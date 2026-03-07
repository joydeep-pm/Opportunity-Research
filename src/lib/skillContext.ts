/**
 * Cross-Skill Context System
 * Enables chaining skills by passing output from one as input to the next
 */

export type SkillContext = {
  sourceSkillId: string;
  sourceSkillLabel: string;
  outputTitle: string;
  outputBody: string;
  timestamp: string;
};

const CONTEXT_KEY = "kwc-skill-context";

function isClientContext(): boolean {
  return typeof window !== "undefined" && typeof window.sessionStorage !== "undefined";
}

/**
 * Save context from current skill output
 */
export function setContext(context: SkillContext): void {
  if (!isClientContext()) {
    return;
  }
  try {
    sessionStorage.setItem(CONTEXT_KEY, JSON.stringify(context));
  } catch (e) {
    console.error("Failed to save context:", e);
  }
}

/**
 * Get current context
 */
export function getContext(): SkillContext | null {
  if (!isClientContext()) {
    return null;
  }
  try {
    const stored = sessionStorage.getItem(CONTEXT_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (e) {
    console.error("Failed to load context:", e);
    return null;
  }
}

/**
 * Clear context
 */
export function clearContext(): void {
  if (!isClientContext()) {
    return;
  }
  try {
    sessionStorage.removeItem(CONTEXT_KEY);
  } catch (e) {
    console.error("Failed to clear context:", e);
  }
}

/**
 * Check if context exists
 */
export function hasContext(): boolean {
  return getContext() !== null;
}

/**
 * Skill compatibility matrix
 * Defines which skills can receive context from which source skills
 */
export const SKILL_CHAINS: Record<string, string[]> = {
  // Play Store market research engine (shared identifier for Play Store and Competitor tracking aliases)
  market: ["product", "validator", "prd", "linkedin"],
  // Market research can chain to Product, Validator, PRD
  "play-store": ["product", "validator", "prd", "linkedin"],
  "competitor": ["product", "validator", "prd", "linkedin"],

  // Product can chain to PRD, LinkedIn, Architecture
  product: ["prd", "linkedin", "workflow"],

  // PRD can chain to LinkedIn, Workflow
  prd: ["linkedin", "workflow"],

  // Validator can chain to Product, PRD
  validator: ["product", "prd", "linkedin"],

  // LinkedIn can chain to Prompt (for optimization)
  linkedin: ["prompt"],

  // Signal can chain to LinkedIn, Product
  signal: ["linkedin", "product", "validator"],

  // Prompt can chain back to any content skill
  prompt: ["linkedin", "product", "prd"],

  // Workflow can chain to anything (general purpose)
  workflow: ["product", "prd", "linkedin", "prompt"],
};

/**
 * Get compatible target skills for a given source skill
 */
export function getCompatibleSkills(sourceSkillId: string): string[] {
  return SKILL_CHAINS[sourceSkillId] || [];
}

/**
 * Check if two skills are compatible for chaining
 */
export function canChain(sourceSkillId: string, targetSkillId: string): boolean {
  const compatible = getCompatibleSkills(sourceSkillId);
  return compatible.includes(targetSkillId);
}

/**
 * Get context hint for a target skill based on source
 * Returns helpful text explaining how the context will be used
 */
export function getContextHint(sourceSkillId: string, targetSkillId: string): string {
  const hints: Record<string, Record<string, string>> = {
    "play-store": {
      product: "Market insights will pre-fill product strategy inputs",
      validator: "Opportunity gaps will be used for idea validation",
      prd: "Market research will inform PRD requirements",
      linkedin: "Market insights will be used for LinkedIn post content",
    },
    market: {
      product: "Market insights will pre-fill product strategy inputs",
      validator: "Opportunity gaps will be used for idea validation",
      prd: "Market research will inform PRD requirements",
      linkedin: "Market insights will be used for LinkedIn post content",
    },
    competitor: {
      product: "Competitive analysis will pre-fill product positioning",
      validator: "Competitor gaps will be used for idea validation",
      prd: "Competitive insights will inform PRD differentiation",
      linkedin: "Competitor insights will be used for LinkedIn content",
    },
    product: {
      prd: "Product strategy will pre-fill PRD requirements",
      linkedin: "Product insights will be used for LinkedIn post",
      workflow: "Product requirements will inform agent workflow",
    },
    prd: {
      linkedin: "PRD details will be used for LinkedIn post",
      workflow: "PRD requirements will inform agent workflow",
    },
    validator: {
      product: "Validated ideas will pre-fill product strategy",
      prd: "Validated ideas will inform PRD creation",
      linkedin: "Idea insights will be used for LinkedIn post",
    },
    linkedin: {
      prompt: "Post content will be optimized by prompt engineering",
    },
    signal: {
      linkedin: "Signal insights will be used for LinkedIn post",
      product: "Trends will inform product strategy",
      validator: "Trends will inform idea validation",
    },
    prompt: {
      linkedin: "Optimized prompt will improve LinkedIn post",
      product: "Optimized prompt will improve product strategy",
      prd: "Optimized prompt will improve PRD generation",
    },
    workflow: {
      product: "Workflow insights will inform product strategy",
      prd: "Workflow will inform PRD requirements",
      linkedin: "Workflow insights will be used for LinkedIn post",
      prompt: "Workflow will be optimized by prompt engineering",
    },
  };

  return hints[sourceSkillId]?.[targetSkillId] || "Previous output will be used as context";
}
