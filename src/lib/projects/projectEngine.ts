// ============================================================
// Project Engine — BEGINNER → CLIENT
// Workspace 4 Parts 95-96
// ============================================================

export type ProjectLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "REAL_WORLD" | "PORTFOLIO" | "CLIENT";
export type ProjectStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "ARCHIVED";

export interface Project {
  id: string;
  user_id: string;
  skill_id?: string;
  expert_id?: string;
  title: string;
  description?: string;
  problem?: string;
  solution?: string;
  level: ProjectLevel;
  status: ProjectStatus;
  tech_stack?: string[];
  github_url?: string;
  demo_url?: string;
  created_at: string;
  updated_at: string;
}

export interface PortfolioItem {
  id: string;
  user_id: string;
  project_id?: string;
  title: string;
  problem?: string;
  solution?: string;
  tech?: string[];
  skills?: string[];
  screenshots?: string[];
  links?: { github?: string; demo?: string; docs?: string };
  docs?: string;
  role?: string;
  date?: string;
  quality?: number; // 1-5
  review?: string;
  evidence?: string; // proof of work, not fake
  created_at: string;
  updated_at: string;
}

export const projectLevelOrder: Record<ProjectLevel, number> = {
  BEGINNER: 0,
  INTERMEDIATE: 1,
  ADVANCED: 2,
  REAL_WORLD: 3,
  PORTFOLIO: 4,
  CLIENT: 5,
};

export const projectLevelDescriptions: Record<ProjectLevel, string> = {
  BEGINNER: "Learn basics, simple project, e.g., personal portfolio page",
  INTERMEDIATE: "More complex, e.g., React app with API",
  ADVANCED: "Full-stack, e.g., Next.js with auth and DB",
  REAL_WORLD: "Real-world problem, e.g., e-commerce for local business",
  PORTFOLIO: "Polished, portfolio-worthy, with documentation and evidence",
  CLIENT: "Client/product level, with brief, proposal, deliverable, revision",
};

// Sample projects
export const sampleProjects: Project[] = [
  {
    id: "proj_web_1",
    user_id: "mock-user",
    skill_id: "web-dev",
    expert_id: "web-development",
    title: "Personal Portfolio Website",
    description: "Build personal portfolio with Next.js, Tailwind, responsive, dark mode",
    problem: "Need portfolio to showcase skills and projects",
    solution: "Next.js App Router, Tailwind v4, responsive, deployed on Vercel",
    level: "BEGINNER",
    status: "COMPLETED",
    tech_stack: ["Next.js", "Tailwind", "TypeScript"],
    github_url: "https://github.com/example/portfolio",
    demo_url: "https://portfolio.example.com",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "proj_web_2",
    user_id: "mock-user",
    skill_id: "web-dev",
    expert_id: "web-development",
    title: "E-Commerce Landing Page",
    description: "Landing page for e-commerce with cart, checkout UI",
    level: "INTERMEDIATE",
    status: "IN_PROGRESS",
    tech_stack: ["React", "Next.js", "Stripe"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "proj_photo_1",
    user_id: "mock-user",
    skill_id: "photography",
    expert_id: "photography",
    title: "Portrait Series — Natural Light",
    description: "10 portraits with natural light, different compositions",
    level: "BEGINNER",
    status: "NOT_STARTED",
    tech_stack: ["DSLR", "Lightroom"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export function getProjectsBySkill(skillId: string, userId: string): Project[] {
  return sampleProjects.filter((p) => p.skill_id === skillId && p.user_id === userId);
}

export function getProjectsByLevel(level: ProjectLevel, userId: string): Project[] {
  return sampleProjects.filter((p) => p.level === level && p.user_id === userId);
}

export function getNextProjectLevel(current: ProjectLevel): ProjectLevel | null {
  const order = projectLevelOrder[current];
  const levels = Object.keys(projectLevelOrder) as ProjectLevel[];
  const nextLevel = levels.find((l) => projectLevelOrder[l] === order + 1);
  return nextLevel || null;
}

// Portfolio engine
export function createPortfolioFromProject(project: Project): PortfolioItem {
  return {
    id: `port_${Date.now()}`,
    user_id: project.user_id,
    project_id: project.id,
    title: project.title,
    problem: project.problem,
    solution: project.solution,
    tech: project.tech_stack,
    skills: project.skill_id ? [project.skill_id] : [],
    screenshots: [],
    links: { github: project.github_url, demo: project.demo_url },
    role: "Developer",
    date: new Date().toISOString(),
    quality: 3,
    evidence: `Built ${project.title} with ${project.tech_stack?.join(", ")} — evidence: GitHub commits, deployed URL, screenshots`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}
