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
import ProductLeaderDigest from "@/components/ProductLeaderDigest";
import RBIPulse from "@/components/RBIPulse";
import SignalNewsletter from "@/components/SignalNewsletter";
import SignalTopicView from "@/components/SignalTopicView";
import OutputActionBar from "@/components/OutputActionBar";
import { saveSignalToHistory } from "./signalHistory";
import { saveToHistory } from "./outputHistory";
import {
  clearContext,
  canChain,
  getCompatibleSkills,
  getContext,
  getContextHint,
  setContext,
  type SkillContext,
} from "./skillContext";

type SkillFieldType = "text" | "textarea" | "select";

type SkillField = {
  id: string;
  label: string;
  type: SkillFieldType;
  placeholder?: string;
  options?: string[];
  defaultValue?: string;
};

type SkillOutputSection = {
  key: string;
  title: string;
  body: string;
  source?: string;
  id?: string;
};

type SkillOutput = {
  title: string;
  body: string;
  sections?: SkillOutputSection[];
  updatedAt?: string;
};

type SkillConfig = {
  id: string;
  name: string;
  icon: LucideIcon;
  description: string;
  localScriptPath: string;
  runLabel: string;
  requiresInitialization?: boolean;
  inputFields: SkillField[];
  generateOutput: (
    values: Record<string, string>,
  ) => SkillOutput | Promise<SkillOutput>;
};

type SkillWrapperProps = {
  skill: SkillConfig;
  onRun: (payload: SkillOutput) => void | Promise<void>;
  onClose: () => void;
  seedValues?: Record<string, string> | null;
  contextHint?: string | null;
  onClearContext?: () => void;
};

type LegacyHomeProps = {
  initialSkillId?: string | null;
  embedded?: boolean;
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
    description: "Multi-source intelligence: RSS + Serper + DuckDuckGo + Twitter. Generates 5-8 signals with topic tags.",
    localScriptPath: "/api/signal/python-refresh (Python backend)",
    runLabel: "Refresh Signal Windows",
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
            title: "Signal Windows (Latest Available)",
            body: `${latestJson?.markdown || "No memo found."}\n\n[refresh-note] ${reason}`,
            sections: Array.isArray(latestJson?.sections) ? latestJson.sections : undefined,
            updatedAt: latestJson?.updatedAt || new Date().toISOString(),
          };
        } catch {
          return {
            title: "Signal Engine",
            body: `Signal refresh failed and no cached memo could be loaded.\n\nReason: ${reason}`,
          };
        }
      };

      // Try Python backend first (full features: RSS + Serper + DuckDuckGo + Twitter)
      try {
        const pythonRes = await fetch("/api/signal/python-refresh", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        if (pythonRes.ok) {
          const json = await pythonRes.json();
          const output = {
            title: `Signal Engine (${json.meta?.sources?.join(" + ") || "Multi-Source"})`,
            body: json?.markdown || "Signal refreshed but no memo text returned.",
            sections: Array.isArray(json?.sections) ? json.sections : undefined,
            updatedAt: json?.updatedAt || new Date().toISOString(),
          };

          // Save to history
          saveSignalToHistory({
            title: output.title,
            markdown: output.body,
            sections: output.sections,
            updatedAt: output.updatedAt,
          });

          return output;
        }

        // Python backend failed, try Next.js route as fallback
        const fallbackRes = await fetch("/api/signal/refresh", { method: "POST" });
        if (fallbackRes.ok) {
          const json = await fallbackRes.json();
          const output = {
            title: "Signal Engine (RSS + Serper only)",
            body: json?.markdown || "Signal refreshed but no memo text returned.",
            sections: Array.isArray(json?.sections) ? json.sections : undefined,
            updatedAt: json?.updatedAt || new Date().toISOString(),
          };

          saveSignalToHistory({
            title: output.title,
            markdown: output.body,
            sections: output.sections,
            updatedAt: output.updatedAt,
          });

          return output;
        }

        return fallback("Both Python backend and Next.js route failed");
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return fallback(`Network error: ${message}`);
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
    generateOutput: async (values) => {
      try {
        const res = await fetch("/api/skills/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ skillId: "market", inputs: values }),
        });

        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.details || "Failed to generate market analysis");
        }

        const data = await res.json();
        return {
          title: "Play Store Market Analysis",
          body: data.output || "No analysis generated",
        };
      } catch (error) {
        return {
          title: "Play Store Market Analysis",
          body: `Error: ${error instanceof Error ? error.message : "Unknown error"}\n\nPlease ensure OPENAI_API_KEY is set in .env file.`,
        };
      }
    },
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
    generateOutput: async (values) => {
      try {
        const res = await fetch("/api/skills/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ skillId: "content", inputs: values }),
        });

        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.details || "Failed to generate LinkedIn post");
        }

        const data = await res.json();
        return {
          title: "LinkedIn Viral Post Package",
          body: data.output || "No post generated",
        };
      } catch (error) {
        return {
          title: "LinkedIn Viral Post Package",
          body: `Error: ${error instanceof Error ? error.message : "Unknown error"}\n\nPlease ensure OPENAI_API_KEY is set in .env file.`,
        };
      }
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
    generateOutput: async (values) => {
      // Try AI-enhanced version first, fallback to deterministic logic
      try {
        const res = await fetch("/api/skills/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ skillId: "idp", inputs: values }),
        });

        if (res.ok) {
          const data = await res.json();
          return {
            title: "Strategic IDP & 1:1 Synthesis (AI-Enhanced)",
            body: data.output || generateLeadershipIdpMarkdown(values),
          };
        }

        // Fallback to deterministic logic if API fails
        return {
          title: "Strategic IDP & 1:1 Synthesis",
          body: generateLeadershipIdpMarkdown(values),
        };
      } catch {
        // Fallback to deterministic logic
        return {
          title: "Strategic IDP & 1:1 Synthesis",
          body: generateLeadershipIdpMarkdown(values),
        };
      }
    },
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
    generateOutput: async (values) => {
      try {
        const res = await fetch("/api/skills/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ skillId: "validator", inputs: values }),
        });

        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.details || "Failed to validate idea");
        }

        const data = await res.json();
        return {
          title: "Idea Validation Report",
          body: data.output || "No validation generated",
        };
      } catch (error) {
        return {
          title: "Idea Validation Report",
          body: `Error: ${error instanceof Error ? error.message : "Unknown error"}\n\nPlease ensure OPENAI_API_KEY is set in .env file.`,
        };
      }
    },
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
    generateOutput: async (values) => {
      try {
        const res = await fetch("/api/skills/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ skillId: "workflow", inputs: values }),
        });

        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.details || "Failed to generate workflow");
        }

        const data = await res.json();
        return {
          title: "Agent Workflow Blueprint",
          body: data.output || "No workflow generated",
        };
      } catch (error) {
        return {
          title: "Agent Workflow Blueprint",
          body: `Error: ${error instanceof Error ? error.message : "Unknown error"}\n\nPlease ensure OPENAI_API_KEY is set in .env file.`,
        };
      }
    },
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
    generateOutput: async (values) => {
      try {
        const res = await fetch("/api/skills/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ skillId: "prompt", inputs: values }),
        });

        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.details || "Failed to optimize prompt");
        }

        const data = await res.json();
        return {
          title: "Prompt Optimization Result",
          body: data.output || "No optimization generated",
        };
      } catch (error) {
        return {
          title: "Prompt Optimization Result",
          body: `Error: ${error instanceof Error ? error.message : "Unknown error"}\n\nPlease ensure OPENAI_API_KEY is set in .env file.`,
        };
      }
    },
  },
  {
    id: "product",
    name: "Product Intelligence",
    icon: BrainCircuit,
    description: "Generates PRD-aligned strategic product recommendations from market signals.",
    localScriptPath: "/Users/joy/Downloads/prd-writer.skill",
    runLabel: "Generate Product Brief",
    requiresInitialization: true,
    inputFields: [
      { id: "problem", label: "Problem", type: "text", defaultValue: "Lending ops teams spend too much time on compliance checks" },
      { id: "metric", label: "Primary Metric", type: "text", defaultValue: "Loan approval cycle time" },
    ],
    generateOutput: async (values) => {
      try {
        const res = await fetch("/api/skills/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ skillId: "product", inputs: values }),
        });

        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.details || "Failed to generate product brief");
        }

        const data = await res.json();
        return {
          title: "Product Intelligence Brief",
          body: data.output || "No brief generated",
        };
      } catch (error) {
        return {
          title: "Product Intelligence Brief",
          body: `Error: ${error instanceof Error ? error.message : "Unknown error"}\n\nPlease ensure OPENAI_API_KEY is set in .env file.`,
        };
      }
    },
  },
];

const SKILL_LABELS: Record<string, string> = {
  signal: "Signal Engine",
  market: "Play Store Market Engine",
  content: "LinkedIn Content Engine",
  validator: "Idea Validator",
  prompt: "Prompt Engineering",
  product: "Product Intelligence",
  prd: "PRD Generator",
  workflow: "Agent Workflow",
  idp: "Leadership IDP Engine",
};

function trimContextBody(context: SkillContext | null): string {
  if (!context) return "";
  return [context.outputTitle, context.outputBody].filter(Boolean).join("\n\n").slice(0, 1300).trim();
}

function buildSeedInputs(skillId: string, context: SkillContext | null): Record<string, string> | null {
  if (!context) return null;

  const contextText = trimContextBody(context);
  if (!contextText) return null;

  switch (skillId) {
    case "content":
      return { idea: contextText };
    case "validator":
      return {
        idea: contextText,
        target: context.sourceSkillLabel,
      };
    case "product":
      return {
        problem: contextText,
        metric: "Time-to-decision and execution velocity",
      };
    case "prompt":
      return {
        prompt: contextText,
        failure: "Needs sharper India-first framing and output structure",
      };
    case "idp":
      return {
        notes: `${contextText}\n\nSource: ${context.sourceSkillLabel}`,
      };
    case "workflow":
      return {
        goal: contextText,
        constraints: `Use ${context.sourceSkillLabel} output as primary context`,
      };
    case "market":
      return {
        query: context.outputTitle || contextText.slice(0, 140),
      };
    case "signal":
      return {
        focus: `${context.sourceSkillLabel}: ${contextText.slice(0, 180)}`,
      };
    default:
      return null;
  }
}

function resolveChainTargets(sourceSkillId?: string) {
  if (!sourceSkillId) return [];
  const uniqueById = new Map<string, { id: string; label: string; description: string }>();

  for (const rawId of getCompatibleSkills(sourceSkillId)) {
    if (rawId === sourceSkillId) continue;
    if (uniqueById.has(rawId)) continue;

    uniqueById.set(rawId, {
      id: rawId,
      label: SKILL_LABELS[rawId] || rawId,
      description: getContextHint(sourceSkillId, rawId),
    });
  }

  return Array.from(uniqueById.values());
}

function SkillWrapper({ skill, onRun, onClose, seedValues, contextHint, onClearContext }: SkillWrapperProps) {
  const defaults = useMemo(() => {
    const base = Object.fromEntries(
      skill.inputFields.map((field) => [field.id, field.defaultValue || ""]),
    ) as Record<string, string>;

    if (!seedValues) return base;

    return { ...base, ...seedValues };
  }, [skill, seedValues]);

  const [values, setValues] = useState<Record<string, string>>(defaults);
  const [running, setRunning] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [stackPreference, setStackPreference] = useState("Kotlin + Compose");
  const [initializedAt, setInitializedAt] = useState<string | null>(null);
  const isInitializationRequired = Boolean(skill.requiresInitialization);
  const isInitialized = !isInitializationRequired || Boolean(initializedAt);

  useEffect(() => {
    setValues(defaults);
  }, [defaults]);

  useEffect(() => {
    setProjectName("");
    setStackPreference("Kotlin + Compose");
    setInitializedAt(null);
  }, [skill.id]);

  const Icon = skill.icon;

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4 rounded-3xl border border-zinc-200 bg-white/90 p-5 shadow-sm">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Active Workspace</p>
          <h2 className="mt-1 text-2xl font-semibold text-zinc-900">{skill.name}</h2>
          <p className="mt-2 text-sm text-zinc-600">{skill.description}</p>
          <p className="mt-2 text-xs text-zinc-500">Local Script Path: <span className="font-mono">{skill.localScriptPath}</span></p>
          {contextHint && (
            <p className="mt-3 text-xs leading-5 text-zinc-700">
              <span className="font-semibold">Context:</span> {contextHint}
            </p>
          )}
        </div>
        <button
          onClick={onClose}
          className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-700 transition hover:bg-zinc-50"
        >
          <X size={14} /> Close
        </button>
        {contextHint && onClearContext && (
          <button
            onClick={onClearContext}
            className="ml-2 inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-100 px-3 py-2 text-xs text-zinc-600 transition hover:bg-zinc-200"
          >
            Clear Context
          </button>
        )}
      </div>

      <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2 text-zinc-700">
          <Icon size={18} />
          <p className="font-medium">Execution Inputs</p>
        </div>
        {isInitializationRequired && (
          <div className="mb-5 rounded-2xl border border-zinc-300 bg-zinc-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Step 1: Initialize Project</p>
            <p className="mt-1 text-sm text-zinc-700">PRD generation is locked until project initialization is completed.</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-600">Project Name</label>
                <input
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="e.g., FinFlow AI"
                  className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-600">Stack Preference</label>
                <select
                  value={stackPreference}
                  onChange={(e) => setStackPreference(e.target.value)}
                  className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-500"
                >
                  <option value="Kotlin + Compose">Kotlin + Compose</option>
                  <option value="Flutter">Flutter</option>
                  <option value="React Native">React Native</option>
                </select>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <button
                onClick={() => {
                  if (!projectName.trim()) return;
                  setInitializedAt(new Date().toISOString());
                }}
                disabled={!projectName.trim()}
                className="inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Initialize Project
              </button>
              {initializedAt && (
                <p className="text-xs text-green-700">
                  Initialized {projectName.trim()} with {stackPreference}
                </p>
              )}
            </div>
          </div>
        )}
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
              const payload = await Promise.resolve(
                skill.generateOutput({
                  ...values,
                  __projectName: projectName.trim(),
                  __stackPreference: stackPreference,
                  __initializedAt: initializedAt || "",
                }),
              );
              await onRun(payload);
            } finally {
              setRunning(false);
            }
          }}
          disabled={running || !isInitialized}
          className="mt-5 inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {running ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />} {skill.runLabel}
        </button>
        {!isInitialized && (
          <p className="mt-2 text-xs text-zinc-500">Complete initialization to unlock PRD generation.</p>
        )}
      </div>
    </div>
  );
}

function NarrativeText({ text }: { text: string }) {
  const blocks = text
    .split(/\n{2,}/)
    .map((item) => item.trim())
    .filter(Boolean);

  return (
    <div className="space-y-4">
      {blocks.map((block, index) => (
        <p key={`${index}-${block.slice(0, 18)}`} className="whitespace-pre-wrap text-[15px] leading-7 text-zinc-800">
          {block}
        </p>
      ))}
    </div>
  );
}

export default function Home({ initialSkillId = null, embedded = false }: LegacyHomeProps) {
  const normalizedInitialSkillId = useMemo(
    () => (initialSkillId && SKILLS.some((skill) => skill.id === initialSkillId) ? initialSkillId : null),
    [initialSkillId],
  );

  const [query, setQuery] = useState("");
  const [activeSkillId, setActiveSkillId] = useState<string | null>(normalizedInitialSkillId);
  const [output, setOutput] = useState<SkillOutput | null>(null);
  const [outputId, setOutputId] = useState<string | null>(null);
  const [skillContext, setSkillContext] = useState<SkillContext | null>(() => getContext());
  const [seedValues, setSeedValues] = useState<Record<string, string> | null>(null);
  const [activeContextHint, setActiveContextHint] = useState<string | null>(null);
  const [omnibarFocused, setOmnibarFocused] = useState(true);
  const [signalViewMode, setSignalViewMode] = useState<"topic" | "newsletter" | "product-leaders" | "rbi-pulse">("topic"); // Topic View is recommended
  const inputRef = useRef<HTMLInputElement>(null);

  const activeSkill = useMemo(
    () => SKILLS.find((skill) => skill.id === activeSkillId) || null,
    [activeSkillId],
  );

  const handleOutputGenerated = (payload: SkillOutput) => {
    setOutput(payload);

    // Save to history
    if (activeSkill) {
      const outputContext: SkillContext = {
        sourceSkillId: activeSkill.id,
        sourceSkillLabel: activeSkill.name,
        outputTitle: payload.title,
        outputBody: payload.body.slice(0, 1400),
        timestamp: new Date().toISOString(),
      };

      setContext(outputContext);
      setSkillContext(outputContext);

      const id = saveToHistory({
        title: payload.title,
        skillId: activeSkill.id,
        skillLabel: activeSkill.name,
        body: payload.body,
      });
      setOutputId(id);
    }
  };

  const chainTargets = useMemo(
    () => resolveChainTargets(activeSkill?.id),
    [activeSkill?.id],
  );

  const compatibleSeedTargets = useMemo(() => {
    const source = skillContext?.sourceSkillId;
    if (!source) return new Set<string>();
    return new Set(getCompatibleSkills(source).map((id) => (id === "prd" ? "product" : id)));
  }, [skillContext]);

  const handleChain = (targetSkillId: string) => {
    const normalizedTarget = targetSkillId === "prd" ? "product" : targetSkillId;
    setActiveSkillId(normalizedTarget);
    setOutput(null);
    setOutputId(null);
    setOmnibarFocused(true);
    setQuery("");
    setActiveContextHint(
      skillContext ? getContextHint(skillContext.sourceSkillId, targetSkillId) : null,
    );
    setSeedValues(buildSeedInputs(normalizedTarget, skillContext));
    window.setTimeout(() => inputRef.current?.blur(), 10);
  };

  const clearSkillContext = () => {
    clearContext();
    setSkillContext(null);
    setSeedValues(null);
    setActiveContextHint(null);
  };

  useEffect(() => {
    if (normalizedInitialSkillId) {
      setOutput(null);
      setActiveSkillId(normalizedInitialSkillId);
      return;
    }
    setOutput(null);
    setActiveSkillId(null);
  }, [normalizedInitialSkillId]);

  useEffect(() => {
    const context = getContext();
    setSkillContext(context);
    const sourceSkillId = context?.sourceSkillId;

    if (!activeSkill || !context || !sourceSkillId) {
      setSeedValues(null);
      setActiveContextHint(null);
      return;
    }

    if (canChain(sourceSkillId, activeSkill.id)) {
      setSeedValues(buildSeedInputs(activeSkill.id, context));
      setActiveContextHint(getContextHint(sourceSkillId, activeSkill.id));
    } else {
      setSeedValues(null);
      setActiveContextHint(null);
    }
  }, [activeSkill]);


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

  if (embedded) {
    return (
      <div className="relative">
        <AnimatePresence mode="wait">
          {!activeSkill && (
            <motion.div
              key="embedded-omnibar"
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
              {skillContext && (
                <p className="mt-3 rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-xs text-violet-700">
                  Context from <span className="font-semibold">{skillContext.sourceSkillLabel}</span>: resume from available chain when supported.
                </p>
              )}

              <div className="mt-4">
                <p className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">Quick Launch</p>
                <div className="grid gap-2 sm:grid-cols-2">
                    {SKILLS.map((skill) => {
                      const Icon = skill.icon;
                      const isSuggested = compatibleSeedTargets.has(skill.id);
                      return (
                        <button
                          key={`quick-${skill.id}`}
                          onClick={() => setActiveSkillId(skill.id)}
                          className="inline-flex w-full items-center justify-between gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-left text-sm text-zinc-700 transition hover:border-zinc-400 hover:bg-white"
                        >
                        <span className="flex items-center gap-2">
                          <Icon size={16} className="text-zinc-600" />
                          <span>{skill.name}</span>
                        </span>
                        {isSuggested && (
                          <span className="text-[10px] uppercase tracking-wide text-violet-600">Chain</span>
                        )}
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
              key={`embedded-${activeSkill.id}`}
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
                onRun={handleOutputGenerated}
                seedValues={seedValues}
                contextHint={activeContextHint}
                onClearContext={skillContext ? clearSkillContext : undefined}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {output && (
            <>
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setOutput(null)}
                className="fixed inset-y-0 left-[240px] right-[280px] z-30 bg-zinc-900/10"
              />
              <motion.div
                initial={{ y: "100%", opacity: 0.7 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: "100%", opacity: 0.7 }}
                transition={{ type: "spring", stiffness: 180, damping: 22 }}
                className="fixed bottom-0 left-[240px] right-[280px] z-40 mx-auto w-auto rounded-t-3xl border border-zinc-200 bg-white p-5 shadow-[0_-20px_60px_rgba(2,6,23,0.12)]"
              >
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-zinc-900">{output.title}</h3>
                  <div className="flex items-center gap-2">
                    {/* View mode toggle for signals */}
                    {Array.isArray(output.sections) && output.sections.length > 0 && (
                      <div className="flex rounded-lg border border-zinc-300 bg-white">
                        <button
                          onClick={() => setSignalViewMode("topic")}
                          className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                            signalViewMode === "topic"
                              ? "bg-blue-600 text-white"
                              : "text-zinc-700 hover:bg-zinc-50"
                          } rounded-l-lg`}
                        >
                          Topic
                        </button>
                        <button
                          onClick={() => setSignalViewMode("newsletter")}
                          className={`px-3 py-1.5 text-xs font-medium transition-colors border-l border-zinc-200 ${
                            signalViewMode === "newsletter"
                              ? "bg-blue-600 text-white"
                              : "text-zinc-700 hover:bg-zinc-50"
                          }`}
                        >
                          Newsletter
                        </button>
                        <button
                          onClick={() => setSignalViewMode("product-leaders")}
                          className={`px-3 py-1.5 text-xs font-medium transition-colors border-l border-zinc-200 ${
                            signalViewMode === "product-leaders"
                              ? "bg-blue-600 text-white"
                              : "text-zinc-700 hover:bg-zinc-50"
                          }`}
                        >
                          PM Leaders
                        </button>
                        <button
                          onClick={() => setSignalViewMode("rbi-pulse")}
                          className={`px-3 py-1.5 text-xs font-medium transition-colors border-l border-zinc-200 ${
                            signalViewMode === "rbi-pulse"
                              ? "bg-blue-600 text-white"
                              : "text-zinc-700 hover:bg-zinc-50"
                          } rounded-r-lg`}
                        >
                          RBI Pulse
                        </button>
                      </div>
                    )}
                    <button
                      onClick={() => setOutput(null)}
                      className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-700"
                    >
                      Close
                    </button>
                  </div>
                </div>
                {Array.isArray(output.sections) && output.sections.length > 0 ? (
                  <div className="max-h-[70vh] overflow-auto">
                    {signalViewMode === "topic" ? (
                      <SignalTopicView signals={output.sections} updatedAt={output.updatedAt} />
                    ) : (
                      <SignalNewsletter signals={output.sections} updatedAt={output.updatedAt} />
                    )}
                  </div>
                ) : (
                  <div className="max-h-[56vh] overflow-auto rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                    <NarrativeText text={output.body} />
                  </div>
                )}

                <OutputActionBar
                  outputId={outputId}
                  title={output.title}
                  body={output.body}
                  sourceSkillId={activeSkill?.id}
                  compatibleSkills={chainTargets}
                  onChain={handleChain}
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    );
  }

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
              {skillContext && (
                <p className="mt-3 rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-xs text-violet-700">
                  Context from <span className="font-semibold">{skillContext.sourceSkillLabel}</span>: resume from available chain when supported.
                </p>
              )}

              <div className="mt-4">
                <p className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">Quick Launch</p>
                <div className="grid gap-2 sm:grid-cols-2">
                    {SKILLS.map((skill) => {
                      const Icon = skill.icon;
                      const isSuggested = compatibleSeedTargets.has(skill.id);
                      return (
                        <button
                          key={`quick-${skill.id}`}
                          onClick={() => setActiveSkillId(skill.id)}
                          className="inline-flex w-full items-center justify-between gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-left text-sm text-zinc-700 transition hover:border-zinc-400 hover:bg-white"
                        >
                        <span className="flex items-center gap-2">
                          <Icon size={16} className="text-zinc-600" />
                          <span>{skill.name}</span>
                        </span>
                        {isSuggested && (
                          <span className="text-[10px] uppercase tracking-wide text-violet-600">Chain</span>
                        )}
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
                  onRun={handleOutputGenerated}
                  seedValues={seedValues}
                  contextHint={activeContextHint}
                  onClearContext={skillContext ? clearSkillContext : undefined}
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
                <div className="flex items-center gap-2">
                  {/* View mode toggle for signals */}
                  {Array.isArray(output.sections) && output.sections.length > 0 && (
                    <div className="flex rounded-lg border border-zinc-300 bg-white">
                      <button
                        onClick={() => setSignalViewMode("topic")}
                        className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                          signalViewMode === "topic"
                            ? "bg-blue-600 text-white rounded-l-lg"
                            : "text-zinc-700 hover:bg-zinc-50"
                        }`}
                      >
                        Topic View
                      </button>
                      <button
                        onClick={() => setSignalViewMode("newsletter")}
                        className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                          signalViewMode === "newsletter"
                            ? "bg-blue-600 text-white rounded-r-lg"
                            : "text-zinc-700 hover:bg-zinc-50"
                        }`}
                      >
                        Newsletter
                      </button>
                    </div>
                  )}
                  <button
                    onClick={() => setOutput(null)}
                    className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-700"
                  >
                    Close
                  </button>
                </div>
              </div>
              {Array.isArray(output.sections) && output.sections.length > 0 ? (
                <div className="max-h-[70vh] overflow-auto">
                  {signalViewMode === "topic" && (
                    <SignalTopicView signals={output.sections} updatedAt={output.updatedAt} />
                  )}
                  {signalViewMode === "newsletter" && (
                    <SignalNewsletter signals={output.sections} updatedAt={output.updatedAt} />
                  )}
                  {signalViewMode === "product-leaders" && (
                    <ProductLeaderDigest signals={output.sections} updatedAt={output.updatedAt} />
                  )}
                  {signalViewMode === "rbi-pulse" && (
                    <RBIPulse signals={output.sections} updatedAt={output.updatedAt} />
                  )}
                </div>
              ) : (
                <div className="max-h-[56vh] overflow-auto rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                  <NarrativeText text={output.body} />
                </div>
              )}

              <OutputActionBar
                outputId={outputId}
                title={output.title}
                body={output.body}
                sourceSkillId={activeSkill?.id}
                compatibleSkills={chainTargets}
                onChain={handleChain}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
