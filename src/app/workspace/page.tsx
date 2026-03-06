import LegacyWorkspace from "@/lib/legacy_page";

type WorkspacePageProps = {
  searchParams?: {
    skill?: string;
  };
};

export default function WorkspacePage({ searchParams }: WorkspacePageProps) {
  const skill = typeof searchParams?.skill === "string" ? searchParams.skill : null;
  return <LegacyWorkspace initialSkillId={skill} />;
}
