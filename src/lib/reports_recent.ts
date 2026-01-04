type RecentReport = { reportId: string; scoutId: string; createdAt: string };
const KEY = "rise:recentReports";
const MAX = 30;

export function pushRecentReport(x: RecentReport) {
    const items = loadRecentReports();
    const next = [x, ...items.filter((r) => r.reportId !== x.reportId)].slice(0, MAX);
    localStorage.setItem(KEY, JSON.stringify(next));
}

export function loadRecentReports(): RecentReport[] {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    try {
        return JSON.parse(raw) as RecentReport[];
    } catch {
        return [];
    }
}
