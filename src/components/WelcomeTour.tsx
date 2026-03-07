"use client";

import { useEffect, useState } from "react";
import Joyride, { CallBackProps, STATUS, Step } from "react-joyride";

const ONBOARDING_KEY = "kwc-onboarding-complete";

const tourSteps: Step[] = [
  {
    target: "body",
    content: (
      <div className="space-y-3">
        <h2 className="text-xl font-bold text-zinc-900">Welcome to KWC OS</h2>
        <p className="text-sm text-zinc-600">
          Your personal operating system for knowledge work and automation. Let me show you around!
        </p>
      </div>
    ),
    placement: "center",
    disableBeacon: true,
  },
  {
    target: "header button",
    content: (
      <div className="space-y-2">
        <h3 className="font-semibold text-zinc-900">Command Bar</h3>
        <p className="text-sm text-zinc-600">
          Press <kbd className="rounded border border-zinc-300 bg-white px-1.5 py-0.5 font-mono text-xs">⌘K</kbd> anytime to search skills and execute commands quickly.
        </p>
      </div>
    ),
    placement: "bottom",
  },
  {
    target: "aside nav",
    content: (
      <div className="space-y-2">
        <h3 className="font-semibold text-zinc-900">Your Skills</h3>
        <p className="text-sm text-zinc-600">
          8 AI-powered skills ready to use: from Daily Signal to LinkedIn Writer. Each icon shows timing and details on hover.
        </p>
      </div>
    ),
    placement: "right",
  },
  {
    target: "aside:last-of-type",
    content: (
      <div className="space-y-2">
        <h3 className="font-semibold text-zinc-900">Workspace Panel</h3>
        <p className="text-sm text-zinc-600">
          Track all outputs here. Activity shows recent runs, Saved holds pinned items, and Queue is for automation (coming soon).
        </p>
      </div>
    ),
    placement: "left",
  },
  {
    target: "body",
    content: (
      <div className="space-y-3">
        <h2 className="text-xl font-bold text-zinc-900">You&apos;re all set!</h2>
        <p className="text-sm text-zinc-600">
          Press <kbd className="rounded border border-zinc-300 bg-white px-1.5 py-0.5 font-mono text-xs">?</kbd> to see all keyboard shortcuts.
          Try running your first skill from the Dashboard!
        </p>
      </div>
    ),
    placement: "center",
  },
];

type WelcomeTourProps = {
  run?: boolean;
};

export default function WelcomeTour({ run: forcedRun }: WelcomeTourProps) {
  const [runTour, setRunTour] = useState(false);

  useEffect(() => {
    // Check if user has seen onboarding
    const hasSeenOnboarding = localStorage.getItem(ONBOARDING_KEY);
    if (!hasSeenOnboarding && !forcedRun) {
      // Wait a bit for page to fully load
      const timer = setTimeout(() => setRunTour(true), 1000);
      return () => clearTimeout(timer);
    } else if (forcedRun) {
      setRunTour(true);
    }
  }, [forcedRun]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRunTour(false);
      // Mark onboarding as complete
      localStorage.setItem(ONBOARDING_KEY, "true");
    }
  };

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
          primaryColor: "#7c3aed", // violet-600
          textColor: "#27272a", // zinc-800
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
