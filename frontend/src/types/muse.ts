export type Phase = "welcome" | "prompt" | "analysis" | "player";

export interface MoodProfile {
  primary_mood: string;
  secondary_mood?: string;
  playlist_title?: string;
  keywords: string[];
  narrative: string;
  recommended_genres: string[];
}

export interface PlaylistSegment {
  intro: string;
  focus: string;
  transition: string;
}

export interface Track {
  title: string;
  artist: string;
  video_id?: string;
  duration?: string;
  thumbnail_url?: string;
  energy?: string;
}

export interface PlaylistResponse {
  prompt: string;
  mood: MoodProfile;
  transitions: string[];
  segments: PlaylistSegment[];
  tracks: Track[];
  history: MoodProfile[];
}

export interface MuseSession {
  user_id: string;
  email: string;
  name: string;
  picture?: string;
  joined_date: string;
  created_on: string;
  updated_on: string;
  has_youtube_auth: boolean;
}
