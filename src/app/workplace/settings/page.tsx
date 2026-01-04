export default function SettingsPage() {
    //const base = process.env.NEXT_PUBLIC_API_BASE;
    const base = "rise"

    return (
        <main className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="text-xs font-bold uppercase tracking-wide text-amber-200/80">Settings</div>
            <h1 className="mt-2 text-2xl font-extrabold">Environment</h1>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div className="text-xs text-white/50">화이팅</div>
                    <div className="mt-2 font-mono text-sm text-white/85 break-all">
                        {base ?? "(not set)"}
                    </div>
                    <div className="mt-2 text-xs text-white/50">
                        일단 아무거나
                    </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div className="text-xs text-white/50">Mode</div>
                    <div className="mt-2 text-sm font-semibold text-white/85">모드입니다</div>
                    <div className="mt-2 text-xs text-white/50">
                        추후에 확장 예정입니다.
                    </div>
                </div>
            </div>
        </main>
    );
}
