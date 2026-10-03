// ============================================================
// Academic Engine — CGPA/GPA Engine (Honest, no hallucinated regulation)
// Workspace 3 Part 73
// ============================================================

export interface CourseGrade {
  course_code: string;
  course_name: string;
  credits: number;
  grade: string; // O, A+, A, B+, B, C, U, etc.
  grade_point: number; // 10, 9, 8, 7, 6, 5, 0
  semester: number;
}

export interface SemesterGpa {
  semester: number;
  gpa: number;
  total_credits: number;
  total_grade_points: number; // sum of (credits * grade_point)
  courses: CourseGrade[];
}

export interface CgpaResult {
  cgpa: number;
  total_credits: number;
  total_grade_points: number;
  semesters: SemesterGpa[];
  disclaimer: string;
}

// Grade point mapping — Anna University R2021 (verify official, this is sample, not guaranteed)
// IMPORTANT: Do not assume old tables, allow custom mapping
export const defaultGradeMap: Record<string, number> = {
  O: 10,
  "A+": 9,
  A: 8,
  "B+": 7,
  B: 6,
  C: 5,
  U: 0, // Fail
  RA: 0, // Re-appear
  SA: 0, // Shortage of attendance
  W: 0, // Withdrawal
};

// Allow custom grade map
export function calculateGpa(courses: CourseGrade[], gradeMap: Record<string, number> = defaultGradeMap): number {
  let totalCredits = 0;
  let totalGradePoints = 0;

  for (const course of courses) {
    const gp = gradeMap[course.grade] ?? course.grade_point;
    totalCredits += course.credits;
    totalGradePoints += course.credits * gp;
  }

  if (totalCredits === 0) return 0;

  return parseFloat((totalGradePoints / totalCredits).toFixed(2));
}

export function calculateCgpa(semesters: SemesterGpa[], gradeMap: Record<string, number> = defaultGradeMap): CgpaResult {
  let totalCredits = 0;
  let totalGradePoints = 0;

  const calculatedSemesters: SemesterGpa[] = semesters.map((sem) => {
    const gpa = calculateGpa(sem.courses, gradeMap);
    const semCredits = sem.courses.reduce((sum, c) => sum + c.credits, 0);
    const semGradePoints = sem.courses.reduce((sum, c) => {
      const gp = gradeMap[c.grade] ?? c.grade_point;
      return sum + c.credits * gp;
    }, 0);

    totalCredits += semCredits;
    totalGradePoints += semGradePoints;

    return {
      ...sem,
      gpa,
      total_credits: semCredits,
      total_grade_points: semGradePoints,
    };
  });

  const cgpa = totalCredits > 0 ? parseFloat((totalGradePoints / totalCredits).toFixed(2)) : 0;

  return {
    cgpa,
    total_credits: totalCredits,
    total_grade_points: totalGradePoints,
    semesters: calculatedSemesters,
    disclaimer:
      "CGPA calculation uses grade point mapping that may vary by regulation (R2021, R2017, etc.). This is sample mapping — verify with official Anna University regulations for your batch. Official regulation math refuses to assume old tables. You can customize gradeMap in settings.",
  };
}

// Mock data for testing
export function getMockGrades(): CourseGrade[] {
  return [
    { course_code: "HS3152", course_name: "Professional English I", credits: 3, grade: "A", grade_point: 8, semester: 1 },
    { course_code: "MA3151", course_name: "Matrices and Calculus", credits: 4, grade: "B+", grade_point: 7, semester: 1 },
    { course_code: "PH3151", course_name: "Engineering Physics", credits: 3, grade: "A+", grade_point: 9, semester: 1 },
    { course_code: "CY3151", course_name: "Engineering Chemistry", credits: 3, grade: "B", grade_point: 6, semester: 1 },
    { course_code: "GE3151", course_name: "Python Programming", credits: 3, grade: "O", grade_point: 10, semester: 1 },
  ];
}

// Convert CGPA to percentage (approximate, varies by university)
export function cgpaToPercentage(cgpa: number, formula: "default" | "anna_university" = "default"): number {
  // Anna University: Percentage = CGPA * 10 (approximate, verify official)
  // Some use: Percentage = (CGPA - 0.5) * 10
  // We provide both and disclaimer

  if (formula === "anna_university") {
    return parseFloat((cgpa * 10).toFixed(2));
  }

  return parseFloat((cgpa * 9.5).toFixed(2)); // Common formula
}
