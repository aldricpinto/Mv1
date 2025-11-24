"use client";

import { useEffect, useState } from "react";
import type { Track } from "@/types/muse";

interface Props {
  track: Track | null;
}

export function ElvisPlayer({ track }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(Boolean(track?.video_id));
  }, [track]);

  if (!visible || !track) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[320px] overflow-hidden rounded-3xl border border-white/10 bg-black/80 shadow-2xl backdrop-blur">
      <div className="flex items-center justify-between px-4 py-3 text-white">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-pink-300">Now playing</p>
          <p className="text-sm font-semibold">{track.title}</p>
          <p className="text-xs text-zinc-400">{track.artist}</p>
        </div>
        <button
          aria-label="Close player"
          className="h-8 w-8 rounded-full border border-white/20 text-sm text-white"
          onClick={() => setVisible(false)}
        >
          x
        </button>
      </div>
      <div className="aspect-video w-full">
        <iframe
          key={track.video_id}
          src={`https://www.youtube.com/embed/${track.video_id}?autoplay=0&modestbranding=1`}
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
      <div className="flex items-center justify-between px-4 py-3 text-xs text-zinc-400">
        <span>Picture-in-player</span>
        <span>Elvis mode</span>
      </div>
    </div>
  );
}
