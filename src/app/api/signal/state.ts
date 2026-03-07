export type SignalSection = {
  key: string;
  title: string;
  body: string;
  source?: string;
  topics?: string[];
  id?: string;
};

export type SignalSnapshot = {
  markdown: string;
  updatedAt: string;
  sections?: SignalSection[];
  meta?: Record<string, unknown>;
};

let latestSignalSnapshot: SignalSnapshot | null = null;

export function setLatestSignalSnapshot(snapshot: SignalSnapshot) {
  latestSignalSnapshot = snapshot;
}

export function getLatestSignalSnapshot(): SignalSnapshot | null {
  return latestSignalSnapshot;
}
