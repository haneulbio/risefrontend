"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {downloadReportPdfById, listReports} from "@/lib/api";
import { loadRecentReports } from "@/lib/reports_recent";

export default function ReportsPage() {
    const [items, setItems] = useState<{ reportId: string; scoutId: string; createdAt: string }[]>([]);
    const [busy, setBusy] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        listReports(50, 0).then(setItems).catch(() => setItems([]));
    }, []);

    async function onDownload(reportId: string) {
        setError(null);
        setBusy(reportId);
        try {
            const blob = await downloadReportPdfById(reportId);
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `rise_report_${reportId}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
        } catch (e: any) {
            setError(e?.message ?? "Unknown error");
        } finally {
            setBusy(null);
        }
    }

    return (
        <main className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <div className="text-xs font-bold uppercase tracking-wide text-amber-200/80">Reports</div>
                    <h1 className="mt-2 text-2xl font-extrabold">Recent Reports</h1>
                    <p className="mt-2 text-sm text-white/60">PDF 생성 기록을 여기서 다시 다운로드할 수 있어요.</p>
                </div>
                <Link href="/" className="rounded-2xl bg-amber-400 px-5 py-3 text-sm font-extrabold text-neutral-950">
                    New Scout
                </Link>
            </div>

            {error && (
                <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                    {error}
                </div>
            )}

            <div className="mt-6 grid gap-3">
                {items.length === 0 ? (
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/60">
                        아직 생성된 리포트가 없어요. Results에서 Download PDF를 눌러보세요.
                    </div>
                ) : (
                    items.map((r) => (
                        <div key={r.reportId} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <div className="font-mono text-xs text-white/50">reportId: {r.reportId}</div>
                                    <div className="mt-1 text-xs text-white/50">scoutId: {r.scoutId}</div>
                                    <div className="mt-2 text-sm text-white/80">created: {r.createdAt}</div>
                                </div>
                                <div className="flex gap-2">
                                    <Link
                                        className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10"
                                        href={`/results?scoutId=${encodeURIComponent(r.scoutId)}`}
                                    >
                                        Open Scout
                                    </Link>
                                    <button
                                        onClick={() => onDownload(r.reportId)}
                                        disabled={busy === r.reportId}
                                        className="rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 px-4 py-2 text-sm font-extrabold text-neutral-950 disabled:opacity-50"
                                    >
                                        {busy === r.reportId ? "Downloading…" : "Download PDF"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </main>
    );
}
