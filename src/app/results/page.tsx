"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createReport, downloadReportPdfById, getScout } from "@/lib/api";
import { loadLastScoutId, saveLastScoutId } from "@/lib/session";
import type { MatchResult, ScoutDetail } from "@/lib/types";
import {pushRecentScout} from "@/lib/recent";
import {pushRecentReport} from "@/lib/reports_recent";

function formatNum(n: number) {
    return new Intl.NumberFormat().format(n);
}

function Pill({ children }: { children: React.ReactNode }) {
    return (
        <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80">
      {children}
    </span>
    );
}

export default function ResultsPage() {
    const sp = useSearchParams();
    const scoutIdFromQuery = sp.get("scoutId");

    const [scoutId, setScoutId] = useState<string | null>(null);
    const [data, setData] = useState<ScoutDetail | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const [busyPdf, setBusyPdf] = useState(false);

    // Resolve scoutId
    useEffect(() => {
        const id = scoutIdFromQuery || loadLastScoutId();
        if (id) {
            setScoutId(id);
            saveLastScoutId(id);
        }
    }, [scoutIdFromQuery]);

    // Fetch scout
    useEffect(() => {
        if (!scoutId) return;

        let mounted = true;
        async function load() {
            setError(null);
            setLoading(true);
            try {
                const d = await getScout(scoutId);
                if (!mounted) return;
                setData(d);
                pushRecentScout({ id: d.id, status: d.status, prompt: d.prompt, intent: d.intent, createdAt: d.createdAt, updatedAt: d.updatedAt });
            } catch (e: any) {
                if (!mounted) return;
                setError(e?.message ?? "Unknown error");
            } finally {
                if (!mounted) return;
                setLoading(false);
            }
        }
        load();
        return () => {
            mounted = false;
        };
    }, [scoutId]);

    const results = useMemo<MatchResult[]>(() => data?.results ?? [], [data]);

    async function onRefresh() {
        if (!scoutId) return;
        setError(null);
        setLoading(true);
        try {
            const d = await getScout(scoutId);
            setData(d);
        } catch (e: any) {
            setError(e?.message ?? "Unknown error");
        } finally {
            setLoading(false);
        }
    }

    async function onDownloadPdf() {
        if (!scoutId) return;
        setError(null);
        setBusyPdf(true);
        try {
            // 1) create report (server builds PDF)
            const r = await createReport(scoutId);
            pushRecentReport({
                reportId: r.reportId,
                scoutId: r.scoutId,
                createdAt: r.createdAt,
            });
            // 2) download by report id
            const blob = await downloadReportPdfById(r.reportId);

            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `rise_report_${r.reportId}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
        } catch (e: any) {
            setError(e?.message ?? "Unknown error");
        } finally {
            setBusyPdf(false);
        }
    }

    if (!scoutId) {
        return (
            <main className="min-h-screen bg-neutral-950 text-neutral-100">
                <div className="mx-auto max-w-3xl px-6 py-20 text-center">
                    <h1 className="text-2xl font-bold">No Scout</h1>
                    <p className="mt-2 text-sm text-white/60">홈에서 Scout를 먼저 생성해 주세요.</p>
                    <Link
                        className="mt-8 inline-flex rounded-2xl bg-amber-400 px-6 py-3 text-sm font-extrabold text-neutral-950"
                        href="/"
                    >
                        Back
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-950 to-amber-950/30 text-neutral-100">
            <div className="mx-auto max-w-6xl px-6 py-10">
                <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <Pill>Workplace</Pill>
                            <Pill>Scout</Pill>
                            {data?.status && <Pill>Status: {data.status}</Pill>}
                        </div>

                        <h1 className="mt-3 text-3xl font-bold tracking-tight">
                            Results
                            <span className="ml-2 text-amber-300">Top Matches</span>
                        </h1>
                        <p className="mt-2 text-sm text-white/70">
                            ScoutId: <span className="font-mono text-white/80">{scoutId}</span>
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <Link
                            className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white/80 hover:bg-white/10"
                            href="/"
                        >
                            New Scout
                        </Link>

                        <Link
                            className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white/80 hover:bg-white/10"
                            href="/workplace/scouts"
                        >
                            Scouts
                        </Link>

                        <Link
                            className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white/80 hover:bg-white/10"
                            href="/workplace/reports"
                        >
                            Reports
                        </Link>

                        <Link
                            className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white/80 hover:bg-white/10"
                            href="/workplace/settings"
                        >
                            Settings
                        </Link>

                        <button
                            className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white/80 hover:bg-white/10 disabled:opacity-50"
                            onClick={onRefresh}
                            disabled={loading}
                        >
                            {loading ? "Refreshing…" : "Refresh"}
                        </button>

                        <button
                            className="rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 px-6 py-3 text-sm font-extrabold text-neutral-950 shadow-lg shadow-amber-500/20 disabled:opacity-50"
                            onClick={onDownloadPdf}
                            disabled={busyPdf || loading || data?.status !== "DONE"}
                            title={data?.status !== "DONE" ? "DONE 상태일 때 다운로드 가능" : undefined}
                        >
                            {busyPdf ? (
                                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-950 border-t-transparent" />
                  Building PDF…
                </span>
                            ) : (
                                "Download PDF"
                            )}
                        </button>
                    </div>
                </header>

                {error && (
                    <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-100">
                        {error}
                    </div>
                )}

                {/* Prompt + Intent */}
                <section className="mb-6 rounded-3xl border border-white/10 bg-white/5 p-6">
                    <div className="text-xs font-bold uppercase tracking-wide text-amber-200/80">
                        Prompt
                    </div>
                    <p className="mt-2 text-base font-semibold text-white/90">
                        {data?.prompt ?? "(loading...)"}
                    </p>

                    <div className="mt-5 grid gap-4 md:grid-cols-4">
                        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                            <div className="text-xs font-bold text-white/60">Followers</div>
                            <div className="mt-2 text-lg font-extrabold">
                                {data?.intent?.minFollowers ?? "N/A"} ~ {data?.intent?.maxFollowers ?? "N/A"}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                            <div className="text-xs font-bold text-white/60">Types</div>
                            <div className="mt-2 text-sm font-semibold text-white/90">
                                {data?.intent?.wantedTypes?.length ? data.intent.wantedTypes.join(", ") : "N/A"}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                            <div className="text-xs font-bold text-white/60">Tags</div>
                            <div className="mt-2 text-sm font-semibold text-white/90">
                                {data?.intent?.wantedTags?.length ? data.intent.wantedTags.join(", ") : "N/A"}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                            <div className="text-xs font-bold text-white/60">Max Ad Ratio</div>
                            <div className="mt-2 text-lg font-extrabold">
                                {data?.intent?.maxAdRatio ?? "N/A"}
                            </div>
                        </div>
                    </div>

                    {data?.errorMessage && (
                        <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                            {data.errorMessage}
                        </div>
                    )}
                </section>

                {/* Results */}
                <section>
                    <div className="mb-4 flex items-end justify-between">
                        <div>
                            <h2 className="text-xl font-bold">Matched Influencers</h2>
                            <p className="text-sm text-white/60">
                                {data?.status === "DONE" ? "Ranked by relevance score" : "Scout is processing…"}
                            </p>
                        </div>
                        <div className="text-sm text-white/60">
                            {data?.status === "DONE" ? `${results.length} results` : ""}
                        </div>
                    </div>

                    <div className="grid gap-5 lg:grid-cols-2">
                        {results.map((r, idx) => (
                            <Link
                                key={r.username}
                                href={`/workplace/scouts/${encodeURIComponent(scoutId)}/influencers/${encodeURIComponent(r.username)}`}
                                className="block rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/30 hover:bg-white/7 transition"
                            >
                                <div
                                    key={r.username}
                                    className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/30 hover:bg-white/7 transition"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="inline-flex items-center gap-2">
                      <span className="inline-flex rounded-lg bg-amber-400 px-2.5 py-0.5 text-xs font-extrabold text-neutral-950">
                        #{idx + 1}
                      </span>
                                                {r.badges?.slice(0, 3).map((b) => (
                                                    <span
                                                        key={b}
                                                        className="inline-flex rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-white/80"
                                                    >
                          {b}
                        </span>
                                                ))}
                                            </div>

                                            <div className="mt-2 text-2xl font-extrabold">
                                                @{r.username}
                                            </div>

                                            <div className="mt-2 text-sm text-white/70">
                                                <span className="font-semibold text-white/90">{formatNum(r.followersCount)}</span>{" "}
                                                followers
                                            </div>

                                            {r.evidencePostIds?.length ? (
                                                <div className="mt-3 flex flex-wrap gap-2">
                                                    {r.evidencePostIds.slice(0, 6).map((id) => (
                                                        <span
                                                            key={id}
                                                            className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] text-white/70 font-mono"
                                                        >
                            {id}
                          </span>
                                                    ))}
                                                </div>
                                            ) : null}
                                        </div>

                                        <div className="rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 px-5 py-4 text-center shadow-lg shadow-amber-500/20">
                                            <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-950/70">
                                                Score
                                            </div>
                                            <div className="mt-1 text-2xl font-extrabold text-neutral-950">
                                                {Number(r.score).toFixed(2)}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
                                        <div className="mb-2 text-xs font-bold uppercase tracking-wide text-white/60">
                                            Reasons
                                        </div>
                                        <ul className="space-y-2">
                                            {r.reasons?.map((reason, i) => (
                                                <li key={i} className="text-sm text-white/80">
                                                    • {reason}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    <p className="mt-8 text-center text-xs text-white/40">
                        * Demo uses synthetic data to showcase the pipeline
                    </p>
                </section>
            </div>
        </main>
    );
}
