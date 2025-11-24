"use client";

import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import type { MuseSession } from "@/types/muse";

type Props = {
  user: MuseSession | null;
  onCredential: (credential: string) => Promise<void> | void;
  onLogout: () => void;
  clientIdMissing: boolean;
};

export function AuthGate({ user, onCredential, onLogout, clientIdMissing }: Props) {
  const [message, setMessage] = useState<string | null>(null);

  if (clientIdMissing) {
    return (
      <section className="rounded-3xl border border-white/10 bg-black/50 p-8 text-white">
        <p className="text-xl font-semibold">Missing Google Client ID</p>
        <p className="text-sm text-zinc-400">Set NEXT_PUBLIC_GOOGLE_CLIENT_ID to enable sign in.</p>
      </section>
    );
  }

  if (user) {
    return (
      <section className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-black/40 p-6 text-white sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.4em] text-zinc-400">Signed in</p>
          <p className="text-2xl font-semibold">{user.name}</p>
          <p className="text-sm text-zinc-400">{user.email}</p>
        </div>
        <button className="btn-ripple rounded-full border border-white/30 px-5 py-2 text-sm" onClick={onLogout}>
          Sign out
        </button>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-black/60 p-8 text-center text-white">
      <p className="text-xs uppercase tracking-[0.4em] text-zinc-400">Step 1</p>
      <h2 className="mt-2 text-3xl font-semibold">Sign in with Google</h2>
      <p className="mt-3 text-zinc-400">The Plug uses your Google account to personalize journeys and link YouTube Music.</p>
      <div className="mt-6 flex justify-center">
        <GoogleLogin
          onSuccess={async (resp) => {
            if (!resp.credential) {
              setMessage("Missing Google credential. Try again.");
              return;
            }
            setMessage(null);
            await onCredential(resp.credential);
          }}
          onError={() => setMessage("Google sign-in failed. Please retry.")}
          useOneTap
        />
      </div>
      {message && <p className="mt-4 text-sm text-red-400">{message}</p>}
    </section>
  );
}
