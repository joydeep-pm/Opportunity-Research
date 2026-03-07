"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import {
  Sparkles,
  Bookmark,
  Search,
  Target,
  WandSparkles,
  FileText,
  Brain,
  GitBranch,
  BarChart3,
  Home,
  X,
} from "lucide-react";

type SkillItem = {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  shortcut?: string;
};

const SKILLS: SkillItem[] = [
  {
    id: "",
    name: "Dashboard",
    description: "Overview of all activity",
    icon: Home,
    shortcut: "⌘H",
  },
  {
    id: "signal",
    name: "Daily Signal",
    description: "AI-powered knowledge feed • ~90s",
    icon: Sparkles,
    shortcut: "⌘1",
  },
  {
    id: "vault",
    name: "Saved Vault",
    description: "Storage for saved signals",
    icon: Bookmark,
    shortcut: "⌘2",
  },
  {
    id: "play-store",
    name: "Play Store Research",
    description: "AI-powered market analysis • ~30-60s",
    icon: Search,
    shortcut: "⌘3",
  },
  {
    id: "competitor",
    name: "Competitor Tracking",
    description: "AI-powered competitive intel • ~30-60s",
    icon: Search,
    shortcut: "⌘4",
  },
  {
    id: "validator",
    name: "Idea Validator",
    description: "AI-powered idea scoring • <5s",
    icon: Target,
    shortcut: "⌘5",
  },
  {
    id: "linkedin",
    name: "LinkedIn Writer",
    description: "AI-powered viral posts • <5s",
    icon: WandSparkles,
    shortcut: "⌘6",
  },
  {
    id: "prompt",
    name: "Prompt Engineering",
    description: "AI-powered prompt optimization • <5s",
    icon: Brain,
    shortcut: "⌘7",
  },
  {
    id: "product",
    name: "Product Intelligence",
    description: "AI-powered strategy • ~10-15s",
    icon: FileText,
    shortcut: "⌘8",
  },
  {
    id: "prd",
    name: "PRD Generator",
    description: "AI-powered product specs • ~10-15s",
    icon: FileText,
    shortcut: "⌘9",
  },
  {
    id: "idp",
    name: "1:1 IDP Builder",
    description: "AI-powered leadership plans • ~10s",
    icon: Brain,
  },
  {
    id: "workflow",
    name: "Agent Workflow",
    description: "AI-powered blueprints • ~10s",
    icon: GitBranch,
  },
  {
    id: "pulse",
    name: "Pulse Timesheets",
    description: "Manual entry timesheets",
    icon: BarChart3,
  },
];

const RECENT_COMMANDS_KEY = "kwc-recent-commands";
const MAX_RECENT = 5;

function getRecentCommands(): string[] {
  try {
    const stored = localStorage.getItem(RECENT_COMMANDS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function addRecentCommand(skillId: string): void {
  const recent = getRecentCommands();
  const updated = [skillId, ...recent.filter((id) => id !== skillId)].slice(0, MAX_RECENT);
  try {
    localStorage.setItem(RECENT_COMMANDS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to save recent command:", e);
  }
}

type CommandPaletteProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [recentCommands, setRecentCommands] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      setRecentCommands(getRecentCommands());
    }
  }, [open]);

  const handleSelect = useCallback(
    (skillId: string) => {
      addRecentCommand(skillId);
      onOpenChange(false);
      setSearch("");
      router.push(skillId ? `/?tool=${skillId}` : "/");
    },
    [router, onOpenChange],
  );

  const recentSkills = SKILLS.filter((skill) => recentCommands.includes(skill.id));
  const allSkills = SKILLS;

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
          onClick={() => onOpenChange(false)}
        />
      )}

      {/* Command Dialog */}
      <Command.Dialog
        open={open}
        onOpenChange={onOpenChange}
        label="Command Palette"
        className="fixed left-1/2 top-[20%] z-50 w-full max-w-2xl -translate-x-1/2 overflow-hidden rounded-xl border border-zinc-300 bg-white shadow-2xl"
      >
      <div className="flex items-center border-b border-zinc-200 px-4">
        <Search className="mr-3 h-4 w-4 shrink-0 text-zinc-400" />
        <Command.Input
          value={search}
          onValueChange={setSearch}
          placeholder="Search skills or type a command..."
          className="flex h-12 w-full bg-transparent text-sm outline-none placeholder:text-zinc-400"
        />
        <button
          onClick={() => onOpenChange(false)}
          className="ml-2 rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <Command.List className="max-h-[400px] overflow-y-auto p-2">
        <Command.Empty className="py-8 text-center text-sm text-zinc-500">
          No skills found.
        </Command.Empty>

        {recentSkills.length > 0 && !search && (
          <Command.Group
            heading="Recently Used"
            className="mb-2 border-b border-zinc-100 pb-2"
          >
            <div className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Recently Used
            </div>
            {recentSkills.map((skill) => {
              const Icon = skill.icon;
              return (
                <Command.Item
                  key={skill.id}
                  value={skill.name}
                  onSelect={() => handleSelect(skill.id)}
                  className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors hover:bg-zinc-100 aria-selected:bg-zinc-100"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-violet-50 text-violet-600">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-zinc-900">{skill.name}</div>
                    <div className="truncate text-xs text-zinc-500">{skill.description}</div>
                  </div>
                  {skill.shortcut && (
                    <div className="ml-auto text-xs text-zinc-400">{skill.shortcut}</div>
                  )}
                </Command.Item>
              );
            })}
          </Command.Group>
        )}

        <Command.Group heading="All Skills">
          {!search && recentSkills.length > 0 && (
            <div className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
              All Skills
            </div>
          )}
          {allSkills.map((skill) => {
            const Icon = skill.icon;
            return (
              <Command.Item
                key={skill.id}
                value={skill.name}
                onSelect={() => handleSelect(skill.id)}
                className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors hover:bg-zinc-100 aria-selected:bg-zinc-100"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-violet-50 text-violet-600">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-zinc-900">{skill.name}</div>
                  <div className="truncate text-xs text-zinc-500">{skill.description}</div>
                </div>
                {skill.shortcut && (
                  <div className="ml-auto text-xs text-zinc-400">{skill.shortcut}</div>
                )}
              </Command.Item>
            );
          })}
        </Command.Group>
      </Command.List>
    </Command.Dialog>
    </>
  );
}
