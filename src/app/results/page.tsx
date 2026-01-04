import { Suspense } from "react";
import ResultsClient from "./ResultsClient";

export default function Page() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-neutral-950 text-white p-10">Loading…</div>}>
            <ResultsClient />
        </Suspense>
    );
}