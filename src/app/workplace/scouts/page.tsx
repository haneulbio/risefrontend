"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { loadRecentScouts } from "@/lib/recent";
import type { ScoutSummary } from "@/lib/types";
import {listScouts} from "@/lib/api";

export default function ScoutsPage() {
    const [q, setQ] = useState("");
    const [items, setItems] = useState<ScoutSummary[]>([]);

    useEffect(() => {
        listScouts(50, 0).then(setItems).catch(() => setItems([]));
    }, []);

    const filtered = useMemo(() => {
        const t = q.trim().toLowerCase();
        if (!t) return items;
        return items.filter((s) => s.prompt.toLowerCase().includes(t) || s.id.toLowerCase().includes(t));
    }, [q, items]);

    return (
        <main className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <div className="text-xs font-bold uppercase tracking-wide text-amber-200/80">Scouts</div>
                    <h1 className="mt-2 text-2xl font-extrabold">All Scouts</h1>
                    <p className="mt-2 text-sm text-white/60">
                        스카웃 리스트
                    </p>
                </div>
                <Link href="/" className="rounded-2xl bg-amber-400 px-5 py-3 text-sm font-extrabold text-neutral-950">
                    New Scout
                </Link>
            </div>

            <div className="mt-5 flex gap-3">
                <input
                    className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-white/40"
                    placeholder="Search by prompt or scoutId…"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                />
            </div>

            <div className="mt-5 grid gap-3">
                {filtered.length === 0 ? (
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/60">
                        No scouts.
                    </div>
                ) : (
                    filtered.map((s) => (
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
                            <div className="mt-2 text-sm font-semibold text-white/90 line-clamp-2">{s.prompt}</div>
                            <div className="mt-2 text-xs text-white/50">updated: {s.updatedAt}</div>
                        </Link>
                    ))
                )}
            </div>
        </main>
    );
}
