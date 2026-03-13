export function saveArtifactSeed(seed: {
  title: string;
  body: string;
  sourceLabel: string;
}) {
  try {
    localStorage.setItem(
      "kwc-artifact-seed",
      JSON.stringify({
        ...seed,
        timestamp: new Date().toISOString(),
      }),
    );
  } catch (error) {
    console.error("Failed to save artifact seed:", error);
  }
}

export function getArtifactSeed(): { title: string; body: string; sourceLabel: string; timestamp: string } | null {
  try {
    const raw = localStorage.getItem("kwc-artifact-seed");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (error) {
    console.error("Failed to load artifact seed:", error);
    return null;
  }
}

export function clearArtifactSeed() {
  try {
    localStorage.removeItem("kwc-artifact-seed");
  } catch (error) {
    console.error("Failed to clear artifact seed:", error);
  }
}
