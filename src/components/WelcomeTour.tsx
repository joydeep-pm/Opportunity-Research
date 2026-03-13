"use client";

import { useEffect, useState } from "react";
import Joyride, { CallBackProps, STATUS, Step } from "react-joyride";

const ONBOARDING_KEY = "opportunity-research-onboarding-complete";

const tourSteps: Step[] = [
  {
    target: "body",
    content: (
      <div className="space-y-3">
        <h2 className="text-xl font-bold text-zinc-900">Welcome to Opportunity Research</h2>
        <p className="text-sm text-zinc-600">
          Monitor signals, turn what matters into research, and draft decision-ready PM artifacts.
        </p>
      </div>
    ),
    placement: "center",
    disableBeacon: true,
  },
  {
    target: "aside nav",
    content: (
      <div className="space-y-2">
        <h3 className="font-semibold text-zinc-900">Primary workflow</h3>
        <p className="text-sm text-zinc-600">
          Move through the product in a simple loop: Signals, Research, Write, and Vault.
        </p>
      </div>
    ),
    placement: "right",
  },
  {
    target: "body",
    content: (
      <div className="space-y-3">
        <h2 className="text-xl font-bold text-zinc-900">You&apos;re all set</h2>
        <p className="text-sm text-zinc-600">
          Press <kbd className="rounded border border-zinc-300 bg-white px-1.5 py-0.5 font-mono text-xs">⌘K</kbd> to open workflows quickly.
        </p>
      </div>
    ),
    placement: "center",
  },
];

type WelcomeTourProps = {
  run?: boolean;
};

export default function WelcomeTour({ run: forcedRun = false }: WelcomeTourProps) {
  const [mounted, setMounted] = useState(false);
  const [runTour, setRunTour] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!forcedRun) return;

    const hasSeenOnboarding = localStorage.getItem(ONBOARDING_KEY);
    if (!hasSeenOnboarding) {
      const timer = window.setTimeout(() => setRunTour(true), 400);
      return () => window.clearTimeout(timer);
    }
  }, [forcedRun, mounted]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRunTour(false);
      localStorage.setItem(ONBOARDING_KEY, "true");
    }
  };

  if (!mounted) return null;

  return (
    <Joyride
      steps={tourSteps}
      run={runTour}
      continuous
      showProgress
      showSkipButton
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: "#7c3aed",
          textColor: "#27272a",
          backgroundColor: "#ffffff",
          overlayColor: "rgba(0, 0, 0, 0.4)",
          zIndex: 100,
        },
        buttonNext: {
          backgroundColor: "#7c3aed",
          fontSize: "14px",
          padding: "8px 16px",
          borderRadius: "6px",
        },
        buttonBack: {
          color: "#71717a",
          fontSize: "14px",
          marginRight: "8px",
        },
        buttonSkip: {
          color: "#71717a",
          fontSize: "14px",
        },
        tooltip: {
          borderRadius: "12px",
          padding: "20px",
        },
        tooltipContent: {
          padding: "0",
        },
      }}
      locale={{
        back: "Back",
        close: "Close",
        last: "Finish",
        next: "Next",
        skip: "Skip tour",
      }}
    />
  );
}

export function resetOnboarding() {
  localStorage.removeItem(ONBOARDING_KEY);
}
