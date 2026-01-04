"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createScout, authMe } from "@/lib/api";
import { saveLastScoutId } from "@/lib/session";

type ChatMsg = { role: "user" | "assistant"; content: string };

const EXAMPLES = [
    `1k~10k 헤어 루틴 REEL 광고 적게 최근10개`,
    `3k~8k 염색/손상모 중심, 협찬 비율 0.2 이하`,
    `두피케어 중심, 영상 위주, 광고 적게, 업로드 규칙적인 계정`,
];

export default function Page() {
    const router = useRouter();
    const [prompt, setPrompt] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [messages, setMessages] = useState<ChatMsg[]>([
        {
            role: "assistant",
            content:
                "원하는 인플루언서 조건을 자연어로 적어주세요. (태그 / 팔로워 범위 / 타입 / 광고 비율 / 최근 N / 선호)",
        },
    ]);

    // ✅ auth state
    const [checking, setChecking] = useState(true);
    const [me, setMe] = useState<{ username: string } | null>(null);

    useEffect(() => {
        let mounted = true;
        (async () => {
            setChecking(true);
            try {
                const m = await authMe(); // { username }
                if (!mounted) return;
                setMe(m);
            } catch {
                if (!mounted) return;
                setMe(null);
            } finally {
                if (!mounted) return;
                setChecking(false);
            }
        })();
        return () => {
            mounted = false;
        };
    }, []);

    const canSend = useMemo(() => {
        return prompt.trim().length > 0 && !busy && !!me && !checking;
    }, [prompt, busy, me, checking]);

    const loginHref = useMemo(() => `/login?next=${encodeURIComponent("/")}`, []);

    async function onSend() {
        if (checking) return;

        if (!me) {
            // 로그인 안되어 있으면 로그인 페이지로
            router.push(loginHref);
            return;
        }

        const text = prompt.trim();
        if (!text) return;

        setError(null);
        setPrompt("");
        setMessages((m) => [...m, { role: "user", content: text }]);
        setBusy(true);

        try {
            setMessages((m) => [
                ...m,
                { role: "assistant", content: "좋아요. Scout를 생성하고 분석을 시작할게요…" },
            ]);

            const scout = await createScout(text);
            saveLastScoutId(scout.id);

            setMessages((m) => [
                ...m,
                {
                    role: "assistant",
                    content: `Scout 생성 완료. 상태: ${scout.status}. 결과 페이지로 이동합니다.`,
                },
            ]);

            router.push(`/results?scoutId=${encodeURIComponent(scout.id)}`);
        } catch (e: any) {
            setError(e?.message ?? "Unknown error");
            setMessages((m) => [
                ...m,
                { role: "assistant", content: "에러가 발생했어요. 아래 메시지를 확인해주세요." },
            ]);
        } finally {
            setBusy(false);
        }
    }

    return (
        <main className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-950 to-amber-950/30 text-neutral-100">
            <div className="mx-auto max-w-5xl px-6 py-10">
                <header className="mb-8 flex items-start justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80">
                            <span className="h-2 w-2 rounded-full bg-emerald-400" />
                            Workplace Demo
                        </div>
                        <h1 className="mt-3 text-3xl font-bold tracking-tight">
                            Scout & Verify
                            <span className="ml-2 text-amber-300">Influencer Finder</span>
                        </h1>
                        <p className="mt-2 max-w-2xl text-sm text-white/70">
                            자연어 프롬프트로 Scout를 만들고, 서버에서 Verify/KPI 계산 후 PDF 리포트를 생성합니다.
                        </p>

                        {/* ✅ login badge / warning */}
                        <div className="mt-3">
                            {checking ? (
                                <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60">
                  Checking session…
                </span>
                            ) : me ? (
                                <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
                  Signed in as <span className="ml-2 font-mono text-white/85">{me.username}</span>
                </span>
                            ) : (
                                <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
                                    로그인 후 Scout 생성이 가능합니다.{" "}
                                    <button
                                        className="underline text-amber-200"
                                        onClick={() => router.push(loginHref)}
                                    >
                                        로그인 하러가기
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="hidden sm:block text-right text-xs text-white/60">
                        <div className="font-semibold text-white/80">Tips</div>
                        <div>Ctrl/Cmd + Enter 전송</div>
                        <div>최근 N, 선호(RR↑, RF↑, Ad↓)도 가능</div>
                    </div>
                </header>

                <div className="grid gap-6 lg:grid-cols-5">
                    {/* Left: Chat */}
                    <section className="lg:col-span-3 rounded-3xl border border-white/10 bg-white/5 shadow-xl shadow-black/40 overflow-hidden">
                        <div className="max-h-[62vh] overflow-auto p-6">
                            <div className="space-y-4">
                                {messages.map((m, idx) => (
                                    <div
                                        key={idx}
                                        className={["flex", m.role === "user" ? "justify-end" : "justify-start"].join(" ")}
                                    >
                                        <div
                                            className={[
                                                "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                                                m.role === "user"
                                                    ? "bg-gradient-to-br from-amber-400 to-yellow-500 text-neutral-950 font-semibold"
                                                    : "bg-white/5 border border-white/10 text-white/90",
                                            ].join(" ")}
                                        >
                                            {m.content}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="border-t border-white/10 bg-black/30 p-5">
                            {error && (
                                <div className="mb-3 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                                    {error}
                                </div>
                            )}

                            <div className="flex gap-3">
                <textarea
                    className="min-h-[56px] flex-1 resize-none rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-white/40 focus:border-amber-400/60 focus:ring-4 focus:ring-amber-400/10 disabled:opacity-60"
                    placeholder='예: "1k~10k 헤어 루틴 REEL 광고 적게 최근10개"'
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={(e) => {
                        if ((e.ctrlKey || e.metaKey) && e.key === "Enter") onSend();
                    }}
                    disabled={busy || !me || checking}
                />

                                <button
                                    className={[
                                        "rounded-2xl px-7 py-3 text-sm font-extrabold shadow-lg transition disabled:opacity-50",
                                        me
                                            ? "bg-gradient-to-br from-amber-400 to-yellow-500 text-neutral-950 shadow-amber-500/20"
                                            : "border border-white/10 bg-white/5 text-white/70",
                                    ].join(" ")}
                                    onClick={onSend}
                                    disabled={!canSend}
                                    title={!me && !checking ? "로그인 후 Scout 생성 가능" : undefined}
                                >
                                    {checking ? (
                                        "Checking…"
                                    ) : busy ? (
                                        <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-950 border-t-transparent" />
                      Creating…
                    </span>
                                    ) : me ? (
                                        "Create Scout"
                                    ) : (
                                        "Login required"
                                    )}
                                </button>
                            </div>

                            <div className="mt-3 text-xs text-white/50">
                                ⌘/Ctrl + Enter 전송 • 서버에서 Scout 생성 후 결과 페이지로 이동
                            </div>
                        </div>
                    </section>

                    {/* Right: Examples */}
                    <aside className="lg:col-span-2 space-y-4">
                        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                            <div className="text-sm font-bold text-white/90">Examples</div>
                            <div className="mt-3 space-y-2">
                                {EXAMPLES.map((ex) => (
                                    <button
                                        key={ex}
                                        onClick={() => setPrompt(ex)}
                                        disabled={!me || checking}
                                        className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-left text-sm text-white/80 hover:bg-black/30 disabled:opacity-50 disabled:hover:bg-black/20"
                                        title={!me && !checking ? "로그인 후 사용 가능" : undefined}
                                    >
                                        {ex}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-amber-500/10 p-5">
                            <div className="text-sm font-bold text-white/90">What happens?</div>
                            <ol className="mt-3 space-y-2 text-sm text-white/70">
                                <li>1) 프롬프트 → Intent 추출</li>
                                <li>2) Demo 데이터에서 Top10 매칭</li>
                                <li>3) Verify(KPI/그래프) 계산</li>
                                <li>4) Report 저장/다운로드(PDF)</li>
                            </ol>
                        </div>
                    </aside>
                </div>

                <p className="mt-8 text-center text-xs text-white/40">
                    Demo uses synthetic data • Live mode requires Meta API approval
                </p>
            </div>
        </main>
    );
}
