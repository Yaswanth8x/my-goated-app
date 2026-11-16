/**
 * Academic Engine tests — curriculum, CGPA, mastery, PYQ, test simulator.
 * These are the "does the maths actually work?" tests.
 */
import { test } from "node:test";
import assert from "node:assert/strict";

import {
  sampleCurriculum,
  getAllCourses,
  getCourseByCode,
  getSemester,
  getTotalCredits,
  getPrerequisiteGraph,
} from "@/lib/academic/curriculum";
import { calculateGpa, calculateCgpa, cgpaToPercentage } from "@/lib/academic/cgpa";
import {
  calculateCourseMastery,
  getWeakConcepts,
  getStrongConcepts,
  calculateNextReview,
  getDueRevisionItems,
} from "@/lib/academic/mastery";
import {
  detectQuestionFamilies,
  analyzeFrequency,
  generateQuestionsFromFamilies,
  getMockPyqs,
} from "@/lib/academic/pyq";
import {
  generateCA1Test,
  generateEndSemTest,
  evaluateAnswer,
  classifyErrors,
} from "@/lib/academic/testEngine";

// ---------- Curriculum ----------

test("curriculum has 8 semesters", () => {
  assert.equal(sampleCurriculum.length, 8);
});

test("curriculum course codes are unique", () => {
  const codes = getAllCourses().map((c) => c.code);
  assert.equal(new Set(codes).size, codes.length);
});

test("every course belongs to the semester it is listed under", () => {
  for (const sem of sampleCurriculum) {
    for (const course of sem.courses) {
      assert.equal(course.semester, sem.number, `${course.code} semester mismatch`);
    }
  }
});

test("getCourseByCode finds a real course", () => {
  const course = getCourseByCode("EC3351");
  assert.ok(course, "EC3351 should exist in the sample curriculum");
  assert.match(course!.name, /control/i);
});

test("getCourseByCode returns undefined for an unknown code", () => {
  assert.equal(getCourseByCode("NOT-A-COURSE"), undefined);
});

test("getSemester returns semester 3 with courses", () => {
  const sem = getSemester(3);
  assert.ok(sem);
  assert.ok(sem!.courses.length > 0);
});

test("total credits are positive and plausible", () => {
  const credits = getTotalCredits();
  assert.ok(credits >= 150, `expected >=150 credits, got ${credits}`);
});

test("every course has at least one unit", () => {
  for (const course of getAllCourses()) {
    assert.ok((course.units?.length ?? 0) > 0, `${course.code} has no units`);
  }
});

test("no prerequisite points to a missing course", () => {
  const graph = getPrerequisiteGraph();
  const codes = new Set(getAllCourses().map((c) => c.code));
  for (const [course, prereqs] of Object.entries(graph)) {
    for (const p of prereqs) {
      assert.ok(codes.has(p), `${course} requires missing ${p}`);
    }
  }
});

// ---------- CGPA ----------

test("calculateGpa computes credit-weighted average", () => {
  const gpa = calculateGpa([
    { course_code: "A", course_name: "A", credits: 4, grade: "O", grade_point: 10, semester: 1 },
    { course_code: "B", course_name: "B", credits: 2, grade: "A+", grade_point: 9, semester: 1 },
  ]);
  // (4*10 + 2*9) / 6 = 9.67
  assert.equal(gpa, 9.67);
});

test("calculateGpa returns 0 when there are no credits", () => {
  assert.equal(calculateGpa([]), 0);
});

test("calculateGpa honours a custom grade map", () => {
  const gpa = calculateGpa(
    [{ course_code: "A", course_name: "A", credits: 3, grade: "X", grade_point: 1, semester: 1 }],
    { X: 5 }
  );
  assert.equal(gpa, 5);
});

test("calculateCgpa aggregates credits across semesters", () => {
  const result = calculateCgpa([
    {
      semester: 1,
      gpa: 0,
      total_credits: 0,
      total_grade_points: 0,
      courses: [{ course_code: "A", course_name: "A", credits: 4, grade: "O", grade_point: 10, semester: 1 }],
    },
    {
      semester: 2,
      gpa: 0,
      total_credits: 0,
      total_grade_points: 0,
      courses: [{ course_code: "B", course_name: "B", credits: 4, grade: "B", grade_point: 6, semester: 2 }],
    },
  ]);
  assert.equal(result.total_credits, 8);
  assert.equal(result.cgpa, 8);
});

test("calculateCgpa on empty input is 0, not NaN", () => {
  const result = calculateCgpa([]);
  assert.equal(result.cgpa, 0);
  assert.equal(result.total_credits, 0);
});

test("cgpaToPercentage returns a number in a sane range", () => {
  const pct = cgpaToPercentage(8.5, "anna_university");
  assert.equal(pct, 85);
  assert.ok(cgpaToPercentage(8.5) <= 100);
});

// ---------- Mastery ----------

test("course mastery is the rounded average of CO mastery", () => {
  assert.equal(
    calculateCourseMastery([
      { co_id: "1", co_code: "CO1", course_id: "X", mastery: 80, attempts: 1 },
      { co_id: "2", co_code: "CO2", course_id: "X", mastery: 40, attempts: 1 },
    ]),
    60
  );
});

test("course mastery on empty list is 0", () => {
  assert.equal(calculateCourseMastery([]), 0);
});

test("weak and strong concept thresholds are correct", () => {
  const cos = [
    { co_id: "1", co_code: "CO1", course_id: "X", mastery: 49, attempts: 1 },
    { co_id: "2", co_code: "CO2", course_id: "X", mastery: 50, attempts: 1 },
    { co_id: "3", co_code: "CO3", course_id: "X", mastery: 80, attempts: 1 },
  ];
  assert.deepEqual(getWeakConcepts(cos), ["CO1"]);
  assert.deepEqual(getStrongConcepts(cos), ["CO3"]);
});

test("spaced repetition resets the interval on a failed recall", () => {
  const item = {
    id: "1",
    user_id: "u",
    course_id: "c",
    topic_id: "t",
    topic: "t",
    interval: 10,
    ease: 2.5,
    repetitions: 4,
    next_review: new Date().toISOString(),
    last_reviewed: new Date().toISOString(),
  };
  const next = calculateNextReview(item, 1);
  assert.equal(next.interval, 1);
  assert.equal(next.repetitions, 0);
});

test("spaced repetition grows the interval on a good recall", () => {
  const item = {
    id: "1",
    user_id: "u",
    course_id: "c",
    topic_id: "t",
    topic: "t",
    interval: 6,
    ease: 2.5,
    repetitions: 2,
    next_review: new Date().toISOString(),
    last_reviewed: new Date().toISOString(),
  };
  const next = calculateNextReview(item, 5);
  assert.ok(next.interval > 6, `expected >6 got ${next.interval}`);
  assert.equal(next.repetitions, 3);
});

test("spaced repetition never lets ease fall below 1.3", () => {
  const item = {
    id: "1",
    user_id: "u",
    course_id: "c",
    topic_id: "t",
    topic: "t",
    interval: 1,
    ease: 1.3,
    repetitions: 0,
    next_review: new Date().toISOString(),
    last_reviewed: new Date().toISOString(),
  };
  const next = calculateNextReview(item, 0);
  assert.ok(next.ease >= 1.3);
});

test("due revision items only include past-due entries", () => {
  const past = new Date(Date.now() - 86400000).toISOString();
  const future = new Date(Date.now() + 86400000).toISOString();
  const base = { user_id: "u", course_id: "c", topic_id: "t", topic: "t", interval: 1, ease: 2.5, repetitions: 1, last_reviewed: past };
  const due = getDueRevisionItems([
    { ...base, id: "1", next_review: past },
    { ...base, id: "2", next_review: future },
  ]);
  assert.deepEqual(due.map((d) => d.id), ["1"]);
});

// ---------- PYQ ----------

test("repeated question patterns are detected as families", () => {
  const pyqs = getMockPyqs("EC3351").concat(getMockPyqs("EC3351"));
  const families = detectQuestionFamilies(pyqs);
  assert.ok(families.length > 0, "expected at least one question family");
  assert.ok(families.every((f) => f.count >= 2));
});

test("frequency analysis sorts HIGH relevance first", () => {
  const pyqs = getMockPyqs("EC3351");
  const families = detectQuestionFamilies(pyqs);
  const analysis = analyzeFrequency(pyqs, families);
  const order = { HIGH: 0, MEDIUM: 1, LOWER: 2 } as const;
  for (let i = 1; i < analysis.length; i++) {
    assert.ok(order[analysis[i - 1].relevance] <= order[analysis[i].relevance]);
  }
});

test("generateQuestionsFromFamilies returns the requested count", () => {
  const pyqs = getMockPyqs("EC3351");
  const families = detectQuestionFamilies(pyqs);
  assert.equal(generateQuestionsFromFamilies(families, 3).length, 3);
});

test("generateQuestionsFromFamilies handles an empty family list", () => {
  assert.deepEqual(generateQuestionsFromFamilies([], 5), []);
});

// ---------- Test simulator ----------

test("CA1 test is generated with questions and a sane total", () => {
  const test = generateCA1Test("EC3351", getMockPyqs("EC3351"));
  assert.ok(test.questions.length > 0);
  assert.ok(test.total_marks > 0);
  assert.ok(test.total_marks <= 50, `CA1 should not exceed 50 marks, got ${test.total_marks}`);
});

test("end-sem test never exceeds the requested total marks", () => {
  const test = generateEndSemTest("EC3351", getMockPyqs("EC3351"));
  assert.ok(
    test.total_marks <= 100,
    `end-sem total marks ${test.total_marks} exceeds 100`
  );
});

test("short answers score lower than long keyword-rich answers", () => {
  const q = {
    id: "q1",
    question_text: "Explain the working of a PN junction diode with a diagram",
    marks: 10,
    type: "THEORY" as const,
    difficulty: "MEDIUM" as const,
  };
  const weak = evaluateAnswer(q, "dunno");
  const strong = evaluateAnswer(
    q,
    "A PN junction diode is formed by joining p-type and n-type semiconductors. Explain the working with a diagram showing depletion region, diffusion, drift, and barrier potential. Forward bias reduces the barrier and current flows."
  );
  assert.ok(strong.score > weak.score, `${strong.score} should beat ${weak.score}`);
  assert.ok(strong.score <= q.marks);
  assert.equal(weak.error_type, "PRESENTATION");
});

test("error classification counts each category", () => {
  const counts = classifyErrors([
    { question_id: "1", score: 1, max_marks: 5, feedback: "", strengths: [], improvements: [], error_type: "CONCEPTUAL" },
    { question_id: "2", score: 2, max_marks: 5, feedback: "", strengths: [], improvements: [], error_type: "CONCEPTUAL" },
    { question_id: "3", score: 3, max_marks: 5, feedback: "", strengths: [], improvements: [], error_type: "CALCULATION" },
    { question_id: "4", score: 4, max_marks: 5, feedback: "", strengths: [], improvements: [] },
  ]);
  assert.equal(counts.CONCEPTUAL, 2);
  assert.equal(counts.CALCULATION, 1);
  assert.equal(counts.PRESENTATION, 0);
});
