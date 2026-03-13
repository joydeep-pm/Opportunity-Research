"use client";

import { useSearchParams } from "next/navigation";
import LegacyWorkspace from "@/lib/legacy_page";
import Dashboard from "@/components/Dashboard";
import ResearchHome from "@/components/ResearchHome";
import WriteHome from "@/components/WriteHome";
import SignalsHome from "@/components/SignalsHome";
import VaultHome from "@/components/VaultHome";

function mapToolToSkill(tool?: string | null): string | null {
  switch (tool) {
    case "signal":
      return null;
    case "vault":
      return null;
    case "research":
      return null;
    case "write":
      return null;
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

function getSurfaceLabel(tool?: string | null): string | null {
  switch (tool) {
    case "play-store":
    case "competitor":
    case "validator":
      return "Research";
    case "linkedin":
    case "prd":
    case "product":
    case "prompt":
      return "Write";
    case "workflow":
    case "pulse":
    case "idp":
      return "Workflow";
    default:
      return null;
  }
}

export default function Home() {
  const searchParams = useSearchParams();
  const tool = searchParams.get("tool");

  if (!tool) {
    return <Dashboard />;
  }

  if (tool === "signal") {
    return <SignalsHome />;
  }

  if (tool === "vault") {
    return <VaultHome />;
  }

  if (tool === "research") {
    return <ResearchHome />;
  }

  if (tool === "write") {
    return <WriteHome />;
  }

  const skill = mapToolToSkill(tool);
  const surfaceLabel = getSurfaceLabel(tool);
  return <LegacyWorkspace key={skill || "home"} initialSkillId={skill} embedded surfaceLabel={surfaceLabel} />;
}
