import { getCompatibleSkills, getContextHint, type SkillContext } from "@/lib/skillContext";
import { getArtifactSeed } from "@/lib/artifactSeed";
import { SKILL_LABELS } from "@/lib/skills";

export function trimContextBody(context: SkillContext | null): string {
  if (!context) return "";
  return [context.outputTitle, context.outputBody].filter(Boolean).join("\n\n").slice(0, 1300).trim();
}

export function buildSeedInputs(skillId: string, context: SkillContext | null): Record<string, string> | null {
  const artifactSeed = getArtifactSeed();
  if (!context && artifactSeed) {
    const contextText = `${artifactSeed.title}\n\n${artifactSeed.body}`;
    switch (skillId) {
      case "content":
        return { idea: contextText };
      case "validator":
        return { idea: contextText, target: artifactSeed.sourceLabel };
      case "product":
        return { problem: contextText, metric: "Decision quality and execution speed" };
      case "prompt":
        return { prompt: contextText, failure: "Needs clearer structure and constraints" };
      case "workflow":
        return { goal: artifactSeed.title, constraints: `Use ${artifactSeed.sourceLabel} artifact as primary context` };
      case "market":
        return { query: artifactSeed.title };
      default:
        return null;
    }
  }

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

export function resolveChainTargets(sourceSkillId?: string) {
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
