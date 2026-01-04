// src/app/workplace/ClientGuard.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { authMe } from "@/lib/api";

export default function ClientGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [ok, setOk] = useState(false);

    useEffect(() => {
        (async () => {
            const me = await authMe(); // null이면 미로그인
            if (!me) {
                router.replace(`/login?next=${encodeURIComponent(pathname)}`);
                return;
            }
            setOk(true);
        })();
    }, [pathname, router]);

    if (!ok) return null; // or loading UI
    return <>{children}</>;
}
