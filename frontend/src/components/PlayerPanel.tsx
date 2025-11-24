"use client";

import type { Track } from "@/types/muse";
import { motion } from "framer-motion";

type Props = {
  current?: Track | null;
  tracks: Track[];
  onSelect: (track: Track) => void;
};

export function PlayerPanel({ current, tracks, onSelect }: Props) {
  return (
    <motion.section
      className="rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900 to-black p-6"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <p className="text-sm uppercase tracking-[0.4em] text-zinc-400">Player</p>
      <h3 className="mt-2 text-2xl font-semibold">{current ? current.title : "Pick a track"}</h3>
      {current && (
        <p className="text-zinc-400">{current.artist}</p>
      )}
      <div className="mt-4 h-64 w-full overflow-hidden rounded-2xl border border-white/10 bg-black">
        {current?.video_id ? (
          <iframe
            key={current.video_id}
            src={`https://www.youtube.com/embed/${current.video_id}?autoplay=0&modestbranding=1`}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div className="flex h-full items-center justify-center text-zinc-600">Select a track to play</div>
        )}
      </div>
      <div className="mt-4 flex flex-wrap gap-2 text-xs text-white">
        {tracks.map((track) => (
          <button
            key={track.video_id ?? track.title}
            onClick={() => onSelect(track)}
            className={`btn-pill ${current?.video_id === track.video_id ? "bg-white text-black" : "bg-white/10"}`}
          >
            {track.title.split(" ").slice(0, 2).join(" ")}
          </button>
        ))}
      </div>
    </motion.section>
  );
}
