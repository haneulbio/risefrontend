"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { authLogout, authMe } from "@/lib/api";
import ClientGuard from "./ClientGuard";

function NavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
    return (
        <Link
            href={href}
            className={[
                "block rounded-2xl px-3 py-2 transition",
                active ? "bg-amber-400 text-neutral-950 font-extrabold" : "hover:bg-white/10 text-white/80",
            ].join(" ")}
        >
            {label}
        </Link>
    );
}

export default function WorkplaceLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();

    const [checking, setChecking] = useState(true);
    const [me, setMe] = useState<{ username: string } | null>(null);

    const isLoginPage = useMemo(() => pathname?.startsWith("/workplace/login"), [pathname]);

    useEffect(() => {
        if (isLoginPage) {
            setChecking(false);
            return;
        }

        let mounted = true;
        (async () => {
            setChecking(true);
            try {
                const m = await authMe(); // { username }
                if (!mounted) return;
                setMe(m);
            } catch {
                if (!mounted) return;
                const next = encodeURIComponent(pathname || "/workplace");
                router.replace(`/workplace/login?next=${next}`);
            } finally {
                if (!mounted) return;
                setChecking(false);
            }
        })();

        return () => {
            mounted = false;
        };
    }, [isLoginPage, pathname, router]);

    async function onLogout() {
        try {
            await authLogout();
        } finally {
            setMe(null);
            router.replace("/login");
        }
    }

    // 로그인 페이지에서는 wrapper만 유지하고 가드/사이드바 숨기기(원하면 보여도 됨)
    if (isLoginPage) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-950 to-amber-950/30 text-neutral-100">
                {children}
            </div>
        );
    }

    if (checking) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-950 to-amber-950/30 text-neutral-100 flex items-center justify-center">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-white/70">
                    Checking session…
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-950 to-amber-950/30 text-neutral-100">
            <div className="mx-auto max-w-7xl px-6 py-8">
                <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
                    <Link href="/workplace" className="text-lg font-extrabold">
                        Workplace
                    </Link>

                    <div className="flex items-center gap-2">
                        {me?.username ? (
                            <span className="hidden sm:inline rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70">
                Signed in as <span className="font-mono text-white/80">{me.username}</span>
              </span>
                        ) : null}

                        <Link
                            href="/"
                            className="rounded-2xl bg-amber-400 px-4 py-2 text-sm font-extrabold text-neutral-950"
                        >
                            New Scout
                        </Link>

                        <button
                            onClick={onLogout}
                            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-extrabold text-white/80 hover:bg-white/10"
                        >
                            Logout
                        </button>
                    </div>
                </header>

                <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
                    <aside className="rounded-3xl border border-white/10 bg-white/5 p-4">
                        <nav className="space-y-2 text-sm">
                            <NavLink href="/workplace" label="Dashboard" active={pathname === "/workplace"} />
                            <NavLink href="/workplace/scouts" label="Scouts" active={pathname?.startsWith("/workplace/scouts") ?? false} />
                            <NavLink href="/workplace/reports" label="Reports" active={pathname?.startsWith("/workplace/reports") ?? false} />
                            <NavLink href="/workplace/settings" label="Settings" active={pathname?.startsWith("/workplace/settings") ?? false} />
                        </nav>
                    </aside>

                    <section>{children}</section>
                </div>
            </div>
        </div>
    );
}