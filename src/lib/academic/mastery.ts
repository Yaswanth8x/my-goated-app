// ============================================================
// Academic Engine — Mastery Engine, CO Mastery, Spaced Revision
// Workspace 3 Parts 56, 71, 72
// ============================================================

export interface CoMastery {
  co_id: string;
  co_code: string;
  course_id: string;
  mastery: number; // 0-100
  last_tested?: string;
  attempts?: number;
  weak?: boolean;
}

export interface CourseMastery {
  course_id: string;
  course_code: string;
  course_name: string;
  overall_mastery: number; // 0-100
  co_mastery: CoMastery[];
  weak_concepts: string[];
  strong_concepts: string[];
  last_updated: string;
}

export interface SpacedRevisionItem {
  id: string;
  user_id: string;
  course_id: string;
  co_id?: string;
  topic: string;
  next_review: string; // ISO date
  interval: number; // days
  ease: number; // SM-2 ease factor
  repetitions: number;
  last_reviewed?: string;
}

// Calculate overall mastery from CO mastery
export function calculateCourseMastery(coMastery: CoMastery[]): number {
  if (coMastery.length === 0) return 0;
  const sum = coMastery.reduce((acc, co) => acc + co.mastery, 0);
  return Math.round(sum / coMastery.length);
}

// Identify weak concepts (mastery < 50)
export function getWeakConcepts(coMastery: CoMastery[]): string[] {
  return coMastery.filter((co) => co.mastery < 50).map((co) => co.co_code);
}

// Identify strong concepts (mastery >= 80)
export function getStrongConcepts(coMastery: CoMastery[]): string[] {
  return coMastery.filter((co) => co.mastery >= 80).map((co) => co.co_code);
}

// SM-2 Spaced Repetition Algorithm (simplified)
export function calculateNextReview(
  item: SpacedRevisionItem,
  quality: number // 0-5, 0=complete blackout, 5=perfect
): SpacedRevisionItem {
  let { interval, ease, repetitions } = item;

  if (quality < 3) {
    // Failed — reset
    repetitions = 0;
    interval = 1;
  } else {
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * ease);
    }
    repetitions++;
  }

  // Update ease
  ease = ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (ease < 1.3) ease = 1.3;

  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + interval);

  return {
    ...item,
    interval,
    ease,
    repetitions,
    next_review: nextReview.toISOString(),
    last_reviewed: new Date().toISOString(),
  };
}

// Mock mastery data for testing
export function getMockMastery(courseId: string): CourseMastery {
  const coMastery: CoMastery[] = [
    { co_id: "co1", co_code: "CO1", course_id: courseId, mastery: 75, attempts: 3 },
    { co_id: "co2", co_code: "CO2", course_id: courseId, mastery: 45, attempts: 2, weak: true },
    { co_id: "co3", co_code: "CO3", course_id: courseId, mastery: 85, attempts: 4 },
    { co_id: "co4", co_code: "CO4", course_id: courseId, mastery: 30, attempts: 1, weak: true },
    { co_id: "co5", co_code: "CO5", course_id: courseId, mastery: 60, attempts: 2 },
  ];

  return {
    course_id: courseId,
    course_code: courseId,
    course_name: `Course ${courseId}`,
    overall_mastery: calculateCourseMastery(coMastery),
    co_mastery: coMastery,
    weak_concepts: getWeakConcepts(coMastery),
    strong_concepts: getStrongConcepts(coMastery),
    last_updated: new Date().toISOString(),
  };
}

// Get revision items due today
export function getDueRevisionItems(items: SpacedRevisionItem[]): SpacedRevisionItem[] {
  const now = new Date();
  return items.filter((item) => new Date(item.next_review) <= now);
}
