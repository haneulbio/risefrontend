import { Suspense } from "react";
import RegisterClient from "./RegisterClient";

export default function Page() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-neutral-950 text-white p-10">Loading…</div>}>
            <RegisterClient />
        </Suspense>
    );
}
