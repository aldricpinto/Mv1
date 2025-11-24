import type { PlaylistResponse } from "@/types/muse";

interface Props {
  history: PlaylistResponse[];
  onReplay: (prompt: string) => void;
  userName?: string;
}

export function ReturningRail({ history, onReplay, userName }: Props) {
  if (!history.length) return null;
  return (
    <section className="rounded-3xl border border-white/10 bg-black/40 p-6 text-white">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-pink-200">Welcome back</p>
          <h3 className="text-2xl font-semibold">{userName ? `${userName}, your recent journeys` : "Recent journeys"}</h3>
        </div>
        <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-400">{history.length} saved</span>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {history.map((entry, idx) => (
          <button
            key={`${entry.prompt}-${idx}`}
            onClick={() => onReplay(entry.prompt)}
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-white transition hover:border-white/30"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-pink-300">{entry.mood.primary_mood}</p>
            <p className="text-sm font-semibold">{entry.prompt.slice(0, 60)}</p>
          </button>
        ))}
      </div>
    </section>
  );
}
