/**
 * Author avatar and metadata utilities
 */

export type AuthorInfo = {
  name: string;
  avatar?: string;
  role?: string;
  platform?: string;
};

// Known author mappings with avatars
const AUTHOR_DATABASE: Record<string, AuthorInfo> = {
  "lenny rachitsky": {
    name: "Lenny Rachitsky",
    avatar: "https://pbs.twimg.com/profile_images/1509950481531449345/C1rRHJZk_400x400.jpg",
    role: "Product & Growth",
    platform: "Newsletter",
  },
  "john cutler": {
    name: "John Cutler",
    avatar: "https://pbs.twimg.com/profile_images/1623375944451899393/vFnl6WLD_400x400.jpg",
    role: "Product Strategy",
    platform: "Newsletter",
  },
  "elena verna": {
    name: "Elena Verna",
    avatar: "https://pbs.twimg.com/profile_images/1658146549924921345/FhQAp8Qm_400x400.jpg",
    role: "Growth & Monetization",
    platform: "Newsletter",
  },
  "aakash gupta": {
    name: "Aakash Gupta",
    avatar: "https://pbs.twimg.com/profile_images/1632428944726040576/zQ8_gW7w_400x400.jpg",
    role: "AI Product Leader",
    platform: "Twitter",
  },
  shreyas: {
    name: "Shreyas Doshi",
    avatar: "https://pbs.twimg.com/profile_images/1665809239654809602/5cIy0xY5_400x400.jpg",
    role: "Product Management",
    platform: "Twitter",
  },
  "shreyas doshi": {
    name: "Shreyas Doshi",
    avatar: "https://pbs.twimg.com/profile_images/1665809239654809602/5cIy0xY5_400x400.jpg",
    role: "Product Management",
    platform: "Twitter",
  },
  "code newsletter ai": {
    name: "AI News",
    avatar: "",
    role: "AI & Engineering",
    platform: "Newsletter",
  },
  "rbi press releases": {
    name: "RBI",
    avatar: "",
    role: "Regulatory Authority",
    platform: "Press Release",
  },
  rbi: {
    name: "RBI",
    avatar: "",
    role: "Regulatory Authority",
    platform: "Official",
  },
  "inc42 fintech": {
    name: "Inc42",
    avatar: "",
    role: "India Fintech News",
    platform: "News",
  },
  yourstory: {
    name: "YourStory",
    avatar: "",
    role: "Startup News",
    platform: "News",
  },
  medianama: {
    name: "Medianama",
    avatar: "",
    role: "Tech Policy",
    platform: "News",
  },
};

/**
 * Get author info from source string
 * Handles formats like:
 * - "Lenny Rachitsky | Newsletter"
 * - "Aakash Gupta | Twitter"
 * - "RBI Press Releases"
 */
export function getAuthorInfo(source?: string): AuthorInfo {
  if (!source) {
    return { name: "Unknown" };
  }

  // Extract author name (before |)
  const authorName = source.split("|")[0].trim().toLowerCase();

  // Look up in database
  const authorInfo = AUTHOR_DATABASE[authorName];
  if (authorInfo) {
    return authorInfo;
  }

  // Fallback: parse source string
  const parts = source.split("|").map((p) => p.trim());
  return {
    name: parts[0],
    platform: parts[1] || undefined,
  };
}

/**
 * Get initials from author name
 */
export function getAuthorInitials(name: string): string {
  const words = name.split(" ").filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0][0].toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

/**
 * Get color for author initials avatar
 */
export function getAuthorColor(name: string): string {
  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-orange-500",
    "bg-teal-500",
    "bg-indigo-500",
    "bg-red-500",
  ];

  // Deterministic color based on name
  const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
}
