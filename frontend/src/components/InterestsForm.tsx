"use client";

import { useState } from "react";

type Props = {
  initialValue: string;
  onSave: (value: string) => void;
};

export function InterestsForm({ initialValue, onSave }: Props) {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    if (!value.trim()) {
      setError("Tell The Plug a few genres, moods, or artists to vibe with.");
      return;
    }
    setError(null);
    onSave(value.trim());
  };

  return (
    <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-black via-[#0b0b0f] to-[#1a0f0f] p-6 text-white shadow-2xl">
      <p className="text-xs uppercase tracking-[0.4em] text-pink-300">Step 2</p>
      <h3 className="mt-2 text-3xl font-semibold">Tell Elvis about your taste</h3>
      <p className="mt-2 text-sm text-zinc-400">
        First time here? Drop a few favorite artists, decades, moods, or instruments so The Plug can start curating like a
        backstage pal.
      </p>
      <textarea
        className="mt-4 h-28 w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white placeholder:text-zinc-500"
        placeholder="Example: 70s rock, Elvis, bluesy guitars, late-night crooners, dramatic strings"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <div className="mt-3 flex flex-wrap gap-3">
        <button
          type="button"
          className="btn-ripple rounded-full bg-white px-5 py-2 text-sm font-semibold text-black"
          onClick={handleSave}
        >
          Save my vibe
        </button>
        <button
          type="button"
          className="rounded-full border border-white/20 px-5 py-2 text-sm text-white"
          onClick={() => setValue("")}
        >
          Clear
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
    </section>
  );
}
