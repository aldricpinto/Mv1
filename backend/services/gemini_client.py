from __future__ import annotations

import asyncio
import json
from typing import Any, Dict, List

from google import genai

from ..models.response_models import MoodProfile, Track
from ..utils.config import Settings
from ..utils.logger import get_logger

logger = get_logger()


class GeminiClient:
    def __init__(self, settings: Settings) -> None:
        if not settings.gemini_api_key:
            raise RuntimeError("Gemini API key missing. Set GEMINI_API_KEY.")
        self.settings = settings
        self._client = genai.Client(api_key=settings.gemini_api_key)

    async def analyze_mood(self, prompt: str) -> MoodProfile:
        system_prompt = (
            "You are The Plug, an AI DJ. Given a user prompt, output a JSON object with "
            "primary_mood, secondary_mood, playlist_title (creative, abstract, unique, 2-4 words), "
            "keywords (list of max 6), narrative string, "
            "and recommended_genres (max 4). IMPORTANT: If the user mentions specific artists, "
            "genres, albums or eras, YOU MUST include them in the 'keywords' list. "
            "If a specific artist or album is requested, your 'narrative' field MUST explicitly stating "
            "that the playlist is strictly for that artist/album (e.g. 'Strictly songs by [Artist]')."
        )
        response = await self._generate(
            contents=[{"role": "user", "parts": [{"text": prompt}]}],
            system_instruction=system_prompt,
        )
        parsed = self._parse_json_text(response)
        return MoodProfile(**parsed)

    async def curate_playlist(self, mood: MoodProfile, tracks: List[Track]) -> List[Track]:
        if not tracks:
            return []
        
        # Enhanced prompt to force strict filtering based on the mood/narrative
        system_prompt = (
            "Select between {min_tracks} and {max_tracks} tracks that best fit the mood. "
            "CRITICAL: You must strictly adhere to the constraints in the mood profile. "
            "If the mood/narrative requests a specific artist, album, or genre, YOU MUST ONLY select "
            "tracks that match that specific criteria from the provided list. "
            "Do not include 'similar' artists if the user explicitly asked for a specific one. "
            "If no tracks match the strict criteria, select the closest matches but prioritize exact matches heavily. "
            "Respond with JSON containing an array named 'order' listing video_id values in order."
        ).format(
            min_tracks=self.settings.playlist_min_tracks,
            max_tracks=min(self.settings.playlist_max_tracks, len(tracks)),
        )
        catalog = [track.model_dump() for track in tracks]
        content = [
            {
                "role": "user",
                "parts": [
                    {
                        "text": json.dumps(
                            {
                                "mood": mood.model_dump(),
                                "tracks": catalog,
                            }
                        )
                    }
                ],
            },
        ]
        try:
            response = await self._generate(content, system_instruction=system_prompt)
            parsed = self._parse_json_text(response)
            ids = parsed.get("order", [])
            id_set = {item for item in ids if item}
            ordered = [track for track in tracks if track.video_id in id_set]
            if ordered:
                return ordered
        except Exception as exc:  # pragma: no cover - fallback logic
            logger.warning("Gemini playlist curation failed: %s", exc)
        # fallback deterministic slicing
        span = slice(0, min(len(tracks), self.settings.playlist_max_tracks))
        return tracks[span]

    async def _generate(self, contents: List[Dict[str, Any]], system_instruction: str | None = None):
        kwargs = {}
        if system_instruction:
            kwargs["config"] = {"system_instruction": system_instruction}
        
        return await asyncio.to_thread(
            self._client.models.generate_content,
            model=self.settings.gemini_model,
            contents=contents,
            **kwargs,
        )

    async def analyze_mood_stream(self, prompt: str):
        system_prompt = (
            "You are The Plug, an AI DJ. I need you to generate a playlist based on the user's request. "
            "First, acknowledge the vibe and talk to the user directly in a cool, confident, empathetic tone (max 2 sentences). "
            "Then, output a special separator '###JSON_SEPARATOR###' followed immediately by a valid JSON object. "
            "The JSON object must have: primary_mood, secondary_mood, playlist_title (creative, 2-4 words), "
            "keywords (list of max 6), narrative (the same text you spoke), and recommended_genres (max 4). "
        )
        
        # We need to run the blocking sync generator in a thread
        # But we need to yield chunks.
        # Solution: Use an iterator wrapper that runs `next()` in a thread
        
        try:
            response_stream = await asyncio.to_thread(
                self._client.models.generate_content_stream,
                model=self.settings.gemini_model,
                contents=[{"role": "user", "parts": [{"text": prompt}]}],
                config={"system_instruction": system_prompt}
            )
        except Exception as e:
            logger.error("Failed to start Gemini stream: %s", e)
            yield {"type": "error", "data": str(e)}
            return

        iterator = iter(response_stream)
        
        def safe_next():
            try:
                return next(iterator)
            except StopIteration:
                return None
        
        json_buffer = ""
        collecting_json = False
        
        while True:
            try:
                chunk = await asyncio.to_thread(safe_next)
                if chunk is None:
                    break
                    
                text = chunk.text or ""
                
                if "###JSON_SEPARATOR###" in text:
                    parts = text.split("###JSON_SEPARATOR###")
                    narrative = parts[0]
                    if narrative:
                         yield {"type": "narrative_chunk", "text": narrative}
                    
                    collecting_json = True
                    # Append the rest to json buffer
                    json_buffer += parts[1]
                elif collecting_json:
                    json_buffer += text
                else:
                    # Pure narrative chunk
                    yield {"type": "narrative_chunk", "text": text}
                    
            except Exception as e:
                logger.error("Error reading from Gemini stream: %s", e)
                break
        
        if json_buffer:
            try:
                parsed = self._parse_json_text_raw(json_buffer)
                if parsed:
                    yield {"type": "json_full", "data": parsed}
            except Exception as e:
                logger.error("Failed to parse streamed JSON: %s", e)

    def _parse_json_text_raw(self, text: str) -> Dict[str, Any]:
        text = text.strip()
        # Remove potential markdown formatting
        if text.startswith("```json"):
            text = text[7:]
        if text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
        text = text.strip()
        
        if not text:
            return {}
            
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            # simple heuristic repair
            start = text.find("{")
            end = text.rfind("}")
            if start != -1 and end != -1:
                return json.loads(text[start : end + 1])
            raise

    def _parse_json_text(self, response: Any) -> Dict[str, Any]:
        text = (response.text or "").strip()
        if not text:
            raise ValueError("Empty response from Gemini")
        return self._parse_json_text_raw(text)

    async def close(self):
        """Cleanup resources."""
        pass
