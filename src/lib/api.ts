// src/lib/api.ts
import type {
    ScoutDetail,
    CreateReportResponse, ScoutSummary,
} from "./types";

const BASE = process.env.NEXT_PUBLIC_API_BASE;

if (!BASE) {
    console.warn("NEXT_PUBLIC_API_BASE is not set. Did you create .env.local?");
}

function joinUrl(base: string, path: string) {
    return `${base.replace(/\/$/, "")}${path.startsWith("/") ? "" : "/"}${path}`;
}

async function apiFetch(path: string, init: RequestInit = {}, opts?: { allowStatuses?: number[] }) {
    const url = joinUrl(BASE ?? "", path);

    const headers = new Headers(init.headers);
    if (!headers.has("Content-Type") && init.body) headers.set("Content-Type", "application/json");

    const doReq = () => fetch(url, { ...init, headers, credentials: "include" });

    let res = await doReq();

    // if unauthorized, try refresh once then retry
    if (res.status === 401 && !path.startsWith("/api/auth/")) {
        const refreshRes = await fetch(joinUrl(BASE ?? "", "/api/auth/refresh"), {
            method: "POST",
            credentials: "include",
        });

        if (refreshRes.ok) {
            res = await doReq();
        }
    }

    if (!res.ok && !(opts?.allowStatuses ?? []).includes(res.status)) {
        const text = await res.text().catch(() => "");
        throw new Error(`${res.status} ${res.statusText}: ${text}`);
    }

    return res;
}

export async function authLogin(username: string, password: string) {
    const res = await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
    });
    // cookies are set by server, no need to store tokens
    return res.json() as Promise<{ ok: true; username: string }>;
}

export async function authLogout() {
    await apiFetch("/api/auth/logout", { method: "POST" }, { allowStatuses: [401] });
    return { ok: true };
}

export async function authMe() {
    const res = await apiFetch("/api/auth/me", { method: "GET" }, { allowStatuses: [401] });
    if (res.status === 401) return null;
    return res.json() as Promise<{ username: string }>;
}



// Scout 생성
export async function createScout(prompt: string): Promise<ScoutSummary> {
    const res = await apiFetch("/api/workplace/scouts", {
        method: "POST",
        body: JSON.stringify({ prompt }),
    });
    return res.json();
}

// Scout 조회
export async function getScout(scoutId: string): Promise<ScoutDetail> {
    const res = await apiFetch(`/api/workplace/scouts/${encodeURIComponent(scoutId)}`, {
        method: "GET",
    });
    return res.json();
}


// Report 생성
export async function createReport(scoutId: string): Promise<CreateReportResponse> {
    const res = await apiFetch(`/api/workplace/scouts/${encodeURIComponent(scoutId)}/reports`, {
        method: "POST",
    });
    return res.json();
}


// Report PDF 다운로드
export async function downloadReportPdfById(reportId: string): Promise<Blob> {
    const res = await apiFetch(`/api/workplace/reports/${encodeURIComponent(reportId)}/pdf`, {
        method: "GET",
    });
    return res.blob();
}



export async function authRegister(username: string, password: string) {
    const res = await apiFetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ username, password }),
    });
    return res.json() as Promise<{
        ok: true;
        username: string;
        accessToken: string;
        refreshToken: string;
        tokenType: "Bearer";
    }>;
}

export async function listScouts(limit = 20, offset = 0) {
    const res = await apiFetch(`/api/workplace/scouts?limit=${limit}&offset=${offset}`, { method: "GET" });
    return res.json() as Promise<ScoutSummary[]>;
}

export async function listReports(limit = 20, offset = 0) {
    const res = await apiFetch(`/api/workplace/reports?limit=${limit}&offset=${offset}`, { method: "GET" });
    return res.json() as Promise<{ reportId: string; scoutId: string; createdAt: string }[]>;
}
