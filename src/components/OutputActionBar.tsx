"use client";

import { Copy, Save, Pin, Download, GitBranch } from "lucide-react";
import { useState } from "react";
import { saveOutput } from "@/lib/outputHistory";

type OutputActionBarProps = {
  outputId: string | null;
  title: string;
  body: string;
  sourceSkillId?: string;
  compatibleSkills?: { id: string; label: string; description: string }[];
  onChain?: (targetSkill: string) => void;
};

const DEFAULT_CHAIN_SKILLS = [
  { id: "product", label: "Product Intelligence", description: "Create PRD from this" },
  { id: "prd", label: "PRD Generator", description: "Generate product spec" },
  { id: "linkedin", label: "LinkedIn Post", description: "Turn into viral content" },
  { id: "prompt", label: "Prompt Engineering", description: "Optimize prompt" },
  { id: "workflow", label: "Agent Workflow", description: "Create an execution blueprint" },
  { id: "validator", label: "Idea Validator", description: "Run structured validation" },
];

export default function OutputActionBar({
  outputId,
  title,
  body,
  sourceSkillId,
  compatibleSkills,
  onChain,
}: OutputActionBarProps) {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [showChainMenu, setShowChainMenu] = useState(false);

  const chainTargets = compatibleSkills?.length
    ? compatibleSkills
    : sourceSkillId
      ? []
      : DEFAULT_CHAIN_SKILLS;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(body);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error("Failed to copy:", e);
    }
  };

  const handleSave = () => {
    if (outputId) {
      saveOutput(outputId, pinned);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const handlePin = () => {
    const newPinned = !pinned;
    setPinned(newPinned);
    if (outputId) {
      saveOutput(outputId, newPinned);
    }
  };

  const handleExport = () => {
    const blob = new Blob([`# ${title}\n\n${body}`], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleChain = (skillId: string) => {
    setShowChainMenu(false);
    if (onChain) {
      onChain(skillId);
    }
  };

  return (
    <div className="flex items-center justify-between border-t border-zinc-200 bg-zinc-50 px-4 py-3">
      <div className="flex items-center gap-2">
        {/* Copy Button */}
        <button
          onClick={handleCopy}
          className={`flex items-center gap-1.5 rounded border px-3 py-1.5 text-xs font-medium transition-all ${
            copied
              ? "border-green-300 bg-green-50 text-green-700"
              : "border-zinc-300 bg-white text-zinc-700 hover:border-zinc-400 hover:bg-zinc-50"
          }`}
        >
          <Copy className="h-3.5 w-3.5" />
          <span>{copied ? "Copied!" : "Copy"}</span>
        </button>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className={`flex items-center gap-1.5 rounded border px-3 py-1.5 text-xs font-medium transition-all ${
            saved
              ? "border-green-300 bg-green-50 text-green-700"
              : "border-zinc-300 bg-white text-zinc-700 hover:border-zinc-400 hover:bg-zinc-50"
          }`}
        >
          <Save className="h-3.5 w-3.5" />
          <span>{saved ? "Saved!" : "Save"}</span>
        </button>

        {/* Pin Button */}
        <button
          onClick={handlePin}
          className={`flex items-center gap-1.5 rounded border px-3 py-1.5 text-xs font-medium transition-all ${
            pinned
              ? "border-amber-300 bg-amber-50 text-amber-700"
              : "border-zinc-300 bg-white text-zinc-700 hover:border-zinc-400 hover:bg-zinc-50"
          }`}
        >
          <Pin className={`h-3.5 w-3.5 ${pinned ? "fill-current" : ""}`} />
          <span>{pinned ? "Pinned" : "Pin"}</span>
        </button>

        {/* Chain to... Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowChainMenu((v) => !v)}
            disabled={chainTargets.length === 0}
            className={`flex items-center gap-1.5 rounded border px-3 py-1.5 text-xs font-medium transition-all ${
              chainTargets.length === 0
                ? "cursor-not-allowed border-zinc-200 bg-zinc-100 text-zinc-400"
                : "border-zinc-300 bg-white text-zinc-700 hover:border-zinc-400 hover:bg-zinc-50"
            }`}
          >
            <GitBranch className="h-3.5 w-3.5" />
            <span>{chainTargets.length ? "Chain to..." : "No chain options"}</span>
          </button>

          {showChainMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowChainMenu(false)}
              />
              <div className="absolute bottom-full left-0 z-20 mb-2 w-64 rounded-lg border border-zinc-200 bg-white shadow-lg">
                <div className="p-2">
                  <div className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Use this output with
                  </div>
                  {chainTargets.map((skill) => (
                    <button
                      key={skill.id}
                      onClick={() => handleChain(skill.id)}
                      className="w-full rounded px-2 py-2 text-left transition-colors hover:bg-zinc-100"
                    >
                      <div className="text-sm font-medium text-zinc-900">{skill.label}</div>
                      <div className="mt-0.5 text-xs text-zinc-500">{skill.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Export Button */}
      <button
        onClick={handleExport}
        className="flex items-center gap-1.5 rounded border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition-all hover:border-zinc-400 hover:bg-zinc-50"
      >
        <Download className="h-3.5 w-3.5" />
        <span>Export MD</span>
      </button>
    </div>
  );
}
