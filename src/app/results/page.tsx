"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { downloadReportPdf } from "@/lib/api";
import { loadLastSearch } from "@/lib/session";
import type { SearchResponse, MatchResult } from "@/lib/types";

function formatNum(n: number) {
    return new Intl.NumberFormat().format(n);
}

export default function ResultsPage() {
    const [data, setData] = useState<SearchResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [busyPdf, setBusyPdf] = useState(false);

    useEffect(() => {
        const d = loadLastSearch();
        setData(d);
    }, []);

    const prompt = data?.prompt ?? "";
    const intent = data?.intent;
    const results = useMemo<MatchResult[]>(() => data?.results ?? [], [data]);

    async function onDownloadPdf() {
        if (!prompt) return;
        setError(null);
        setBusyPdf(true);
        try {
            const blob = await downloadReportPdf(prompt);
            const url = URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = url;
            a.download = "rise_demo_report.pdf";
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

    if (!data) {
        return (
            <main className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-yellow-50">
                <div className="mx-auto max-w-4xl px-6 py-20 text-center">
                    <div className="mb-6 inline-block rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 p-4 shadow-xl shadow-amber-500/30">
                        <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">No Results Found</h1>
                    <p className="mt-3 text-base text-gray-600">
                        Start a new search to discover influencers.
                    </p>
                    <Link
                        className="mt-8 inline-block rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-amber-500/30 transition-all hover:shadow-xl hover:shadow-amber-500/40"
                        href="/"
                    >
                        Start New Search
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-yellow-50">
            <div className="mx-auto max-w-6xl px-6 py-10">
                <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <div className="mb-2 inline-block rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 px-3 py-1">
                            <span className="text-xs font-bold tracking-wide text-white">RESULTS</span>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                            Top 10 Influencers
                        </h1>
                        <p className="mt-2 text-sm text-gray-600">
                            Matched based on your criteria and preferences
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <Link
                            className="rounded-2xl border-2 border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:border-amber-300 hover:shadow-md"
                            href="/"
                        >
                            New Search
                        </Link>
                        <button
                            className="group rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-amber-500/30 transition-all hover:shadow-xl hover:shadow-amber-500/40 disabled:opacity-50 disabled:shadow-none"
                            onClick={onDownloadPdf}
                            disabled={busyPdf || !prompt}
                            title={!prompt ? "Missing prompt in session storage" : undefined}
                        >
                            {busyPdf ? (
                                <span className="flex items-center gap-2">
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                                    Building
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <svg className="h-4 w-4 transition-transform group-hover:translate-y-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Download PDF
                                </span>
                            )}
                        </button>
                    </div>
                </header>

                {error && (
                    <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700 shadow-sm">
                        {error}
                    </div>
                )}

                <section className="mb-8 rounded-3xl border border-amber-200/50 bg-white p-6 shadow-lg shadow-amber-500/5">
                    <h2 className="text-sm font-bold uppercase tracking-wide text-amber-600">
                        Your Prompt
                    </h2>
                    <p className="mt-2 text-base font-medium text-gray-900">{prompt}</p>

                    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-50 p-4 border border-amber-100">
                            <div className="text-xs font-bold uppercase tracking-wide text-amber-700">
                                Followers
                            </div>
                            <div className="mt-2 text-lg font-bold text-gray-900">
                                {intent?.minFollowers ?? "N/A"} ~ {intent?.maxFollowers ?? "N/A"}
                            </div>
                        </div>

                        <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-50 p-4 border border-amber-100">
                            <div className="text-xs font-bold uppercase tracking-wide text-amber-700">
                                Content Types
                            </div>
                            <div className="mt-2 text-sm font-semibold text-gray-900">
                                {(intent?.wantedTypes?.length ? intent.wantedTypes.join(", ") : "N/A")}
                            </div>
                        </div>

                        <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-50 p-4 border border-amber-100">
                            <div className="text-xs font-bold uppercase tracking-wide text-amber-700">
                                Tags
                            </div>
                            <div className="mt-2 text-sm font-semibold text-gray-900">
                                {(intent?.wantedTags?.length ? intent.wantedTags.join(", ") : "N/A")}
                            </div>
                        </div>

                        <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-50 p-4 border border-amber-100">
                            <div className="text-xs font-bold uppercase tracking-wide text-amber-700">
                                Max Ad Ratio
                            </div>
                            <div className="mt-2 text-lg font-bold text-gray-900">
                                {intent?.maxAdRatio ?? "N/A"}
                            </div>
                        </div>
                    </div>
                </section>

                <section>
                    <div className="mb-4">
                        <h2 className="text-xl font-bold text-gray-900">Matched Influencers</h2>
                        <p className="text-sm text-gray-600">Ranked by relevance score</p>
                    </div>

                    <div className="grid gap-5 lg:grid-cols-2">
                        {results.map((r, idx) => (
                            <div
                                key={r.username}
                                className="group rounded-3xl border border-amber-200/50 bg-white p-6 shadow-lg shadow-amber-500/5 transition-all hover:border-amber-300 hover:shadow-xl hover:shadow-amber-500/10"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="mb-2 inline-block rounded-lg bg-gradient-to-r from-amber-400 to-yellow-500 px-2.5 py-0.5 text-xs font-bold text-white">
                                            #{idx + 1}
                                        </div>
                                        <div className="text-2xl font-bold text-gray-900">
                                            @{r.username}
                                        </div>
                                        <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                                            <svg className="h-4 w-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                                            </svg>
                                            <span className="font-semibold text-gray-900">{formatNum(r.followersCount)}</span>
                                            <span>followers</span>
                                        </div>
                                    </div>

                                    <div className="flex-shrink-0 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 px-5 py-4 text-center shadow-lg shadow-amber-500/30">
                                        <div className="text-[10px] font-bold uppercase tracking-wider text-white/80">
                                            Score
                                        </div>
                                        <div className="mt-1 text-2xl font-bold text-white">
                                            {r.score.toFixed(3)}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-5 rounded-2xl bg-gray-50 p-4">
                                    <div className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-600">
                                        Match Reasons
                                    </div>
                                    <ul className="space-y-2">
                                        {r.reasons?.map((reason, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                                <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                                <span>{reason}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <p className="mt-8 text-center text-xs text-gray-500">
                    * Demo uses synthetic data to showcase the pipeline
                </p>
            </div>
        </main>
    );
}