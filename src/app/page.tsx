"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  BrainCircuit,
  Command,
  GitBranch,
  Loader2,
  Search,
  ShieldCheck,
  Sparkles,
  WandSparkles,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";

type SkillFieldType = "text" | "textarea" | "select";

type SkillField = {
  id: string;
  label: string;
  type: SkillFieldType;
  placeholder?: string;
  options?: string[];
  defaultValue?: string;
};

type SkillConfig = {
  id: string;
  name: string;
  icon: LucideIcon;
  description: string;
  localScriptPath: string;
  runLabel: string;
  inputFields: SkillField[];
  generateOutput: (
    values: Record<string, string>,
  ) => { title: string; body: string } | Promise<{ title: string; body: string }>;
};

type SkillWrapperProps = {
  skill: SkillConfig;
  onRun: (payload: { title: string; body: string }) => void | Promise<void>;
  onClose: () => void;
};

function toLines(raw: string): string[] {
  return raw
    .split("\n")
    .map((line) => line.replace(/^[\-\*\u2022]\s*/, "").trim())
    .filter(Boolean);
}

function strengthCategory(line: string): string {
  if (/(stakeholder|cross-functional|alignment|influence|communication)/i.test(line)) return "Stakeholder Influence";
  if (/(delivery|execute|ship|ownership|deadline|throughput|reliable)/i.test(line)) return "Execution Reliability";
  if (/(strategy|priorit|roadmap|decision|framing|trade-?off)/i.test(line)) return "Strategic Clarity";
  if (/(coach|mentor|team|delegate|enable)/i.test(line)) return "Team Enablement";
  return "Problem Structuring";
}

function bottleneckCategory(line: string): string {
  if (/(unclear|misalign|communication|stakeholder)/i.test(line)) return "Communication Precision";
  if (/(delay|late|slip|cadence|inconsistent|follow-through)/i.test(line)) return "Operating Cadence";
  if (/(priorit|focus|scope|context-switch|too many)/i.test(line)) return "Decision Focus";
  if (/(delegate|scal|bandwidth|overload|single point)/i.test(line)) return "Scalability of Execution";
  return "Execution System Design";
}

function strengthImpact(category: string): string {
  const map: Record<string, string> = {
    "Stakeholder Influence": "cross-functional alignment and faster execution buy-in",
    "Execution Reliability": "predictable delivery and higher trust from leadership",
    "Strategic Clarity": "higher decision quality and clearer team direction",
    "Team Enablement": "greater team leverage and reduced bottlenecks",
    "Problem Structuring": "faster root-cause diagnosis and better solution quality",
  };
  return map[category] || "stronger business outcomes";
}

function bottleneckImpact(category: string): string {
  const map: Record<string, string> = {
    "Communication Precision": "slows decisions and introduces avoidable alignment rework",
    "Operating Cadence": "creates execution volatility and missed commitments",
    "Decision Focus": "dilutes impact across initiatives and lowers strategic throughput",
    "Scalability of Execution": "caps team throughput and increases key-person dependency",
    "Execution System Design": "reduces repeatability and constrains quality at scale",
  };
  return map[category] || "constrains team and product performance";
}

function resolutionAction(category: string): { action: string; done: string } {
  const map: Record<string, { action: string; done: string }> = {
    "Communication Precision": {
      action: "Adopt one-page decision memos before stakeholder meetings",
      done: "For 4 consecutive weeks, every high-impact meeting includes pre-read memo and explicit decision log",
    },
    "Operating Cadence": {
      action: "Install a weekly execution control tower",
      done: "By quarter end, >90% of planned commitments are closed on time with visible weekly risk flags",
    },
    "Decision Focus": {
      action: "Run a MECE priority filter every Monday",
      done: "Reduce active priorities to top 3 and maintain documented stop/start decisions each week",
    },
    "Scalability of Execution": {
      action: "Build a delegation and ownership map for recurring work",
      done: "Shift at least 30% of repeat execution tasks to designated owners with quality maintained",
    },
    "Execution System Design": {
      action: "Standardize operating playbooks for repeat workflows",
      done: "Create and adopt 3 playbooks with compliance tracked in weekly reviews",
    },
  };
  return map[category] || {
    action: "Tighten operating system around measurable weekly milestones",
    done: "Evidence of stable execution cadence and reduced rework by end of quarter",
  };
}

function generateLeadershipIdpMarkdown(values: Record<string, string>): string {
  const employeeName = (values.employeeName || "Employee Name").trim();
  const date = (values.date || "").trim();
  const notes = toLines(values.notes || "");

  const positive = notes.filter((line) =>
    /\b(strong|great|excellent|effective|proactive|reliable|consistent|clear|trusted|led|owned|delivered|improved|high-impact|initiative)\b/i.test(
      line,
    ),
  );
  const negative = notes.filter((line) =>
    /\b(struggle|miss(ed)?|delay(ed)?|late|unclear|inconsistent|reactive|gap|weak|blocked|overwhelm(ed)?|slow|needs?\b|improve)\b/i.test(
      line,
    ),
  );

  const leveragePool = (positive.length ? positive : notes).slice(0, 6);
  const bottleneckPool = (negative.length ? negative : notes.slice(1)).slice(0, 6);

  const leverage: Array<{ category: string; line: string }> = [];
  for (const line of leveragePool) {
    const category = strengthCategory(line);
    if (!leverage.find((item) => item.category === category)) leverage.push({ category, line });
    if (leverage.length === 3) break;
  }
  if (!leverage.length) leverage.push({ category: "Execution Reliability", line: "Delivers consistently on committed priorities" });

  const bottlenecks: Array<{ category: string; line: string }> = [];
  for (const line of bottleneckPool) {
    const category = bottleneckCategory(line);
    if (!bottlenecks.find((item) => item.category === category)) bottlenecks.push({ category, line });
    if (bottlenecks.length === 2) break;
  }
  if (!bottlenecks.length) bottlenecks.push({ category: "Decision Focus", line: "Priority spread is broader than optimal for quarterly impact" });

  const trajectory = bottlenecks.length >= 2 ? "Requires Pivot" : bottlenecks.length === 1 ? "Steady" : "Accelerating";
  const coreStrength = leverage[0]?.category || "Execution Reliability";
  const coreBottleneck = bottlenecks[0]?.category || "Decision Focus";

  const summary = [
    `${employeeName} creates disproportionate value through **${coreStrength}**, with clear signs of leadership leverage.`,
    `The next-quarter focus is to remove the **${coreBottleneck}** bottleneck so execution scales with greater strategic finesse rather than added effort.`,
  ].join(" ");

  const actions = [
    resolutionAction(bottlenecks[0].category),
    resolutionAction(bottlenecks[1]?.category || bottlenecks[0].category),
    {
      action: `Amplify ${coreStrength} via one visible cross-functional initiative`,
      done: "Deliver one initiative with explicit business metric movement and documented leadership lessons by quarter close",
    },
  ];

  return [
    `# ${employeeName} - Strategic IDP & 1:1 Synthesis`,
    `**Date:** ${date} | **Trajectory:** ${trajectory}`,
    "",
    "## 1. The Executive Summary (Top of the Pyramid)",
    summary,
    "",
    "## 2. Leverage & Natural Finesse (The 'Situation')",
    ...leverage.map(
      (item) =>
        `* **${item.category}:** ${item.line.replace(/[.]+$/, "")}, which increases ${strengthImpact(item.category)}.`,
    ),
    "",
    "## 3. Structural Bottlenecks (The 'Complication')",
    ...bottlenecks.map(
      (item) =>
        `* **${item.category}:** ${item.line.replace(/[.]+$/, "")} -> ${bottleneckImpact(item.category)}.`,
    ),
    "",
    "## 4. Actionable Resolution",
    ...actions.slice(0, 3).map((item) => `* ${item.action}: ${item.done}`),
  ].join("\n");
}

const SKILLS: SkillConfig[] = [
  {
    id: "signal",
    name: "Signal Engine",
    icon: Sparkles,
    description: "Refreshes and loads the latest AI/PM strategic memo from connected sources.",
    localScriptPath: "/Users/joy/Opportunity Research/backend/signal_engine.py",
    runLabel: "Refresh and Load Latest Signal",
    inputFields: [
      {
        id: "focus",
        label: "Focus Lens",
        type: "text",
        defaultValue: "Indian fintech, RBI, enterprise AI, lending automation",
      },
    ],
    generateOutput: async () => {
      const fallback = async (reason: string) => {
        try {
          const latestRes = await fetch("/api/signal", { cache: "no-store" });
          const latestJson = await latestRes.json();
          return {
            title: "Signal Engine Strategic Memo (Latest Available)",
            body: `${latestJson?.markdown || "No memo found."}\n\n[refresh-note] ${reason}`,
          };
        } catch {
          return {
            title: "Signal Engine",
            body: `Signal refresh failed and no cached memo could be loaded.\n\nReason: ${reason}`,
          };
        }
      };

      try {
        const res = await fetch("/api/signal/refresh", { method: "POST" });
        const json = await res.json();
        if (!res.ok) {
          return fallback(json?.details || json?.error || "Unknown refresh error");
        }
        return {
          title: "Signal Engine Strategic Memo",
          body: json?.markdown || "Signal refreshed but no memo text returned.",
        };
      } catch {
        return fallback("Network error while calling /api/signal/refresh");
      }
    },
  },
  {
    id: "market",
    name: "Play Store Market Engine",
    icon: BarChart3,
    description: "India-first market scan, opportunity framing, and action-ready summary.",
    localScriptPath: "/Users/joy/Opportunity Research/skills/play-store-opportunity-research/scripts/play_store_research.py",
    runLabel: "Generate Opportunity Snapshot",
    inputFields: [
      { id: "category", label: "Category", type: "select", options: ["HEALTH_AND_FITNESS", "FINANCE", "PRODUCTIVITY"], defaultValue: "HEALTH_AND_FITNESS" },
      { id: "query", label: "Niche Query", type: "text", placeholder: "AI habit tracker for India", defaultValue: "AI habit tracker for India" },
      { id: "country", label: "Market", type: "text", defaultValue: "India" },
    ],
    generateOutput: (values) => ({
      title: "Play Store Opportunity Snapshot",
      body: [
        `Category: ${values.category}`,
        `Niche: ${values.query}`,
        `Market: ${values.country}`,
        "",
        "Top Signals:",
        "1. Competitors have strong installs but repeated UX complaints in onboarding and personalization.",
        "2. Mid-install apps indicate proven demand with room for better product execution.",
        "3. India-first positioning + localized behavior loops is a strong wedge.",
        "",
        "Recommended Next Move:",
        "Build a constrained MVP around one habit loop, one retention mechanic, and one monetization path.",
      ].join("\n"),
    }),
  },
  {
    id: "content",
    name: "LinkedIn Content Engine",
    icon: Sparkles,
    description: "Turns rough ideas into full, high-craft LinkedIn posts with hook strategy.",
    localScriptPath: "/Users/joy/Downloads/linkedin-viral-post-writer.skill",
    runLabel: "Generate Viral Post Package",
    inputFields: [
      { id: "idea", label: "Rough Idea", type: "textarea", placeholder: "Paste rough idea...", defaultValue: "AI teams move faster when they design skill systems, not random prompts." },
      { id: "funnel", label: "Funnel Mode", type: "select", options: ["ToF", "MoF", "BoF"], defaultValue: "ToF" },
      { id: "cta", label: "CTA Goal", type: "text", defaultValue: "Drive comments and profile follows" },
    ],
    generateOutput: (values) => {
      const seed = (values.idea || "").trim() || "AI teams move faster when they design skill systems, not random prompts.";
      const firstSentence = seed.split(/[.!?]/)[0] || seed;
      const ctaLine =
        values.funnel === "BoF"
          ? `If you want the full framework, comment "template" and I will send it.`
          : "What part of this workflow would you challenge first?";

      return {
        title: "LinkedIn Viral Post Package",
        body: [
          "Hook Options:",
          `1. If I had to learn this again, I'd start here: ${firstSentence}`,
          `2. Everyone says post more. They're wrong. ${firstSentence}`,
          `3. I tested this for 30 days and the result surprised me: ${firstSentence}`,
          "",
          "Final Post:",
          `${firstSentence}`,
          "",
          "Most creators focus on output volume.",
          "The leverage is in system quality.",
          "",
          "In the last month I observed 3 patterns:",
          "1) Teams with purpose-built skills produce clearer output.",
          "2) Teams with strict quality checks improve faster.",
          "3) Teams that track outcomes (not activity) compound faster.",
          "",
          "The future is not one person doing everything.",
          "The future is one operator orchestrating specialized capabilities.",
          "",
          ctaLine,
          "",
          "#LinkedInGrowth #AIBuilders #ProductStrategy #ContentEngine",
          "",
          "Checklist:",
          "- Keep first 3 lines curiosity-heavy.",
          "- Ensure at least one concrete number or specific detail.",
          "- One CTA only.",
          `- Funnel Mode: ${values.funnel}`,
          `- CTA Goal: ${values.cta}`,
        ].join("\n"),
      };
    },
  },
  {
    id: "idp",
    name: "Leadership IDP Engine",
    icon: BrainCircuit,
    description: "Synthesizes raw 1:1 brain-dumps into executive-ready IDP summaries using Pyramid + MECE.",
    localScriptPath: "/Users/joy/Downloads/SKILL.md",
    runLabel: "Generate Strategic IDP",
    inputFields: [
      { id: "employeeName", label: "Employee Name", type: "text", defaultValue: "Aditi Rao" },
      { id: "date", label: "Date (optional)", type: "text", defaultValue: "" },
      {
        id: "notes",
        label: "Raw 1:1 Brain-Dump Notes",
        type: "textarea",
        defaultValue:
          "Strong ownership on product execution and cross-functional follow-through.\nNeeds sharper prioritization when multiple asks arrive simultaneously.\nTrusted by design and engineering partners for clear updates.\nDelivery cadence slipped twice this month due to unclear sequencing.\nShows initiative in mentoring junior PMs and documenting decisions.",
      },
    ],
    generateOutput: (values) => ({
      title: "Strategic IDP & 1:1 Synthesis",
      body: generateLeadershipIdpMarkdown(values),
    }),
  },
  {
    id: "validator",
    name: "Idea Validator",
    icon: ShieldCheck,
    description: "Scores an idea on problem quality, market pull, differentiation, and execution risk.",
    localScriptPath: "/Users/joy/Opportunity Research/skills/idea-validator/SKILL.md",
    runLabel: "Run Validation",
    inputFields: [
      { id: "idea", label: "Idea", type: "textarea", defaultValue: "AI-led compliance assistant for NBFC lending operations in India." },
      { id: "target", label: "Target User", type: "text", defaultValue: "NBFC ops and risk teams" },
    ],
    generateOutput: (values) => ({
      title: "Idea Validator Snapshot",
      body: [
        `Idea: ${values.idea}`,
        `Target: ${values.target}`,
        "",
        "Scores (0-10):",
        "- Problem Intensity: 8",
        "- Market Timing: 8",
        "- Differentiation: 7",
        "- Distribution Feasibility: 6",
        "- Execution Risk: 6",
        "",
        "Verdict: ITERATE -> strong problem, improve distribution wedge and pricing proof.",
      ].join("\n"),
    }),
  },
  {
    id: "workflow",
    name: "Agent Workflow",
    icon: GitBranch,
    description: "Converts messy goals into a step-by-step agent execution blueprint.",
    localScriptPath: "/Users/joy/Downloads/agent-workflow.skill",
    runLabel: "Generate Workflow Blueprint",
    inputFields: [
      { id: "goal", label: "Goal", type: "text", defaultValue: "Generate weekly market and product intelligence brief" },
      { id: "constraints", label: "Constraints", type: "textarea", defaultValue: "Budget <= $5/month, India-focused, verifiable sources only." },
    ],
    generateOutput: (values) => ({
      title: "Agent Workflow Blueprint",
      body: [
        `Goal: ${values.goal}`,
        `Constraints: ${values.constraints}`,
        "",
        "Execution Plan:",
        "1. Ingest source signals",
        "2. Normalize and deduplicate",
        "3. Apply reliability scoring",
        "4. Synthesize executive memo",
        "5. Export and schedule automation",
      ].join("\n"),
    }),
  },
  {
    id: "prompt",
    name: "Prompt Engineering",
    icon: WandSparkles,
    description: "Refines rough prompts into production-grade instructions with evaluation hooks.",
    localScriptPath: "/Users/joy/Downloads/prompt-engineering.skill",
    runLabel: "Optimize Prompt",
    inputFields: [
      { id: "prompt", label: "Prompt Draft", type: "textarea", defaultValue: "Summarize PM news." },
      { id: "failure", label: "Current Failure Mode", type: "text", defaultValue: "Too generic and lacks India context" },
    ],
    generateOutput: (values) => ({
      title: "Prompt Optimization Result",
      body: [
        "Optimized Prompt:",
        `You are a fintech and enterprise-AI strategy analyst for India. ${values.prompt}`,
        "Always ground output in RBI compliance implications, lending execution, and measurable business impact. Use 3-4 concise paragraphs and avoid generic advice.",
        "",
        `Resolved Failure Mode: ${values.failure}`,
      ].join("\n"),
    }),
  },
  {
    id: "product",
    name: "Product Intelligence",
    icon: BrainCircuit,
    description: "Generates PRD-aligned strategic product recommendations from market signals.",
    localScriptPath: "/Users/joy/Downloads/prd-writer.skill",
    runLabel: "Generate Product Brief",
    inputFields: [
      { id: "problem", label: "Problem", type: "text", defaultValue: "Lending ops teams spend too much time on compliance checks" },
      { id: "metric", label: "Primary Metric", type: "text", defaultValue: "Loan approval cycle time" },
    ],
    generateOutput: (values) => ({
      title: "Product Intelligence Brief",
      body: [
        `Problem: ${values.problem}`,
        `Primary Metric: ${values.metric}`,
        "",
        "Recommended Direction:",
        "Build an AI co-pilot for compliance triage, policy interpretation, and audit-ready explanations.",
        "",
        "Expected Impact:",
        "- 25-35% faster approval cycle",
        "- Lower compliance review workload",
        "- Better regulator-facing traceability",
      ].join("\n"),
    }),
  },
];

function SkillWrapper({ skill, onRun, onClose }: SkillWrapperProps) {
  const defaults = useMemo(
    () =>
      Object.fromEntries(
        skill.inputFields.map((field) => [field.id, field.defaultValue || ""]),
      ) as Record<string, string>,
    [skill],
  );

  const [values, setValues] = useState<Record<string, string>>(defaults);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    setValues(defaults);
  }, [defaults]);

  const Icon = skill.icon;

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4 rounded-3xl border border-zinc-200 bg-white/90 p-5 shadow-sm">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Active Workspace</p>
          <h2 className="mt-1 text-2xl font-semibold text-zinc-900">{skill.name}</h2>
          <p className="mt-2 text-sm text-zinc-600">{skill.description}</p>
          <p className="mt-2 text-xs text-zinc-500">Local Script Path: <span className="font-mono">{skill.localScriptPath}</span></p>
        </div>
        <button
          onClick={onClose}
          className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-700 transition hover:bg-zinc-50"
        >
          <X size={14} /> Close
        </button>
      </div>

      <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2 text-zinc-700">
          <Icon size={18} />
          <p className="font-medium">Execution Inputs</p>
        </div>
        <div className="space-y-4">
          {skill.inputFields.map((field) => (
            <div key={field.id} className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-700">{field.label}</label>
              {field.type === "textarea" && (
                <textarea
                  value={values[field.id] || ""}
                  onChange={(e) => setValues((prev) => ({ ...prev, [field.id]: e.target.value }))}
                  placeholder={field.placeholder}
                  className="h-28 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-500"
                />
              )}
              {field.type === "text" && (
                <input
                  value={values[field.id] || ""}
                  onChange={(e) => setValues((prev) => ({ ...prev, [field.id]: e.target.value }))}
                  placeholder={field.placeholder}
                  className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-500"
                />
              )}
              {field.type === "select" && (
                <select
                  value={values[field.id] || ""}
                  onChange={(e) => setValues((prev) => ({ ...prev, [field.id]: e.target.value }))}
                  className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-500"
                >
                  {(field.options || []).map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={async () => {
            setRunning(true);
            try {
              const payload = await Promise.resolve(skill.generateOutput(values));
              await onRun(payload);
            } finally {
              setRunning(false);
            }
          }}
          disabled={running}
          className="mt-5 inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {running ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />} {skill.runLabel}
        </button>
      </div>
    </div>
  );
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [activeSkillId, setActiveSkillId] = useState<string | null>(null);
  const [output, setOutput] = useState<{ title: string; body: string } | null>(null);
  const [omnibarFocused, setOmnibarFocused] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeSkill = useMemo(
    () => SKILLS.find((skill) => skill.id === activeSkillId) || null,
    [activeSkillId],
  );

  const filteredSkills = useMemo(() => {
    if (!query.trim()) return SKILLS;
    const q = query.toLowerCase();
    return SKILLS.filter(
      (skill) =>
        skill.name.toLowerCase().includes(q) ||
        skill.description.toLowerCase().includes(q),
    );
  }, [query]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setActiveSkillId(null);
        setOmnibarFocused(true);
        window.setTimeout(() => inputRef.current?.focus(), 40);
      }

      if (event.key === "Escape") {
        if (output) {
          setOutput(null);
          return;
        }
        if (activeSkillId) {
          setActiveSkillId(null);
          setOmnibarFocused(true);
          window.setTimeout(() => inputRef.current?.focus(), 40);
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeSkillId, output]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#FAFAFA] text-zinc-900">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-16 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.08),transparent_70%)]" />
        <div className="absolute right-16 top-24 h-48 w-48 rotate-12 rounded-3xl border border-zinc-200/70" />
        <div className="absolute bottom-20 left-1/3 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.07),transparent_70%)]" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-6 py-10">
        <div className="w-full max-w-4xl">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Knowledge Work Center</p>
              <h1 className="mt-1 text-3xl font-semibold tracking-tight text-zinc-900">Intent-Driven Omnibar</h1>
            </div>
            <button
              onClick={() => {
                setActiveSkillId(null);
                setOmnibarFocused(true);
                window.setTimeout(() => inputRef.current?.focus(), 40);
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-700 shadow-sm"
            >
              <Command size={14} /> Cmd + K
            </button>
          </div>

          <AnimatePresence mode="wait">
            {!activeSkill && (
              <motion.div
                key="omnibar"
                layoutId="omnibar-shell"
                initial={{ opacity: 0, y: 14, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                transition={{ type: "spring", stiffness: 170, damping: 20 }}
                className="rounded-3xl border border-zinc-200 bg-white/90 p-5 shadow-[0_20px_60px_rgba(2,6,23,0.08)] backdrop-blur"
              >
                <div
                  className={`flex items-center gap-3 rounded-2xl border px-4 py-3 transition ${
                    omnibarFocused ? "border-zinc-400" : "border-zinc-300"
                  }`}
                >
                  <Search size={18} className="text-zinc-500" />
                  <input
                    ref={inputRef}
                    value={query}
                    onFocus={() => setOmnibarFocused(true)}
                    onBlur={() => setOmnibarFocused(false)}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && filteredSkills.length) {
                        setActiveSkillId(filteredSkills[0].id);
                      }
                    }}
                    className="w-full bg-transparent text-base text-zinc-900 outline-none placeholder:text-zinc-500"
                    placeholder="Route intent to skill... (e.g., signal, play store, linkedin, idp, prompt)"
                  />
                </div>

                <div className="mt-4">
                  <p className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">Quick Launch</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {SKILLS.map((skill) => {
                      const Icon = skill.icon;
                      return (
                        <button
                          key={`quick-${skill.id}`}
                          onClick={() => setActiveSkillId(skill.id)}
                          className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-left text-sm text-zinc-700 transition hover:border-zinc-400 hover:bg-white"
                        >
                          <Icon size={16} className="text-zinc-600" />
                          <span>{skill.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  {filteredSkills.map((skill) => {
                    const Icon = skill.icon;
                    return (
                      <button
                        key={skill.id}
                        onClick={() => setActiveSkillId(skill.id)}
                        className="flex w-full items-start gap-3 rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-left transition hover:border-zinc-400 hover:shadow-sm"
                      >
                        <Icon size={18} className="mt-0.5 text-zinc-600" />
                        <div>
                          <p className="text-sm font-semibold text-zinc-900">{skill.name}</p>
                          <p className="mt-0.5 text-xs text-zinc-600">{skill.description}</p>
                        </div>
                      </button>
                    );
                  })}
                  {!filteredSkills.length && (
                    <p className="rounded-xl border border-zinc-200 bg-white px-3 py-3 text-sm text-zinc-600">
                      No matching skill. Try another intent phrase.
                    </p>
                  )}
                </div>
              </motion.div>
            )}

            {activeSkill && (
              <motion.div
                key={activeSkill.id}
                layoutId="omnibar-shell"
                initial={{ opacity: 0, y: 12, scale: 0.985 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.985 }}
                transition={{ type: "spring", stiffness: 170, damping: 20 }}
                className="rounded-3xl border border-zinc-200 bg-[#FCFCFC] p-5 shadow-[0_20px_60px_rgba(2,6,23,0.08)]"
              >
                <SkillWrapper
                  skill={activeSkill}
                  onClose={() => setActiveSkillId(null)}
                  onRun={(payload) => setOutput(payload)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {output && (
          <>
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOutput(null)}
              className="fixed inset-0 z-30 bg-zinc-900/10"
            />
            <motion.div
              initial={{ y: "100%", opacity: 0.7 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0.7 }}
              transition={{ type: "spring", stiffness: 180, damping: 22 }}
              className="fixed bottom-0 left-0 right-0 z-40 mx-auto w-full max-w-5xl rounded-t-3xl border border-zinc-200 bg-white p-5 shadow-[0_-20px_60px_rgba(2,6,23,0.12)]"
            >
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-xl font-semibold text-zinc-900">{output.title}</h3>
                <button
                  onClick={() => setOutput(null)}
                  className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-700"
                >
                  Close
                </button>
              </div>
              <pre className="max-h-[46vh] overflow-auto rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm leading-6 text-zinc-800">
                {output.body}
              </pre>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
