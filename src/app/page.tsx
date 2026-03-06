"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BarChart3, Clock, Database, FileText, Play, Sparkles, WandSparkles } from "lucide-react";
import { SignalCard } from "@/components/SignalCard";
import Link from "next/link";

type SignalItem = {
  id: string;
  author: { name: string; avatarInitials: string };
  domain: string;
  timestamp: string;
  title: string;
  content: JSX.Element;
  isPinned: boolean;
  score: number;
  order: number;
};

type FeedMode = "latest" | "top";

type ToolPlaceholderProps = {
  toolId: string;
  title: string;
  description: string;
  icon: React.ElementType;
};

const INITIAL_SIGNALS: SignalItem[] = [
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
    score: 84,
    order: 400,
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
    score: 92,
    order: 390,
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
    score: 88,
    order: 380,
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
    score: 80,
    order: 370,
  },
];

const OLDER_SIGNALS: SignalItem[] = [
  {
    id: "sig-5",
    author: { name: "Elena Verna", avatarInitials: "EV" },
    domain: "Growth",
    timestamp: "4 days ago",
    title: "Retention loops beat acquisition hacks",
    content: (
      <div className="space-y-3">
        <p>Most teams over-invest in top-of-funnel while retention has unresolved leakage points.</p>
        <p>Fix activation and week-1 retention before scaling paid channels.</p>
      </div>
    ),
    isPinned: false,
    score: 75,
    order: 360,
  },
  {
    id: "sig-6",
    author: { name: "Policy Desk", avatarInitials: "PD" },
    domain: "RBI",
    timestamp: "6 days ago",
    title: "NBFC audit readiness checklist updated",
    content: (
      <div className="space-y-3">
        <p>Audit readiness now requires stronger traceability for decisioning and KYC exception handling.</p>
        <p>Teams should maintain immutable logs for model-assisted underwriting decisions.</p>
      </div>
    ),
    isPinned: false,
    score: 71,
    order: 350,
  },
];

function buildToolOutput(toolId: string): string {
  const now = new Date().toLocaleString("en-IN", {
    hour12: true,
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  const outputs: Record<string, string> = {
    "play-store": [
      `Run completed at ${now}`,
      "Top findings (India):",
      "- Habit compliance apps have strong install velocity but weak personalization retention.",
      "- Competitor rating drag is concentrated in onboarding and reminder fatigue.",
      "- Opportunity: RBI-safe financial habit coaching for salaried first-credit users.",
    ].join("\n"),
    competitor: [
      `Run completed at ${now}`,
      "Competitor sweep:",
      "- 6 tracked apps updated pricing in the last 30 days.",
      "- 3 products shipped AI rewrite assistants; quality remains inconsistent.",
      "- Alert: one emerging player crossed 100k installs in two regions.",
    ].join("\n"),
    linkedin: [
      `Run completed at ${now}`,
      "Draft package ready:",
      "- 3 hooks",
      "- 1 long-form post",
      "- 1 CTA variant",
      "- 1 polish checklist",
    ].join("\n"),
    prd: [
      `Run completed at ${now}`,
      "PRD generated:",
      "- Problem statement and market context",
      "- Personas and JTBD",
      "- MVP scope and non-goals",
      "- Metrics and launch risks",
    ].join("\n"),
    idp: [
      `Run completed at ${now}`,
      "IDP synthesis complete:",
      "- Executive summary",
      "- Leverage strengths",
      "- Structural bottlenecks",
      "- 90-day measurable actions",
    ].join("\n"),
    pulse: [
      `Run completed at ${now}`,
      "Timesheet pulse exported:",
      "- Focus time by stream",
      "- Fragmentation score",
      "- Weekly delivery variance",
    ].join("\n"),
    prompt: [
      `Run completed at ${now}`,
      "Prompt optimization output:",
      "- Constraint hardened prompt",
      "- Evaluation rubric",
      "- Failure-mode guardrails",
    ].join("\n"),
    validator: [
      `Run completed at ${now}`,
      "Idea validation scorecard:",
      "- Problem severity: 8.4",
      "- Differentiation: 7.1",
      "- Distribution risk: medium",
    ].join("\n"),
    product: [
      `Run completed at ${now}`,
      "Product intelligence brief:",
      "- Strategy angle",
      "- Capability map",
      "- Build sequencing",
      "- KPI recommendation",
    ].join("\n"),
  };

  return outputs[toolId] || [`Run completed at ${now}`, "Execution finished."].join("\n");
}

function ToolPlaceholder({ toolId, title, description, icon: Icon }: ToolPlaceholderProps) {
  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState("Output will stream into this pane.");

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-6 flex items-center justify-between border-b border-zinc-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded border border-zinc-200 bg-white shadow-sm">
            <Icon size={20} className="text-zinc-700" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-zinc-900">{title}</h1>
            <p className="text-sm text-zinc-500">{description}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            setRunning(true);
            setOutput("Running... gathering context and generating output.");
            window.setTimeout(() => {
              setOutput(buildToolOutput(toolId));
              setRunning(false);
            }, 650);
          }}
          disabled={running}
          className="flex items-center gap-2 rounded bg-zinc-900 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white shadow-sm transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70"
        >
          <Play size={14} /> {running ? "Running" : "Run Tool"}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="mb-3 border-b border-zinc-100 pb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
            Execution Configuration
          </div>
          <div className="space-y-4 text-sm font-medium text-zinc-600">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Model:</span>
              <span className="rounded bg-zinc-100 px-2 py-0.5 text-zinc-800">GPT-4o</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Context Window:</span>
              <span className="rounded bg-zinc-100 px-2 py-0.5 text-zinc-800">128k</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Cache Strategy:</span>
              <span className="rounded bg-zinc-100 px-2 py-0.5 text-zinc-800">Redis / LRU</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Database Pull:</span>
              <span className="rounded border border-blue-200 bg-blue-50 px-2 py-0.5 text-blue-700">Active</span>
            </div>
          </div>
        </div>
        <div className="rounded border border-zinc-200 bg-zinc-50 p-5 text-sm font-medium text-zinc-700 shadow-sm">
          <div className="mb-2 border-b border-zinc-200 pb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
            Execution Output
          </div>
          <pre className="max-h-[260px] overflow-auto whitespace-pre-wrap font-mono text-[13px] leading-6 text-zinc-700">
            {output}
          </pre>
        </div>
      </div>
    </div>
  );
}

function PageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tool = searchParams.get("tool") || "signal";
  const sortParam = searchParams.get("sort");
  const feedMode: FeedMode = sortParam === "top" ? "top" : "latest";
  const showOlder = searchParams.get("older") === "1";

  const [signals, setSignals] = useState<SignalItem[]>(INITIAL_SIGNALS);
  const [notice, setNotice] = useState<string | null>(null);

  const activeSignals = useMemo(() => {
    const source = showOlder ? [...signals, ...OLDER_SIGNALS] : signals;
    const items = [...source];
    if (feedMode === "top") {
      return items.sort((a, b) => {
        const pinWeight = Number(b.isPinned) - Number(a.isPinned);
        if (pinWeight !== 0) return pinWeight;
        return b.score - a.score;
      });
    }
    return items.sort((a, b) => b.order - a.order);
  }, [signals, showOlder, feedMode]);

  const setInfo = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(null), 1800);
  };

  const handleTogglePin = (id: string) => {
    setSignals((prev) => prev.map((item) => (item.id === id ? { ...item, isPinned: !item.isPinned } : item)));
    setInfo("Pin status updated.");
  };

  const handleShare = async (id: string) => {
    const signal = signals.find((item) => item.id === id);
    if (!signal) return;
    const text = `${signal.title} — ${signal.author.name}`;

    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        setInfo("Signal copied to clipboard.");
        return;
      }
      setInfo("Clipboard unavailable on this browser.");
    } catch {
      setInfo("Could not copy to clipboard.");
    }
  };

  const handleRunWorkflow = (id: string) => {
    const signal = signals.find((item) => item.id === id);
    if (!signal) return;

    const map: Record<string, string> = {
      Product: "product",
      Growth: "linkedin",
      Fintech: "play-store",
      RBI: "play-store",
      AI: "prompt",
    };

    const nextTool = map[signal.domain] || "product";
    router.push(`/?tool=${nextTool}`);
    setInfo(`Routed to ${nextTool} workflow.`);
  };

  if (tool === "play-store") {
    return (
      <ToolPlaceholder
        toolId="play-store"
        title="Play Store Research"
        description="Scan live app store data to unearth feature gaps and user sentiment."
        icon={Database}
      />
    );
  }

  if (tool === "competitor") {
    return (
      <ToolPlaceholder
        toolId="competitor"
        title="Competitor Tracking"
        description="Automated deep-dive into competitor pricing, changelogs, and momentum."
        icon={BarChart3}
      />
    );
  }

  if (tool === "linkedin") {
    return (
      <ToolPlaceholder
        toolId="linkedin"
        title="LinkedIn Writer"
        description="Transforms loose thoughts into dense, structured, hook-driven LinkedIn posts."
        icon={Sparkles}
      />
    );
  }

  if (tool === "prd") {
    return (
      <ToolPlaceholder
        toolId="prd"
        title="PRD Generator"
        description="Draft rigid, engineering-ready Product Requirements Documents from user needs."
        icon={FileText}
      />
    );
  }

  if (tool === "pulse") {
    return (
      <ToolPlaceholder
        toolId="pulse"
        title="Pulse Timesheets"
        description="Automated time-tracking analytics and team utilization reporting."
        icon={Clock}
      />
    );
  }

  if (tool === "idp") {
    return (
      <ToolPlaceholder
        toolId="idp"
        title="1:1 IDP Builder"
        description="Synthesize 1:1 messy notes into executive-ready professional development plans."
        icon={FileText}
      />
    );
  }

  if (tool === "prompt") {
    return (
      <ToolPlaceholder
        toolId="prompt"
        title="Prompt Engineering"
        description="Optimize prompts with stronger constraints and output quality controls."
        icon={WandSparkles}
      />
    );
  }

  if (tool === "validator") {
    return (
      <ToolPlaceholder
        toolId="validator"
        title="Idea Validator"
        description="Score idea quality, risk profile, and distribution feasibility."
        icon={BarChart3}
      />
    );
  }

  if (tool === "product") {
    return (
      <ToolPlaceholder
        toolId="product"
        title="Product Intelligence"
        description="Generate product recommendations and launch-ready execution framing."
        icon={Sparkles}
      />
    );
  }

  if (tool === "vault") {
    return (
      <ToolPlaceholder
        toolId="vault"
        title="Saved Vault"
        description="Review saved insights, pinned signal packs, and reusable summaries."
        icon={Database}
      />
    );
  }

  return (
    <div className="animate-in fade-in flex flex-col gap-2 pb-12 duration-500">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="inline-block border-b-2 border-zinc-900 pb-1 text-xl font-bold tracking-tight text-zinc-900">
          Signal Feed
        </h1>
        <div className="flex items-center rounded border border-zinc-200 bg-zinc-100 p-1 shadow-sm">
          <Link
            href={`/?tool=signal&sort=latest${showOlder ? "&older=1" : ""}`}
            className={`rounded px-3 py-1.5 text-[12px] font-bold uppercase tracking-wider transition-colors ${
              feedMode === "latest" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-900"
            }`}
          >
            Latest
          </Link>
          <Link
            href={`/?tool=signal&sort=top${showOlder ? "&older=1" : ""}`}
            className={`rounded px-3 py-1.5 text-[12px] font-bold uppercase tracking-wider transition-colors ${
              feedMode === "top" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-900"
            }`}
          >
            Top Rated
          </Link>
        </div>
      </div>

      {notice ? (
        <div className="mb-3 rounded border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700">{notice}</div>
      ) : null}

      <div className="flex w-full max-w-full flex-col gap-0">
        {activeSignals.map((signal) => (
          <SignalCard
            key={signal.id}
            id={signal.id}
            author={signal.author}
            domain={signal.domain}
            timestamp={signal.timestamp}
            title={signal.title}
            content={signal.content}
            isPinned={signal.isPinned}
            onShare={handleShare}
            onRunWorkflow={handleRunWorkflow}
            onTogglePin={handleTogglePin}
          />
        ))}
      </div>

      <div className="mt-8 flex justify-center">
        <Link
          href={`/?tool=signal&sort=${feedMode}&older=1`}
          className="flex items-center gap-2 rounded-full border border-zinc-200 px-4 py-2 text-[12px] font-bold uppercase tracking-widest text-zinc-500 transition-colors hover:border-zinc-300 hover:text-zinc-900"
        >
          {showOlder ? "Older Signals Loaded" : "Load Older Signals"}
        </Link>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="flex animate-pulse gap-4">
          <div className="h-12 w-12 rounded bg-zinc-200" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-1/4 rounded bg-zinc-200" />
            <div className="h-4 w-1/2 rounded bg-zinc-200" />
          </div>
        </div>
      }
    >
      <PageContent />
    </Suspense>
  );
}
