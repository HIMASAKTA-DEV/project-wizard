"use client";

import { useStore } from "@/store/useStore";
import { QuestionCard } from "@/components/QuestionCard";
import { AnimatePresence, motion } from "framer-motion";
import { ResultDashboard } from "@/components/ResultDashboard";

export default function Home() {
    const { isStarted, startProject, conversation, isComplete } = useStore();

    const lastQuestionItem = [...conversation].reverse().find(item => item.role === 'assistant' && item.question);
    const activeQuestion = lastQuestionItem?.question;

    return (
        <main className="relative h-screen w-screen flex flex-col items-center justify-center overflow-hidden bg-black selection:bg-white/20">
            <AnimatePresence mode="wait">
                {!isStarted ? (
                    <motion.div
                        key="landing"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, y: -50 }}
                        transition={{ duration: 1 }}
                        className="text-center z-10"
                    >
                        <motion.h1
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                            className="text-6xl md:text-8xl font-bold tracking-tighter mb-8"
                        >
                            Project<span className="text-white/40">Wizard</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 }}
                            className="text-white/40 text-xl mb-12 tracking-widest font-light"
                        >
                            UBAH VISI MENJADI BLUEPRINT
                        </motion.p>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={startProject}
                            className="px-12 py-4 glass rounded-full text-lg font-medium hover:bg-white/10 transition-colors"
                        >
                            Mulai Inisiasi
                        </motion.button>
                    </motion.div>
                ) : isComplete ? (
                    <ResultDashboard key="result" />
                ) : (
                    <div key="interview" className="w-full h-full flex items-center justify-center relative px-4">
                        <AnimatePresence mode="wait">
                            {activeQuestion && (
                                <QuestionCard
                                    key={activeQuestion.id}
                                    question={activeQuestion}
                                    index={conversation.length}
                                />
                            )}
                        </AnimatePresence>

                        <MoodBackground />
                    </div>
                )}
            </AnimatePresence>

            {/* Footer */}
            <footer className="fixed bottom-6 left-0 right-0 z-50 pointer-events-none">
                <div className="flex justify-center flex-col items-center gap-1 opacity-20 hover:opacity-100 transition-opacity duration-500">
                    <p className="text-[10px] font-mono tracking-[0.3em] uppercase text-white pointer-events-auto">
                        Platform made with <span className="text-red-500">❤</span> by{" "}
                        <a
                            href="https://github.com/HIMASAKTA-DEV"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline underline-offset-4 font-bold"
                        >
                            HIMASAKTA DEV
                        </a>
                    </p>
                </div>
            </footer>
        </main>
    );
}

function MoodBackground() {
    const mood = useStore((state) => state.mood);

    const colors = {
        blue: "rgba(37, 99, 235, 0.05)",
        green: "rgba(5, 150, 105, 0.05)",
        purple: "rgba(147, 51, 234, 0.05)",
        orange: "rgba(234, 88, 12, 0.05)",
    };

    return (
        <div className="fixed inset-0 pointer-events-none -z-10 bg-black">
            <motion.div
                key={mood}
                initial={{ opacity: 0 }}
                animate={{
                    opacity: 1,
                    backgroundColor: colors[mood] || colors.blue
                }}
                transition={{ duration: 2 }}
                className="absolute inset-0"
            />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_100%)] opacity-80" />
        </div>
    );
}
