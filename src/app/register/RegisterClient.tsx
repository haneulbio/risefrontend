// src/app/register/RegisterClient.tsx
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authRegister } from "@/lib/api";
import { saveTokens } from "@/lib/tokenStore";

export default function RegisterPage() {
    const router = useRouter();
    const sp = useSearchParams();
    const next = sp.get("next") || "/";

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setBusy(true);
        try {
            const res = await authRegister(username.trim(), password);
            saveTokens(res.accessToken, res.refreshToken);
            router.replace(next);
        } catch (e: any) {
            setError(e?.message ?? "Register failed");
        } finally {
            setBusy(false);
        }
    }

    return (
        <main className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-950 to-amber-950/30 text-neutral-100">
            <div className="mx-auto max-w-md px-6 py-16">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/30">
                    <div className="text-xs font-bold uppercase tracking-wide text-amber-200/80">Workplace</div>
                    <h1 className="mt-2 text-2xl font-extrabold">Create account</h1>
                    <p className="mt-2 text-sm text-white/60">username/password로 회원가입</p>

                    {error && (
                        <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                            {error}
                        </div>
                    )}

                    <form onSubmit={onSubmit} className="mt-6 space-y-3">
                        <input
                            className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-amber-400/60 focus:ring-4 focus:ring-amber-400/10"
                            placeholder="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            disabled={busy}
                            autoComplete="username"
                            required
                        />
                        <input
                            type="password"
                            className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-amber-400/60 focus:ring-4 focus:ring-amber-400/10"
                            placeholder="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={busy}
                            autoComplete="new-password"
                            required
                        />
                        <button
                            type="submit"
                            disabled={busy || !username.trim() || !password}
                            className="w-full rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 px-6 py-3 text-sm font-extrabold text-neutral-950 disabled:opacity-50"
                        >
                            {busy ? "Creating…" : "Create account"}
                        </button>
                    </form>
                </div>
            </div>
        </main>
    );
}
