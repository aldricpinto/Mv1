import type { PlaylistResponse } from "@/types/muse";

interface Props {
  history: PlaylistResponse[];
  onSelect: (playlist: PlaylistResponse) => void;
}

export function HistoryRail({ history, onSelect }: Props) {
  if (!history.length) return null;
  return (
    <section className="relative">
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-track-retro-olive-dark scrollbar-thumb-retro-neon">
        {history.map((entry, index) => (
          <button
            key={`${entry.prompt}-${index}`}
            onClick={() => onSelect(entry)}
            className="group relative min-w-[280px] flex-shrink-0 bg-black border border-retro-neon/30 p-4 text-left hover:border-retro-neon transition-all hover:-translate-y-1 hover:shadow-[4px_4px_0px_rgba(204,255,0,0.3)]"
          >
            {/* Tape Label Decoration */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-retro-neon/20 group-hover:bg-retro-neon transition-colors" />

            <div className="flex justify-between items-start mb-2 mt-2">
              <span className="text-[10px] font-mono text-retro-neon border border-retro-neon px-1">
                TAPE #{index + 1}
              </span>
              <span className="text-[10px] font-mono text-zinc-500">
                {entry.tracks.length} TRKS
              </span>
            </div>

            <h4 className="text-lg font-bold text-white uppercase truncate mb-1 group-hover:text-retro-neon transition-colors">
              {entry.mood.primary_mood}
            </h4>
            <p className="text-xs text-zinc-400 line-clamp-2 font-mono leading-relaxed">
              {entry.prompt}
            </p>

            {/* Screws */}
            <div className="absolute bottom-2 right-2 w-1.5 h-1.5 rounded-full bg-zinc-700 flex items-center justify-center">
              <div className="w-full h-px bg-black rotate-45" />
            </div>
            <div className="absolute bottom-2 left-2 w-1.5 h-1.5 rounded-full bg-zinc-700 flex items-center justify-center">
              <div className="w-full h-px bg-black rotate-45" />
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
