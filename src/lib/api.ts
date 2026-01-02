import { SearchResponse } from "./types";

const BASE = process.env.NEXT_PUBLIC_API_BASE;

if (!BASE) {
    // This helps catch missing env var early
    console.warn("NEXT_PUBLIC_API_BASE is not set. Did you create .env.local?");
}

export async function postSearch(prompt: string): Promise<SearchResponse> {
    const res = await fetch(`${BASE}/demo/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
    });

    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Search failed (${res.status}): ${text}`);
    }

    return res.json();
}

export async function downloadReportPdf(prompt: string): Promise<Blob> {
    console.log("BASE =", BASE);
    const url = `${BASE}/demo/search/report`;
    console.log("fetching", url);

    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
    });

    console.log("report status", res.status, res.type);

    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Report failed (${res.status}): ${text}`);
    }
    const blob = await res.blob();
    console.log("blob", blob.type, blob.size);
    return blob;
}

