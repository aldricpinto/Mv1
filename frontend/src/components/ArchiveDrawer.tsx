import { motion, AnimatePresence } from "framer-motion";
import type { PlaylistResponse } from "@/types/muse";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    history: PlaylistResponse[];
    onSelect: (playlist: PlaylistResponse) => void;
    onClear: () => void;
}

export function ArchiveDrawer({ isOpen, onClose, history, onSelect, onClear }: Props) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 h-full w-full max-w-md bg-retro-olive-dark border-l border-retro-neon/30 shadow-2xl z-50 flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-retro-neon/20 flex items-center justify-between bg-retro-surface">
                            <h2 className="text-xl font-bold text-retro-neon uppercase tracking-widest">
                                Archive
                            </h2>
                            <button
                                onClick={onClose}
                                className="text-retro-neon/50 hover:text-retro-neon transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-track-retro-olive-dark scrollbar-thumb-retro-neon">
                            {history.length === 0 ? (
                                <div className="text-center text-zinc-500 mt-10 font-mono text-sm">
                                    NO TAPES FOUND
                                </div>
                            ) : (
                                history.map((entry, index) => (
                                    <button
                                        key={`${entry.prompt}-${index}`}
                                        onClick={() => {
                                            onSelect(entry);
                                            onClose();
                                        }}
                                        className="w-full group relative bg-retro-surface border border-retro-neon/30 p-4 text-left hover:border-retro-neon transition-all hover:-translate-y-1 hover:shadow-[4px_4px_0px_rgba(204,255,0,0.3)]"
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

                                        <h4 className="text-lg font-bold text-retro-text-contrast uppercase truncate mb-1 group-hover:text-retro-neon transition-colors">
                                            {entry.mood.playlist_title || entry.mood.primary_mood}
                                        </h4>
                                        <p className="text-xs text-zinc-400 line-clamp-2 font-mono leading-relaxed">
                                            {entry.prompt}
                                        </p>
                                    </button>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        {history.length > 0 && (
                            <div className="p-6 border-t border-retro-neon/20 bg-retro-surface">
                                <button
                                    onClick={onClear}
                                    className="w-full btn-secondary text-xs"
                                >
                                    [ ERASE ALL DATA ]
                                </button>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
