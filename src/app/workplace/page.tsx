"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { loadRecentScouts } from "@/lib/recent";
import type { ScoutSummary } from "@/lib/types";
import {authMe, listScouts} from "@/lib/api";

export default function WorkplaceDashboard() {
    const router = useRouter();

    const [items, setItems] = useState<ScoutSummary[]>([]);

    const [checking, setChecking] = useState(true);
    const [me, setMe] = useState<{ username: string } | null>(null);


    useEffect(() => {
        listScouts(10, 0).then(setItems).catch(() => setItems([]));
    }, []);



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

    const loginHref = useMemo(() => `/login?next=${encodeURIComponent("/")}`, []);
    const newScoutHref = me ? "/" : loginHref;

    return (
        <main className="grid gap-6 lg:grid-cols-3">
            <section className="lg:col-span-2 rounded-3xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <div className="text-xs font-bold uppercase tracking-wide text-amber-200/80">
                            Overview
                        </div>
                        <h1 className="mt-2 text-2xl font-extrabold">Workplace Dashboard</h1>
                        <p className="mt-2 text-sm text-white/60">
                            최근 Scout를 확인하고, 새 Scout를 생성해서 Verify/Report로 진행하세요.
                        </p>

                        {!checking && me?.username && (
                            <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
                                Signed in as <span className="font-mono text-white/85">{me.username}</span>
                            </div>
                        )}
                    </div>

                    <Link
                        href={newScoutHref}
                        aria-disabled={!me}
                        className={[
                            "rounded-2xl px-5 py-3 text-sm font-extrabold shadow-lg transition",
                            checking
                                ? "border border-white/10 bg-white/5 text-white/60"
                                : me
                                    ? "bg-gradient-to-br from-amber-400 to-yellow-500 text-neutral-950 shadow-amber-500/20 hover:brightness-105"
                                    : "border border-white/10 bg-white/5 text-white/50 cursor-not-allowed",
                        ].join(" ")}
                        onClick={(e) => {
                            if (checking) {
                                e.preventDefault();
                                return;
                            }
                            if (!me) {
                                e.preventDefault();
                                router.push(loginHref);
                            }
                        }}
                        title={!me && !checking ? "로그인 후 Scout 생성 가능" : undefined}
                    >
                        {checking ? "Checking…" : me ? "New Scout" : "Login required"}
                    </Link>
                </div>

                {!checking && !me && (
                    <div className="mt-5 rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
                        Scout 생성은 로그인 후 가능합니다.{" "}
                        <Link className="underline text-amber-200" href={loginHref}>
                            로그인하러 가기
                        </Link>
                    </div>
                )}

                <div className="mt-6">
                    <div className="text-sm font-bold text-white/80">Recent Scouts (local)</div>
                    <div className="mt-3 grid gap-3">
                        {items.length === 0 ? (
                            <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/60">
                                아직 저장된 Scout가 없어요. 홈에서 Scout를 만들어보세요.
                            </div>
                        ) : (
                            items.map((s) => (
                                <Link
                                    key={s.id}
                                    href={`/results?scoutId=${encodeURIComponent(s.id)}`}
                                    className="rounded-2xl border border-white/10 bg-black/20 p-4 hover:bg-black/30"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="font-mono text-xs text-white/50">{s.id}</div>
                                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
                      {s.status}
                    </span>
                                    </div>
                                    <div className="mt-2 text-sm font-semibold text-white/90 line-clamp-2">
                                        {s.prompt}
                                    </div>
                                    <div className="mt-2 text-xs text-white/50">updated: {s.updatedAt}</div>
                                </Link>
                            ))
                        )}
                    </div>
                </div>
            </section>

            <aside className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <div className="text-sm font-bold text-white/80">Next actions</div>
                <div className="mt-3 space-y-3 text-sm text-white/70">
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                        1) Scout 생성 → Results에서 DONE 확인
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                        2) Download PDF 클릭 → Report 기록 남기기(추가 예정)
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                        3) Reports 페이지에서 다운로드 재사용
                    </div>
                </div>
            </aside>
        </main>
    );
}
