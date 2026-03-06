"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { SignalCard } from "@/components/SignalCard";

type Section = {
  id: string;
  label: string;
  description: string;
  skillId: string;
};

const SECTIONS: Section[] = [
  {
    id: "signal",
    label: "Signals Feed",
    description: "Latest strategic signals across PM, fintech, RBI, and AI.",
    skillId: "signal",
  },
  {
    id: "market",
    label: "Market Research",
    description: "Play Store opportunity scans and gap analysis.",
    skillId: "market",
  },
  {
    id: "content",
    label: "Content Engine",
    description: "Generate and refine high-quality LinkedIn posts.",
    skillId: "content",
  },
  {
    id: "idp",
    label: "Leadership IDP",
    description: "Convert 1:1 notes into executive-ready IDP summaries.",
    skillId: "idp",
  },
  {
    id: "validator",
    label: "Idea Validator",
    description: "Score startup/product ideas on viability and risk.",
    skillId: "validator",
  },
  {
    id: "workflow",
    label: "Agent Workflow",
    description: "Design repeatable execution blueprints for operators.",
    skillId: "workflow",
  },
  {
    id: "prompt",
    label: "Prompt Engineering",
    description: "Harden prompts for clarity, constraints, and output quality.",
    skillId: "prompt",
  },
  {
    id: "product",
    label: "Product Intelligence",
    description: "Generate PRD-aligned product strategy and recommendations.",
    skillId: "product",
  },
];

const MOCK_SIGNALS = [
  {
    id: "sig-1",
    author: { name: "Shreyas Doshi", avatarInitials: "SD" },
    domain: "Product",
    timestamp: "2 hours ago",
    title: "The High-Agency PM Framework",
    content: (
      <div className="space-y-3">
        <p>
          If you want to move faster, stop asking for permission to do the obvious. High-agency PMs write the doc,
          build the prototype, and ask for feedback on the artifact, not the idea.
        </p>
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
        <p>
          They optimize for data collection rather than time-to-value. Users drop off when you force them to create an
          account before showing them what the product actually does.
        </p>
        <p>
          <strong>Fix:</strong> Give them a <em>guest mode</em> first. Show value, then ask for sign-up to save
          progress.
        </p>
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
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Default loss guarantees (FLDG) are capped at 5% of the loan portfolio.</li>
          <li>Cooling-off periods must be explicitly built into the repayment UI.</li>
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
        <p>
          The key was constraining the output schema using strict JSON mode rather than relying on regex parsing of raw
          markdown.
        </p>
      </div>
    ),
    isPinned: false,
  },
];

export default function Home() {
  const router = useRouter();
  const [activeSectionId, setActiveSectionId] = useState<string>("signal");
  const activeSection = useMemo(
    () => SECTIONS.find((section) => section.id === activeSectionId) || SECTIONS[0],
    [activeSectionId],
  );

  return (
    <div className="animate-in fade-in flex flex-col gap-6 pb-12 duration-500">
      <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-zinc-900">Knowledge Work Sections</h1>
            <p className="mt-1 text-sm text-zinc-600">Use this launcher to jump into any module, not just signals.</p>
          </div>
          <button
            onClick={() => router.push("/workspace")}
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-zinc-900 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-white transition hover:bg-zinc-800"
          >
            Open Full Workspace <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
          {SECTIONS.map((section) => {
            const active = section.id === activeSectionId;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSectionId(section.id)}
                className={`rounded-lg border px-3 py-2 text-left transition ${
                  active
                    ? "border-zinc-900 bg-zinc-900 text-white"
                    : "border-zinc-200 bg-zinc-50 text-zinc-800 hover:border-zinc-300 hover:bg-white"
                }`}
              >
                <p className="text-sm font-semibold">{section.label}</p>
                <p className={`mt-1 text-xs ${active ? "text-zinc-200" : "text-zinc-600"}`}>{section.description}</p>
              </button>
            );
          })}
        </div>
      </section>

      {activeSection.id !== "signal" ? (
        <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">Selected Section</p>
              <h2 className="mt-1 text-2xl font-semibold text-zinc-900">{activeSection.label}</h2>
              <p className="mt-2 max-w-2xl text-sm text-zinc-600">{activeSection.description}</p>
            </div>
            <Sparkles className="h-6 w-6 text-zinc-400" />
          </div>
          <div className="mt-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700">
            This module is available in the full interactive workspace.
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => router.push(`/workspace?skill=${encodeURIComponent(activeSection.skillId)}`)}
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50"
            >
              Open {activeSection.label}
              <ArrowUpRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => setActiveSectionId("signal")}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-700 transition hover:bg-zinc-50"
            >
              Back to Signals
            </button>
          </div>
        </section>
      ) : (
        <>
          <div className="mb-1 flex items-center justify-between">
            <h2 className="inline-block border-b-2 border-zinc-900 pb-1 text-xl font-bold tracking-tight text-zinc-900">
              Signal Feed
            </h2>
            <div className="flex items-center rounded border border-zinc-200 bg-zinc-100 p-1 shadow-sm">
              <button className="rounded bg-white px-3 py-1.5 text-[12px] font-bold uppercase tracking-wider text-zinc-900 shadow-sm transition-colors">
                Latest
              </button>
              <button className="rounded px-3 py-1.5 text-[12px] font-bold uppercase tracking-wider text-zinc-500 transition-colors hover:text-zinc-900">
                Top Rated
              </button>
            </div>
          </div>

          <div className="flex w-full max-w-full flex-col gap-0">
            {MOCK_SIGNALS.map((signal) => (
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

          <div className="mt-4 flex justify-center">
            <button className="flex items-center gap-2 rounded-full border border-zinc-200 px-4 py-2 text-[12px] font-bold uppercase tracking-widest text-zinc-500 transition-colors hover:border-zinc-300 hover:text-zinc-900">
              Load Older Signals
            </button>
          </div>
        </>
      )}
    </div>
  );
}
