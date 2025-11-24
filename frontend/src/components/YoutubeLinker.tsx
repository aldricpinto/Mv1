"use client";

import { useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";

type Props = {
  userId: string;
  onLink: (code: string) => void;
};

export function YoutubeLinker({ userId, onLink }: Props) {
  const [message, setMessage] = useState<string | null>(null);

  const login = useGoogleLogin({
    onSuccess: async (codeResponse) => {
      await onLink(codeResponse.code);
    },
    onError: () => setMessage("YouTube authorization failed. Please retry."),
    flow: "auth-code",
    scope: "https://www.googleapis.com/auth/youtube https://www.googleapis.com/auth/youtube.readonly",
  });

  return (
    <div className="mt-8">
      <button
        onClick={() => login()}
        className="btn-primary w-full flex items-center justify-center gap-3 text-lg"
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
        INITIALIZE LINK
      </button>
      {message && (
        <div className="mt-4 border border-retro-orange bg-retro-orange/10 p-2 text-retro-orange text-xs font-mono">
          ERROR: {message.toUpperCase()}
        </div>
      )}
    </div>
  );
}
