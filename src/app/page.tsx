"use client";

import { useState } from "react";
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

export default function Home() {
    const [signals] = useState(MOCK_SIGNALS);

    return (
        <div className="flex flex-col gap-2 pb-12 animate-in fade-in duration-500">
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
