import type { ScoutSummary } from "./types";

const KEY = "rise:recentScouts";
const MAX = 20;

export function pushRecentScout(s: ScoutSummary) {
    const items = loadRecentScouts();
    const next = [s, ...items.filter((x) => x.id !== s.id)].slice(0, MAX);
    localStorage.setItem(KEY, JSON.stringify(next));
}

export function loadRecentScouts(): ScoutSummary[] {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    try {
        return JSON.parse(raw) as ScoutSummary[];
    } catch {
        return [];
    }
}
