"use client";

import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";
import {
  BarChart3,
  BrainCircuit,
  CheckCircle2,
  Command,
  FileText,
  Gauge,
  GitBranch,
  Layers,
  ListChecks,
  Loader2,
  Rocket,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Target,
  Terminal,
  TriangleAlert,
  WandSparkles,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type SkillId = "market" | "content" | "validator" | "workflow" | "prompt" | "product" | "settings";
type ValidatorRating = "Strong" | "Moderate" | "Weak";
type WorkflowComplexity = "single" | "multi" | "integration";

type ValidatorDimension = {
  name: string;
  rating: ValidatorRating;
  score: number;
  reason: string;
};

type ValidatorReport = {
  dimensions: ValidatorDimension[];
  verdict: "GO" | "ITERATE" | "STOP";
  verdictReason: string;
  competitors: Array<{
    name: string;
    type: "Direct" | "Adjacent" | "Workaround";
    pricing: string;
    size: string;
    weakness: string;
  }>;
  killerQuestions: string[];
  experiments: Array<{
    title: string;
    cost: string;
    signal: string;
  }>;
};

type WorkflowBlueprint = {
  architecture: "Single Agent" | "Multi-Agent Orchestration" | "Integration-Focused Agent";
  scopeStatement: string;
  nineStepPlan: Array<{ step: string; detail: string }>;
  layerPriorities: Array<{ layer: string; priority: "High" | "Medium" | "Low"; focus: string }>;
  promptTemplate: string;
};

type PrdDraft = {
  title: string;
  executiveSummary: string;
  scope: string[];
  nonGoals: string[];
  metrics: Array<{ metric: string; target: string; guardrail: string }>;
  rollout: string[];
  risks: string[];
  markdown: string;
};

type PromptAudit = {
  topWeaknesses: string[];
  optimizedPrompt: string;
  evalPlan: string[];
  tokenEstimate: { before: number; after: number; reductionPct: number };
};

type ProductSubSkill = "prd" | "competitive" | "launch" | "metrics" | "sprint" | "research";

type CompetitiveReport = {
  whatTheyBuilt: { coreFunctionality: string; targetUser: string; keyDifferentiator: string };
  whatsSmart: string[];
  whatsWeak: string[];
  implicationsForUs: string[];
};

type LaunchChecklist = {
  preLaunch: string[];
  launchDay: string[];
  post48h: string[];
  postWeek: string[];
  riskAddons: string[];
};

type MetricsPlan = {
  primary: { name: string; definition: string; measurement: string; target: string; timeframe: string };
  secondary: string[];
  guardrails: string[];
  leading: string[];
  antiMetrics: string[];
};

type SprintPlan = {
  goal: string;
  capacity: number;
  planned: number;
  buffer: number;
  verdict: "Overloaded" | "Right-sized" | "Underloaded";
  items: Array<{ item: string; estimate: number; priority: string; dependency: string; owner: string }>;
  stretchGoals: string[];
  risks: string[];
};

type ResearchSynthesis = {
  findings: Array<{ finding: string; evidence: string; confidence: "High" | "Medium" | "Low"; implication: string }>;
  themes: Array<{ theme: string; frequency: string; quote: string; implication: string }>;
  surprises: string[];
  gaps: string[];
  actions: string[];
};

type LinkedInFunnelType = "ToF" | "MoF" | "BoF";
type LinkedInViralDraft = {
  hookOptions: string[];
  finalPost: string;
  angle: string;
  funnelPlan: string;
  checklist: string[];
};

const sidebarItems = [
  { id: "market" as SkillId, label: "Market Research", icon: BarChart3 },
  { id: "content" as SkillId, label: "Content Engine", icon: FileText },
  { id: "validator" as SkillId, label: "Idea Validator", icon: ShieldCheck },
  { id: "workflow" as SkillId, label: "Agent Workflow", icon: GitBranch },
  { id: "prompt" as SkillId, label: "Prompt Engineering", icon: WandSparkles },
  { id: "product" as SkillId, label: "Product Intelligence", icon: BrainCircuit },
  { id: "settings" as SkillId, label: "Settings", icon: Settings },
];

const categories = ["Finance", "Productivity", "Health", "Lifestyle", "Business", "Education"];

const marketMap = [
  { app: "Taskito", installs: "1M+", rating: "4.6", complaints: "Reminder fatigue" },
  { app: "TickTick", installs: "5M+", rating: "4.7", complaints: "Feature overload" },
  { app: "Loop Habit Tracker", installs: "5M+", rating: "4.7", complaints: "Weak AI insights" },
  { app: "HabitNow", installs: "1M+", rating: "4.8", complaints: "No smart adaptation" },
  { app: "Microsoft To Do", installs: "10M+", rating: "4.6", complaints: "Generic workflow" },
];

const gapRadar = [
  { cluster: "Generic recommendations", count: 312, signal: "high" },
  { cluster: "Onboarding friction", count: 254, signal: "high" },
  { cluster: "Weak sync reliability", count: 181, signal: "medium" },
  { cluster: "Reminder noise", count: 166, signal: "medium" },
];

const opportunities = [
  { title: "AI Habit Copilot for Indian Shift Workers", confidence: 91, difficulty: "Medium" },
  { title: "Offline-first Micro Habits for Tier-2/3", confidence: 84, difficulty: "Low" },
  { title: "Localized Behavioral Reward Loop", confidence: 78, difficulty: "High" },
];

function buildLinkedInViralDraft({
  idea,
  funnelType,
  polishRemaining,
}: {
  idea: string;
  funnelType: LinkedInFunnelType;
  polishRemaining: number;
}): LinkedInViralDraft {
  const cleaned = idea.trim().replace(/\s+/g, " ") || "AI teams ship faster when they design systems, not just prompts.";
  const seed = cleaned.split(/[.!?]/)[0]?.trim() || cleaned;
  const shortSeed = seed.length > 92 ? `${seed.slice(0, 89)}...` : seed;

  const hookOptions = [
    `If I had to learn this again, I would start here: ${shortSeed}`,
    `The biggest mistake creators make in this topic: ${shortSeed.toLowerCase()}`,
    `Most teams miss this leverage point: ${shortSeed}`,
    `We tested this for 30 days. Here is what happened: ${shortSeed}`,
    `Meet the playbook that changed our output: ${shortSeed}`,
    `From confusion to clarity in 30 days: ${shortSeed}`,
    `I spent weeks analyzing this problem. Here is what works: ${shortSeed}`,
    `Everyone says "post more." They are wrong about this: ${shortSeed}`,
    `The system behind better LinkedIn results starts with this: ${shortSeed}`,
    `If you are building in AI, read this before your next post: ${shortSeed}`,
    `The hidden reason your posts do not convert: ${shortSeed}`,
    `I wish I knew this earlier about content systems: ${shortSeed}`,
  ];

  const funnelPlan =
    funnelType === "ToF"
      ? "Top of Funnel: broad value and shareability first (growth-oriented)."
      : funnelType === "MoF"
        ? "Middle of Funnel: authority-building through specific frameworks and proof."
        : "Bottom of Funnel: conversion-oriented post with direct CTA and offer framing.";

  const polishLine =
    polishRemaining >= 8
      ? "Final polish: tighten the first 2 lines and sharpen CTA."
      : polishRemaining >= 4
        ? "Final polish: trim 15% words and add one concrete metric."
        : "Final polish: ready to post, do one final tone pass.";

  const hashtags = ["#LinkedInGrowth", "#AIBuilders", "#ProductStrategy", "#ContentMarketing", "#Startups"];
  const cta =
    funnelType === "BoF"
      ? "If you want this exact workflow template, comment \"template\" and I will share it."
      : "What part of this workflow would you challenge or improve?";

  const finalPost = [
    hookOptions[0],
    "",
    "Most people treat AI content like a writing task.",
    "High-performing creators treat it like a system design task.",
    "",
    "Over the last month, I noticed 3 patterns:",
    "1. Teams using ready-made agent frameworks move faster on output.",
    "2. Teams that define role-specific skills move faster on quality.",
    "3. Teams that measure outcomes (not just output volume) compound faster.",
    "",
    "The real shift is this:",
    "The future is not one generalist full-stack builder doing everything.",
    "It is a builder who orchestrates specialized skills with clear decision loops.",
    "",
    "So the winning question is no longer:",
    "\"Can I ship with AI?\"",
    "It is:",
    "\"Can I design the right skill system for my company context?\"",
    "",
    cta,
    "",
    hashtags.join(" "),
    "",
    `(${polishLine})`,
  ].join("\n");

  return {
    hookOptions,
    finalPost,
    angle: `Primary angle: ${funnelType} post balancing information + emotion with concrete operational framing.`,
    funnelPlan,
    checklist: [
      "Pick one hook and keep first 3 lines high-curiosity.",
      "Ensure every paragraph has specific value, not generic claims.",
      "Keep one concrete example or number for credibility.",
      "Use one clear CTA only.",
      "Post at a sustainable cadence (quality over frequency).",
    ],
  };
}

function ratingLabel(score: number): ValidatorRating {
  if (score >= 3) return "Strong";
  if (score === 2) return "Moderate";
  return "Weak";
}

function buildCompetitorRows(idea: string) {
  const lower = idea.toLowerCase();

  if (lower.includes("habit") || lower.includes("fitness")) {
    return [
      { name: "HabitNow", type: "Direct" as const, pricing: "Freemium", size: "1M+ installs", weakness: "Generic routine logic" },
      { name: "Loop Habit Tracker", type: "Direct" as const, pricing: "Free", size: "5M+ installs", weakness: "Limited AI adaptation" },
      { name: "Spreadsheet + Reminders", type: "Workaround" as const, pricing: "Free", size: "Very common", weakness: "High manual effort" },
    ];
  }

  if (lower.includes("linkedin") || lower.includes("content")) {
    return [
      { name: "Taplio", type: "Direct" as const, pricing: "$39/mo", size: "Large", weakness: "Generic tone for India audience" },
      { name: "Jasper", type: "Adjacent" as const, pricing: "$49/mo", size: "Large", weakness: "Not LinkedIn-first workflow" },
      { name: "Notion + Manual prompts", type: "Workaround" as const, pricing: "Low", size: "Common", weakness: "Inconsistent quality" },
    ];
  }

  return [
    { name: "Incumbent SaaS", type: "Direct" as const, pricing: "Mid-tier", size: "Established", weakness: "Slow onboarding and heavy UX" },
    { name: "General-purpose AI", type: "Adjacent" as const, pricing: "Usage-based", size: "Massive", weakness: "No vertical specialization" },
    { name: "DIY process stack", type: "Workaround" as const, pricing: "Free-Low", size: "Common", weakness: "Fragmented and error-prone" },
  ];
}

function buildIdeaReport({
  idea,
  audience,
  currentSolution,
  builderEdge,
  monetization,
}: {
  idea: string;
  audience: string;
  currentSolution: string;
  builderEdge: string;
  monetization: string;
}): ValidatorReport {
  const merged = `${idea} ${audience} ${currentSolution} ${builderEdge} ${monetization}`;
  const specificAudience = audience.length > 25 && !/\beveryone|all users|all businesses|anyone\b/i.test(audience);
  const frequencySignal = /\bdaily|weekly|habit|routine|recurring|shift|workflow\b/i.test(merged);
  const hasWorkaround = currentSolution.length > 25;
  const hasPricingSignal = /\b₹|\$|subscription|freemium|paid|monthly|annual|commission\b/i.test(monetization);
  const hasDifferentiationSignal = /\bindia|tier|localized|segment|specific|first\b/i.test(idea + builderEdge);
  const feasibilityRisk = /\bhardware|regulatory|license|medical device|banking license\b/i.test(merged);

  const problemScore = frequencySignal ? 3 : idea.length > 45 ? 2 : 1;
  const marketScore = Math.min(3, (hasWorkaround ? 2 : 1) + (hasPricingSignal ? 1 : 0));
  const differentiationScore = Math.min(3, (hasDifferentiationSignal ? 2 : 1) + (builderEdge.length > 20 ? 1 : 0));
  const feasibilityScore = feasibilityRisk ? 1 : /\bapi|mobile|web|assistant|ai\b/i.test(merged) ? 3 : 2;
  const viabilityScore = Math.min(3, (hasPricingSignal ? 2 : 1) + (specificAudience ? 1 : 0));

  const dimensions: ValidatorDimension[] = [
    {
      name: "Problem Severity",
      score: problemScore,
      rating: ratingLabel(problemScore),
      reason:
        problemScore >= 3
          ? "Users appear to face this repeatedly. ASSUMPTION: frequency is at least weekly for the first segment."
          : "Pain exists but frequency/cost signal is still soft. Validate time loss with interviews.",
    },
    {
      name: "Market Evidence",
      score: marketScore,
      rating: ratingLabel(marketScore),
      reason:
        marketScore >= 3
          ? "Alternatives and willingness to pay signals exist. ASSUMPTION: current workaround spend can be redirected."
          : "Market proof is partial. Gather competitor pricing and user spend data before full commitment.",
    },
    {
      name: "Solution Differentiation",
      score: differentiationScore,
      rating: ratingLabel(differentiationScore),
      reason:
        differentiationScore >= 3
          ? "Wedge is clear for a focused segment. Defensibility can come from localized behavior data loops."
          : "Differentiation is present but not durable yet. Refine one-sentence wedge and switching reason.",
    },
    {
      name: "Feasibility",
      score: feasibilityScore,
      rating: ratingLabel(feasibilityScore),
      reason:
        feasibilityScore >= 3
          ? "MVP looks buildable with common APIs and a small team in 4-6 weeks."
          : "Delivery risk exists due to platform/regulatory complexity. Scope first release narrower.",
    },
    {
      name: "Business Viability",
      score: viabilityScore,
      rating: ratingLabel(viabilityScore),
      reason:
        viabilityScore >= 3
          ? "Monetization path exists and segment focus improves conversion potential."
          : "Revenue path is plausible but weakly quantified. Validate willingness-to-pay before scaling.",
    },
  ];

  const total = dimensions.reduce((sum, d) => sum + d.score, 0);
  const weakCount = dimensions.filter((d) => d.rating === "Weak").length;
  const verdict: ValidatorReport["verdict"] = total >= 13 && weakCount === 0 ? "GO" : total >= 10 ? "ITERATE" : "STOP";
  const verdictReason =
    verdict === "GO"
      ? "Signal quality is high enough to justify a constrained MVP and fast validation sprint."
      : verdict === "ITERATE"
      ? "Promising direction, but 1-2 dimensions need stronger evidence before full build."
      : "Core risks are too high right now; pivot scope or customer segment before investing in development.";

  const weakDimensions = dimensions.filter((d) => d.rating !== "Strong").map((d) => d.name);

  return {
    dimensions,
    verdict,
    verdictReason,
    competitors: buildCompetitorRows(idea),
    killerQuestions: [
      weakDimensions.includes("Market Evidence")
        ? "Which exact competitor are users paying today, and what is the real replacement budget?"
        : "What segment-specific proof point makes your wedge hard to copy in six months?",
      weakDimensions.includes("Solution Differentiation")
        ? "Why will the first 100 users switch from current tools this month, not someday?"
        : "What unique data loop will strengthen your product after every user action?",
      weakDimensions.includes("Business Viability")
        ? "What price can the first customer approve without procurement friction?"
        : "How many paying users are required to reach the first sustainable revenue milestone?",
    ],
    experiments: [
      {
        title: "10-customer problem interview sprint",
        cost: "3-4 days, near-zero cash cost",
        signal: "Strong if 7+ users describe current workaround pain and urgency without prompting.",
      },
      {
        title: "Smoke-test landing page with pricing",
        cost: "1 day, low ad spend",
        signal: "Strong if sign-up conversion and pricing click-through exceed baseline benchmarks.",
      },
      {
        title: "Manual concierge prototype",
        cost: "1 week founder time",
        signal: "Strong if users repeat usage weekly and request to keep access.",
      },
    ],
  };
}

function buildWorkflowBlueprint({
  problem,
  outcome,
  constraints,
  successMetric,
  complexity,
}: {
  problem: string;
  outcome: string;
  constraints: string;
  successMetric: string;
  complexity: WorkflowComplexity;
}): WorkflowBlueprint {
  const architecture =
    complexity === "multi"
      ? "Multi-Agent Orchestration"
      : complexity === "integration"
        ? "Integration-Focused Agent"
        : "Single Agent";

  const scopeStatement = `Build a ${architecture.toLowerCase()} that solves "${problem}" and achieves "${outcome}" under constraints: ${constraints}.`;

  const nineStepPlan = [
    { step: "1. Define Purpose and Scope", detail: `Lock job-to-be-done and success metric: ${successMetric}.` },
    { step: "2. Structure Inputs and Outputs", detail: "Define strict JSON input/output contracts with clear error states." },
    { step: "3. Write System Instructions", detail: "Specify role, guardrails, style, and missing-data behavior." },
    { step: "4. Enable Reasoning and Actions", detail: "Start with deterministic if/then checks, then add tool-calling loops." },
    {
      step: "5. Orchestrate Agents",
      detail:
        complexity === "multi"
          ? "Use research, analysis, writing, and QA agents with simple handoff payloads."
          : "Keep orchestration minimal until single-agent reliability is proven.",
    },
    { step: "6. Implement Memory and Context", detail: "Persist session state, user preferences, and key task history." },
    { step: "7. Add Multimedia Capabilities", detail: "Add only if needed for the target workflow (docs/images/voice)." },
    { step: "8. Format and Deliver Results", detail: "Return human-readable + machine-parseable outputs in parallel." },
    { step: "9. Build Interface or API", detail: "Expose chat UI and API endpoint with logging and monitoring." },
  ];

  const layerPriorities: WorkflowBlueprint["layerPriorities"] = [
    { layer: "Layer 1 · Infrastructure", priority: "High", focus: "Latency/cost monitoring and reliable state storage." },
    {
      layer: "Layer 3 · Protocol",
      priority: complexity === "integration" ? "High" : "Medium",
      focus: "Use MCP-compatible tool contracts for interoperability.",
    },
    { layer: "Layer 4 · Tooling Enrichment", priority: "High", focus: "Ship 3-5 robust tools before expanding integrations." },
    {
      layer: "Layer 5 · Cognition Reasoning",
      priority: "High",
      focus: "Guardrails, confidence scoring, and graceful recovery paths.",
    },
    {
      layer: "Layer 6 · Memory Personalization",
      priority: complexity === "single" ? "Medium" : "High",
      focus: "Store context needed for continuity and user personalization.",
    },
    { layer: "Layer 8 · Ops Governance", priority: "High", focus: "Audit logs, privacy filters, and human-in-the-loop escalation." },
  ];

  const promptTemplate = [
    "You are an agent workflow specialist.",
    "",
    `GOAL: ${outcome}`,
    `PROBLEM: ${problem}`,
    `SUCCESS METRIC: ${successMetric}`,
    "",
    "RULES:",
    "- Follow the JSON output schema exactly.",
    "- Never fabricate data; return explicit unknown fields when needed.",
    "- Escalate if confidence < 70 or critical data is missing.",
    "",
    "OUTPUT:",
    "{",
    '  "plan": "string",',
    '  "actions": ["string"],',
    '  "risks": ["string"],',
    '  "confidence": "0-100"',
    "}",
  ].join("\n");

  return {
    architecture,
    scopeStatement,
    nineStepPlan,
    layerPriorities,
    promptTemplate,
  };
}

function buildPrdDraft({
  productName,
  problem,
  hypothesis,
  scopeInput,
  nonGoalsInput,
  metricInput,
  rolloutInput,
}: {
  productName: string;
  problem: string;
  hypothesis: string;
  scopeInput: string;
  nonGoalsInput: string;
  metricInput: string;
  rolloutInput: string;
}): PrdDraft {
  const scope = scopeInput
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
  const nonGoals = nonGoalsInput
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
  const rollout = rolloutInput
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

  const parsedMetrics = metricInput
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [metric, target, guardrail] = line.split("|").map((part) => part.trim());
      return {
        metric: metric || "Primary KPI",
        target: target || "Define target",
        guardrail: guardrail || "Define guardrail",
      };
    });

  const metrics = parsedMetrics.length
    ? parsedMetrics
    : [{ metric: "Activation rate", target: ">= +10% vs baseline", guardrail: "No increase in churn >2%" }];

  const executiveSummary = `${productName} targets "${problem}" with a clear hypothesis: ${hypothesis}. This PRD locks scope, success criteria, and rollout gates so the team can ship with measurable outcomes rather than vague intent.`;

  const risks = [
    "Ambiguous behavior contracts causing implementation drift.",
    "Metric movement without causal confidence from weak experiment design.",
    "Rollout without a clear kill switch owner.",
  ];

  const markdown = [
    `# PRD: ${productName}`,
    "",
    "## Opportunity Framing",
    `- Core Problem: ${problem}`,
    `- Working Hypothesis: ${hypothesis}`,
    "- Strategy Fit: Supports high-confidence delivery with measurable business impact.",
    "",
    "## Scope",
    ...scope.map((s) => `- ${s}`),
    "",
    "## Non-Goals",
    ...nonGoals.map((n) => `- ${n}`),
    "",
    "## Success Metrics",
    ...metrics.map((m) => `- ${m.metric}: Target ${m.target}; Guardrail ${m.guardrail}`),
    "",
    "## Rollout Plan",
    ...rollout.map((r) => `- ${r}`),
    "",
    "## Risk Management",
    ...risks.map((r) => `- ${r}`),
    "",
    "## Ownership",
    "- Product: PM Owner",
    "- Engineering: Tech Lead",
    "- Launch Decision: PM + Eng + Design at ramp gates",
  ].join("\n");

  return {
    title: `PRD: ${productName}`,
    executiveSummary,
    scope,
    nonGoals,
    metrics,
    rollout,
    risks,
    markdown,
  };
}

function buildPromptAudit({
  prompt,
  failureModesInput,
  targetModel,
}: {
  prompt: string;
  failureModesInput: string;
  targetModel: string;
}): PromptAudit {
  const failures = failureModesInput
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const topWeaknesses = [
    failures[0] || "Soft instructions without hard constraints.",
    failures[1] || "No explicit edge-case behavior.",
    failures[2] || "Output format not strict enough for production parsing.",
  ];

  const styleHint =
    targetModel === "Claude"
      ? "Use XML sections for constraints and tasks."
      : targetModel === "GPT-4"
        ? "Use strict JSON contract with required keys."
        : "Use compact markdown + bullet constraints.";

  const optimizedPrompt = [
    "SYSTEM ROLE: You are a production AI assistant for a single, clearly defined task.",
    "",
    "HARD CONSTRAINTS (NEVER):",
    `- ${topWeaknesses[0]}`,
    `- ${topWeaknesses[1]}`,
    "- Return uncertain claims as UNKNOWN instead of guessing.",
    "",
    "REQUIRED BEHAVIORS (ALWAYS):",
    "- Follow output schema exactly.",
    "- Ask one clarifying question if required input is missing.",
    "- Keep response concise and actionable.",
    "",
    `MODEL FORMAT STRATEGY: ${styleHint}`,
    "",
    "OUTPUT SCHEMA:",
    "{",
    '  "answer": "string",',
    '  "confidence": "0-100",',
    '  "next_step": "string"',
    "}",
    "",
    "INPUT CONTEXT:",
    prompt.trim() || "[Provide user task context here]",
  ].join("\n");

  const before = Math.max(80, prompt.split(/\s+/).filter(Boolean).length * 1.3);
  const after = Math.max(60, Math.round(before * 0.72));
  const reductionPct = Math.round(((before - after) / before) * 100);

  return {
    topWeaknesses,
    optimizedPrompt,
    evalPlan: [
      "20% happy path tests (standard user requests).",
      "60% edge case tests (ambiguous, malformed, multilingual input).",
      "20% adversarial tests (prompt injection, policy-bypass attempts).",
      "Track format compliance, safety escapes, and latency per run.",
    ],
    tokenEstimate: {
      before,
      after,
      reductionPct,
    },
  };
}

function buildCompetitiveReport({
  competitor,
  feature,
  ourProduct,
}: {
  competitor: string;
  feature: string;
  ourProduct: string;
}): CompetitiveReport {
  return {
    whatTheyBuilt: {
      coreFunctionality: `${competitor} optimized ${feature} around a tightly scoped user journey.`,
      targetUser: "High-frequency users with immediate workflow pain.",
      keyDifferentiator: "Fast activation path with low setup friction and clear upgrade moments.",
    },
    whatsSmart: [
      "Narrow initial scope that maximizes first-week retention.",
      "Feature embedding inside daily workflow instead of optional sidebar utilities.",
      "Monetization tied to usage thresholds, not arbitrary paywalls.",
    ],
    whatsWeak: [
      "Limited transparency in advanced pricing tiers for growing teams.",
      "Weak mobile parity for core flows, reducing cross-device engagement.",
      "Guardrail and audit workflows underdeveloped for regulated customers.",
    ],
    implicationsForUs: [
      `For ${ourProduct}, copy the low-friction onboarding pattern and avoid opaque packaging.`,
      "Differentiate with explicit trust controls, audit traces, and visible quality scoring.",
      "Prioritize mobile parity for the highest-frequency path before adding feature breadth.",
    ],
  };
}

function buildLaunchChecklist({
  launchTarget,
  riskLevel,
}: {
  launchTarget: string;
  riskLevel: "low" | "medium" | "high";
}): LaunchChecklist {
  const base: LaunchChecklist = {
    preLaunch: [
      `Feature for "${launchTarget}" is QA signed-off end-to-end.`,
      "Rollback plan documented and tested in staging.",
      "Primary + guardrail metrics have baselines and alert thresholds.",
      "Support brief with FAQ and escalation owner is published.",
      "Feature flag and monitoring dashboard are configured.",
    ],
    launchDay: [
      "Deploy in low-traffic window and verify telemetry ingestion.",
      "Monitor errors, latency, and support channels for 2 hours.",
      "Post internal launch communication with rollback command.",
    ],
    post48h: [
      "Compare primary metric against baseline and expected MDE.",
      "Review guardrails: performance, support volume, and failures.",
      "Summarize issues and decision options to stakeholders.",
    ],
    postWeek: [
      "Run full impact review and decide scale, iterate, or rollback.",
      "Capture learnings and update launch runbook for next release.",
    ],
    riskAddons: [],
  };

  if (riskLevel === "medium") {
    base.riskAddons = [
      "Use staged rollout with manual gate checks at 10%, 25%, and 50%.",
      "Assign explicit on-call owner for first 24 hours.",
    ];
  }

  if (riskLevel === "high") {
    base.riskAddons = [
      "War-room channel active with engineering, product, and support.",
      "Staged rollout required: 1% → 10% → 50% → 100%.",
      "Executive notification and 24-hour monitoring coverage.",
      "No Friday-afternoon deployment window allowed.",
    ];
  }

  return base;
}

function buildMetricsPlan({
  initiative,
  goal,
}: {
  initiative: string;
  goal: string;
}): MetricsPlan {
  return {
    primary: {
      name: `${initiative} activation rate`,
      definition: `Percent of exposed users completing the key ${initiative} action within 7 days.`,
      measurement: `Event tracking pipeline with event "initiative_action_completed" and exposure marker.`,
      target: `>= +12% vs baseline aligned to goal: ${goal}`,
      timeframe: "Weekly readout, formal evaluation at 30 and 90 days.",
    },
    secondary: [
      "Completion-to-repeat ratio within first 14 days.",
      "Median time-to-first-value from first exposure.",
      "Retention delta for exposed vs control cohorts.",
    ],
    guardrails: [
      "p95 latency does not regress more than 10% from baseline.",
      "Support tickets in impacted workflow do not exceed +15% week-over-week.",
      "Crash/error rate stays below pre-launch threshold.",
    ],
    leading: [
      "Day-1 setup completion.",
      "First-session drop-off at critical steps.",
      "User-reported clarity score in first-week survey.",
    ],
    antiMetrics: [
      "Higher session count with lower completion can indicate confusion loops.",
      "Traffic spikes without qualified conversions can indicate mis-targeting.",
    ],
  };
}

function buildSprintPlan({
  backlogInput,
  teamSize,
  sprintWeeks,
}: {
  backlogInput: string;
  teamSize: number;
  sprintWeeks: number;
}): SprintPlan {
  const parsed = backlogInput
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [item, estimate, priority, dependency, owner] = line.split("|").map((part) => part.trim());
      return {
        item: item || "Backlog item",
        estimate: Number(estimate) || 2,
        priority: priority || "P1",
        dependency: dependency || "None",
        owner: owner || "TBD",
      };
    });

  const capacity = teamSize * sprintWeeks * 5;
  const effectiveCapacity = Math.round(capacity * 0.8);
  const planned = parsed.reduce((sum, item) => sum + item.estimate, 0);
  const buffer = Math.max(0, effectiveCapacity - planned);
  const verdict: SprintPlan["verdict"] =
    planned > effectiveCapacity ? "Overloaded" : planned < effectiveCapacity * 0.65 ? "Underloaded" : "Right-sized";

  return {
    goal: "Deliver highest-risk items first while preserving 20% contingency capacity.",
    capacity: effectiveCapacity,
    planned,
    buffer,
    verdict,
    items: parsed,
    stretchGoals: [
      "Add one P2 task only if all P0/P1 items are complete by mid-sprint.",
      "Reserve final day for hardening, instrumentation checks, and release prep.",
    ],
    risks: [
      "Items with unresolved dependencies may cause schedule compression.",
      "Low-confidence estimates should be re-sized by day 2 checkpoint.",
    ],
  };
}

function buildResearchSynthesis({
  question,
  participants,
}: {
  question: string;
  participants: number;
}): ResearchSynthesis {
  const sample = Math.max(1, participants);
  const highCount = Math.max(2, Math.round(sample * 0.6));
  const medCount = Math.max(1, Math.round(sample * 0.3));

  return {
    findings: [
      {
        finding: "Users hesitate at trust-heavy setup steps before experiencing value.",
        evidence: `${highCount} of ${sample} participants delayed or skipped setup until value was clearer.`,
        confidence: "High",
        implication: "Move trust asks after first value milestone.",
      },
      {
        finding: "Frequent users create manual workarounds for repetitive tasks.",
        evidence: `${medCount} of ${sample} participants showed ad-hoc shortcuts or external tools.`,
        confidence: "Medium",
        implication: "Prioritize batch or automation workflows for retention.",
      },
    ],
    themes: [
      {
        theme: "Onboarding trust friction",
        frequency: `${highCount}/${sample}`,
        quote: "\"I need to see value before granting deeper access.\"",
        implication: "Re-sequence onboarding to show value first.",
      },
      {
        theme: "Workflow fragmentation",
        frequency: `${medCount}/${sample}`,
        quote: "\"I keep switching between tools to complete one task.\"",
        implication: "Consolidate key workflow in a single surface.",
      },
    ],
    surprises: [
      "Search/discovery features are less visible than expected during live usage.",
      `Some users answered differently from observed behavior in ${question}.`,
    ],
    gaps: [
      "Limited coverage from enterprise and low-activity cohorts.",
      "Pricing sensitivity not deeply tested in current sessions.",
    ],
    actions: [
      "Run follow-up interviews focused on enterprise decision-makers.",
      "Prototype value-first onboarding and test against current baseline.",
      "Instrument discovery and repeated-task behaviors before next sprint.",
    ],
  };
}

function SkillMarketResearch({
  onLog,
}: {
  onLog: (line: string) => void;
}) {
  const [category, setCategory] = useState("Finance");
  const [niche, setNiche] = useState("AI habit tracker for Indian users");
  const [analyzing, setAnalyzing] = useState(false);
  const [ready, setReady] = useState(false);
  const [showPrd, setShowPrd] = useState(false);

  const runAnalysis = () => {
    setAnalyzing(true);
    setReady(false);
    setShowPrd(false);
    onLog(`[Market Engine] Starting India analysis for ${category}`);
    window.setTimeout(() => {
      setAnalyzing(false);
      setReady(true);
      onLog("[Market Engine] Gap analysis complete. 3 opportunities drafted.");
    }, 2000);
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="mb-2 text-xs uppercase tracking-[0.2em] text-violet-200">Play Store Research</p>
        <h2 className="text-xl font-semibold">Market Engine (India Scope)</h2>
        <p className="mt-1 text-sm text-white/70">
          Select category, run a gap scan, then expand into a PRD draft.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((item) => (
            <button
              key={item}
              onClick={() => {
                setCategory(item);
                setNiche(`${item} opportunity in India with underserved demand`);
                onLog(`[Market Engine] Category switched to ${item}`);
              }}
              className={clsx(
                "rounded-xl border px-3 py-2 text-left text-sm transition",
                category === item
                  ? "border-violet-300/60 bg-violet-500/20"
                  : "border-white/10 bg-black/30 hover:border-white/25",
              )}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="mt-4 flex flex-col gap-3 lg:flex-row">
          <input
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-violet-300/60"
          />
          <button
            onClick={runAnalysis}
            disabled={analyzing}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-violet-300/40 bg-violet-500/20 px-4 py-2 text-sm font-medium transition hover:bg-violet-500/30 disabled:opacity-50"
          >
            {analyzing ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
            Analyze
          </button>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
          <h3 className="mb-3 font-semibold">Gap Analysis</h3>
          <div className="space-y-2">
            {gapRadar.map((item) => (
              <div key={item.cluster} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm">
                <span>{item.cluster}</span>
                <span
                  className={clsx(
                    "rounded-full px-2 py-0.5 text-xs",
                    item.signal === "high" ? "bg-rose-500/20 text-rose-200" : "bg-amber-500/20 text-amber-200",
                  )}
                >
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
          <h3 className="mb-3 font-semibold">Opportunity Stack</h3>
          <div className="space-y-2">
            {opportunities.map((item) => (
              <div key={item.title} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <p className="text-sm font-medium">{item.title}</p>
                <p className="mt-1 text-xs text-white/70">
                  Confidence {item.confidence}% · Difficulty {item.difficulty}
                </p>
              </div>
            ))}
          </div>
          <button
            disabled={!ready}
            onClick={() => {
              setShowPrd(true);
              onLog("[Market Engine] PRD panel opened.");
            }}
            className="mt-4 inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/8 px-3 py-2 text-sm disabled:opacity-45"
          >
            <WandSparkles size={15} />
            Generate PRD
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
        <h3 className="mb-3 font-semibold">Market Map</h3>
        <div className="overflow-hidden rounded-xl border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/[0.05] text-white/80">
              <tr>
                <th className="px-3 py-2 font-medium">App</th>
                <th className="px-3 py-2 font-medium">Installs</th>
                <th className="px-3 py-2 font-medium">Rating</th>
                <th className="px-3 py-2 font-medium">Primary Complaint</th>
              </tr>
            </thead>
            <tbody>
              {marketMap.map((row) => (
                <tr key={row.app} className="border-t border-white/10 bg-black/20">
                  <td className="px-3 py-2">{row.app}</td>
                  <td className="px-3 py-2 text-white/80">{row.installs}</td>
                  <td className="px-3 py-2 text-white/80">{row.rating}</td>
                  <td className="px-3 py-2 text-white/75">{row.complaints}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showPrd && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-violet-300/30 bg-violet-500/10 p-5"
        >
          <h3 className="text-lg font-semibold">PRD Snapshot</h3>
          <p className="mt-2 text-sm text-violet-100">
            Strategy: Build an India-first adaptive routine planner for users with irregular schedules.
          </p>
          <p className="mt-2 text-sm text-violet-100">
            MVP Features: adaptive plans, offline capture, reliability sync, weekly insight cards.
          </p>
        </motion.div>
      )}
    </div>
  );
}

function SkillContentEngine({
  onLog,
}: {
  onLog: (line: string) => void;
}) {
  const [idea, setIdea] = useState(
    "Frameworks like BMAD and GSD accelerate AI software development, but the real moat is designing purpose-built skills for your company context."
  );
  const [funnelType, setFunnelType] = useState<LinkedInFunnelType>("ToF");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedHookIndex, setSelectedHookIndex] = useState(0);
  const [draft, setDraft] = useState("");
  const [polish, setPolish] = useState(10);
  const [viralDraft, setViralDraft] = useState<LinkedInViralDraft | null>(null);

  const polishHint = useMemo(() => {
    if (polish >= 8) return "Polish needed: tighten hook and make CTA more specific.";
    if (polish >= 4) return "Polish needed: reduce one paragraph and add one concrete metric.";
    return "Almost publish-ready. Final tone alignment only.";
  }, [polish]);

  const generationQualityFlags = useMemo(() => {
    if (!viralDraft) return [];
    const checks = [];
    if (!/\d/.test(viralDraft.finalPost)) checks.push("Add at least one number/result for specificity.");
    if (!/\?$/.test(viralDraft.finalPost.trim()) && !/comment|DM|link/i.test(viralDraft.finalPost))
      checks.push("Close with a clearer engagement CTA or offer CTA.");
    if (viralDraft.finalPost.split("\n").filter((line) => line.trim()).length < 12)
      checks.push("Body is too short for authority/value depth.");
    return checks;
  }, [viralDraft]);

  const generateViralPost = () => {
    setIsGenerating(true);
    onLog(`[Content Engine] Generating ${funnelType} viral post package from rough idea...`);
    window.setTimeout(() => {
      const pkg = buildLinkedInViralDraft({
        idea,
        funnelType,
        polishRemaining: polish,
      });
      setViralDraft(pkg);
      setSelectedHookIndex(0);
      setDraft(pkg.finalPost);
      setIsGenerating(false);
      onLog("[Content Engine] Viral post package ready: hooks + final post + checklist.");
    }, 1200);
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="mb-2 text-xs uppercase tracking-[0.2em] text-violet-200">LinkedIn Viral Post Writer</p>
        <h2 className="text-xl font-semibold">Viral Drafting Studio</h2>
        <p className="mt-1 text-sm text-white/70">
          Uses local skill context from <code>/Users/joy/Downloads/linkedin-viral-post-writer.skill</code> with hook templates and post anatomy references.
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {[
            { id: "ToF" as LinkedInFunnelType, label: "Top Funnel (ToF)" },
            { id: "MoF" as LinkedInFunnelType, label: "Middle Funnel (MoF)" },
            { id: "BoF" as LinkedInFunnelType, label: "Bottom Funnel (BoF)" },
          ].map((option) => (
            <button
              key={option.id}
              onClick={() => setFunnelType(option.id)}
              className={clsx(
                "rounded-xl border px-3 py-2 text-sm transition",
                funnelType === option.id
                  ? "border-violet-300/60 bg-violet-500/20"
                  : "border-white/10 bg-black/30 hover:border-white/25",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-black/35 p-4">
          <h3 className="mb-2 font-semibold">Rough Idea</h3>
          <textarea
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            className="h-52 w-full rounded-xl border border-white/10 bg-black/70 px-3 py-3 text-sm text-zinc-100 caret-violet-300 outline-none placeholder:text-zinc-400 focus:border-violet-300/60"
            placeholder="Write your rough idea here..."
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={generateViralPost}
              disabled={isGenerating}
              className="rounded-xl border border-violet-300/40 bg-violet-500/20 px-4 py-2 text-sm font-medium transition hover:bg-violet-500/30 disabled:opacity-50"
            >
              {isGenerating ? "Generating..." : "Generate Viral Post"}
            </button>
            <button
              onClick={() => {
                if (!viralDraft) return;
                const chosen = viralDraft.hookOptions[selectedHookIndex] || viralDraft.hookOptions[0];
                const updatedPost = viralDraft.finalPost.replace(viralDraft.hookOptions[0], chosen);
                setDraft(updatedPost);
                onLog("[Content Engine] Applied selected hook to final post.");
              }}
              disabled={!viralDraft}
              className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium transition hover:bg-white/20 disabled:opacity-50"
            >
              Apply Selected Hook
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
          <h3 className="mb-2 font-semibold">Final Post Output</h3>
          <pre className="h-52 overflow-auto rounded-xl border border-white/10 bg-black/40 p-3 text-sm leading-6 text-white/90">
            {draft}
          </pre>
          <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span>10% Polish Slider</span>
              <span className="text-violet-200">{polish}% manual polish remaining</span>
            </div>
            <input
              type="range"
              min={0}
              max={10}
              value={polish}
              onChange={(e) => setPolish(Number(e.target.value))}
              className="w-full accent-violet-400"
            />
            <p className="mt-2 text-xs text-white/70">{polishHint}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
          <h3 className="mb-2 font-semibold">Hook Lab (10+ Options)</h3>
          {!viralDraft && (
            <p className="text-sm text-white/65">Generate first to see ranked hook options.</p>
          )}
          {viralDraft && (
            <div className="space-y-2">
              {viralDraft.hookOptions.map((hook, index) => (
                <button
                  key={`${hook}-${index}`}
                  onClick={() => setSelectedHookIndex(index)}
                  className={clsx(
                    "w-full rounded-xl border px-3 py-2 text-left text-sm transition",
                    selectedHookIndex === index
                      ? "border-violet-300/60 bg-violet-500/20"
                      : "border-white/10 bg-white/[0.03] hover:border-white/25",
                  )}
                >
                  {hook}
                </button>
              ))}
              <p className="text-xs text-white/65">{viralDraft.funnelPlan}</p>
              <p className="text-xs text-white/65">{viralDraft.angle}</p>
            </div>
          )}
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
          <h3 className="mb-2 font-semibold">Publish Checklist</h3>
          {!viralDraft && (
            <p className="text-sm text-white/65">Checklist appears after generation.</p>
          )}
          {viralDraft && (
            <div className="space-y-2 text-sm">
              {viralDraft.checklist.map((item) => (
                <p key={item} className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-white/80">
                  {item}
                </p>
              ))}
              {!!generationQualityFlags.length && (
                <div className="rounded-xl border border-amber-300/30 bg-amber-500/10 p-3">
                  <p className="font-medium text-amber-100">Quality Guardrails</p>
                  <ul className="mt-1 list-disc pl-5 text-amber-100/90">
                    {generationQualityFlags.map((flag) => (
                      <li key={flag}>{flag}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SkillIdeaValidator({
  onLog,
}: {
  onLog: (line: string) => void;
}) {
  const [idea, setIdea] = useState("AI habit coach for Indian shift workers with adaptive plans.");
  const [audience, setAudience] = useState("Night-shift professionals in India at BPO and support teams (100-1000 employee companies).");
  const [currentSolution, setCurrentSolution] = useState("They use generic reminder apps, spreadsheets, and WhatsApp accountability groups.");
  const [builderEdge, setBuilderEdge] = useState("Team has prior behavior design and Android growth experience in India-first products.");
  const [monetization, setMonetization] = useState("Freemium + ₹199/month premium for adaptive coaching and insight reports.");
  const [isValidating, setIsValidating] = useState(false);
  const [report, setReport] = useState<ValidatorReport | null>(null);

  const runValidation = () => {
    setIsValidating(true);
    onLog("[Idea Validator] Running 5-dimension stress test...");
    window.setTimeout(() => {
      setReport(
        buildIdeaReport({
          idea,
          audience,
          currentSolution,
          builderEdge,
          monetization,
        }),
      );
      setIsValidating(false);
      onLog("[Idea Validator] Validation complete with verdict generated.");
    }, 1800);
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="mb-2 text-xs uppercase tracking-[0.2em] text-violet-200">Idea Validator</p>
        <h2 className="text-xl font-semibold">Founder Stress-Test Console</h2>
        <p className="mt-1 text-sm text-white/70">
          Local reference: <code>/Users/joy/pm-claude-skills/skills/idea-validator/SKILL.md</code>
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-black/35 p-4">
          <h3 className="mb-2 font-semibold">Step 1 · Idea Inputs</h3>
          <div className="space-y-3">
            <textarea
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              className="h-20 w-full rounded-xl border border-white/10 bg-black/70 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-violet-300/60"
              placeholder="One-sentence idea"
            />
            <textarea
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              className="h-20 w-full rounded-xl border border-white/10 bg-black/70 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-violet-300/60"
              placeholder="Specific first customer segment"
            />
            <textarea
              value={currentSolution}
              onChange={(e) => setCurrentSolution(e.target.value)}
              className="h-20 w-full rounded-xl border border-white/10 bg-black/70 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-violet-300/60"
              placeholder="How users solve this today"
            />
            <textarea
              value={builderEdge}
              onChange={(e) => setBuilderEdge(e.target.value)}
              className="h-20 w-full rounded-xl border border-white/10 bg-black/70 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-violet-300/60"
              placeholder="Why you can win this market"
            />
            <input
              value={monetization}
              onChange={(e) => setMonetization(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/70 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-violet-300/60"
              placeholder="Monetization model"
            />
          </div>
          <button
            onClick={runValidation}
            disabled={isValidating}
            className="mt-3 inline-flex items-center gap-2 rounded-xl border border-violet-300/40 bg-violet-500/20 px-4 py-2 text-sm font-medium transition hover:bg-violet-500/30 disabled:opacity-50"
          >
            {isValidating ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
            Validate Idea
          </button>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
          <h3 className="mb-2 font-semibold">Step 2 · Verdict</h3>
          {!report && (
            <div className="rounded-xl border border-dashed border-white/20 bg-white/[0.02] p-5 text-sm text-white/65">
              Run validation to generate the full scorecard, competitive scan, and de-risking experiments.
            </div>
          )}
          {report && (
            <div className="space-y-3">
              <div
                className={clsx(
                  "rounded-xl border p-3",
                  report.verdict === "GO"
                    ? "border-emerald-300/40 bg-emerald-500/10"
                    : report.verdict === "ITERATE"
                      ? "border-amber-300/40 bg-amber-500/10"
                      : "border-rose-300/40 bg-rose-500/10",
                )}
              >
                <p className="text-xs uppercase tracking-[0.15em] text-white/70">Verdict</p>
                <p className="mt-1 text-lg font-semibold">{report.verdict}</p>
                <p className="mt-1 text-sm text-white/80">{report.verdictReason}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm text-white/80">
                {report.verdict === "STOP" ? (
                  <span className="inline-flex items-center gap-2">
                    <TriangleAlert size={15} className="text-rose-200" />
                    Recommend pivoting segment before writing MVP scope.
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2">
                    <CheckCircle2 size={15} className="text-emerald-200" />
                    Continue with structured interviews and quick pricing validation.
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {report && (
        <>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            {report.dimensions.map((dimension) => (
              <div key={dimension.name} className="rounded-xl border border-white/10 bg-black/30 p-3">
                <p className="text-xs text-white/60">{dimension.name}</p>
                <p
                  className={clsx(
                    "mt-1 text-sm font-semibold",
                    dimension.rating === "Strong"
                      ? "text-emerald-200"
                      : dimension.rating === "Moderate"
                        ? "text-amber-200"
                        : "text-rose-200",
                  )}
                >
                  {dimension.rating}
                </p>
                <p className="mt-2 text-xs text-white/70">{dimension.reason}</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
            <h3 className="mb-3 font-semibold">Quick Competitive Scan</h3>
            <div className="overflow-hidden rounded-xl border border-white/10">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/[0.05] text-white/80">
                  <tr>
                    <th className="px-3 py-2 font-medium">Competitor / Alternative</th>
                    <th className="px-3 py-2 font-medium">Type</th>
                    <th className="px-3 py-2 font-medium">Pricing</th>
                    <th className="px-3 py-2 font-medium">Est. Size</th>
                    <th className="px-3 py-2 font-medium">Key Weakness</th>
                  </tr>
                </thead>
                <tbody>
                  {report.competitors.map((row) => (
                    <tr key={row.name} className="border-t border-white/10 bg-black/20">
                      <td className="px-3 py-2">{row.name}</td>
                      <td className="px-3 py-2 text-white/80">{row.type}</td>
                      <td className="px-3 py-2 text-white/80">{row.pricing}</td>
                      <td className="px-3 py-2 text-white/80">{row.size}</td>
                      <td className="px-3 py-2 text-white/75">{row.weakness}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <h3 className="mb-2 font-semibold">Killer Questions</h3>
              <div className="space-y-2 text-sm text-white/80">
                {report.killerQuestions.map((question) => (
                  <p key={question} className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
                    {question}
                  </p>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <h3 className="mb-2 font-semibold">Next Experiments</h3>
              <div className="space-y-2 text-sm">
                {report.experiments.map((exp) => (
                  <div key={exp.title} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                    <p className="font-medium">{exp.title}</p>
                    <p className="mt-1 text-white/75">Cost: {exp.cost}</p>
                    <p className="mt-1 text-white/75">Signal: {exp.signal}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function SkillAgentWorkflow({
  onLog,
}: {
  onLog: (line: string) => void;
}) {
  const [problem, setProblem] = useState("Research Play Store category leaders and generate a PRD-ready opportunity report.");
  const [outcome, setOutcome] = useState("A ranked top-3 opportunity output with implementation-ready scope.");
  const [constraints, setConstraints] = useState("Single operator, India-first market context, low compute budget.");
  const [successMetric, setSuccessMetric] = useState("Research report completeness >90% with reproducible workflow in under 15 minutes.");
  const [complexity, setComplexity] = useState<WorkflowComplexity>("multi");
  const [isDesigning, setIsDesigning] = useState(false);
  const [blueprint, setBlueprint] = useState<WorkflowBlueprint | null>(null);

  const generateWorkflow = () => {
    setIsDesigning(true);
    onLog("[Agent Workflow] Designing architecture blueprint from skill framework...");
    window.setTimeout(() => {
      setBlueprint(
        buildWorkflowBlueprint({
          problem,
          outcome,
          constraints,
          successMetric,
          complexity,
        }),
      );
      setIsDesigning(false);
      onLog("[Agent Workflow] 9-step + 8-layer blueprint ready.");
    }, 1500);
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="mb-2 text-xs uppercase tracking-[0.2em] text-violet-200">Agent Workflow Designer</p>
        <h2 className="text-xl font-semibold">System Architecture Panel</h2>
        <p className="mt-1 text-sm text-white/70">
          Source loaded from <code>/Users/joy/Downloads/agent-workflow.skill</code> (9-step process + 8-layer model).
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-black/35 p-4">
          <h3 className="mb-3 font-semibold">Problem Definition</h3>
          <div className="space-y-3">
            <textarea
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              className="h-20 w-full rounded-xl border border-white/10 bg-black/70 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-violet-300/60"
              placeholder="What problem should the agent workflow solve?"
            />
            <textarea
              value={outcome}
              onChange={(e) => setOutcome(e.target.value)}
              className="h-20 w-full rounded-xl border border-white/10 bg-black/70 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-violet-300/60"
              placeholder="What concrete outcome is required?"
            />
            <textarea
              value={constraints}
              onChange={(e) => setConstraints(e.target.value)}
              className="h-20 w-full rounded-xl border border-white/10 bg-black/70 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-violet-300/60"
              placeholder="Constraints: budget, timeline, integrations, resources"
            />
            <input
              value={successMetric}
              onChange={(e) => setSuccessMetric(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/70 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-violet-300/60"
              placeholder="Success metric"
            />
            <div className="grid grid-cols-3 gap-2 rounded-xl border border-white/10 bg-black/30 p-2 text-xs">
              {[
                { id: "single" as WorkflowComplexity, label: "Single Agent" },
                { id: "multi" as WorkflowComplexity, label: "Multi-Agent" },
                { id: "integration" as WorkflowComplexity, label: "Integration" },
              ].map((option) => (
                <button
                  key={option.id}
                  onClick={() => setComplexity(option.id)}
                  className={clsx(
                    "rounded-lg border px-2 py-1.5 transition",
                    complexity === option.id
                      ? "border-violet-300/60 bg-violet-500/20"
                      : "border-white/10 bg-white/[0.03] hover:border-white/25",
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={generateWorkflow}
            disabled={isDesigning}
            className="mt-3 inline-flex items-center gap-2 rounded-xl border border-violet-300/40 bg-violet-500/20 px-4 py-2 text-sm font-medium transition hover:bg-violet-500/30 disabled:opacity-50"
          >
            {isDesigning ? <Loader2 size={16} className="animate-spin" /> : <GitBranch size={16} />}
            Generate Workflow
          </button>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
          <h3 className="mb-2 font-semibold">Architecture Snapshot</h3>
          {!blueprint ? (
            <div className="rounded-xl border border-dashed border-white/20 bg-white/[0.02] p-5 text-sm text-white/65">
              Run workflow generation to produce scoped architecture, step plan, and prompt template.
            </div>
          ) : (
            <div className="space-y-3">
              <div className="rounded-xl border border-indigo-300/30 bg-indigo-500/10 p-3">
                <p className="text-xs uppercase tracking-[0.15em] text-indigo-100/80">Recommended Architecture</p>
                <p className="mt-1 text-lg font-semibold">{blueprint.architecture}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm text-white/80">
                {blueprint.scopeStatement}
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm text-white/80">
                <p className="text-xs uppercase tracking-[0.12em] text-white/60">Decision Tree Hint</p>
                <p className="mt-1">
                  {complexity === "single" &&
                    "Use one agent first; only split roles after proving deterministic reliability."}
                  {complexity === "multi" &&
                    "Separate research, analysis, writing, and QA roles with simple handoff payloads."}
                  {complexity === "integration" &&
                    "Prioritize tool protocol contracts and resilient API integration before scaling agent count."}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {blueprint && (
        <>
          <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
            <h3 className="mb-3 font-semibold">9-Step Build Plan</h3>
            <div className="grid gap-2 lg:grid-cols-3">
              {blueprint.nineStepPlan.map((item) => (
                <div key={item.step} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <p className="text-sm font-semibold">{item.step}</p>
                  <p className="mt-1 text-xs text-white/70">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <h3 className="mb-3 font-semibold">8-Layer Priorities</h3>
              <div className="space-y-2">
                {blueprint.layerPriorities.map((layer) => (
                  <div key={layer.layer} className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{layer.layer}</p>
                      <span
                        className={clsx(
                          "rounded-full px-2 py-0.5 text-xs",
                          layer.priority === "High"
                            ? "bg-rose-500/20 text-rose-200"
                            : layer.priority === "Medium"
                              ? "bg-amber-500/20 text-amber-200"
                              : "bg-emerald-500/20 text-emerald-200",
                        )}
                      >
                        {layer.priority}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-white/70">{layer.focus}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <h3 className="mb-2 font-semibold">System Prompt Scaffold</h3>
              <pre className="h-[360px] overflow-auto rounded-xl border border-white/10 bg-black/40 p-3 text-xs leading-6 text-white/90">
                {blueprint.promptTemplate}
              </pre>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function SkillProductIntelligence({
  onLog,
}: {
  onLog: (line: string) => void;
}) {
  const modules: Array<{ id: ProductSubSkill; label: string; source: string }> = [
    { id: "prd", label: "PRD Writer", source: "/Users/joy/Downloads/prd-writer.skill" },
    { id: "competitive", label: "Competitive Analysis", source: "/Users/joy/Downloads/SKILL (4).md" },
    { id: "launch", label: "Launch Checklist", source: "/Users/joy/Downloads/SKILL (3).md" },
    { id: "metrics", label: "Metrics Definer", source: "/Users/joy/Downloads/SKILL (2).md" },
    { id: "sprint", label: "Sprint Planner", source: "/Users/joy/Downloads/SKILL (1).md" },
    { id: "research", label: "User Research Synthesizer", source: "/Users/joy/Downloads/SKILL.md" },
  ];
  const [activeModule, setActiveModule] = useState<ProductSubSkill>("prd");

  const [productName, setProductName] = useState("PlayIntel Copilot");
  const [problem, setProblem] = useState("Founders lack decision-grade Play Store opportunity specs before building.");
  const [hypothesis, setHypothesis] = useState("A gated research-to-PRD workflow will reduce false-start builds and improve launch quality.");
  const [scopeInput, setScopeInput] = useState(
    "India-only market research mode\nTop-3 opportunity ranking with confidence\nPRD generation after explicit initialization gate",
  );
  const [nonGoalsInput, setNonGoalsInput] = useState(
    "Global market coverage in v1\nAutomatic full app code generation\nMulti-user collaboration and auth",
  );
  const [metricInput, setMetricInput] = useState(
    "Research-to-PRD completion rate | >= 60% | No session error rate above 5%\nTime to first opportunity report | <= 4 min | No critical data omissions",
  );
  const [rolloutInput, setRolloutInput] = useState(
    "Week 1: Internal alpha at 5% usage\nWeek 2: Expand to trusted founders cohort at 20%\nWeek 3: Ramp to 50% if guardrails hold",
  );
  const [isDrafting, setIsDrafting] = useState(false);
  const [draft, setDraft] = useState<PrdDraft | null>(null);
  const [competitorName, setCompetitorName] = useState("HabitNow");
  const [competitorFeature, setCompetitorFeature] = useState("AI habit coaching loop");
  const [ourProductName, setOurProductName] = useState("PlayIntel Copilot");
  const [isAnalyzingCompetitive, setIsAnalyzingCompetitive] = useState(false);
  const [competitiveReport, setCompetitiveReport] = useState<CompetitiveReport | null>(null);
  const [launchTarget, setLaunchTarget] = useState("India-first AI Habit Tracker release");
  const [launchDate, setLaunchDate] = useState("2026-04-01");
  const [usersAffected, setUsersAffected] = useState("~10,000 beta users");
  const [launchRisk, setLaunchRisk] = useState<"low" | "medium" | "high">("medium");
  const [isBuildingChecklist, setIsBuildingChecklist] = useState(false);
  const [launchChecklist, setLaunchChecklist] = useState<LaunchChecklist | null>(null);
  const [metricInitiative, setMetricInitiative] = useState("Opportunity-to-PRD conversion");
  const [metricGoal, setMetricGoal] = useState("Increase quality handoffs from research to execution.");
  const [currentSignals, setCurrentSignals] = useState("Research run count, PRD generation completion, session errors");
  const [isDefiningMetrics, setIsDefiningMetrics] = useState(false);
  const [metricsPlan, setMetricsPlan] = useState<MetricsPlan | null>(null);
  const [backlogInput, setBacklogInput] = useState(
    "Finalize India filter enforcement | 3 | P0 | None | Joy\nBuild competitor table export | 2 | P1 | API schema lock | Arjun\nLaunch-readiness dashboard | 4 | P1 | Metrics events | Priya",
  );
  const [teamSize, setTeamSize] = useState(3);
  const [sprintWeeks, setSprintWeeks] = useState(2);
  const [sprintConstraints, setSprintConstraints] = useState("One engineer part-time on support during week 1");
  const [isPlanningSprint, setIsPlanningSprint] = useState(false);
  const [sprintPlan, setSprintPlan] = useState<SprintPlan | null>(null);
  const [researchNotes, setResearchNotes] = useState(
    "Participant 1: hesitant to connect data before seeing value.\nParticipant 2: uses spreadsheet workaround for repetitive flows.\nParticipant 3: says onboarding asks too much too early.",
  );
  const [researchQuestion, setResearchQuestion] = useState("Why do users drop during onboarding for AI habit products?");
  const [participantCount, setParticipantCount] = useState(10);
  const [isSynthesizingResearch, setIsSynthesizingResearch] = useState(false);
  const [researchSynthesis, setResearchSynthesis] = useState<ResearchSynthesis | null>(null);

  const generatePrd = () => {
    setIsDrafting(true);
    onLog("[Product Intelligence] Generating decision-first PRD draft...");
    window.setTimeout(() => {
      setDraft(
        buildPrdDraft({
          productName,
          problem,
          hypothesis,
          scopeInput,
          nonGoalsInput,
          metricInput,
          rolloutInput,
        }),
      );
      setIsDrafting(false);
      onLog("[Product Intelligence] PRD draft generated with rollout + risk controls.");
    }, 1500);
  };
  const runCompetitiveAnalysis = () => {
    setIsAnalyzingCompetitive(true);
    onLog("[Product Intelligence] Running competitive analysis module...");
    window.setTimeout(() => {
      setCompetitiveReport(
        buildCompetitiveReport({
          competitor: competitorName,
          feature: competitorFeature,
          ourProduct: ourProductName,
        }),
      );
      setIsAnalyzingCompetitive(false);
      onLog("[Product Intelligence] Competitive analysis completed.");
    }, 1000);
  };
  const generateLaunchChecklist = () => {
    setIsBuildingChecklist(true);
    onLog("[Product Intelligence] Building risk-scaled launch checklist...");
    window.setTimeout(() => {
      setLaunchChecklist(
        buildLaunchChecklist({
          launchTarget: `${launchTarget} (${launchDate}, ${usersAffected})`,
          riskLevel: launchRisk,
        }),
      );
      setIsBuildingChecklist(false);
      onLog("[Product Intelligence] Launch checklist ready.");
    }, 900);
  };
  const defineMetrics = () => {
    setIsDefiningMetrics(true);
    onLog("[Product Intelligence] Defining primary, guardrail, and anti-metrics...");
    window.setTimeout(() => {
      setMetricsPlan(
        buildMetricsPlan({
          initiative: metricInitiative,
          goal: `${metricGoal} Current measurable signals: ${currentSignals}.`,
        }),
      );
      setIsDefiningMetrics(false);
      onLog("[Product Intelligence] Metrics contract generated.");
    }, 900);
  };
  const planSprint = () => {
    setIsPlanningSprint(true);
    onLog("[Product Intelligence] Creating sprint plan with capacity check...");
    window.setTimeout(() => {
      setSprintPlan(
        buildSprintPlan({
          backlogInput,
          teamSize,
          sprintWeeks,
        }),
      );
      setIsPlanningSprint(false);
      onLog("[Product Intelligence] Sprint plan ready.");
    }, 900);
  };
  const synthesizeResearch = () => {
    setIsSynthesizingResearch(true);
    onLog("[Product Intelligence] Synthesizing interview evidence...");
    window.setTimeout(() => {
      setResearchSynthesis(
        buildResearchSynthesis({
          question: `${researchQuestion} Notes: ${researchNotes}`,
          participants: participantCount,
        }),
      );
      setIsSynthesizingResearch(false);
      onLog("[Product Intelligence] Research synthesis complete.");
    }, 900);
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="mb-2 text-xs uppercase tracking-[0.2em] text-violet-200">Product Intelligence</p>
        <h2 className="text-xl font-semibold">Multi-Skill Product Ops Console</h2>
        <p className="mt-1 text-sm text-white/70">PRD Writer is retained, with five additional product skills added as requested.</p>
        <div className="mt-3 grid gap-2 md:grid-cols-2">
          {modules.map((module) => (
            <button
              key={module.id}
              onClick={() => {
                setActiveModule(module.id);
                onLog(`[Product Intelligence] Switched to ${module.label}.`);
              }}
              className={clsx(
                "rounded-xl border px-3 py-2 text-left text-sm transition",
                activeModule === module.id
                  ? "border-violet-300/60 bg-violet-500/20"
                  : "border-white/10 bg-black/25 hover:border-white/25",
              )}
            >
              <p className="font-medium">{module.label}</p>
              <p className="text-xs text-white/65">{module.source}</p>
            </button>
          ))}
        </div>
      </div>

      {activeModule === "prd" && (
        <>
          <div className="grid gap-4 xl:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-black/35 p-4">
              <h3 className="mb-2 font-semibold">PRD Inputs</h3>
              <div className="space-y-3">
                <input
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/70 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-violet-300/60"
                  placeholder="Product name"
                />
                <textarea
                  value={problem}
                  onChange={(e) => setProblem(e.target.value)}
                  className="h-20 w-full rounded-xl border border-white/10 bg-black/70 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-violet-300/60"
                  placeholder="Core problem"
                />
                <textarea
                  value={hypothesis}
                  onChange={(e) => setHypothesis(e.target.value)}
                  className="h-20 w-full rounded-xl border border-white/10 bg-black/70 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-violet-300/60"
                  placeholder="Working hypothesis"
                />
                <textarea
                  value={scopeInput}
                  onChange={(e) => setScopeInput(e.target.value)}
                  className="h-24 w-full rounded-xl border border-white/10 bg-black/70 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-violet-300/60"
                  placeholder="In-scope items (one per line)"
                />
                <textarea
                  value={nonGoalsInput}
                  onChange={(e) => setNonGoalsInput(e.target.value)}
                  className="h-20 w-full rounded-xl border border-white/10 bg-black/70 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-violet-300/60"
                  placeholder="Non-goals (one per line)"
                />
                <textarea
                  value={metricInput}
                  onChange={(e) => setMetricInput(e.target.value)}
                  className="h-24 w-full rounded-xl border border-white/10 bg-black/70 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-violet-300/60"
                  placeholder="Metrics as: metric | target | guardrail"
                />
                <textarea
                  value={rolloutInput}
                  onChange={(e) => setRolloutInput(e.target.value)}
                  className="h-20 w-full rounded-xl border border-white/10 bg-black/70 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-violet-300/60"
                  placeholder="Rollout steps (one per line)"
                />
              </div>
              <button
                onClick={generatePrd}
                disabled={isDrafting}
                className="mt-3 inline-flex items-center gap-2 rounded-xl border border-violet-300/40 bg-violet-500/20 px-4 py-2 text-sm font-medium transition hover:bg-violet-500/30 disabled:opacity-50"
              >
                {isDrafting ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
                Generate PRD
              </button>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <h3 className="mb-2 font-semibold">Execution Snapshot</h3>
              {!draft && (
                <div className="rounded-xl border border-dashed border-white/20 bg-white/[0.02] p-5 text-sm text-white/65">
                  Generate a PRD to view structured decisions, metrics, rollout gates, and risk controls.
                </div>
              )}
              {draft && (
                <div className="space-y-3">
                  <div className="rounded-xl border border-indigo-300/35 bg-indigo-500/10 p-3 text-sm text-indigo-100">
                    {draft.executiveSummary}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                      <p className="text-xs text-white/60">Scope Items</p>
                      <p className="mt-1 text-lg font-semibold">{draft.scope.length}</p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                      <p className="text-xs text-white/60">Success Metrics</p>
                      <p className="mt-1 text-lg font-semibold">{draft.metrics.length}</p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                      <p className="text-xs text-white/60">Rollout Gates</p>
                      <p className="mt-1 text-lg font-semibold">{draft.rollout.length}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          {draft && (
            <div className="grid gap-4 xl:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                <h3 className="mb-2 flex items-center gap-2 font-semibold">
                  <Gauge size={16} /> Metric Contract
                </h3>
                <div className="space-y-2 text-sm">
                  {draft.metrics.map((m) => (
                    <div key={`${m.metric}-${m.target}`} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                      <p className="font-medium">{m.metric}</p>
                      <p className="mt-1 text-white/75">Target: {m.target}</p>
                      <p className="mt-1 text-white/75">Guardrail: {m.guardrail}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                <h3 className="mb-2 flex items-center gap-2 font-semibold">
                  <Rocket size={16} /> Rollout + Risks
                </h3>
                <div className="space-y-2 text-sm">
                  {draft.rollout.map((step) => (
                    <p key={step} className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-white/80">
                      {step}
                    </p>
                  ))}
                  <div className="rounded-xl border border-rose-300/30 bg-rose-500/10 p-3">
                    <p className="font-medium text-rose-100">Primary Risk Cluster</p>
                    <ul className="mt-1 list-disc pl-5 text-xs text-rose-100/90">
                      {draft.risks.map((risk) => (
                        <li key={risk}>{risk}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
          {draft && (
            <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <h3 className="mb-2 flex items-center gap-2 font-semibold">
                <ListChecks size={16} /> PRD Markdown Draft
              </h3>
              <pre className="max-h-[360px] overflow-auto rounded-xl border border-white/10 bg-black/40 p-3 text-xs leading-6 text-white/90">
                {draft.markdown}
              </pre>
            </div>
          )}
        </>
      )}

      {activeModule === "competitive" && (
        <div className="grid gap-4 xl:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-black/35 p-4">
            <h3 className="mb-2 font-semibold">Competitive Inputs</h3>
            <div className="space-y-3">
              <input
                value={competitorName}
                onChange={(e) => setCompetitorName(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/70 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-violet-300/60"
                placeholder="Competitor name"
              />
              <input
                value={competitorFeature}
                onChange={(e) => setCompetitorFeature(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/70 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-violet-300/60"
                placeholder="Feature/product area"
              />
              <input
                value={ourProductName}
                onChange={(e) => setOurProductName(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/70 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-violet-300/60"
                placeholder="Our product for comparison"
              />
            </div>
            <button
              onClick={runCompetitiveAnalysis}
              disabled={isAnalyzingCompetitive}
              className="mt-3 inline-flex items-center gap-2 rounded-xl border border-violet-300/40 bg-violet-500/20 px-4 py-2 text-sm font-medium transition hover:bg-violet-500/30 disabled:opacity-50"
            >
              {isAnalyzingCompetitive ? <Loader2 size={16} className="animate-spin" /> : <BrainCircuit size={16} />}
              Analyze Competitor
            </button>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
            <h3 className="mb-2 font-semibold">Analysis Output</h3>
            {!competitiveReport && (
              <div className="rounded-xl border border-dashed border-white/20 bg-white/[0.02] p-5 text-sm text-white/65">
                Run analysis to get what to copy, avoid, and differentiate.
              </div>
            )}
            {competitiveReport && (
              <div className="space-y-3 text-sm">
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <p className="font-medium">What They Built</p>
                  <p className="mt-1 text-white/75">Core: {competitiveReport.whatTheyBuilt.coreFunctionality}</p>
                  <p className="mt-1 text-white/75">User: {competitiveReport.whatTheyBuilt.targetUser}</p>
                  <p className="mt-1 text-white/75">Differentiator: {competitiveReport.whatTheyBuilt.keyDifferentiator}</p>
                </div>
                <div className="rounded-xl border border-emerald-300/30 bg-emerald-500/10 p-3">
                  <p className="font-medium text-emerald-100">What&apos;s Smart</p>
                  <ul className="mt-1 list-disc pl-5 text-emerald-100/90">
                    {competitiveReport.whatsSmart.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-xl border border-amber-300/30 bg-amber-500/10 p-3">
                  <p className="font-medium text-amber-100">What&apos;s Weak</p>
                  <ul className="mt-1 list-disc pl-5 text-amber-100/90">
                    {competitiveReport.whatsWeak.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-xl border border-indigo-300/30 bg-indigo-500/10 p-3">
                  <p className="font-medium text-indigo-100">Implications For Us</p>
                  <ul className="mt-1 list-disc pl-5 text-indigo-100/90">
                    {competitiveReport.implicationsForUs.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeModule === "launch" && (
        <div className="grid gap-4 xl:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-black/35 p-4">
            <h3 className="mb-2 font-semibold">Launch Inputs</h3>
            <div className="space-y-3">
              <input
                value={launchTarget}
                onChange={(e) => setLaunchTarget(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/70 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-violet-300/60"
                placeholder="What are you launching?"
              />
              <input
                value={launchDate}
                onChange={(e) => setLaunchDate(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/70 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-violet-300/60"
                placeholder="Launch date"
              />
              <input
                value={usersAffected}
                onChange={(e) => setUsersAffected(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/70 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-violet-300/60"
                placeholder="Users affected"
              />
              <select
                value={launchRisk}
                onChange={(e) => setLaunchRisk(e.target.value as "low" | "medium" | "high")}
                className="w-full rounded-xl border border-white/10 bg-black/70 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-violet-300/60"
              >
                <option value="low">Low Risk</option>
                <option value="medium">Medium Risk</option>
                <option value="high">High Risk</option>
              </select>
            </div>
            <button
              onClick={generateLaunchChecklist}
              disabled={isBuildingChecklist}
              className="mt-3 inline-flex items-center gap-2 rounded-xl border border-violet-300/40 bg-violet-500/20 px-4 py-2 text-sm font-medium transition hover:bg-violet-500/30 disabled:opacity-50"
            >
              {isBuildingChecklist ? <Loader2 size={16} className="animate-spin" /> : <ListChecks size={16} />}
              Generate Checklist
            </button>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
            <h3 className="mb-2 font-semibold">Checklist</h3>
            {!launchChecklist && (
              <div className="rounded-xl border border-dashed border-white/20 bg-white/[0.02] p-5 text-sm text-white/65">
                Generate a risk-scaled launch checklist with pre, launch day, and post-launch controls.
              </div>
            )}
            {launchChecklist && (
              <div className="space-y-3 text-sm">
                {[
                  { title: "Pre-Launch", items: launchChecklist.preLaunch },
                  { title: "Launch Day", items: launchChecklist.launchDay },
                  { title: "Post-Launch (48h)", items: launchChecklist.post48h },
                  { title: "Post-Launch (1 week)", items: launchChecklist.postWeek },
                ].map((section) => (
                  <div key={section.title} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                    <p className="font-medium">{section.title}</p>
                    <ul className="mt-1 list-disc pl-5 text-white/80">
                      {section.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
                {!!launchChecklist.riskAddons.length && (
                  <div className="rounded-xl border border-rose-300/30 bg-rose-500/10 p-3">
                    <p className="font-medium text-rose-100">Risk-Level Additions</p>
                    <ul className="mt-1 list-disc pl-5 text-rose-100/90">
                      {launchChecklist.riskAddons.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {activeModule === "metrics" && (
        <div className="grid gap-4 xl:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-black/35 p-4">
            <h3 className="mb-2 font-semibold">Metric Inputs</h3>
            <div className="space-y-3">
              <input
                value={metricInitiative}
                onChange={(e) => setMetricInitiative(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/70 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-violet-300/60"
                placeholder="Feature or initiative"
              />
              <textarea
                value={metricGoal}
                onChange={(e) => setMetricGoal(e.target.value)}
                className="h-20 w-full rounded-xl border border-white/10 bg-black/70 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-violet-300/60"
                placeholder="Goal"
              />
              <textarea
                value={currentSignals}
                onChange={(e) => setCurrentSignals(e.target.value)}
                className="h-20 w-full rounded-xl border border-white/10 bg-black/70 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-violet-300/60"
                placeholder="What can you currently measure?"
              />
            </div>
            <button
              onClick={defineMetrics}
              disabled={isDefiningMetrics}
              className="mt-3 inline-flex items-center gap-2 rounded-xl border border-violet-300/40 bg-violet-500/20 px-4 py-2 text-sm font-medium transition hover:bg-violet-500/30 disabled:opacity-50"
            >
              {isDefiningMetrics ? <Loader2 size={16} className="animate-spin" /> : <Gauge size={16} />}
              Define Metrics
            </button>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
            <h3 className="mb-2 font-semibold">Metric Contract</h3>
            {!metricsPlan && (
              <div className="rounded-xl border border-dashed border-white/20 bg-white/[0.02] p-5 text-sm text-white/65">
                Generate primary, secondary, guardrail, leading, and anti-metrics.
              </div>
            )}
            {metricsPlan && (
              <div className="space-y-3 text-sm">
                <div className="rounded-xl border border-indigo-300/30 bg-indigo-500/10 p-3">
                  <p className="font-medium text-indigo-100">{metricsPlan.primary.name}</p>
                  <p className="mt-1 text-indigo-100/90">Definition: {metricsPlan.primary.definition}</p>
                  <p className="mt-1 text-indigo-100/90">Measurement: {metricsPlan.primary.measurement}</p>
                  <p className="mt-1 text-indigo-100/90">Target: {metricsPlan.primary.target}</p>
                  <p className="mt-1 text-indigo-100/90">Timeframe: {metricsPlan.primary.timeframe}</p>
                </div>
                {[
                  { title: "Secondary Metrics", items: metricsPlan.secondary },
                  { title: "Guardrail Metrics", items: metricsPlan.guardrails },
                  { title: "Leading Indicators", items: metricsPlan.leading },
                  { title: "Anti-Metrics", items: metricsPlan.antiMetrics },
                ].map((section) => (
                  <div key={section.title} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                    <p className="font-medium">{section.title}</p>
                    <ul className="mt-1 list-disc pl-5 text-white/80">
                      {section.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeModule === "sprint" && (
        <div className="grid gap-4 xl:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-black/35 p-4">
            <h3 className="mb-2 font-semibold">Sprint Inputs</h3>
            <div className="space-y-3">
              <textarea
                value={backlogInput}
                onChange={(e) => setBacklogInput(e.target.value)}
                className="h-28 w-full rounded-xl border border-white/10 bg-black/70 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-violet-300/60"
                placeholder="Item | Estimate(days) | Priority | Dependencies | Owner"
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  type="number"
                  min={1}
                  value={teamSize}
                  onChange={(e) => setTeamSize(Number(e.target.value) || 1)}
                  className="w-full rounded-xl border border-white/10 bg-black/70 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-violet-300/60"
                  placeholder="Team size"
                />
                <select
                  value={sprintWeeks}
                  onChange={(e) => setSprintWeeks(Number(e.target.value))}
                  className="w-full rounded-xl border border-white/10 bg-black/70 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-violet-300/60"
                >
                  <option value={1}>1 week sprint</option>
                  <option value={2}>2 week sprint</option>
                </select>
              </div>
              <textarea
                value={sprintConstraints}
                onChange={(e) => setSprintConstraints(e.target.value)}
                className="h-16 w-full rounded-xl border border-white/10 bg-black/70 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-violet-300/60"
                placeholder="Constraints or deadlines"
              />
            </div>
            <button
              onClick={planSprint}
              disabled={isPlanningSprint}
              className="mt-3 inline-flex items-center gap-2 rounded-xl border border-violet-300/40 bg-violet-500/20 px-4 py-2 text-sm font-medium transition hover:bg-violet-500/30 disabled:opacity-50"
            >
              {isPlanningSprint ? <Loader2 size={16} className="animate-spin" /> : <Target size={16} />}
              Plan Sprint
            </button>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
            <h3 className="mb-2 font-semibold">Sprint Plan</h3>
            {!sprintPlan && (
              <div className="rounded-xl border border-dashed border-white/20 bg-white/[0.02] p-5 text-sm text-white/65">
                Generate a plan with capacity math, backlog fit, stretch goals, and risks.
              </div>
            )}
            {sprintPlan && (
              <div className="space-y-3 text-sm">
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <p className="font-medium">Sprint Goal</p>
                  <p className="mt-1 text-white/80">{sprintPlan.goal}</p>
                  <p className="mt-2 text-xs text-white/70">Constraints: {sprintConstraints}</p>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-2 text-center">
                    <p className="text-xs text-white/60">Capacity</p>
                    <p className="font-semibold">{sprintPlan.capacity}</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-2 text-center">
                    <p className="text-xs text-white/60">Planned</p>
                    <p className="font-semibold">{sprintPlan.planned}</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-2 text-center">
                    <p className="text-xs text-white/60">Buffer</p>
                    <p className="font-semibold">{sprintPlan.buffer}</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-2 text-center">
                    <p className="text-xs text-white/60">Verdict</p>
                    <p className="font-semibold">{sprintPlan.verdict}</p>
                  </div>
                </div>
                <div className="overflow-hidden rounded-xl border border-white/10">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-white/[0.05]">
                      <tr>
                        <th className="px-2 py-2">Item</th>
                        <th className="px-2 py-2">Est</th>
                        <th className="px-2 py-2">Pri</th>
                        <th className="px-2 py-2">Dep</th>
                        <th className="px-2 py-2">Owner</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sprintPlan.items.map((item) => (
                        <tr key={`${item.item}-${item.owner}`} className="border-t border-white/10">
                          <td className="px-2 py-2">{item.item}</td>
                          <td className="px-2 py-2">{item.estimate}</td>
                          <td className="px-2 py-2">{item.priority}</td>
                          <td className="px-2 py-2">{item.dependency}</td>
                          <td className="px-2 py-2">{item.owner}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <p className="font-medium">Risks</p>
                  <ul className="mt-1 list-disc pl-5 text-white/80">
                    {sprintPlan.risks.map((risk) => (
                      <li key={risk}>{risk}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeModule === "research" && (
        <div className="grid gap-4 xl:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-black/35 p-4">
            <h3 className="mb-2 font-semibold">Research Inputs</h3>
            <div className="space-y-3">
              <textarea
                value={researchNotes}
                onChange={(e) => setResearchNotes(e.target.value)}
                className="h-28 w-full rounded-xl border border-white/10 bg-black/70 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-violet-300/60"
                placeholder="Paste interview notes or transcripts"
              />
              <input
                value={researchQuestion}
                onChange={(e) => setResearchQuestion(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/70 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-violet-300/60"
                placeholder="Research question"
              />
              <input
                type="number"
                min={1}
                value={participantCount}
                onChange={(e) => setParticipantCount(Number(e.target.value) || 1)}
                className="w-full rounded-xl border border-white/10 bg-black/70 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-violet-300/60"
                placeholder="Participants"
              />
            </div>
            <button
              onClick={synthesizeResearch}
              disabled={isSynthesizingResearch}
              className="mt-3 inline-flex items-center gap-2 rounded-xl border border-violet-300/40 bg-violet-500/20 px-4 py-2 text-sm font-medium transition hover:bg-violet-500/30 disabled:opacity-50"
            >
              {isSynthesizingResearch ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
              Synthesize Research
            </button>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
            <h3 className="mb-2 font-semibold">Synthesis Output</h3>
            {!researchSynthesis && (
              <div className="rounded-xl border border-dashed border-white/20 bg-white/[0.02] p-5 text-sm text-white/65">
                Generate evidence-ranked findings with themes, surprises, gaps, and actions.
              </div>
            )}
            {researchSynthesis && (
              <div className="space-y-3 text-sm">
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <p className="font-medium">Key Findings</p>
                  {researchSynthesis.findings.map((finding) => (
                    <div key={finding.finding} className="mt-2 rounded-lg border border-white/10 bg-black/20 p-2">
                      <p className="font-medium">{finding.finding}</p>
                      <p className="text-white/75">Evidence: {finding.evidence}</p>
                      <p className="text-white/75">Confidence: {finding.confidence}</p>
                      <p className="text-white/75">Implication: {finding.implication}</p>
                    </div>
                  ))}
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <p className="font-medium">Themes</p>
                  <div className="mt-2 space-y-2">
                    {researchSynthesis.themes.map((theme) => (
                      <div key={theme.theme} className="rounded-lg border border-white/10 bg-black/20 p-2">
                        <p className="font-medium">{theme.theme} ({theme.frequency})</p>
                        <p className="text-white/75">Quote: {theme.quote}</p>
                        <p className="text-white/75">Implication: {theme.implication}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid gap-2 md:grid-cols-3">
                  <div className="rounded-xl border border-amber-300/30 bg-amber-500/10 p-3">
                    <p className="font-medium text-amber-100">Surprises</p>
                    <ul className="mt-1 list-disc pl-5 text-amber-100/90">
                      {researchSynthesis.surprises.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-xl border border-rose-300/30 bg-rose-500/10 p-3">
                    <p className="font-medium text-rose-100">Gaps</p>
                    <ul className="mt-1 list-disc pl-5 text-rose-100/90">
                      {researchSynthesis.gaps.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-xl border border-emerald-300/30 bg-emerald-500/10 p-3">
                    <p className="font-medium text-emerald-100">Actions</p>
                    <ul className="mt-1 list-disc pl-5 text-emerald-100/90">
                      {researchSynthesis.actions.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function SkillPromptEngineering({
  onLog,
}: {
  onLog: (line: string) => void;
}) {
  const [targetModel, setTargetModel] = useState("GPT-4");
  const [prompt, setPrompt] = useState(
    "Help users find Play Store opportunities and provide recommendations with details and metrics.",
  );
  const [failureModes, setFailureModes] = useState(
    "Too verbose output\nNo strict format consistency\nHallucinates unsupported market stats",
  );
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [audit, setAudit] = useState<PromptAudit | null>(null);

  const optimizePrompt = () => {
    setIsOptimizing(true);
    onLog(`[Prompt Engineering] Optimizing prompt for ${targetModel}...`);
    window.setTimeout(() => {
      setAudit(
        buildPromptAudit({
          prompt,
          failureModesInput: failureModes,
          targetModel,
        }),
      );
      setIsOptimizing(false);
      onLog("[Prompt Engineering] Optimized prompt and eval plan generated.");
    }, 1200);
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="mb-2 text-xs uppercase tracking-[0.2em] text-violet-200">Prompt Engineering</p>
        <h2 className="text-xl font-semibold">Production Prompt Optimizer</h2>
        <p className="mt-1 text-sm text-white/70">
          Source: <code>/Users/joy/Downloads/prompt-engineering.skill</code>
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-black/35 p-4">
          <h3 className="mb-2 font-semibold">Prompt Input</h3>
          <div className="space-y-3">
            <select
              value={targetModel}
              onChange={(e) => setTargetModel(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/70 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-violet-300/60"
            >
              <option>GPT-4</option>
              <option>Claude</option>
              <option>GPT-3.5</option>
            </select>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="h-32 w-full rounded-xl border border-white/10 bg-black/70 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-violet-300/60"
              placeholder="Current prompt"
            />
            <textarea
              value={failureModes}
              onChange={(e) => setFailureModes(e.target.value)}
              className="h-24 w-full rounded-xl border border-white/10 bg-black/70 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-violet-300/60"
              placeholder="Top failure modes, one per line"
            />
          </div>
          <button
            onClick={optimizePrompt}
            disabled={isOptimizing}
            className="mt-3 inline-flex items-center gap-2 rounded-xl border border-violet-300/40 bg-violet-500/20 px-4 py-2 text-sm font-medium transition hover:bg-violet-500/30 disabled:opacity-50"
          >
            {isOptimizing ? <Loader2 size={16} className="animate-spin" /> : <WandSparkles size={16} />}
            Optimize Prompt
          </button>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
          <h3 className="mb-2 font-semibold">Optimization Result</h3>
          {!audit && (
            <div className="rounded-xl border border-dashed border-white/20 bg-white/[0.02] p-5 text-sm text-white/65">
              Run optimization to generate hard constraints, cost-aware prompt rewrite, and evaluation mix.
            </div>
          )}
          {audit && (
            <div className="space-y-3">
              <div className="rounded-xl border border-indigo-300/30 bg-indigo-500/10 p-3">
                <p className="text-xs uppercase tracking-[0.15em] text-indigo-100/80">Top Weaknesses</p>
                <ul className="mt-1 list-disc pl-5 text-sm text-indigo-100/95">
                  {audit.topWeaknesses.map((weak) => (
                    <li key={weak}>{weak}</li>
                  ))}
                </ul>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-center">
                  <p className="text-xs text-white/60">Tokens Before</p>
                  <p className="mt-1 font-semibold">{audit.tokenEstimate.before}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-center">
                  <p className="text-xs text-white/60">Tokens After</p>
                  <p className="mt-1 font-semibold">{audit.tokenEstimate.after}</p>
                </div>
                <div className="rounded-xl border border-emerald-300/30 bg-emerald-500/10 p-3 text-center">
                  <p className="text-xs text-emerald-100/80">Reduction</p>
                  <p className="mt-1 font-semibold text-emerald-100">{audit.tokenEstimate.reductionPct}%</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {audit && (
        <div className="grid gap-4 xl:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
            <h3 className="mb-2 flex items-center gap-2 font-semibold">
              <Target size={16} /> Eval Plan
            </h3>
            <div className="space-y-2 text-sm">
              {audit.evalPlan.map((line) => (
                <p key={line} className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-white/80">
                  {line}
                </p>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
            <h3 className="mb-2 font-semibold">Optimized Prompt</h3>
            <pre className="max-h-[320px] overflow-auto rounded-xl border border-white/10 bg-black/40 p-3 text-xs leading-6 text-white/90">
              {audit.optimizedPrompt}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

function SkillPlaceholder({ title, summary }: { title: string; summary: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mt-2 text-sm text-white/70">{summary}</p>
      <div className="mt-4 rounded-xl border border-dashed border-white/20 bg-black/20 p-6 text-sm text-white/55">
        Workspace module stub. Ready to connect to local skill runtime.
      </div>
    </div>
  );
}

export default function Home() {
  const [activeSkill, setActiveSkill] = useState<SkillId>("market");
  const [commandOpen, setCommandOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [logs, setLogs] = useState<string[]>([
    "[System] Knowledge Work Center booted.",
    "[Status] LinkedIn Viral Post Writer: Online (/Users/joy/Downloads/linkedin-viral-post-writer.skill)",
    "[Status] Play Store Research Skill: Online (/Users/joy/Opportunity Research/skills/play-store-opportunity-research)",
    "[Status] Idea Validator: Online (/Users/joy/pm-claude-skills/skills/idea-validator/SKILL.md)",
    "[Status] Agent Workflow Designer: Online (/Users/joy/Downloads/agent-workflow.skill)",
    "[Status] PRD Writer: Online (/Users/joy/Downloads/prd-writer.skill)",
    "[Status] Prompt Engineering: Online (/Users/joy/Downloads/prompt-engineering.skill)",
  ]);

  const pushLog = (line: string) => {
    setLogs((prev) => [line, ...prev].slice(0, 8));
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen((prev) => !prev);
      }
      if (event.key === "Escape") setCommandOpen(false);
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const filteredItems = useMemo(() => {
    if (!query.trim()) return sidebarItems;
    const q = query.toLowerCase();
    return sidebarItems.filter((item) => item.label.toLowerCase().includes(q));
  }, [query]);

  const switchSkill = (id: SkillId) => {
    setActiveSkill(id);
    setCommandOpen(false);
    setQuery("");
    pushLog(`[System] Switched workspace to ${sidebarItems.find((x) => x.id === id)?.label}.`);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0B0B0C] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(93,58,196,0.33),transparent_70%)]" />
        <div className="absolute right-0 top-20 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(73,85,190,0.27),transparent_70%)]" />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(113,78,220,0.2),transparent_70%)]" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-[1500px] gap-4 p-4">
        <aside className="hidden w-64 flex-col rounded-3xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur lg:flex">
          <div className="mb-5 flex items-center gap-2">
            <Layers size={18} className="text-violet-200" />
            <span className="font-semibold">Command Center</span>
          </div>
          <nav className="space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => switchSkill(item.id)}
                  className={clsx(
                    "flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left text-sm transition",
                    activeSkill === item.id
                      ? "border-violet-300/50 bg-violet-500/20"
                      : "border-white/10 bg-black/20 hover:border-white/25"
                  )}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
          <button
            onClick={() => setCommandOpen(true)}
            className="mt-auto flex items-center justify-between rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs text-white/80"
          >
            Quick Switch
            <span className="inline-flex items-center gap-1 rounded-md border border-white/20 px-2 py-0.5">
              <Command size={12} /> K
            </span>
          </button>
        </aside>

        <section className="flex min-h-[calc(100vh-2rem)] flex-1 flex-col gap-4">
          <header className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-white/55">Knowledge Work Center OS</p>
              <h1 className="text-xl font-semibold">Unified Skill Runtime</h1>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/35 bg-emerald-500/15 px-3 py-1 text-xs text-emerald-200">
                <ShieldCheck size={13} /> LinkedIn Viral Post Writer: Online
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-indigo-300/35 bg-indigo-500/15 px-3 py-1 text-xs text-indigo-200">
                <Sparkles size={13} /> Play Store Market Engine: Online
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-amber-300/35 bg-amber-500/15 px-3 py-1 text-xs text-amber-200">
                <ShieldCheck size={13} /> Idea Validator: Online
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-sky-300/35 bg-sky-500/15 px-3 py-1 text-xs text-sky-200">
                <GitBranch size={13} /> Agent Workflow: Online
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/35 bg-cyan-500/15 px-3 py-1 text-xs text-cyan-200">
                <FileText size={13} /> PRD Writer: Online
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-fuchsia-300/35 bg-fuchsia-500/15 px-3 py-1 text-xs text-fuchsia-200">
                <WandSparkles size={13} /> Prompt Engineering: Online
              </span>
              <button
                onClick={() => setCommandOpen(true)}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs"
              >
                <Command size={13} /> Command Menu
              </button>
            </div>
          </header>

          <motion.main layout className="rounded-3xl border border-white/10 bg-white/[0.02] p-4 backdrop-blur">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSkill}
                initial={{ opacity: 0, x: 24, scale: 0.985 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -24, scale: 0.985 }}
                transition={{ type: "spring", stiffness: 120, damping: 18 }}
              >
                {activeSkill === "market" && <SkillMarketResearch onLog={pushLog} />}
                {activeSkill === "content" && <SkillContentEngine onLog={pushLog} />}
                {activeSkill === "validator" && <SkillIdeaValidator onLog={pushLog} />}
                {activeSkill === "workflow" && <SkillAgentWorkflow onLog={pushLog} />}
                {activeSkill === "prompt" && <SkillPromptEngineering onLog={pushLog} />}
                {activeSkill === "product" && <SkillProductIntelligence onLog={pushLog} />}
                {activeSkill === "settings" && (
                  <SkillPlaceholder
                    title="Settings"
                    summary="Runtime preferences, model routing, and integration keys."
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </motion.main>

          <footer className="rounded-3xl border border-white/10 bg-black/40 p-4">
            <div className="mb-2 flex items-center gap-2">
              <Terminal size={16} className="text-violet-200" />
              <p className="text-sm font-medium">Terminal · Local Skill Logs</p>
            </div>
            <div className="space-y-1 font-mono text-xs text-white/75">
              {logs.map((line, idx) => (
                <p key={`${line}-${idx}`}>{line}</p>
              ))}
              <p className="text-violet-200">[Paths] /Users/joy/Portfolio Tracker · /Users/joy/pm-claude-skills</p>
            </div>
          </footer>
        </section>
      </div>

      <AnimatePresence>
        {commandOpen && (
          <>
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCommandOpen(false)}
              className="fixed inset-0 z-40 bg-black/60"
            />
            <motion.div
              initial={{ opacity: 0, y: -24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -24, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 140, damping: 18 }}
              className="fixed left-1/2 top-[12%] z-50 w-[92vw] max-w-xl -translate-x-1/2 rounded-2xl border border-white/15 bg-[#121217] p-3 shadow-2xl"
            >
              <div className="mb-3 flex items-center gap-2 rounded-xl border border-white/10 bg-black/25 px-3 py-2">
                <Search size={16} className="text-white/55" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full bg-transparent text-sm outline-none placeholder:text-white/45"
                  placeholder="Jump to skill..."
                />
              </div>
              <div className="space-y-1">
                {filteredItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => switchSkill(item.id)}
                      className="flex w-full items-center gap-3 rounded-xl border border-transparent px-3 py-2 text-left text-sm transition hover:border-white/10 hover:bg-white/8"
                    >
                      <Icon size={16} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
                {!filteredItems.length && (
                  <p className="px-3 py-2 text-sm text-white/55">No skill found for that query.</p>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
