import type { PlaylistResponse, Track } from "@/types/muse";
import { motion } from "framer-motion";

import { TrackThumbnail } from "./TrackThumbnail";

type Props = {
  playlist: PlaylistResponse;
  onSelect: (track: Track) => void;
  currentTrack: Track | null;
};

export function PlaylistColumn({ playlist, onSelect, currentTrack }: Props) {
  return (
    <div className="space-y-8">
      {/* Transitions / Narrative - Compact Horizontal Scroll or Grid */}
      <div className="border border-retro-neon/20 bg-retro-surface/40 p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 bg-retro-neon text-black text-[10px] font-bold px-2 py-1 uppercase tracking-widest">
          Sequence Logic
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          {playlist.transitions.map((transition, index) => (
            <div key={index} className="relative pl-4 border-l-2 border-retro-neon/30">
              <p className="text-xs text-retro-neon/80 font-mono leading-relaxed uppercase">{transition}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tracks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {playlist.tracks.map((track, index) => {
          const isActive = currentTrack?.video_id === track.video_id;
          return (
            <motion.button
              key={`${track.video_id}-${index}`}
              onClick={() => onSelect(track)}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className={`group relative flex items-center gap-4 p-3 text-left transition-all border ${isActive
                ? "bg-retro-neon/10 border-retro-neon shadow-[0_0_15px_rgba(204,255,0,0.2)]"
                : "bg-retro-surface/40 border-retro-neon/20 hover:border-retro-neon/60 hover:bg-retro-neon/5"
                }`}
            >
              {/* Index Number */}
              <div className="absolute top-1 right-2 text-[10px] font-mono text-retro-neon/30 group-hover:text-retro-neon/60">
                {(index + 1).toString().padStart(2, '0')}
              </div>

              <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden bg-retro-olive-dark border border-retro-neon/20 group-hover:border-retro-neon/50 transition-colors">
                <TrackThumbnail
                  src={track.thumbnail_url}
                  alt={track.title}
                  className="h-full w-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                />
                {isActive && (
                  <div className="absolute inset-0 flex items-center justify-center bg-retro-neon/20 backdrop-blur-[1px]">
                    <div className="h-2 w-2 bg-retro-neon animate-pulse shadow-[0_0_5px_#ccff00]" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0 pr-4">
                <p className={`truncate font-bold text-sm uppercase tracking-wider ${isActive ? "text-retro-neon" : "text-zinc-300 group-hover:text-retro-neon transition-colors"}`}>
                  {track.title}
                </p>
                <p className="truncate text-xs font-mono text-retro-neon/60">{track.artist}</p>
              </div>

              <div className="text-[10px] text-retro-neon/40 font-mono border-l border-retro-neon/20 pl-2">
                {track.duration || "--:--"}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}


