"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { MuseSession, Phase, PlaylistResponse, Track } from "@/types/muse";
import {
  attachYoutubeAuth,
  fetchSession,
  registerGoogle,
} from "@/lib/api";

const USER_KEY = "muse-user-id";

export function useMuseFlow() {
  const [user, setUser] = useState<MuseSession | null>(null);
  const [authReady, setAuthReady] = useState(false);

  // Global Player State
  const [playlist, setPlaylist] = useState<PlaylistResponse | null>(null);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const savedUserId = window.localStorage.getItem(USER_KEY);
    if (savedUserId) {
      fetchSession(savedUserId)
        .then(setUser)
        .catch(() => window.localStorage.removeItem(USER_KEY))
        .finally(() => setAuthReady(true));
    } else {
      setAuthReady(true);
    }
  }, []);

  const handleGoogleCredential = useCallback(async (idToken: string) => {
    const session = await registerGoogle(idToken);
    setUser(session);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(USER_KEY, session.user_id);
    }
  }, []);

  const linkYoutube = useCallback(
    async (code: string) => {
      if (!user) throw new Error("User missing");
      const session = await attachYoutubeAuth(user.user_id, code);
      setUser(session);
    },
    [user]
  );

  const logout = useCallback(() => {
    setUser(null);
    setPlaylist(null);
    setCurrentTrack(null);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(USER_KEY);
    }
  }, []);

  const selectTrack = useCallback((track: Track | null) => {
    setCurrentTrack(track);
  }, []);

  return {
    user,
    authReady,
    handleGoogleCredential,
    linkYoutube,
    logout,
    playlist,
    setPlaylist,
    currentTrack,
    selectTrack,
  };
}
