"use client";

import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Bot,
    Send,
    Stethoscope,
    AlertCircle,
    ChevronRight,
    History,
    RefreshCcw,
    Zap,
    Thermometer,
    Wind,
    BrainCircuit,
    CircleUser,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Message {
    role: "user" | "ai";
    content: string;
}

export default function SymptomEntry() {
    const [messages, setMessages] = useState<Message[]>([
        {
            role: "ai",
            content:
                "Hello! I'm your AI Care Assistant. Please describe the symptoms you're experiencing, and I'll help assess the situation.",
        },
    ]);
    const [input, setInput] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [currentAiResponse, setCurrentAiResponse] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, currentAiResponse]);

    const handleSend = async () => {
        if (!input.trim() || isAnalyzing) return;

        const userMessage = { role: "user" as const, content: input };
        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);
        setInput("");
        setIsAnalyzing(true);
        setCurrentAiResponse("");

        try {
            const response = await fetch("/api/symptoms", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: updatedMessages }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to get assessment");
            }

            if (!response.body) throw new Error("No response body");

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let aiText = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value, { stream: true });
                aiText += chunk;
                setCurrentAiResponse(aiText);
            }

            setMessages([...updatedMessages, { role: "ai", content: aiText }]);
            setCurrentAiResponse("");
        } catch (err: any) {
            toast.error(err.message);
            console.error(err);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const startNewAssessment = () => {
        setMessages([
            {
                role: "ai",
                content:
                    "Hello! I'm your AI Care Assistant. Please describe the symptoms you're experiencing, and I'll help assess the situation.",
            },
        ]);
        setInput("");
        setIsAnalyzing(false);
        setCurrentAiResponse("");
    };

    const suggestions = [
        "I have a persistent cough",
        "Severe headache since morning",
        "Mild fever and body aches",
        "Stomach pain after meals",
    ];

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-blue-600 rounded-3xl flex items-center justify-center shadow-xl shadow-blue-200 ring-4 ring-blue-50">
                        <Bot className="text-white w-8 h-8" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                            AI Symptom Check
                        </h2>
                        <p className="text-slate-500 font-medium mt-1">
                            Real-time intelligent assessment powered by Gemini
                            AI.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 p-1 bg-slate-100 rounded-2xl">
                    <button
                        onClick={startNewAssessment}
                        className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm text-xs font-bold text-slate-900 transition-all hover:bg-slate-50"
                    >
                        <RefreshCcw className="w-3.5 h-3.5 text-blue-500" />
                        New Assessment
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Left Column - Chat Interface */}
                <div className="lg:col-span-3 space-y-6">
                    <Card className="h-[600px] rounded-[2.5rem] border-none shadow-2xl flex flex-col bg-white overflow-hidden">
                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-8 scroll-smooth">
                            {messages.map((m, i) => (
                                <div
                                    key={i}
                                    className={cn(
                                        "flex gap-4",
                                        m.role === "user"
                                            ? "flex-row-reverse"
                                            : "flex-row",
                                    )}
                                >
                                    <div
                                        className={cn(
                                            "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border",
                                            m.role === "user"
                                                ? "bg-slate-50 border-slate-100 text-slate-600"
                                                : "bg-blue-600 border-blue-500 text-white",
                                        )}
                                    >
                                        {m.role === "user" ? (
                                            <CircleUser className="w-5 h-5" />
                                        ) : (
                                            <Bot className="w-5 h-5" />
                                        )}
                                    </div>
                                    <div
                                        className={cn(
                                            "max-w-[80%] p-6 rounded-3xl text-sm font-medium leading-relaxed whitespace-pre-wrap",
                                            m.role === "user"
                                                ? "bg-slate-50 text-slate-700 rounded-tr-none"
                                                : "bg-blue-50 text-slate-800 border border-blue-100/50 rounded-tl-none shadow-sm",
                                        )}
                                    >
                                        {m.content}
                                    </div>
                                </div>
                            ))}
                            {isAnalyzing && currentAiResponse && (
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shrink-0">
                                        <Bot className="w-5 h-5" />
                                    </div>
                                    <div className="max-w-[80%] p-6 rounded-3xl text-sm font-medium leading-relaxed whitespace-pre-wrap bg-blue-50 text-slate-800 border border-blue-100/50 rounded-tl-none shadow-sm">
                                        {currentAiResponse}
                                    </div>
                                </div>
                            )}
                            {isAnalyzing && !currentAiResponse && (
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white">
                                        <Bot className="w-5 h-5" />
                                    </div>
                                    <div className="bg-blue-50/50 p-6 rounded-3xl rounded-tl-none flex items-center gap-3">
                                        <div className="flex gap-1.5">
                                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                                        </div>
                                        <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
                                            AI is assessing...
                                        </span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-8 pt-0">
                            <div className="relative group">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={(e) =>
                                        e.key === "Enter" && handleSend()
                                    }
                                    disabled={isAnalyzing}
                                    placeholder="Describe how you feel (e.g. 'I have a sore throat and slight fever')..."
                                    className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-3xl py-6 pl-8 pr-24 outline-none transition-all font-semibold text-slate-900 disabled:opacity-50"
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                    <button
                                        onClick={handleSend}
                                        disabled={isAnalyzing || !input.trim()}
                                        className="bg-blue-600 hover:bg-blue-700 text-white p-3.5 rounded-2xl shadow-lg shadow-blue-200 transition-all active:scale-90 disabled:opacity-50 disabled:shadow-none"
                                    >
                                        <Send className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 mt-6">
                                {suggestions.map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => setInput(s)}
                                        disabled={isAnalyzing}
                                        className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-[10px] font-bold text-slate-500 transition-all border border-transparent hover:border-blue-100 uppercase tracking-tight disabled:opacity-50"
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Right Column - Context & Safeguards */}
                <div className="space-y-6">
                    <Card className="p-6 rounded-[2rem] border-none shadow-xl bg-white space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-600">
                                <AlertCircle className="w-5 h-5" />
                            </div>
                            <h4 className="font-bold text-slate-900">
                                Medical Disclaimer
                            </h4>
                        </div>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">
                            MedFlow AI is an assessment tool powered by Gemini
                            2.0 Flash, not a diagnostic service. In case of
                            life-threatening emergencies, please call emergency
                            services immediately.
                        </p>
                        <Button
                            variant="outline"
                            className="w-full rounded-2xl border-slate-100 text-slate-600 font-bold h-12 hover:bg-slate-50"
                        >
                            Emergency Protocols
                        </Button>
                    </Card>

                    <Card className="p-6 rounded-[2rem] border-none shadow-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Zap className="w-20 h-20" />
                        </div>
                        <div className="relative z-10 space-y-4">
                            <h4 className="font-bold flex items-center gap-2">
                                <BrainCircuit className="w-5 h-5" />
                                Live Metrics
                            </h4>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-blue-100 uppercase tracking-widest">
                                        Confidence
                                    </span>
                                    <span className="text-xs font-black">
                                        Streaming
                                    </span>
                                </div>
                                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-white h-full w-[94%] rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>
                                </div>
                            </div>
                            <div className="pt-2">
                                <p className="text-[10px] font-medium text-blue-100 italic">
                                    "Connected to Gemini 2.0 Flash for
                                    multi-modal clinical reasoning."
                                </p>
                            </div>
                        </div>
                    </Card>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-5 rounded-3xl bg-white shadow-sm border border-slate-100 space-y-2">
                            <Thermometer className="w-5 h-5 text-red-500" />
                            <p className="text-[10px] font-bold text-slate-400">
                                VITALS
                            </p>
                            <p className="text-xs font-bold text-slate-900">
                                SYNCED
                            </p>
                        </div>
                        <div className="p-5 rounded-3xl bg-white shadow-sm border border-slate-100 space-y-2">
                            <Wind className="w-5 h-5 text-blue-500" />
                            <p className="text-[10px] font-bold text-slate-400">
                                TRIAGE
                            </p>
                            <p className="text-xs font-bold text-slate-900">
                                OPTIMAL
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
