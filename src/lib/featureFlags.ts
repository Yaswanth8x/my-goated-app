// ============================================================
// Feature Flags — For unfinished systems
// Workspace 1 Part 13 + Workspace 5 Part 121
// ============================================================

export const featureFlags = {
  AI_HUB_ENABLED: process.env.NEXT_PUBLIC_AI_HUB_ENABLED !== "false",
  RAG_ENABLED: process.env.NEXT_PUBLIC_RAG_ENABLED !== "false",
  FREELANCE_ENABLED: process.env.NEXT_PUBLIC_FREELANCE_ENABLED === "true",
  MULTI_USER_ENABLED: process.env.NEXT_PUBLIC_MULTI_USER_ENABLED !== "false",
  ACADEMIC_ENGINE_ENABLED: process.env.NEXT_PUBLIC_ACADEMIC_ENGINE_ENABLED !== "false",
  SKILLS_ENABLED: process.env.NEXT_PUBLIC_SKILLS_ENABLED !== "false",
  PROJECTS_ENABLED: process.env.NEXT_PUBLIC_PROJECTS_ENABLED !== "false",
  PORTFOLIO_ENABLED: process.env.NEXT_PUBLIC_PORTFOLIO_ENABLED !== "false",
  CAREER_ENABLED: process.env.NEXT_PUBLIC_CAREER_ENABLED !== "false",
  ANALYTICS_ENABLED: process.env.NEXT_PUBLIC_ANALYTICS_ENABLED !== "false",
  ADMIN_ENABLED: process.env.NEXT_PUBLIC_ADMIN_ENABLED === "true",
};

export function isFeatureEnabled(flag: keyof typeof featureFlags): boolean {
  return featureFlags[flag];
}

// For UI: Show placeholder if feature disabled
export function getFeatureStatus(flag: keyof typeof featureFlags): { enabled: boolean; message: string } {
  const enabled = isFeatureEnabled(flag);

  if (enabled) {
    return { enabled: true, message: "Enabled" };
  }

  return {
    enabled: false,
    message: `Feature ${flag} is disabled. Enable via NEXT_PUBLIC_${flag}=true in .env. Currently showing placeholder.`,
  };
}
