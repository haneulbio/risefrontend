import { Suspense } from "react";
import LoginClient from "./LoginClient";

export default function Page() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-neutral-950 text-white p-10">Loading…</div>}>
            <LoginClient />
        </Suspense>
    );
}
