// ============================================================
// Analytics — Learning Analytics, Skill Analytics, Time Tracking
// Workspace 5 Part 117
// ============================================================

export interface LearningAnalytics {
  user_id: string;
  date: string;
  academic: {
    total_courses: number;
    avg_mastery: number;
    weak_areas: string[];
    tests_taken: number;
    avg_score: number;
  };
  professional: {
    total_skills: number;
    now_skills: number;
    avg_skill_level: number;
    projects_completed: number;
    portfolio_items: number;
    readiness: number;
  };
  time_tracking: {
    academic_hours: number;
    professional_hours: number;
    total_hours: number;
  };
}

export function getMockAnalytics(userId: string): LearningAnalytics {
  return {
    user_id: userId,
    date: new Date().toISOString(),
    academic: {
      total_courses: 12,
      avg_mastery: 59,
      weak_areas: ["Pointers", "K-Maps", "Control Systems"],
      tests_taken: 5,
      avg_score: 72,
    },
    professional: {
      total_skills: 8,
      now_skills: 2,
      avg_skill_level: 35,
      projects_completed: 1,
      portfolio_items: 2,
      readiness: 45,
    },
    time_tracking: {
      academic_hours: 15,
      professional_hours: 8,
      total_hours: 23,
    },
  };
}

// Weekly, monthly, semester, year reviews
export function generateReview(
  type: "weekly" | "monthly" | "semester" | "year",
  analytics: LearningAnalytics
): { title: string; summary: string; achievements: string[]; next_focus: string[] } {
  const titles = {
    weekly: "Weekly Review",
    monthly: "Monthly Review",
    semester: "Semester Review",
    year: "Year Review",
  };

  return {
    title: titles[type],
    summary: `Academic mastery ${analytics.academic.avg_mastery}%, ${analytics.academic.tests_taken} tests taken, avg score ${analytics.academic.avg_score}%. Professional: ${analytics.professional.projects_completed} projects, readiness ${analytics.professional.readiness}%. Time: ${analytics.time_tracking.total_hours} hours (academic ${analytics.time_tracking.academic_hours}, professional ${analytics.time_tracking.professional_hours})`,
    achievements: [
      `Completed ${analytics.professional.projects_completed} projects`,
      `Mastery ${analytics.academic.avg_mastery}% in ${analytics.academic.total_courses} courses`,
      `Skills: ${analytics.professional.now_skills} NOW, avg level ${analytics.professional.avg_skill_level}%`,
    ],
    next_focus: [
      `Weak areas: ${analytics.academic.weak_areas.join(", ")}`,
      `Increase portfolio from ${analytics.professional.portfolio_items} to 3+`,
      `Balance academic (${analytics.time_tracking.academic_hours}h) vs professional (${analytics.time_tracking.professional_hours}h)`,
    ],
  };
}
