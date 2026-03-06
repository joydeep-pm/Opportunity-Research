"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Play, FileText, Database, BarChart3, Clock, Sparkles } from "lucide-react";
import { SignalCard } from "@/components/SignalCard";

const MOCK_SIGNALS = [
    {
        id: "sig-1",
        author: { name: "Shreyas Doshi", avatarInitials: "SD" },
        domain: "Product",
        timestamp: "2 hours ago",
        title: "The High-Agency PM Framework",
        content: (
            <div className="space-y-3">
                <p>If you want to move faster, stop asking for permission to do the obvious. High-agency PMs write the doc, build the prototype, and ask for feedback on the artifact, not the idea.</p>
                <p>Most organizations slow down because PMs wait for alignment before doing the work.</p>
            </div>
        ),
        isPinned: false,
    },
    {
        id: "sig-2",
        author: { name: "Aakash Gupta", avatarInitials: "AG" },
        domain: "Growth",
        timestamp: "5 hours ago",
        title: "Why Most Onboarding Flows Fail",
        content: (
            <div className="space-y-3">
                <p>They optimize for data collection rather than time-to-value. Users drop off when you force them to create an account before showing them what the product actually does.</p>
                <p><strong>Fix:</strong> Give them a <em>guest mode</em> first. Show value, then ask for sign-up to save progress.</p>
            </div>
        ),
        isPinned: true,
    },
    {
        id: "sig-3",
        author: { name: "RBI Updates", avatarInitials: "RB" },
        domain: "Fintech",
        timestamp: "1 day ago",
        title: "New Digital Lending Guidelines",
        content: (
            <div className="space-y-3">
                <p>All unregulated lending apps must now have an explicit audit trail for loan originations.</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>Default loss guarantees (FLDG) are capped at 5% of the loan portfolio.</li>
                    <li>Cooling-off periods must be explicitly built into the repymant UI.</li>
                </ul>
            </div>
        ),
        isPinned: false,
    },
    {
        id: "sig-4",
        author: { name: "AI Dev Team", avatarInitials: "AI" },
        domain: "AI",
        timestamp: "2 days ago",
        title: "Switching to GPT-4o for Core Inference",
        content: (
            <div className="space-y-3">
                <p>We migrated our unstructured parsing engine to GPT-4o. Latency dropped by 45% and cost by 30%.</p>
                <p>The key was constraining the output schema using strict JSON mode rather than relying on regex parsing of raw markdown.</p>
            </div>
        ),
        isPinned: false,
    },
];

function ToolPlaceholder({ title, description, icon: Icon }: { title: string, description: string, icon: React.ElementType }) {
    return (
        <div className="animate-in fade-in duration-500">
            <div className="mb-6 flex items-center justify-between border-b border-zinc-200 pb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded border border-zinc-200 bg-white flex items-center justify-center shadow-sm">
                        <Icon size={20} className="text-zinc-700" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-zinc-900">{title}</h1>
                        <p className="text-sm text-zinc-500">{description}</p>
                    </div>
                </div>
                <button className="flex items-center gap-2 rounded bg-zinc-900 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white transition hover:bg-zinc-800 shadow-sm">
                    <Play size={14} /> Run Tool
                </button>
            </div>

            {/* Utilitarian Dense Grid Layout for Tool Properties */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-zinc-200 bg-white p-5 rounded shadow-sm">
                    <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3 border-b border-zinc-100 pb-2">Execution Configuration</div>
                    <div className="space-y-4 text-sm font-medium text-zinc-600">
                        <div className="flex justify-between items-center"><span className="text-zinc-400">Model:</span> <span className="bg-zinc-100 px-2 py-0.5 rounded text-zinc-800">GPT-4o</span></div>
                        <div className="flex justify-between items-center"><span className="text-zinc-400">Context Window:</span> <span className="bg-zinc-100 px-2 py-0.5 rounded text-zinc-800">128k</span></div>
                        <div className="flex justify-between items-center"><span className="text-zinc-400">Cache Strategy:</span> <span className="bg-zinc-100 px-2 py-0.5 rounded text-zinc-800">Redis / LRU</span></div>
                        <div className="flex justify-between items-center"><span className="text-zinc-400">Database Pull:</span> <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded">Active</span></div>
                    </div>
                </div>
                <div className="border border-zinc-200 bg-zinc-50 p-5 rounded flex items-center justify-center text-zinc-400 text-sm font-medium border-dashed">
                    Output will stream into this pane.
                </div>
            </div>
        </div>
    );
}

function PageContent() {
    const [signals] = useState(MOCK_SIGNALS);
    const searchParams = useSearchParams();
    const tool = searchParams.get("tool") || "signal";

    if (tool === "play-store") {
        return <ToolPlaceholder title="Play Store Research" description="Scan live app store data to unearth feature gaps and user sentiment." icon={Database} />;
    }

    if (tool === "competitor") {
        return <ToolPlaceholder title="Competitor Tracking" description="Automated deep-dive into competitor pricing, changelogs, and momentum." icon={BarChart3} />;
    }

    if (tool === "linkedin") {
        return <ToolPlaceholder title="LinkedIn Writer" description="Transforms loose thoughts into dense, structured, hook-driven LinkedIn posts." icon={Sparkles} />;
    }

    if (tool === "prd") {
        return <ToolPlaceholder title="PRD Generator" description="Draft rigid, engineering-ready Product Requirements Documents from user needs." icon={FileText} />;
    }

    if (tool === "pulse") {
        return <ToolPlaceholder title="Pulse Timesheets" description="Automated time-tracking analytics and team utilization reporting." icon={Clock} />;
    }

    if (tool === "idp") {
        return <ToolPlaceholder title="1:1 IDP Builder" description="Synthesize 1:1 messy notes into executive-ready professional development plans." icon={FileText} />;
    }

    // Default to Reading Signal Feed
    return (
        <div className="animate-in fade-in flex flex-col gap-2 pb-12 duration-500">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-xl font-bold tracking-tight text-zinc-900 border-b-2 border-zinc-900 pb-1 inline-block">Signal Feed</h1>
                <div className="flex items-center p-1 bg-zinc-100 rounded border border-zinc-200 shadow-sm">
                    <button className="text-[12px] font-bold uppercase tracking-wider text-zinc-900 px-3 py-1.5 rounded bg-white shadow-sm transition-colors">Latest</button>
                    <button className="text-[12px] font-bold uppercase tracking-wider text-zinc-500 hover:text-zinc-900 px-3 py-1.5 rounded transition-colors">Top Rated</button>
                </div>
            </div>

            <div className="flex flex-col gap-0 w-full max-w-full">
                {signals.map((signal) => (
                    <SignalCard
                        key={signal.id}
                        author={signal.author}
                        domain={signal.domain}
                        timestamp={signal.timestamp}
                        title={signal.title}
                        content={signal.content}
                        isPinned={signal.isPinned}
                    />
                ))}
            </div>

            <div className="mt-8 flex justify-center">
                <button className="text-[12px] uppercase tracking-widest font-bold text-zinc-500 hover:text-zinc-900 px-4 py-2 border border-zinc-200 hover:border-zinc-300 rounded-full transition-colors flex items-center gap-2">
                    Load Older Signals
                </button>
            </div>
        </div>
    );
}

export default function Home() {
    return (
        <Suspense fallback={<div className="animate-pulse flex gap-4"><div className="w-12 h-12 bg-zinc-200 rounded"></div><div className="flex-1 space-y-2"><div className="h-4 bg-zinc-200 rounded w-1/4"></div><div className="h-4 bg-zinc-200 rounded w-1/2"></div></div></div>}>
            <PageContent />
        </Suspense>
    );
}
