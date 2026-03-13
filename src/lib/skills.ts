import {
  BarChart3,
  BrainCircuit,
  GitBranch,
  ShieldCheck,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import { saveSignalToHistory } from "@/lib/signalHistory";
import type { SkillConfig, SkillOutput } from "@/lib/skillTypes";

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

async function callSkillApi(skillId: string, values: Record<string, string>, title: string): Promise<SkillOutput> {
  try {
    const res = await fetch("/api/skills/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ skillId, inputs: values }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.details || `Failed to generate ${skillId}`);
    }

    const data = await res.json();
    return {
      title,
      body: data.output || `No output generated for ${skillId}`,
    };
  } catch (error) {
    return {
      title,
      body: `Error: ${error instanceof Error ? error.message : "Unknown error"}\n\nPlease ensure OPENAI_API_KEY is set in .env file.`,
    };
  }
}

export const SKILLS: SkillConfig[] = [
  {
    id: "signal",
    name: "Signal Engine",
    icon: Sparkles,
    description: "Multi-source intelligence: RSS + Serper + DuckDuckGo + Twitter. Generates 5-8 signals with topic tags.",
    localScriptPath: "Preferred: /api/signal/python-refresh · Fallback: /api/signal/refresh",
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

          saveSignalToHistory({
            title: output.title,
            markdown: output.body,
            sections: output.sections,
            updatedAt: output.updatedAt,
            sourceLabel: json?.meta?.sources?.length ? json.meta.sources.join(" + ") : "Python pipeline",
            freshnessLabel: "Fresh run",
          });

          return output;
        }

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
            sourceLabel: "Node pipeline",
            freshnessLabel: "Fresh run",
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
    generateOutput: async (values) => callSkillApi("market", values, "Play Store Market Analysis"),
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
    generateOutput: async (values) => callSkillApi("content", values, "LinkedIn Viral Post Package"),
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

        return {
          title: "Strategic IDP & 1:1 Synthesis",
          body: generateLeadershipIdpMarkdown(values),
        };
      } catch {
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
    generateOutput: async (values) => callSkillApi("validator", values, "Idea Validation Report"),
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
    generateOutput: async (values) => callSkillApi("workflow", values, "Agent Workflow Blueprint"),
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
    generateOutput: async (values) => callSkillApi("prompt", values, "Prompt Optimization Result"),
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
    generateOutput: async (values) => callSkillApi("product", values, "Product Intelligence Brief"),
  },
];

export const SKILL_LABELS: Record<string, string> = {
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
