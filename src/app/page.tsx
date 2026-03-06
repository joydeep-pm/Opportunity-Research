import LegacyWorkspace from "@/lib/legacy_page";

type PageProps = {
  searchParams?: {
    tool?: string;
  };
};

function mapToolToSkill(tool?: string): string | null {
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

export default function Home({ searchParams }: PageProps) {
  const skill = mapToolToSkill(searchParams?.tool);
  return <LegacyWorkspace initialSkillId={skill} />;
}
