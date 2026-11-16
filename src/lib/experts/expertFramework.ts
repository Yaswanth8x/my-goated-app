// ============================================================
// Expert Framework — Custom Expert Creation
// Workspace 4 Parts 79-85
// ============================================================

import { getExpertPersona } from "@/lib/ai/personas/orchestrator";

export interface Expert {
  id: string;
  user_id?: string; // null for builtin
  name: string;
  persona?: string;
  expertise?: string;
  roadmap?: any;
  teaching_style?: string;
  master_prompt?: string;
  is_custom: boolean;
  is_builtin: boolean;
  created_at: string;
  updated_at: string;
  // Resources
  resources?: {
    pdfs?: string[];
    docs?: string[];
    links?: string[];
    notes?: string;
  };
  // Config
  config?: {
    model?: string;
    provider?: string;
    temperature?: number;
    teaching_modes?: string[];
  };
}

export interface ExpertMemory {
  id: string;
  expert_id: string;
  user_id: string;
  key?: string;
  content: string;
  created_at: string;
}

// Builtin experts
export const builtinExperts: Expert[] = [
  {
    id: "ece-professor",
    name: "ECE Professor",
    persona: "Deep explainer, Socratic teacher, exam analyst, problem solver, visual teacher, viva examiner, mentor. Feynman-style clarity.",
    expertise: "Electronics and Communication Engineering, all semesters, CEG ECE, Anna University",
    teaching_style: "Feynman, Socratic, visual, exam-focused",
    is_custom: false,
    is_builtin: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "web-development",
    name: "Web Development Expert",
    persona: "Senior full-stack developer, mentor, project-based teaching, 10+ years experience",
    expertise: "HTML, CSS, JavaScript, React, Next.js, Node.js, databases, deployment, performance, accessibility",
    teaching_style: "Project-based, hands-on, code reviews",
    is_custom: false,
    is_builtin: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "app-development",
    name: "App Development Expert",
    persona: "Mobile app developer, React Native, Flutter, mentor",
    expertise: "React Native, Flutter, mobile UI, state management, native modules, deployment",
    teaching_style: "Project-based, mobile-first",
    is_custom: false,
    is_builtin: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "full-stack",
    name: "Full Stack Expert",
    persona: "Full-stack architect, end-to-end, mentor",
    expertise: "Frontend + Backend + DB + DevOps, scalability, security",
    teaching_style: "Architecture-first, project-based",
    is_custom: false,
    is_builtin: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "ai-automation",
    name: "AI Automation Expert",
    persona: "AI engineer, LLMs, RAG, agents, workflows, mentor",
    expertise: "LLMs, RAG, agents, n8n, Zapier, Python, APIs, prompt engineering, cost optimization",
    teaching_style: "Hands-on automation, cost-aware",
    is_custom: false,
    is_builtin: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "video-editing",
    name: "Video Editing Expert",
    persona: "Professional video editor, storytelling, Premiere, DaVinci",
    expertise: "Video editing, storytelling, color grading, sound design, motion graphics",
    teaching_style: "Visual, project-based, critiques",
    is_custom: false,
    is_builtin: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "photography",
    name: "Photography Expert",
    persona: "Professional photographer, visual storytelling, technical and artistic",
    expertise: "Photography, composition, lighting, exposure, editing, storytelling, genres",
    teaching_style: "Visual, assignments, critiques",
    is_custom: false,
    is_builtin: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "cybersecurity",
    name: "Cybersecurity Expert",
    persona: "Cybersecurity educator, ethical hacking concepts, defense-focused, safety constraints",
    expertise: "Educational: Network security, ethical hacking concepts, pentesting concepts, defense, secure coding",
    teaching_style: "Educational, defense-focused, no facilitation of wrongdoing, CTF educational",
    is_custom: false,
    is_builtin: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "finance",
    name: "Finance Expert",
    persona: "Finance educator, personal finance, investing concepts, financial literacy, no financial advice",
    expertise: "Educational: Personal finance, budgeting, investing concepts, risk, diversification, financial planning",
    teaching_style: "Educational, no financial advice, no guaranteed income claims, literacy-focused",
    is_custom: false,
    is_builtin: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "global-orchestrator",
    name: "Global Orchestrator",
    persona: "Coordination expert, not a teacher. Understands academics, skills, projects, deadlines, mastery, career, portfolio, freelancing. Answers 'What should I do next?' with prioritization.",
    expertise: "Polymath coordination, goal setting, priority management, anti-overload, academic protection, weekly/monthly planning",
    teaching_style: "Mentor, prioritization, actionable, not encouraging everything",
    is_custom: false,
    is_builtin: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Custom expert creation from master prompt
export function createExpertFromPrompt(data: {
  name: string;
  masterPrompt: string;
  userId?: string;
  resources?: Expert["resources"];
}): Expert {
  // Parse master prompt to extract persona, expertise, roadmap, teaching style, assessment, projects
  const parsed = parseMasterPrompt(data.masterPrompt);

  const expert: Expert = {
    id: `expert_${Date.now()}_${data.name.toLowerCase().replace(/\s+/g, "-")}`,
    user_id: data.userId,
    name: data.name,
    persona: parsed.persona || `Expert in ${data.name}`,
    expertise: parsed.expertise || data.name,
    roadmap: parsed.roadmap,
    teaching_style: parsed.teaching_style,
    master_prompt: data.masterPrompt,
    resources: data.resources,
    is_custom: true,
    is_builtin: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  return expert;
}

// Prompt parser — extracts structured info from master prompt
export function parseMasterPrompt(masterPrompt: string): {
  persona?: string;
  expertise?: string;
  roadmap?: any;
  teaching_style?: string;
  assessment?: string;
  projects?: string[];
} {
  const lowerPrompt = masterPrompt.toLowerCase();

  // Simple heuristic parsing — real would use LLM to parse
  let persona = "";
  let expertise = "";
  let teaching_style = "";
  let roadmap: any = {};
  let assessment = "";
  let projects: string[] = [];

  // Extract persona (look for "You are..." or "Act as...")
  const personaMatch = masterPrompt.match(/(?:You are|Act as|You are an?)\s+([^.\n]+)/i);
  if (personaMatch) {
    persona = personaMatch[1].trim();
  }

  // Extract expertise (look for "Expertise:" or "Skills:")
  const expertiseMatch = masterPrompt.match(/(?:Expertise|Skills|Knowledge):\s*([^\n]+)/i);
  if (expertiseMatch) {
    expertise = expertiseMatch[1].trim();
  }

  // If no explicit, use first paragraph as expertise
  if (!expertise) {
    expertise = masterPrompt.split("\n")[0].slice(0, 200);
  }

  // Teaching style
  if (lowerPrompt.includes("socratic")) teaching_style += "Socratic, ";
  if (lowerPrompt.includes("visual")) teaching_style += "Visual, ";
  if (lowerPrompt.includes("project")) teaching_style += "Project-based, ";
  if (lowerPrompt.includes("hands-on")) teaching_style += "Hands-on, ";
  if (teaching_style === "") teaching_style = "Mentor, project-based";

  // Roadmap (look for BEGINNER, INTERMEDIATE, etc.)
  roadmap = {
    beginner: ["Basics of " + (expertise || "domain")],
    intermediate: ["Intermediate concepts"],
    advanced: ["Advanced topics"],
    real_world: ["Real-world projects"],
    portfolio: ["Portfolio building"],
    client: ["Client work simulation"],
  };

  // Projects (look for "Projects:" or list)
  const projectMatch = masterPrompt.match(/(?:Projects|Build):\s*([^\n]+)/i);
  if (projectMatch) {
    projects = projectMatch[1].split(",").map((p) => p.trim());
  }

  return { persona, expertise, roadmap, teaching_style, assessment, projects };
}

// Get expert by id
export function getExpertById(id: string, customExperts: Expert[] = []): Expert | undefined {
  const allExperts = [...builtinExperts, ...customExperts];
  return allExperts.find((e) => e.id === id || e.name.toLowerCase() === id.toLowerCase());
}

// Get all experts
export function getAllExperts(customExperts: Expert[] = []): Expert[] {
  return [...builtinExperts, ...customExperts];
}

// Expert-specific RAG — filter chunks by expert_id
export function getExpertRagFilter(expertId: string): { expert_id: string } {
  return { expert_id: expertId };
}
