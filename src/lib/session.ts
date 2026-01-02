import type { SearchResponse } from "./types";

const KEY = "rise:lastSearch";

export function saveLastSearch(data: SearchResponse) {
    sessionStorage.setItem(KEY, JSON.stringify(data));
}

export function loadLastSearch(): SearchResponse | null {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    try {
        return JSON.parse(raw) as SearchResponse;
    } catch {
        return null;
    }
}
