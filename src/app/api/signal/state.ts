export type SignalSnapshot = {
  markdown: string;
  updatedAt: string;
  meta?: Record<string, unknown>;
};

let latestSignalSnapshot: SignalSnapshot | null = null;

export function setLatestSignalSnapshot(snapshot: SignalSnapshot) {
  latestSignalSnapshot = snapshot;
}

export function getLatestSignalSnapshot(): SignalSnapshot | null {
  return latestSignalSnapshot;
}
