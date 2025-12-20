"use client";

import { useState, useRef } from "react";

type Props = {
  onSubmit: (prompt: string) => void;
  userId: string;
  isLoading?: boolean;
};

export function PromptForm({ onSubmit, userId, isLoading = false }: Props) {
  const [prompt, setPrompt] = useState("");
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    onSubmit(prompt);
    setPrompt("");
  };

  const toggleVoice = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setPrompt((prev) => (prev ? `${prev} ${transcript}` : transcript));
    };
    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="relative group">
        <div className="absolute -inset-1 bg-retro-neon/20 blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
        <div className="relative flex items-stretch bg-retro-surface border-2 border-retro-olive-dark">
          {/* Voice Button */}
          <button
            type="button"
            onClick={toggleVoice}
            className={`px-4 flex items-center justify-center border-r-2 border-retro-olive-dark transition-colors ${isListening ? "bg-retro-orange text-black animate-pulse" : "bg-retro-olive hover:bg-retro-olive/80 text-retro-neon"
              }`}
          >
            {isListening ? (
              <div className="h-3 w-3 rounded-full bg-retro-surface" />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></svg>
            )}
          </button>

          {/* Processing Overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-retro-neon/10 z-10 overflow-hidden pointer-events-none">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-retro-neon/20 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
              <div className="absolute bottom-0 left-0 w-full h-1 bg-retro-neon animate-pulse" />
            </div>
          )}

          {/* Input */}
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={isLoading ? "ANALYZING AUDIO SPECTRUM..." : "TELL ME THE VIBE..."}
            className={`flex-1 bg-transparent px-6 py-4 text-retro-neon placeholder-retro-neon/30 font-mono focus:outline-none uppercase tracking-wider transition-opacity ${isLoading ? 'opacity-50' : 'opacity-100'}`}
            disabled={isLoading}
          />

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !prompt.trim()}
            className={`bg-retro-neon text-black font-bold px-8 hover:bg-[#b3e600] disabled:opacity-80 disabled:cursor-not-allowed transition-all uppercase tracking-widest clip-path-slant ${isLoading ? 'animate-pulse' : ''}`}
            style={{ clipPath: "polygon(10px 0, 100% 0, 100% 100%, 0 100%, 0 10px)" }}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </span>
            ) : "EXECUTE"}
          </button>
        </div>
      </div>

      {/* Decorative Labels */}
      <div className="flex justify-between mt-2 text-[10px] font-mono text-retro-neon/50 uppercase tracking-widest">
        <span>Input Channel A</span>
        <span>Freq: 44.1kHz</span>
      </div>
    </form>
  );
}
