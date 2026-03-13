import type { LucideIcon } from "lucide-react";

export type SkillFieldType = "text" | "textarea" | "select";

export type SkillField = {
  id: string;
  label: string;
  type: SkillFieldType;
  placeholder?: string;
  options?: string[];
  defaultValue?: string;
};

export type SkillOutputSection = {
  key: string;
  title: string;
  body: string;
  source?: string;
  id?: string;
  topics?: string[];
};

export type SkillOutput = {
  title: string;
  body: string;
  sections?: SkillOutputSection[];
  updatedAt?: string;
};

export type SkillConfig = {
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
