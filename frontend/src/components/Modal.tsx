"use client";

import { motion, AnimatePresence } from "framer-motion";

export type ModalType = "alert" | "confirm";

type ModalProps = {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
    type?: ModalType;
    onConfirm?: () => void;
    confirmLabel?: string;
    cancelLabel?: string;
};

export function Modal({
    isOpen,
    onClose,
    title,
    message,
    type = "alert",
    onConfirm,
    confirmLabel = "OK",
    cancelLabel = "CANCEL"
}: ModalProps) {
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
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-retro-olive-dark border border-retro-neon/30 p-6 shadow-[0_0_30px_rgba(204,255,0,0.1)] z-[101]"
                    >
                        {/* Decorative Corner Lines */}
                        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-retro-neon" />
                        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-retro-neon" />
                        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-retro-neon" />
                        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-retro-neon" />

                        <div className="mb-6">
                            <h3 className="text-xl font-bold text-retro-neon uppercase tracking-widest mb-2">
                                {title}
                            </h3>
                            <div className="h-px w-full bg-retro-neon/20 mb-4" />
                            <p className="text-retro-neon/80 font-mono text-sm leading-relaxed">
                                {message}
                            </p>
                        </div>

                        <div className="flex justify-end gap-3">
                            {type === "confirm" && (
                                <button
                                    onClick={onClose}
                                    className="px-4 py-2 text-retro-neon/70 font-mono text-xs hover:text-retro-neon transition-colors uppercase tracking-wider"
                                >
                                    {cancelLabel}
                                </button>
                            )}
                            <button
                                onClick={() => {
                                    if (type === "confirm" && onConfirm) {
                                        onConfirm();
                                    }
                                    onClose();
                                }}
                                className="px-6 py-2 bg-retro-neon text-black font-bold text-xs uppercase tracking-widest hover:bg-[#b3e600] transition-colors clip-path-slant"
                                style={{ clipPath: "polygon(10px 0, 100% 0, 100% 100%, 0 100%, 0 10px)" }}
                            >
                                {confirmLabel}
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
