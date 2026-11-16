// ============================================================
// Freelancing Engine — Services, Leads, Clients, Projects, etc.
// Workspace 4 Parts 97-99
// ============================================================

export type FreelanceService = {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  pricing?: string;
  skills?: string[];
  portfolio_ids?: string[];
  created_at: string;
};

export type Lead = {
  id: string;
  user_id: string;
  source: string; // e.g., "LinkedIn", "Referral", "Portfolio"
  client_name?: string;
  service_id?: string;
  status: "NEW" | "CONTACTED" | "QUALIFIED" | "PROPOSAL_SENT" | "WON" | "LOST";
  notes?: string;
  created_at: string;
};

export type Client = {
  id: string;
  user_id: string;
  name: string;
  email?: string;
  company?: string;
  projects?: string[];
  total_spent?: number;
  created_at: string;
};

export type FreelanceProject = {
  id: string;
  user_id: string;
  client_id?: string;
  service_id?: string;
  title: string;
  brief?: string;
  proposal?: string;
  deliverables?: string[];
  status: "BRIEF" | "PROPOSAL" | "IN_PROGRESS" | "DELIVERABLES" | "REVISIONS" | "COMPLETED";
  price?: number;
  deadline?: string;
  created_at: string;
};

export type ReadinessScore = {
  portfolio: number; // 0-100
  skills: number;
  projects: number;
  testimonials: number;
  overall: number;
  missing: string[];
};

// Sample services
export const sampleServices: FreelanceService[] = [
  {
    id: "service_web_landing",
    user_id: "mock-user",
    title: "Landing Page Development",
    description: "High-converting landing pages with Next.js, Tailwind, responsive, SEO",
    pricing: "$200-$500",
    skills: ["web-dev"],
    created_at: new Date().toISOString(),
  },
  {
    id: "service_photo_portrait",
    user_id: "mock-user",
    title: "Portrait Photography",
    description: "Natural light portrait sessions, editing, delivery",
    pricing: "$100-$300 per session",
    skills: ["photography"],
    created_at: new Date().toISOString(),
  },
];

// Freelance readiness matrix (not fake score)
export function calculateReadiness(userId: string, portfolioCount: number, skillLevels: Record<string, number>, projectCount: number): ReadinessScore {
  const portfolioScore = Math.min(100, portfolioCount * 20); // 5 portfolio items = 100
  const skillsAvg = Object.values(skillLevels).reduce((sum, lvl) => sum + lvl, 0) / Math.max(1, Object.values(skillLevels).length);
  const skillsScore = Math.min(100, skillsAvg);
  const projectsScore = Math.min(100, projectCount * 15); // 7 projects = 100
  const testimonialsScore = 0; // TODO: testimonials

  const overall = Math.round((portfolioScore * 0.3 + skillsScore * 0.3 + projectsScore * 0.3 + testimonialsScore * 0.1));

  const missing: string[] = [];
  if (portfolioCount < 3) missing.push(`Need ${3 - portfolioCount} more portfolio items (have ${portfolioCount}, need 3)`);
  if (skillsAvg < 50) missing.push(`Skills avg ${Math.round(skillsAvg)}% — need 50%+ in at least one skill`);
  if (projectCount < 3) missing.push(`Need ${3 - projectCount} more projects (have ${projectCount}, need 3)`);
  if (testimonialsScore === 0) missing.push("Need testimonials from clients or peers");

  return {
    portfolio: portfolioScore,
    skills: Math.round(skillsScore),
    projects: projectsScore,
    testimonials: testimonialsScore,
    overall,
    missing,
  };
}

// Client simulation
export function simulateClientBrief(service: FreelanceService): string {
  return `CLIENT BRIEF (Simulation):

Client: Local business owner
Needs: ${service.title}
Description: ${service.description}
Budget: ${service.pricing}
Timeline: 2 weeks

Requirements:
- Responsive design
- Fast loading
- SEO friendly
- Contact form

Deliverables:
- Deployed website
- Source code
- Documentation
- 1 round revisions

What to do: Create proposal with timeline, price, deliverables, and ask clarifying questions.`;
}

// No guaranteed income disclaimer
export const freelancingDisclaimer = `
FREELANCING DISCLAIMER:
- No guaranteed income — freelancing depends on skills, portfolio, network, market, effort
- This engine helps you prepare: services, leads, clients, briefs, proposals, deliverables, portfolio, readiness matrix (not fake score)
- Focus on building portfolio and skills first, then clients
- Start with small projects, testimonials, then larger
- During exams, academics take priority — reduce freelance workload (academic protection)
`;
