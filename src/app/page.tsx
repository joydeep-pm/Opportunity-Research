"use client";

import { useSearchParams } from "next/navigation";
import LegacyWorkspace from "@/lib/legacy_page";
import Dashboard from "@/components/Dashboard";

function mapToolToSkill(tool?: string | null): string | null {
  switch (tool) {
    case "signal":
      return "signal";
    case "vault":
      return "signal";
    case "play-store":
      return "market";
    case "competitor":
      return "market";
    case "linkedin":
      return "content";
    case "prd":
      return "product";
    case "idp":
      return "idp";
    case "pulse":
      return "workflow";
    case "workflow":
      return "workflow";
    case "prompt":
      return "prompt";
    case "validator":
      return "validator";
    case "product":
      return "product";
    default:
      return null;
  }
}

export default function Home() {
  const searchParams = useSearchParams();
  const tool = searchParams.get("tool");

  // Show dashboard when no tool is selected
  if (!tool) {
    return <Dashboard />;
  }

  const skill = mapToolToSkill(tool);
  return <LegacyWorkspace key={skill || "home"} initialSkillId={skill} embedded />;
}
