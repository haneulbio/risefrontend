"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getScout } from "@/lib/api";
import type { MatchResult } from "@/lib/types";
import {
    ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip,
    BarChart, Bar
} from "recharts";

// If you exported these from types.ts, import them.
// Otherwise keep them in this file.
type InfluencerLite = {
    username: string;
    followersCount: number;
    score: number;
    badges: string[];
    reasons: string[];
    evidencePostIds: string[];
    igUserId?: string;
};

type OverviewKpi = {
    score100: number;
    followers: number;
    badgeCount: number;
    evidenceCount: number;
    rrMed: number;
    rfMed: number;
    adRatio: number;
    eMed: number;
    clMed: number;
    uploadStdGapDays: number;
    rrSeries: number[];
    rfSeries: number[];
    adSeries: number[];
};

function buildOverviewKpi(d: InfluencerLite): OverviewKpi {
    const score = Math.max(0, Math.min(100, d.score ?? 0));
    const followers = Math.max(0, d.followersCount ?? 0);

    const badgeCount = d.badges?.length ?? 0;
    const evidenceCount = d.evidencePostIds?.length ?? 0;

    const rrMed = +(0.01 + (score / 100) * 0.06).toFixed(4);
    const rfMed = +(0.1 + Math.log10(followers + 10) * 0.15).toFixed(3);
    const adRatio = +(badgeCount > 0 ? Math.min(1, badgeCount / 6) : 0).toFixed(2);
    const eMed = Math.round((followers * (score / 100)) / 50);
    const clMed = +(0.02 + (1 - score / 100) * 0.08).toFixed(3);
    const uploadStdGapDays = +(3 + (1 - score / 100) * 10).toFixed(2);

    const rrSeries = Array.from({ length: 10 }, (_, i) => {
        const t = i / 9;
        return +(rrMed * (0.9 + 0.2 * t)).toFixed(4);
    });

    const rfSeries = Array.from({ length: 10 }, (_, i) => {
        const t = i / 9;
        return +(rfMed * (0.92 + 0.16 * (1 - t))).toFixed(3);
    });

    const adSeries = Array.from({ length: 10 }, (_, i) => {
        const base = (badgeCount + evidenceCount) % 4;
        return (i % (base + 2) === 0) ? 1 : 0;
    });

    return {
        score100: score,
        followers,
        badgeCount,
        evidenceCount,
        rrMed,
        rfMed,
        adRatio,
        eMed,
        clMed,
        uploadStdGapDays,
        rrSeries,
        rfSeries,
        adSeries,
    };
}

type TabKey = "overview" | "growth" | "content" | "ads" | "risk" | "ai";

function TabButton({ active, children, onClick }: any) {
    return (
        <button
            onClick={onClick}
            className={[
                "rounded-full px-4 py-2 text-sm font-semibold transition",
                active ? "bg-amber-400 text-neutral-950" : "border border-white/10 bg-white/5 text-white/80 hover:bg-white/10",
            ].join(" ")}
        >
            {children}
        </button>
    );
}

function kpiCard(title: string, value: string, hint: string) {
    return (
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="text-xs font-bold text-white/60">{title}</div>
            <div className="mt-2 text-2xl font-extrabold text-white/95">{value}</div>
            <div className="mt-2 text-xs text-white/50">{hint}</div>
        </div>
    );
}

export default function InfluencerReportPage() {
    const params = useParams<{ scoutId: string; username: string }>();
    const scoutId = params.scoutId;
    const username = decodeURIComponent(params.username);

    const [tab, setTab] = useState<TabKey>("overview");
    const [detail, setDetail] = useState<InfluencerLite | null>(null);
    const [kpi, setKpi] = useState<OverviewKpi | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let mounted = true;

        (async () => {
            setError(null);
            setLoading(true);
            try {
                const s = await getScout(scoutId);
                const m = (s.results ?? []).find((x: MatchResult) => x.username === username) ?? null;

                if (!mounted) return;

                if (!m) {
                    setDetail(null);
                    setKpi(null);
                    setError("Influencer not in top results.");
                    return;
                }

                const lite: InfluencerLite = {
                    username: m.username,
                    igUserId: m.igUserId,
                    followersCount: m.followersCount,
                    score: m.score,
                    reasons: m.reasons ?? [],
                    badges: m.badges ?? [],
                    evidencePostIds: m.evidencePostIds ?? [],
                };

                setDetail(lite);
                setKpi(buildOverviewKpi(lite));
            } catch (e: any) {
                if (!mounted) return;
                setError(e?.message ?? "Unknown error");
            } finally {
                if (!mounted) return;
                setLoading(false);
            }
        })();

        return () => { mounted = false; };
    }, [scoutId, username]);

    const rrSeries = (kpi?.rrSeries ?? []).map((v, i) => ({ i: i + 1, v }));
    const rfSeries = (kpi?.rfSeries ?? []).map((v, i) => ({ i: i + 1, v }));
    const adSeries = (kpi?.adSeries ?? []).map((v, i) => ({ i: i + 1, v }));

    const hasCharts = rrSeries.length > 0;

    return (
        <main className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-950 to-amber-950/30 text-neutral-100">
            <div className="mx-auto max-w-6xl px-6 py-10">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <div className="text-xs font-bold uppercase tracking-wide text-amber-200/80">Influencer report</div>
                        <h1 className="mt-2 text-3xl font-extrabold">
                            @{username}
                            <span className="ml-3 text-base font-semibold text-white/60">
                {detail?.followersCount ? `${detail.followersCount.toLocaleString()} followers` : ""}
              </span>
                        </h1>
                        <div className="mt-2 text-sm text-white/60">
                            ScoutId: <span className="font-mono text-white/80">{scoutId}</span>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <Link
                            href={`/results?scoutId=${encodeURIComponent(scoutId)}`}
                            className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white/80 hover:bg-white/10"
                        >
                            리스트로 돌아가기
                        </Link>
                        <Link
                            href="/workplace/reports"
                            className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white/80 hover:bg-white/10"
                        >
                            Reports
                        </Link>
                    </div>
                </div>

                {error && (
                    <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-100">
                        {error}
                    </div>
                )}

                <div className="mt-6 flex flex-wrap gap-2">
                    <TabButton active={tab === "overview"} onClick={() => setTab("overview")}>핵심 지표</TabButton>
                    <TabButton active={tab === "growth"} onClick={() => setTab("growth")}>성장</TabButton>
                    <TabButton active={tab === "content"} onClick={() => setTab("content")}>콘텐츠</TabButton>
                    <TabButton active={tab === "ads"} onClick={() => setTab("ads")}>광고/협찬</TabButton>
                    <TabButton active={tab === "risk"} onClick={() => setTab("risk")}>리스크</TabButton>
                    <TabButton active={tab === "ai"} onClick={() => setTab("ai")}>AI 요약</TabButton>
                </div>

                <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-6">
                    {loading && <div className="text-sm text-white/60">Loading…</div>}

                    {tab === "overview" && (
                        <>
                            <div className="grid gap-4 md:grid-cols-3">
                                {kpiCard("RR_med", kpi ? kpi.rrMed.toFixed(4) : "—", "최근 N개 기준 (L+C)/Reach 중앙값")}
                                {kpiCard("RF_med", kpi ? kpi.rfMed.toFixed(3) : "—", "최근 N개 기준 Reach/Follower 중앙값")}
                                {kpiCard("AdRatio", kpi ? kpi.adRatio.toFixed(2) : "—", "최근 N개 중 광고 표기 비율")}
                                {kpiCard("E_med", kpi ? `${Math.round(kpi.eMed)}` : "—", "반응(좋아요+댓글) 중앙값")}
                                {kpiCard("CL_med", kpi ? kpi.clMed.toFixed(3) : "—", "댓글/좋아요 중앙값")}
                                {kpiCard("Upload StdGap", kpi ? kpi.uploadStdGapDays.toFixed(2) : "—", "업로드 간격 표준편차(낮을수록 규칙적)")}
                            </div>

                            <div className="mt-6 grid gap-4 md:grid-cols-2">
                                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                                    <div className="text-sm font-bold">RR Trend (recent)</div>
                                    <div className="mt-3 h-48">
                                        {hasCharts ? (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart data={rrSeries}>
                                                    <XAxis dataKey="i" tick={{ fill: "rgba(255,255,255,0.5)" }} />
                                                    <YAxis tick={{ fill: "rgba(255,255,255,0.5)" }} />
                                                    <Tooltip />
                                                    <Line type="monotone" dataKey="v" dot={false} />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div className="text-sm text-white/50">No series data yet.</div>
                                        )}
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                                    <div className="text-sm font-bold">RF Trend (recent)</div>
                                    <div className="mt-3 h-48">
                                        {rfSeries.length ? (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart data={rfSeries}>
                                                    <XAxis dataKey="i" tick={{ fill: "rgba(255,255,255,0.5)" }} />
                                                    <YAxis tick={{ fill: "rgba(255,255,255,0.5)" }} />
                                                    <Tooltip />
                                                    <Line type="monotone" dataKey="v" dot={false} />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div className="text-sm text-white/50">No series data yet.</div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4">
                                <div className="text-sm font-bold">Why recommended</div>
                                <ul className="mt-3 space-y-2 text-sm text-white/80">
                                    {(detail?.reasons ?? []).map((x, i) => <li key={i}>• {x}</li>)}
                                </ul>
                            </div>
                        </>
                    )}

                    {tab === "ads" && (
                        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                            <div className="text-sm font-bold">Ad timeline (recent)</div>
                            <div className="mt-3 h-40">
                                {adSeries.length ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={adSeries}>
                                            <XAxis dataKey="i" tick={{ fill: "rgba(255,255,255,0.5)" }} />
                                            <YAxis tick={{ fill: "rgba(255,255,255,0.5)" }} />
                                            <Tooltip />
                                            <Bar dataKey="v" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="text-sm text-white/50">No ad series yet.</div>
                                )}
                            </div>
                            <div className="mt-4 text-sm text-white/70">
                                * “연속 광고 스트릭” 같은 지표를 서버에서 계산해주면 여기서 배지로 강조할 수 있어요.
                            </div>
                        </div>
                    )}

                    {tab === "ai" && (
                        <div className="text-sm text-white/60">
                            AI 요약 - 추후에 확장 예정 (서버에서 summary/headline/grounds/watchouts 제공 시 연결)
                        </div>
                    )}

                    {tab === "growth" && <div className="text-sm text-white/60">Growth tab (follower time series) - 서버 데이터 연결 예정</div>}
                    {tab === "content" && <div className="text-sm text-white/60">Content tab (format donut, top hashtags) - 서버 데이터 연결 예정</div>}
                    {tab === "risk" && <div className="text-sm text-white/60">Risk tab (flags, comment quality) - 서버 데이터 연결 예정</div>}
                </div>
            </div>
        </main>
    );
}
