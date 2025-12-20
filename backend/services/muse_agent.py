from __future__ import annotations

from collections import deque
from typing import Deque, List

from ..models.response_models import MoodProfile, PlaylistSegment, Track


class MuseAgent:
    """Lightweight conversational memory for Muse."""

    def __init__(self, memory_size: int = 10) -> None:
        self.memory: Deque[str] = deque(maxlen=memory_size)

    def remember_prompt(self, prompt: str) -> None:
        if prompt:
            self.memory.appendleft(prompt.strip())

    def summarize_history(self) -> List[str]:
        return list(self.memory)

    def build_transitions(self, mood: MoodProfile, tracks: List[Track]) -> List[str]:
        transitions: List[str] = []
        if not tracks:
            return transitions
        templates = [
            "Easing in with {first} to set the {mood} tone.",
            "Let us lift the room with {second}.",
            "Here comes your emotional anchor: {anchor}.",
            "We ramp the energy with {penultimate} before landing on {last}.",
        ]
        names = [f"{t.title} - {t.artist}" for t in tracks]
        transitions.append(templates[0].format(first=names[0], mood=mood.primary_mood.lower()))
        if len(names) > 2:
            transitions.append(templates[1].format(second=names[len(names)//2]))
        if len(names) >= 3:
            transitions.append(templates[2].format(anchor=names[len(names)//3]))
        if len(names) >= 4:
            transitions.append(
                templates[3].format(penultimate=names[-2], last=names[-1])
            )
        return transitions

    def build_segments(self, mood: MoodProfile) -> List[PlaylistSegment]:
        return [
            PlaylistSegment(
                intro="Starting soft and centered",
                focus=mood.primary_mood,
                transition="Let’s open the journey gently.",
            ),
            PlaylistSegment(
                intro="Energy lift",
                focus=mood.secondary_mood or mood.primary_mood,
                transition="Time to move and glow.",
            ),
            PlaylistSegment(
                intro="Anchor and reflection",
                focus="introspective pulse",
                transition="Holding space for resonance before we close.",
            ),
        ]
