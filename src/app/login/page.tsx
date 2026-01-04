"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authLogin } from "@/lib/api";

export default function WorkplaceLoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const next = searchParams.get("next") || "/";

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (busy) return;

        setError(null);
        setBusy(true);

        try {
            await authLogin(username.trim(), password);
            router.replace(next); // ✅ redirect after successful login
        } catch {
            // ✅ requested message
            setError("회원가입 해주세요");
        } finally {
            setBusy(false);
        }
    }

    const registerHref = `/register?next=${encodeURIComponent(next)}`;

    return (
        <main className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-950 to-amber-950/30 text-neutral-100">
            <div className="mx-auto max-w-md px-6 py-16">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/30">
                    <div className="text-xs font-bold uppercase tracking-wide text-amber-200/80">
                        Workplace
                    </div>

                    <h1 className="mt-2 text-2xl font-extrabold">
                        Sign in
                    </h1>

                    <p className="mt-2 text-sm text-white/60">
                        Username / Password 로그인
                    </p>

                    {error && (
                        <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100 text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={onSubmit} className="mt-6 space-y-3">
                        <input
                            className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none
                                       focus:border-amber-400/60 focus:ring-4 focus:ring-amber-400/10"
                            placeholder="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            autoComplete="username"
                            disabled={busy}
                            required
                        />

                        <input
                            type="password"
                            className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none
                                       focus:border-amber-400/60 focus:ring-4 focus:ring-amber-400/10"
                            placeholder="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="current-password"
                            disabled={busy}
                            required
                        />

                        <button
                            type="submit"
                            disabled={busy || !username.trim() || !password}
                            className="w-full rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500
                                       px-6 py-3 text-sm font-extrabold text-neutral-950 disabled:opacity-50"
                        >
                            {busy ? "Signing in…" : "Sign in"}
                        </button>
                    </form>

                    {/* ✅ Register link */}
                    <div className="mt-5 text-center text-sm text-white/60">
                        아직 계정이 없으신가요?{" "}
                        <button
                            onClick={() => router.push(registerHref)}
                            className="font-semibold text-amber-300 hover:underline"
                        >
                            회원가입
                        </button>
                    </div>

                    <div className="mt-4 text-center text-xs text-white/40">
                        로그인 후 자동으로 이전 페이지로 이동합니다
                    </div>
                </div>
            </div>
        </main>
    );
}
