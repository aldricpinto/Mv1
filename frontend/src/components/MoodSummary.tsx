import type { PlaylistResponse } from "@/types/muse";
import { motion } from "framer-motion";

type Props = {
  journey: PlaylistResponse;
};

export function MoodSummary({ journey }: Props) {
  const { mood } = journey;
  return (
    <motion.section
      className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 to-white/0 p-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <p className="text-sm uppercase tracking-[0.4em] text-zinc-400">Mood map</p>
      <h3 className="mt-2 text-3xl font-semibold text-white">{mood.primary_mood}</h3>
      {mood.secondary_mood && <p className="text-lg text-zinc-400">with {mood.secondary_mood}</p>}
      <p className="mt-4 text-zinc-300">{mood.narrative}</p>
      <div className="mt-6 flex flex-wrap gap-3 text-sm text-white">
        {mood.keywords.map((keyword) => (
          <span key={keyword} className="rounded-full border border-white/20 px-4 py-1 text-xs uppercase tracking-widest">
            {keyword}
          </span>
        ))}
      </div>
      <div className="mt-6 text-sm text-zinc-400">
        Recommended genres: <span className="text-white">{mood.recommended_genres.join(", ")}</span>
      </div>
    </motion.section>
  );
}
