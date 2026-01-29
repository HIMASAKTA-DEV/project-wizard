"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { useStore, Question } from "@/store/useStore";
import { ArrowRight, ChevronRight, RefreshCcw, AlertTriangle, Sparkles, CheckCircle2, History, ChevronDown, Clock } from "lucide-react";
import { sendDiscordMessage, sendDiscordFile } from "@/lib/discord";
import { generateProjectPDF } from "@/lib/pdf";

interface QuestionCardProps {
    question: Question;
    index: number;
}

export const QuestionCard = ({ question, index }: QuestionCardProps) => {
    const [value, setValue] = useState("");
    const [streamingText, setStreamingText] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [showHistory, setShowHistory] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const {
        addAnswer,
        setThinking,
        isThinking,
        addAIQuestion,
        setComplete,
        conversation,
        answers,
        sessionId,
        historyLog
    } = useStore();

    const assistantMessageCount = conversation.filter(c => c.role === 'assistant').length;

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, [value]);

    const handleSubmit = async (e?: React.FormEvent, selectedValue?: string, isFinalForce: boolean = false) => {
        e?.preventDefault();
        const finalValue = isFinalForce ? "SAYA INGIN SELESAI SEKARANG. Selesaikan laporannya berdasarkan data yang ada." : (selectedValue || value);
        if (!finalValue && !isFinalForce) return;

        setError(null);
        setThinking(true);
        setStreamingText("");

        sendDiscordMessage(`[${sessionId}] User Answered: **${question.text}**\nAnswer: \`\`\`${finalValue}\`\`\``);

        addAnswer(question.id, finalValue);
        const currentHistory = [...conversation, { role: 'user', content: String(finalValue) }];
        setValue("");

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    history: currentHistory.map(h => ({ role: h.role, content: h.content })),
                    answers: { ...answers, [question.id]: finalValue }
                }),
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const reader = response.body!.getReader();
            const decoder = new TextDecoder();
            let fullText = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value);
                fullText += chunk;
                setStreamingText((prev) => prev + chunk);
            }

            setThinking(false);

            const cleanedText = fullText.replace(/```json/g, "").replace(/```/g, "").trim();
            let data;
            try {
                const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
                const jsonStr = jsonMatch ? jsonMatch[0] : cleanedText;
                data = JSON.parse(jsonStr);
            } catch (parseError) {
                data = {
                    question: { id: `ai_${Date.now()}`, type: 'text', text: cleanedText, suggestion: "Lanjutkan detailnya..." },
                    isComplete: false
                };
            }

            if (data.isComplete) {
                setComplete(true, data.summary);

                // AUTO SEND TO DISCORD
                setTimeout(async () => {
                    try {
                        const doc = await generateProjectPDF(data.summary, sessionId);
                        const pdfBlob = doc.output('blob');
                        const formData = new FormData();
                        formData.append('file', pdfBlob, `${data.summary.title.replace(/\s+/g, '_')}_Blueprint.pdf`);
                        formData.append('content', `✅ **[${sessionId}] LAPORAN OTOMATIS BERHASIL DIBUAT!**\nJudul: ${data.summary.title}\n\nLaporan ini telah dikirim secara otomatis.`);
                        await sendDiscordFile(formData);
                    } catch (pdfErr) {
                        console.error("Auto PDF Send Failed:", pdfErr);
                    }
                }, 1000);

            } else if (data.question) {
                addAIQuestion(data.question);
            }
        } catch (err: any) {
            console.error("AI Error:", err);
            setError("AI terputus. Silakan coba kirim ulang.");
            setThinking(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-2xl px-6 relative"
        >
            <div className="space-y-8 min-h-[450px] flex flex-col justify-center">
                <AnimatePresence mode="wait">
                    {isThinking ? (
                        <motion.div
                            key="thinking"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center space-y-8 py-12"
                        >
                            <div className="relative w-32 h-32">
                                <div className="absolute inset-0 animate-spin-slow">
                                    <svg className="w-full h-full" viewBox="0 0 128 128">
                                        <circle cx="64" cy="64" r="58" className="fill-none stroke-white/5 stroke-[4]" />
                                        <circle cx="64" cy="64" r="58" strokeDasharray="80 284" className="fill-none stroke-blue-500 stroke-[6] stroke-round" />
                                    </svg>
                                </div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Sparkles className="w-10 h-10 text-white animate-pulse" />
                                </div>
                            </div>
                            <div className="flex flex-col items-center gap-3 text-center">
                                <span className="text-sm font-mono uppercase tracking-[0.4em] text-white/50 animate-pulse">Analisis Mendalam</span>
                                {streamingText && <div className="text-[10px] text-white/10 font-mono truncate max-w-[200px] italic">{streamingText}</div>}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                            <div className="space-y-2">
                                <div className="flex justify-between items-center text-xs font-mono uppercase tracking-widest text-white/20">
                                    <span>Langkah {assistantMessageCount} / ?</span>
                                    <span className="opacity-50">#ID: {sessionId}</span>
                                </div>
                                <motion.h2 className="text-4xl md:text-5xl font-medium tracking-tight text-white leading-tight">
                                    {question.text}
                                </motion.h2>
                            </div>

                            <div className="space-y-6">
                                {error ? (
                                    <div className="p-8 glass border-red-500/20 rounded-3xl space-y-4">
                                        <div className="flex items-center gap-3 text-red-400">
                                            <AlertTriangle className="w-6 h-6" />
                                            <span className="font-medium">Jaringan Terganggu</span>
                                        </div>
                                        <p className="text-white/40 text-sm italic">"{error}"</p>
                                        <button onClick={() => setError(null)} className="flex items-center gap-2 px-6 py-2 bg-white/5 hover:bg-white/10 rounded-full text-sm font-bold">Coba Kirim Ulang</button>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {question.type === 'text' && (
                                            <div className="space-y-4">
                                                <div className="relative group flex items-end gap-4 border-b-2 border-white/10 focus-within:border-white/60 transition-all py-2">
                                                    <textarea
                                                        ref={textareaRef}
                                                        autoFocus
                                                        rows={1}
                                                        value={value}
                                                        onChange={(e) => setValue(e.target.value)}
                                                        onKeyDown={handleKeyDown}
                                                        placeholder={question.suggestion || "Ketik jawaban Anda..."}
                                                        className="flex-1 bg-transparent py-4 text-2xl md:text-3xl focus:outline-none placeholder:text-white/5 placeholder:italic resize-none overflow-hidden min-h-[60px]"
                                                    />
                                                    <button onClick={() => handleSubmit()} disabled={!value} className="p-3 mb-2 hover:bg-white/10 rounded-full active:scale-95 transition-all text-white/40 hover:text-white"><ArrowRight className="w-10 h-10" /></button>
                                                </div>
                                                <div className="flex justify-between items-center text-xs">
                                                    <span className="text-white/20 italic">{question.suggestion && !value ? `Ide: ${question.suggestion}` : ''}</span>
                                                    {assistantMessageCount >= 5 && (
                                                        <button onClick={() => handleSubmit(undefined, undefined, true)} className="text-white/30 hover:text-white flex items-center gap-2 font-bold tracking-widest uppercase text-[10px]">
                                                            <CheckCircle2 className="w-4 h-4 text-emerald-500/50" /> Selesai & Kirim Laporan
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                        {question.type === 'choice' && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {question.options?.map((opt) => (
                                                    <button key={opt.value} onClick={() => handleSubmit(undefined, opt.value)} className="glass p-6 text-left rounded-3xl hover:bg-white/10 group flex justify-between items-center border border-white/5">
                                                        <span className="text-xl text-white/80 font-light">{opt.label}</span>
                                                        <ChevronRight className="w-5 h-5 text-white/20 group-hover:translate-x-1 transition-transform" />
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="pt-12">
                                    <div className="relative">
                                        <button onClick={() => setShowHistory(!showHistory)} className="flex items-center gap-2 text-white/10 hover:text-white/30 transition-colors text-[10px] font-mono uppercase tracking-[0.3em] mb-4">
                                            <History className="w-4 h-4" /> Riwayat ({historyLog.length}) <ChevronDown className={`w-3 h-3 transition-transform ${showHistory ? 'rotate-180' : ''}`} />
                                        </button>
                                        <div className={`overflow-hidden transition-all duration-700 ${showHistory ? 'max-h-[300px] opacity-100' : 'max-h-16 opacity-10 grayscale pointer-events-none'}`}>
                                            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 no-scrollbar pb-10">
                                                {historyLog.map((log, i) => (
                                                    <div key={i} className="p-4 glass rounded-[32px] border border-white/5 space-y-2 bg-white/[0.02]">
                                                        <div className="flex justify-between items-center text-[10px] font-mono text-white/20">
                                                            <span className="font-bold text-white/40">{log.projectName}</span>
                                                            <div className="flex items-center gap-1 opacity-50"><Clock className="w-3 h-3" /> {log.timestamp}</div>
                                                        </div>
                                                        {log.qa.slice(0, 1).map((pair, j) => (
                                                            <div key={j} className="text-[10px] line-clamp-1 opacity-40"><span className="text-white/20">A:</span> {pair.a}</div>
                                                        ))}
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};
