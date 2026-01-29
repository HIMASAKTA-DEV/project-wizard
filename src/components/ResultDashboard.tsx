"use client";

import { motion } from "framer-motion";
import { useStore } from "@/store/useStore";
import { CheckCircle2, Code2, Layout, Server, Rocket, Download, Share2, Send, Info, Sparkles, AlertCircle } from "lucide-react";
import { sendDiscordFile, sendDiscordMessage } from "@/lib/discord";
import { generateProjectPDF } from "@/lib/pdf";
import { useState } from "react";

export const ResultDashboard = () => {
    const { summary, answers, sessionId } = useStore();
    const [isSending, setIsSending] = useState(false);

    const data = summary || {
        title: answers.project_name || "Proyek Baru",
        pitch: "Laporan blueprint teknis sedang disiapkan.",
        techStack: ["React", "TypeScript", "Node.js"],
        sprintPlan: [
            { week: 1, tasks: ["Analisis Kebutuhan", "Setup Project"] }
        ]
    };

    const handleDownload = async () => {
        const doc = await generateProjectPDF(data, sessionId);
        doc.save(`${data.title.replace(/\s+/g, '_')}_Blueprint.pdf`);
        sendDiscordMessage(`📂 **[${sessionId}]** User downloaded PDF for: **${data.title}**`);
    };

    const handleSendToDiscord = async () => {
        setIsSending(true);
        try {
            const doc = await generateProjectPDF(data, sessionId);
            const pdfBlob = doc.output('blob');
            const formData = new FormData();
            formData.append('file', pdfBlob, `${data.title.replace(/\s+/g, '_')}_Blueprint.pdf`);
            formData.append('content', `🚀 **[${sessionId}] Laporan Blueprint Dikirim Ulang!**\nProyek: ${data.title}`);

            await sendDiscordFile(formData);
            alert("Laporan telah dikirim ulang ke Discord!");
        } catch (error) {
            console.error(error);
            alert("Gagal mengirim laporan.");
        } finally {
            setIsSending(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-6xl p-8 max-h-[90vh] overflow-y-auto no-scrollbar z-10"
        >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <header className="space-y-4">
                        <div className="flex items-center gap-3">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="px-4 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full w-fit uppercase tracking-widest border border-emerald-500/30"
                            >
                                Inisiasi Selesai
                            </motion.div>
                            <span className="text-white/10 font-mono text-[10px]">#{sessionId}</span>
                        </div>
                        <h1 className="text-5xl font-bold tracking-tight">{data.title}</h1>
                        <div className="space-y-4">
                            {data.pitch.split('. ').map((p: string, i: number) => (
                                <p key={i} className="text-xl text-white/60 leading-relaxed font-light italic">
                                    {p}{p.endsWith('.') ? '' : '.'}
                                </p>
                            ))}
                        </div>
                    </header>

                    <section className="bg-white/5 border border-white/10 p-8 rounded-[40px] space-y-6 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="flex items-center gap-3 text-emerald-400">
                            <CheckCircle2 className="w-8 h-8" />
                            <h2 className="text-2xl font-bold text-white">Langkah Selanjutnya</h2>
                        </div>
                        <p className="text-lg text-white/80 font-light leading-relaxed relative z-10">
                            Terima kasih atas wawasannya, kami akan mulai menyusun laporan detail dan mengirimkan update melalui **WhatsApp**. Semua data teknis telah dikompilasi ke dalam blueprint Anda.
                        </p>
                    </section>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="glass p-6 rounded-3xl space-y-3">
                            <Layout className="w-8 h-8 text-blue-400" />
                            <h3 className="font-medium">Frontend</h3>
                            <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Generated Spec</p>
                        </div>
                        <div className="glass p-6 rounded-3xl space-y-3">
                            <Server className="w-8 h-8 text-purple-400" />
                            <h3 className="font-medium">Backend</h3>
                            <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Ready Architecture</p>
                        </div>
                        <div className="glass p-6 rounded-3xl space-y-3">
                            <Rocket className="w-8 h-8 text-orange-400" />
                            <h3 className="font-medium">Development</h3>
                            <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Blueprint Done</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="glass p-8 rounded-[40px] space-y-8 flex flex-col justify-between">
                        <div className="space-y-8">
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                <Download className="w-6 h-6" /> Arsip Proyek
                            </h2>

                            <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex gap-3">
                                <AlertCircle className="w-5 h-5 text-orange-400 shrink-0" />
                                <p className="text-[11px] text-orange-200/70 leading-relaxed">
                                    <strong>PENTING:</strong> Segera download PDF Anda. Laporan ini tidak disimpan secara permanen di server kami demi privasi Anda.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <button
                                    onClick={handleDownload}
                                    className="w-full py-4 bg-white text-black rounded-2xl font-bold hover:bg-white/90 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                                >
                                    <Download className="w-5 h-5" /> Download PDF
                                </button>

                                <button
                                    onClick={handleSendToDiscord}
                                    disabled={isSending}
                                    className="w-full py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                                >
                                    {isSending ? <Sparkles className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                                    Kirim Ulang ke Discord
                                </button>
                            </div>
                        </div>

                        <div className="border-t border-white/10 pt-8 space-y-4">
                            <div className="flex items-center gap-2 text-white/40 mb-2">
                                <Info className="w-4 h-4" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Stack Terpilih</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {(data.techStack || []).map((tech: string) => (
                                    <span key={tech} className="px-3 py-1 bg-white/5 border border-white/5 rounded-full text-[10px] text-white/60">
                                        {tech}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
