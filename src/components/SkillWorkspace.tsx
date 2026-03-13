"use client";

import { Loader2, Sparkles, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { SkillConfig, SkillOutput } from "@/lib/skillTypes";

type SkillWorkspaceProps = {
  skill: SkillConfig;
  onRun: (payload: SkillOutput) => void | Promise<void>;
  onClose: () => void;
  seedValues?: Record<string, string> | null;
  contextHint?: string | null;
  onClearContext?: () => void;
  surfaceLabel?: string | null;
};

export default function SkillWorkspace({
  skill,
  onRun,
  onClose,
  seedValues,
  contextHint,
  onClearContext,
  surfaceLabel,
}: SkillWorkspaceProps) {
  const defaults = useMemo(() => {
    const base = Object.fromEntries(
      skill.inputFields.map((field) => [field.id, field.defaultValue || ""]),
    ) as Record<string, string>;

    if (!seedValues) return base;

    return { ...base, ...seedValues };
  }, [skill, seedValues]);

  const [values, setValues] = useState<Record<string, string>>(defaults);
  const [running, setRunning] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [stackPreference, setStackPreference] = useState("Kotlin + Compose");
  const [initializedAt, setInitializedAt] = useState<string | null>(null);
  const isInitializationRequired = Boolean(skill.requiresInitialization);
  const isInitialized = !isInitializationRequired || Boolean(initializedAt);

  useEffect(() => {
    setValues(defaults);
  }, [defaults]);

  useEffect(() => {
    setProjectName("");
    setStackPreference("Kotlin + Compose");
    setInitializedAt(null);
  }, [skill.id]);

  const Icon = skill.icon;

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4 rounded-3xl border border-zinc-200 bg-white/90 p-5 shadow-sm">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">{surfaceLabel ? `${surfaceLabel} Task` : "Current Task"}</p>
          <h2 className="mt-1 text-2xl font-semibold text-zinc-900">{skill.name}</h2>
          <p className="mt-2 text-sm text-zinc-600">{skill.description}</p>
          {contextHint && (
            <p className="mt-3 text-xs leading-5 text-zinc-700">
              <span className="font-semibold">Context:</span> {contextHint}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {contextHint && onClearContext && (
            <button
              onClick={onClearContext}
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-100 px-3 py-2 text-xs text-zinc-600 transition hover:bg-zinc-200"
            >
              Clear Context
            </button>
          )}
          <button
            onClick={onClose}
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-700 transition hover:bg-zinc-50"
          >
            <X size={14} /> Close
          </button>
        </div>
      </div>

      <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2 text-zinc-700">
          <Icon size={18} />
          <p className="font-medium">{surfaceLabel ? `${surfaceLabel} Inputs` : "Task Inputs"}</p>
        </div>
        {isInitializationRequired && (
          <div className="mb-5 rounded-2xl border border-zinc-300 bg-zinc-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Step 1: Initialize Project</p>
            <p className="mt-1 text-sm text-zinc-700">PRD generation is locked until project initialization is completed.</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-600">Project Name</label>
                <input
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="e.g., FinFlow AI"
                  className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-600">Stack Preference</label>
                <select
                  value={stackPreference}
                  onChange={(e) => setStackPreference(e.target.value)}
                  className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-500"
                >
                  <option value="Kotlin + Compose">Kotlin + Compose</option>
                  <option value="Flutter">Flutter</option>
                  <option value="React Native">React Native</option>
                </select>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <button
                onClick={() => {
                  if (!projectName.trim()) return;
                  setInitializedAt(new Date().toISOString());
                }}
                disabled={!projectName.trim()}
                className="inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Initialize Project
              </button>
              {initializedAt && (
                <p className="text-xs text-green-700">
                  Initialized {projectName.trim()} with {stackPreference}
                </p>
              )}
            </div>
          </div>
        )}
        <div className="space-y-4">
          {skill.inputFields.map((field) => (
            <div key={field.id} className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-700">{field.label}</label>
              {field.type === "textarea" && (
                <textarea
                  value={values[field.id] || ""}
                  onChange={(e) => setValues((prev) => ({ ...prev, [field.id]: e.target.value }))}
                  placeholder={field.placeholder}
                  className="h-28 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-500"
                />
              )}
              {field.type === "text" && (
                <input
                  value={values[field.id] || ""}
                  onChange={(e) => setValues((prev) => ({ ...prev, [field.id]: e.target.value }))}
                  placeholder={field.placeholder}
                  className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-500"
                />
              )}
              {field.type === "select" && (
                <select
                  value={values[field.id] || ""}
                  onChange={(e) => setValues((prev) => ({ ...prev, [field.id]: e.target.value }))}
                  className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-500"
                >
                  {(field.options || []).map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={async () => {
            setRunning(true);
            try {
              const payload = await Promise.resolve(
                skill.generateOutput({
                  ...values,
                  __projectName: projectName.trim(),
                  __stackPreference: stackPreference,
                  __initializedAt: initializedAt || "",
                }),
              );
              await onRun(payload);
            } finally {
              setRunning(false);
            }
          }}
          disabled={running || !isInitialized}
          className="mt-5 inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {running ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />} {skill.runLabel}
        </button>
        {!isInitialized && (
          <p className="mt-2 text-xs text-zinc-500">Complete initialization to unlock PRD generation.</p>
        )}
      </div>
    </div>
  );
}
