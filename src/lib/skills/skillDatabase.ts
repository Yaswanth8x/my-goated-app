// ============================================================
// Skills — Skill Database & Graph
// Workspace 4 Parts 76-78
// ============================================================

export type SkillCategory = "Development" | "AI" | "Media" | "Security" | "Business" | "Design" | "Other";
export type SkillStatus = "NOW" | "NEXT" | "LATER" | "PARKED";
export type SkillLevel = number; // 0-100

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  description: string;
  prerequisites?: string[]; // skill ids
  related_skills?: string[];
  roadmap?: {
    beginner: string[];
    intermediate: string[];
    advanced: string[];
    real_world: string[];
    portfolio: string[];
    client: string[];
  };
  created_at: string;
}

export interface UserSkill {
  user_id: string;
  skill_id: string;
  level: SkillLevel;
  status: SkillStatus;
  started_at?: string;
  updated_at: string;
}

export interface SkillGraphNode {
  skill_id: string;
  skill_name: string;
  level: number;
  status: SkillStatus;
  prerequisites: string[];
  dependents: string[]; // skills that depend on this
}

// Sample skills database
export const skillDatabase: Skill[] = [
  {
    id: "web-dev",
    name: "Web Development",
    category: "Development",
    description: "HTML, CSS, JavaScript, React, Next.js, Node.js, databases, deployment",
    prerequisites: [],
    related_skills: ["app-dev", "full-stack"],
    roadmap: {
      beginner: ["HTML basics", "CSS basics", "JavaScript basics", "Responsive design"],
      intermediate: ["React", "State management", "API integration", "Authentication"],
      advanced: ["Next.js", "Full-stack", "Performance", "Accessibility"],
      real_world: ["Build 3 real projects: portfolio, e-commerce, dashboard"],
      portfolio: ["Polish, deploy, document with problem/solution/tech/evidence"],
      client: ["Client briefs, proposals, deliverables, revisions"],
    },
    created_at: new Date().toISOString(),
  },
  {
    id: "app-dev",
    name: "App Development",
    category: "Development",
    description: "React Native, Flutter, mobile UI, state, native modules",
    prerequisites: ["web-dev"],
    related_skills: ["web-dev", "full-stack"],
    roadmap: {
      beginner: ["Mobile UI basics", "React Native setup"],
      intermediate: ["Navigation", "State", "API"],
      advanced: ["Native modules", "Performance", "Deployment"],
      real_world: ["Build 2 apps: todo, e-commerce"],
      portfolio: ["Deploy to stores, document"],
      client: ["Client app briefs"],
    },
    created_at: new Date().toISOString(),
  },
  {
    id: "full-stack",
    name: "Full Stack",
    category: "Development",
    description: "Frontend + Backend + DB + DevOps, end-to-end",
    prerequisites: ["web-dev"],
    related_skills: ["web-dev", "app-dev", "ai-automation"],
    roadmap: {
      beginner: ["Frontend + Backend basics"],
      intermediate: ["Auth, DB, API"],
      advanced: ["Scalability, Security, DevOps"],
      real_world: ["SaaS project"],
      portfolio: ["Full-stack portfolio"],
      client: ["Full-stack client work"],
    },
    created_at: new Date().toISOString(),
  },
  {
    id: "ai-automation",
    name: "AI Automation",
    category: "AI",
    description: "LLMs, RAG, agents, workflows, n8n, APIs, prompt engineering",
    prerequisites: ["web-dev"],
    related_skills: ["full-stack"],
    roadmap: {
      beginner: ["Prompt engineering", "No-code automation"],
      intermediate: ["RAG, agents, API"],
      advanced: ["Multi-agent, fine-tuning concepts"],
      real_world: ["Automate real workflows"],
      portfolio: ["Document automations with metrics"],
      client: ["Automation services"],
    },
    created_at: new Date().toISOString(),
  },
  {
    id: "video-editing",
    name: "Video Editing",
    category: "Media",
    description: "Premiere, DaVinci, storytelling, color grading, sound",
    prerequisites: [],
    related_skills: ["photography"],
    roadmap: {
      beginner: ["Cutting, trimming, basics"],
      intermediate: ["Transitions, effects, color"],
      advanced: ["Storytelling, sound design, motion"],
      real_world: ["Edit 3 videos: vlog, promo, short film"],
      portfolio: ["Showreel"],
      client: ["Client video briefs"],
    },
    created_at: new Date().toISOString(),
  },
  {
    id: "photography",
    name: "Photography",
    category: "Media",
    description: "Composition, lighting, exposure, editing, storytelling",
    prerequisites: [],
    related_skills: ["video-editing"],
    roadmap: {
      beginner: ["Composition, light, phone photography"],
      intermediate: ["Manual mode, editing, genres"],
      advanced: ["Lighting setups, storytelling, series"],
      real_world: ["Photo projects: portrait series, event, product"],
      portfolio: ["Curate best 20, website"],
      client: ["Client briefs"],
    },
    created_at: new Date().toISOString(),
  },
  {
    id: "cybersecurity",
    name: "Cybersecurity",
    category: "Security",
    description: "Educational: Network security, ethical hacking, pentesting concepts, defense",
    prerequisites: ["web-dev"],
    related_skills: [],
    roadmap: {
      beginner: ["Network basics, security principles"],
      intermediate: ["Vulnerabilities, defense, tools (educational)"],
      advanced: ["Pentesting concepts, secure coding"],
      real_world: ["Secure own projects, CTF (educational)"],
      portfolio: ["Security audits of own projects"],
      client: ["Security consulting (educational, no facilitation)"],
    },
    created_at: new Date().toISOString(),
  },
  {
    id: "finance",
    name: "Finance",
    category: "Business",
    description: "Educational: Personal finance, investing concepts, budgeting, financial literacy",
    prerequisites: [],
    related_skills: [],
    roadmap: {
      beginner: ["Budgeting, saving, personal finance"],
      intermediate: ["Investing concepts, risk, diversification (educational)"],
      advanced: ["Financial planning, analysis"],
      real_world: ["Track personal finances, mock portfolio"],
      portfolio: ["Financial literacy projects"],
      client: ["Financial education content (no advice)"],
    },
    created_at: new Date().toISOString(),
  },
];

export function getSkillById(id: string): Skill | undefined {
  return skillDatabase.find((s) => s.id === id);
}

export function getSkillsByCategory(category: SkillCategory): Skill[] {
  return skillDatabase.filter((s) => s.category === category);
}

export function getSkillGraph(): SkillGraphNode[] {
  const graph: SkillGraphNode[] = skillDatabase.map((skill) => ({
    skill_id: skill.id,
    skill_name: skill.name,
    level: 0,
    status: "LATER" as SkillStatus,
    prerequisites: skill.prerequisites || [],
    dependents: skillDatabase.filter((s) => s.prerequisites?.includes(skill.id)).map((s) => s.id),
  }));

  return graph;
}

export function getUserSkillGraph(userSkills: UserSkill[]): SkillGraphNode[] {
  const baseGraph = getSkillGraph();

  return baseGraph.map((node) => {
    const userSkill = userSkills.find((us) => us.skill_id === node.skill_id);
    return {
      ...node,
      level: userSkill?.level || 0,
      status: userSkill?.status || "LATER",
    };
  });
}

// Mock user skills for testing
export function getMockUserSkills(userId: string): UserSkill[] {
  return [
    { user_id: userId, skill_id: "web-dev", level: 65, status: "NOW", updated_at: new Date().toISOString() },
    { user_id: userId, skill_id: "photography", level: 40, status: "NOW", updated_at: new Date().toISOString() },
    { user_id: userId, skill_id: "ai-automation", level: 20, status: "NEXT", updated_at: new Date().toISOString() },
    { user_id: userId, skill_id: "video-editing", level: 10, status: "LATER", updated_at: new Date().toISOString() },
    { user_id: userId, skill_id: "cybersecurity", level: 0, status: "PARKED", updated_at: new Date().toISOString() },
  ];
}
