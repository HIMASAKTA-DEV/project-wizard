import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type QuestionType = 'text' | 'choice' | 'visual-choice' | 'slider';

export interface Question {
    id: string;
    type: QuestionType;
    text: string;
    suggestion?: string;
    options?: { label: string; value: string; image?: string }[];
}

export interface ConversationItem {
    role: 'assistant' | 'user';
    content: string;
    question?: Question;
    timestamp?: string;
}

export interface HistoryLogItem {
    timestamp: string;
    projectName: string;
    qa: { q: string, a: string }[];
    summary: any;
    answers: Record<string, any>;
}

interface ProjectState {
    sessionId: string;
    isStarted: boolean;
    isCompiling: boolean;
    isComplete: boolean;
    isThinking: boolean;
    currentStep: number;
    conversation: ConversationItem[];
    answers: Record<string, any>;
    mood: 'blue' | 'green' | 'purple' | 'orange';
    summary: any | null;
    historyLog: HistoryLogItem[];

    startProject: () => void;
    addAnswer: (questionId: string, answer: any) => void;
    addAIQuestion: (question: Question) => void;
    setThinking: (status: boolean) => void;
    setCompiling: (status: boolean) => void;
    setComplete: (status: boolean, summary?: any) => void;
    setMood: (mood: ProjectState['mood']) => void;
    saveToHistory: () => void;
    loadProject: (historyItem: HistoryLogItem) => void;
    resetProject: () => void;
}

const generateId = () => Math.random().toString(36).substring(2, 11).toUpperCase();

export const useStore = create<ProjectState>()(
    persist(
        (set, get) => ({
            sessionId: `SESSION-${generateId()}`,
            isStarted: false,
            isCompiling: false,
            isComplete: false,
            isThinking: false,
            currentStep: 0,
            conversation: [
                {
                    role: 'assistant',
                    content: "Selamat datang di ProjectWizard. Mari kita bangun visi Anda. Apa nama atau ide utama proyek Anda?",
                    question: {
                        id: 'project_name',
                        type: 'text',
                        text: "Mari kita mulai dengan nama. Apa yang sedang kita bangun?",
                        suggestion: "Misal: Aplikasi E-commerce untuk UMKM"
                    },
                    timestamp: new Date().toISOString()
                }
            ],
            answers: {},
            mood: 'blue',
            summary: null,
            historyLog: [],

            startProject: () => set({ isStarted: true }),

            addAnswer: (questionId, answer) => set((state) => {
                const newAnswers = { ...state.answers, [questionId]: answer };
                const newConversation = [...state.conversation];
                newConversation.push({
                    role: 'user',
                    content: String(answer),
                    timestamp: new Date().toISOString()
                });

                return {
                    answers: newAnswers,
                    conversation: newConversation,
                    currentStep: state.currentStep + 1
                };
            }),

            addAIQuestion: (question) => set((state) => ({
                conversation: [
                    ...state.conversation,
                    {
                        role: 'assistant',
                        content: question.text,
                        question,
                        timestamp: new Date().toISOString()
                    }
                ]
            })),

            setThinking: (isThinking) => set({ isThinking }),
            setCompiling: (status) => set({ isCompiling: status }),
            setComplete: (status, summary) => {
                set({ isComplete: status, summary: summary || null });
                if (status && summary) {
                    get().saveToHistory();
                }
            },
            setMood: (mood) => set({ mood }),

            saveToHistory: () => {
                const state = get();
                const projectName = state.answers.project_name || "Untitled Project";
                const qa: { q: string, a: string }[] = [];

                for (let i = 0; i < state.conversation.length; i++) {
                    const item = state.conversation[i];
                    if (item.role === 'assistant' && item.question) {
                        const nextItem = state.conversation[i + 1];
                        if (nextItem && nextItem.role === 'user') {
                            qa.push({ q: item.content, a: nextItem.content });
                        }
                    }
                }

                const newLogItem: HistoryLogItem = {
                    timestamp: new Date().toLocaleString('id-ID'),
                    projectName,
                    qa,
                    summary: state.summary,
                    answers: state.answers
                };

                const newHistory = [newLogItem, ...state.historyLog].slice(0, 25);
                set({ historyLog: newHistory });
            },

            loadProject: (historyItem) => set({
                isStarted: true,
                isComplete: true,
                summary: historyItem.summary,
                answers: historyItem.answers,
                isThinking: false
            }),

            resetProject: () => set({
                sessionId: `SESSION-${generateId()}`,
                isStarted: false,
                isComplete: false,
                isThinking: false,
                currentStep: 0,
                conversation: [
                    {
                        role: 'assistant',
                        content: "Selamat datang di ProjectWizard. Mari kita bangun visi Anda. Apa nama atau ide utama proyek Anda?",
                        question: {
                            id: 'project_name',
                            type: 'text',
                            text: "Mari kita mulai dengan nama. Apa yang sedang kita bangun?",
                            suggestion: "Misal: Aplikasi E-commerce untuk UMKM"
                        },
                        timestamp: new Date().toISOString()
                    }
                ],
                answers: {},
                summary: null,
                mood: 'blue'
            })
        }),
        {
            name: 'project-wizard-storage',
            partialize: (state) => ({ historyLog: state.historyLog, sessionId: state.sessionId }),
        }
    )
);
