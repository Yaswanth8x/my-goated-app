// ============================================================
// Global AI Coordinator — Polymath Engine
// Workspace 5 Parts 101-108
// ============================================================

import { getMockUserSkills } from "@/lib/skills/skillDatabase";
import { sampleProjects } from "@/lib/projects/projectEngine";

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  type: "ACADEMIC" | "PROFESSIONAL" | "PERSONAL";
  deadline?: string;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "PARKED";
  priority: number; // 1-5, 1 highest
  created_at: string;
}

export interface Task {
  id: string;
  title: string;
  type: "ACADEMIC" | "PROFESSIONAL";
  course_id?: string;
  skill_id?: string;
  project_id?: string;
  deadline?: string;
  estimated_hours?: number;
  priority: number;
  status: "TODO" | "IN_PROGRESS" | "DONE";
}

export interface PriorityResult {
  next_actions: Task[];
  reasoning: string;
  academic_protection_active: boolean;
  overload_warning?: string;
}

// Mock goals for testing
export function getMockGoals(userId: string): Goal[] {
  return [
    {
      id: "goal_1",
      user_id: userId,
      title: "CA-1 for CS3353 C Programming next week",
      type: "ACADEMIC",
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // next week
      status: "IN_PROGRESS",
      priority: 1,
      created_at: new Date().toISOString(),
    },
    {
      id: "goal_2",
      user_id: userId,
      title: "Complete ECE assignment EC3352",
      type: "ACADEMIC",
      deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days
      status: "NOT_STARTED",
      priority: 1,
      created_at: new Date().toISOString(),
    },
    {
      id: "goal_3",
      user_id: userId,
      title: "Web Development Project — Portfolio Website",
      type: "PROFESSIONAL",
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 2 weeks
      status: "IN_PROGRESS",
      priority: 2,
      created_at: new Date().toISOString(),
    },
    {
      id: "goal_4",
      user_id: userId,
      title: "Photography Assignment — Portrait Series",
      type: "PROFESSIONAL",
      deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      status: "NOT_STARTED",
      priority: 3,
      created_at: new Date().toISOString(),
    },
  ];
}

// Priority engine — answers "What should I do next?"
export function calculatePriority(userId: string, goals: Goal[], isExamPeriod: boolean = false): PriorityResult {
  const userSkills = getMockUserSkills(userId);
  const nowSkills = userSkills.filter((s) => s.status === "NOW").map((s) => s.skill_id);

  // Sort goals by deadline and priority
  const sortedGoals = [...goals].sort((a, b) => {
    // Academic first during exam period
    if (isExamPeriod) {
      if (a.type === "ACADEMIC" && b.type !== "ACADEMIC") return -1;
      if (a.type !== "ACADEMIC" && b.type === "ACADEMIC") return 1;
    }

    // Then by deadline (earlier first)
    if (a.deadline && b.deadline) {
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    }
    if (a.deadline && !b.deadline) return -1;
    if (!a.deadline && b.deadline) return 1;

    // Then by priority
    return a.priority - b.priority;
  });

  // Convert goals to tasks — PERSONAL goals map to PROFESSIONAL for Task type (academic/professional bridge)
  const tasks: Task[] = sortedGoals.map((goal) => ({
    id: goal.id,
    title: goal.title,
    type: goal.type === "PERSONAL" ? ("PROFESSIONAL" as const) : goal.type,
    deadline: goal.deadline,
    priority: goal.priority,
    status: goal.status === "COMPLETED" ? ("DONE" as const) : goal.status === "IN_PROGRESS" ? ("IN_PROGRESS" as const) : ("TODO" as const),
  }));

  // Academic protection: During exam periods, reduce professional workload
  let academicProtectionActive = isExamPeriod;
  let filteredTasks = tasks;

  if (isExamPeriod) {
    // Only show academic tasks as high priority, professional as low or parked
    filteredTasks = tasks.map((task) => {
      if (task.type === "PROFESSIONAL") {
        return { ...task, priority: task.priority + 2 }; // Lower priority
      }
      return task;
    });
  }

  // Anti-overload: Check if too many NOW skills
  let overloadWarning: string | undefined;
  if (nowSkills.length > 3) {
    overloadWarning = `⚠️ Anti-overload: You have ${nowSkills.length} skills in NOW status (${nowSkills.join(", ")}). Polymath engine recommends max 2-3 NOW skills to go deep, not shallow. Consider moving some to NEXT/LATER/PARKED. Status: NOW=actively learning, NEXT=next, LATER=later, PARKED=parked.`;
  }

  // Next actions: Top 1-3 most important
  const nextActions = filteredTasks
    .filter((t) => t.status !== "DONE")
    .slice(0, 3);

  // Reasoning
  let reasoning = "";
  if (isExamPeriod) {
    reasoning = `Academic protection active: During exam period, academics take priority. Professional workload reduced. Focus on: ${nextActions
      .filter((t) => t.type === "ACADEMIC")
      .map((t) => t.title)
      .join(", ")}. Professional can increase during vacations.`;
  } else {
    reasoning = `Based on deadlines and goals: ${nextActions.map((t) => `${t.title} (${t.type}, priority ${t.priority})`).join(", ")}. Prioritized by deadline and type.`;
  }

  if (overloadWarning) {
    reasoning += `\n\n${overloadWarning}`;
  }

  return {
    next_actions: nextActions,
    reasoning,
    academic_protection_active: academicProtectionActive,
    overload_warning: overloadWarning,
  };
}

// Cross-domain skill graph
export function getCrossDomainGraph(): { skill: string; connects_to: string[]; bridge: string }[] {
  return [
    {
      skill: "ECE",
      connects_to: ["Web Development", "AI Automation"],
      bridge: "Signals → Audio processing for web, Embedded → IoT for AI",
    },
    {
      skill: "Photography",
      connects_to: ["Web Development", "Video Editing"],
      bridge: "Composition → UI design, Visual storytelling → Video",
    },
    {
      skill: "C Programming",
      connects_to: ["Web Development", "Embedded Systems"],
      bridge: "Memory management → Performance optimization, Embedded C → IoT",
    },
  ];
}

// Cross-domain project suggestions
export function getCrossDomainProjects(): { title: string; skills: string[]; description: string }[] {
  return [
    {
      title: "ECE + Web: Audio Visualizer for Signals",
      skills: ["ECE", "Web Development"],
      description: "Build web-based audio visualizer using Web Audio API + signals knowledge from EC3354",
    },
    {
      title: "Photography + Web: Portfolio with Advanced Gallery",
      skills: ["Photography", "Web Development"],
      description: "Build photography portfolio with lightbox, EXIF data, storytelling",
    },
    {
      title: "C + AI: Embedded AI for IoT",
      skills: ["C Programming", "AI Automation"],
      description: "C for embedded + AI automation for IoT data processing",
    },
  ];
}

// Weekly planner
export function generateWeeklyPlanner(userId: string, goals: Goal[]): { week: string; tasks: Task[]; focus: string } {
  const priority = calculatePriority(userId, goals, false);

  return {
    week: `Week of ${new Date().toLocaleDateString()}`,
    tasks: priority.next_actions,
    focus: priority.reasoning,
  };
}
