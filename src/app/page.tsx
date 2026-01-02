"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { postSearch, downloadReportPdf } from "@/lib/api";
import { saveLastSearch } from "@/lib/session";

type ChatMsg = { role: "user" | "assistant"; content: string };

export default function Page() {
    const router = useRouter();
    const [prompt, setPrompt] = useState("");
    const [busy, setBusy] = useState<"idle" | "searching" | "pdf">("idle");
    const [error, setError] = useState<string | null>(null);
    const [messages, setMessages] = useState<ChatMsg[]>([
        {
            role: "assistant",
            content:
                'Describe what kind of influencers you want (tags, follower range, content type, ad ratio). Example: "1k~10k 헤어 루틴 REEL 광고 적게".',
        },
    ]);


    const canSend = useMemo(() => prompt.trim().length > 0 && busy === "idle", [prompt, busy]);

    async function onSend() {
        const text = prompt.trim();
        if (!text) return;

        setError(null);
        setPrompt("");
        setMessages((m) => [...m, { role: "user", content: text }]);
        setBusy("searching");

        try {
            const data = await postSearch(text);

            saveLastSearch(data);

            setMessages((m) => [
                ...m,
                {
                    role: "assistant",
                    content: `Got it. I found ${data.results.length} matches. Opening results…`,
                },
            ]);
            const resp = await postSearch(prompt);

            const full = { ...resp, prompt };

            saveLastSearch(full);
            router.push("/results");
        } catch (e: any) {
            setError(e?.message ?? "Unknown error");
            setMessages((m) => [
                ...m,
                { role: "assistant", content: "Something went wrong. Check the error below." },
            ]);
        } finally {
            setBusy("idle");
        }
    }

    async function onDownloadPdfHere() {
        const lastUserMsg = [...messages].reverse().find((m) => m.role === "user")?.content;
        const text = lastUserMsg?.trim();
        if (!text) {
            setError("No prompt found yet. Send a prompt first.");
            return;
        }

        setError(null);
        setBusy("pdf");
        try {
            const blob = await downloadReportPdf(text);
            const url = URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = url;
            a.download = "rise_demo_report.pdf";
            document.body.appendChild(a);
            a.click();
            a.remove();

            URL.revokeObjectURL(url);
        } catch (e: any) {
            setError(e?.message ?? "Unknown error");
        } finally {
            setBusy("idle");
        }
    }

    return (
        <main className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-yellow-50">
            <div className="mx-auto max-w-4xl px-6 py-12">
                <header className="mb-12 text-center">
                    <div className="mb-8 inline-block rounded-1xl bg-gradient-to-r from-amber-400 to-yellow-500 px-8 py-4">
                        <span className="text-xl font-bold tracking-wide text-white">NANO DEMO</span>
                    </div>
                    <p className="mt-3 text-base text-gray-600">
                        AI-powered intent extraction •  Instant PDF reports
                    </p>
                </header>

                <div className="rounded-3xl border border-amber-200/50 bg-white shadow-2xl shadow-amber-500/10">
                    <div className="max-h-[60vh] overflow-auto p-6">
                        <div className="space-y-4">
                            {messages.map((m, idx) => (
                                <div
                                    key={idx}
                                    className={[
                                        "flex animate-in fade-in slide-in-from-bottom-2 duration-500",
                                        m.role === "user" ? "justify-end" : "justify-start",
                                    ].join(" ")}
                                    style={{ animationDelay: `${idx * 50}ms` }}
                                >
                                    <div
                                        className={[
                                            "max-w-[80%] rounded-2xl px-5 py-3 text-sm leading-relaxed shadow-sm",
                                            m.role === "user"
                                                ? "bg-gradient-to-br from-amber-400 to-yellow-500 text-white font-medium"
                                                : "bg-gray-50 text-gray-800 border border-gray-100",
                                        ].join(" ")}
                                    >
                                        {m.content}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="border-t border-gray-100 bg-gradient-to-b from-white to-amber-50/30 p-5">
                        {error && (
                            <div className="mb-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                {error}
                            </div>
                        )}

                        <div className="flex gap-3">
                            <textarea
                                className="min-h-[56px] flex-1 resize-none rounded-2xl border-2 border-gray-200
                                bg-white px-4 py-3 text-sm outline-none transition-all
                                text-slate-900 placeholder:text-gray-400
                                focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
                                placeholder='Try: "1k~10k 헤어 루틴 REEL 광고 적게"'
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                onKeyDown={(e) => {
                                    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") onSend();
                                }}
                                disabled={busy !== "idle"}
                            />
                            <button
                                className="rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-amber-500/30 transition-all hover:shadow-xl hover:shadow-amber-500/40 disabled:opacity-50 disabled:shadow-none"
                                onClick={onSend}
                                disabled={!canSend}
                                title="Send (Ctrl/Cmd + Enter)"
                            >
                                {busy === "searching" ? (
                                    <span className="flex items-center gap-2">
                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                                        Searching
                                    </span>
                                ) : (
                                    "Send"
                                )}
                            </button>
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                            <span className="text-xs text-gray-500">
                                ⌘ + Enter to send
                            </span>

                        </div>
                    </div>
                </div>

                <p className="mt-6 text-center text-xs text-gray-500">
                    Demo uses synthetic data • Live mode requires Meta API approval
                </p>
            </div>
        </main>
    );
}