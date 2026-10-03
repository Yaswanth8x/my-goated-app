// ============================================================
// Academic Engine — Test Simulators (CA-1, CA-2, EndSem, Viva)
// Workspace 3 Parts 65-68
// ============================================================

import { Pyq, ExamType } from "./pyq";

export interface TestQuestion {
  id: string;
  question_text: string;
  marks: number;
  co_id?: string;
  unit_id?: string;
  type: "THEORY" | "PROBLEM" | "MCQ";
  options?: string[]; // for MCQ
  correct_answer?: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
}

export interface Test {
  id: string;
  course_id: string;
  type: ExamType;
  title: string;
  total_marks: number;
  duration: number; // minutes
  questions: TestQuestion[];
  created_at: string;
}

export interface TestAttempt {
  id: string;
  test_id: string;
  user_id: string;
  answers: Record<string, string>; // question_id -> answer
  score?: number;
  started_at: string;
  submitted_at?: string;
  time_taken?: number; // minutes
}

export interface AnswerEvaluation {
  question_id: string;
  score: number;
  max_marks: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  error_type?: "CONCEPTUAL" | "CALCULATION" | "PRESENTATION" | "TIME_MANAGEMENT";
}

// Generate test from PYQs
export function generateTestFromPyqs(
  courseId: string,
  type: ExamType,
  pyqs: Pyq[],
  totalMarks: number = 100,
  duration: number = 90
): Test {
  // Select PYQs to match total marks
  let selected: Pyq[] = [];
  let currentMarks = 0;

  // Sort by relevance HIGH first
  const sorted = [...pyqs].sort((a, b) => (b.marks || 0) - (a.marks || 0));

  for (const pyq of sorted) {
    if (currentMarks + (pyq.marks || 5) <= totalMarks) {
      selected.push(pyq);
      currentMarks += pyq.marks || 5;
    }
    if (currentMarks >= totalMarks) break;
  }

  // If not enough, fill with remaining
  if (currentMarks < totalMarks) {
    for (const pyq of sorted) {
      if (!selected.includes(pyq)) {
        selected.push(pyq);
        currentMarks += pyq.marks || 5;
        if (currentMarks >= totalMarks) break;
      }
    }
  }

  const questions: TestQuestion[] = selected.map((pyq, idx) => ({
    id: `q_${idx + 1}`,
    question_text: pyq.question_text,
    marks: pyq.marks || 5,
    co_id: pyq.co_id,
    unit_id: pyq.unit_id,
    type: "THEORY" as const,
    difficulty: pyq.difficulty || "MEDIUM",
  }));

  return {
    id: `test_${Date.now()}`,
    course_id: courseId,
    type,
    title: `${type} Simulator — ${courseId} — ${totalMarks} Marks`,
    total_marks: currentMarks,
    duration,
    questions,
    created_at: new Date().toISOString(),
  };
}

// CA-1 Simulator: 50 marks, 90 mins, 2-3 units
export function generateCA1Test(courseId: string, pyqs: Pyq[]): Test {
  const ca1Pyqs = pyqs.filter((p) => p.exam_type === "CA1" || p.unit_id?.includes("1") || p.unit_id?.includes("2"));
  return generateTestFromPyqs(courseId, "CA1", ca1Pyqs.length > 0 ? ca1Pyqs : pyqs, 50, 90);
}

// CA-2 Simulator: 50 marks, 90 mins, 3-5 units
export function generateCA2Test(courseId: string, pyqs: Pyq[]): Test {
  const ca2Pyqs = pyqs.filter((p) => p.exam_type === "CA2");
  return generateTestFromPyqs(courseId, "CA2", ca2Pyqs.length > 0 ? ca2Pyqs : pyqs, 50, 90);
}

// EndSem Simulator: 100 marks, 180 mins, all units
export function generateEndSemTest(courseId: string, pyqs: Pyq[]): Test {
  return generateTestFromPyqs(courseId, "ENDSEM", pyqs, 100, 180);
}

// Viva Mode — Generate viva questions
export function generateVivaQuestions(courseId: string, unitId?: string, count: number = 10): TestQuestion[] {
  const vivaQuestions: TestQuestion[] = [
    {
      id: "viva_1",
      question_text: `Define ${courseId} in your own words. What is its significance?`,
      marks: 5,
      type: "THEORY",
      difficulty: "EASY",
    },
    {
      id: "viva_2",
      question_text: `Explain the working principle of ${courseId} with diagram.`,
      marks: 10,
      type: "THEORY",
      difficulty: "MEDIUM",
    },
    {
      id: "viva_3",
      question_text: `What happens if we change X in ${courseId}? Analyze.`,
      marks: 8,
      type: "THEORY",
      difficulty: "HARD",
    },
    {
      id: "viva_4",
      question_text: `Compare ${courseId} with similar concept Y. Differences?`,
      marks: 6,
      type: "THEORY",
      difficulty: "MEDIUM",
    },
    {
      id: "viva_5",
      question_text: `Give real-world application of ${courseId}.`,
      marks: 5,
      type: "THEORY",
      difficulty: "EASY",
    },
  ];

  // In real implementation, generate from course topics, COs, PYQs via AI
  // For now, mock

  return vivaQuestions.slice(0, count);
}

// Answer evaluation (mock, real would use AI)
export function evaluateAnswer(question: TestQuestion, answer: string): AnswerEvaluation {
  // Simple heuristic: Check length, keywords, etc.
  // Real would use AI to evaluate vs rubric

  const lowerAnswer = answer.toLowerCase();
  const lowerQuestion = question.question_text.toLowerCase();

  let score = 0;
  const strengths: string[] = [];
  const improvements: string[] = [];
  let error_type: AnswerEvaluation["error_type"] | undefined;

  // Check if answer is too short
  if (answer.trim().length < 20) {
    score = Math.floor(question.marks * 0.2);
    improvements.push("Answer too short, elaborate with examples and explanation");
    error_type = "PRESENTATION";
  } else if (answer.trim().length < 100) {
    score = Math.floor(question.marks * 0.5);
    improvements.push("Add more details, examples, diagrams description");
  } else {
    score = Math.floor(question.marks * 0.7);
    strengths.push("Good length and attempt");

    // Check for keywords from question
    const questionKeywords = lowerQuestion.split(/\s+/).filter((w) => w.length > 4);
    let keywordMatches = 0;
    for (const kw of questionKeywords) {
      if (lowerAnswer.includes(kw)) keywordMatches++;
    }

    if (keywordMatches >= questionKeywords.length * 0.5) {
      score = Math.floor(question.marks * 0.8);
      strengths.push("Covers key concepts from question");
    } else {
      improvements.push("Include more key terms from question");
      error_type = "CONCEPTUAL";
    }

    // Check for common mistakes
    if (lowerAnswer.includes("i think") || lowerAnswer.includes("maybe")) {
      improvements.push("Be more confident, avoid 'I think', 'maybe' — state clearly");
      error_type = "PRESENTATION";
    }
  }

  // Cap score
  score = Math.min(score, question.marks);

  let feedback = "";
  if (score >= question.marks * 0.8) {
    feedback = "Excellent answer! Covers key points, good presentation.";
  } else if (score >= question.marks * 0.5) {
    feedback = "Good attempt, but can improve with more details, examples, and structure.";
  } else {
    feedback = "Needs improvement. Focus on understanding concepts, not just memorizing. Add examples, diagrams, and clear explanation.";
  }

  return {
    question_id: question.id,
    score,
    max_marks: question.marks,
    feedback,
    strengths,
    improvements,
    error_type,
  };
}

// Error classification
export function classifyErrors(evaluations: AnswerEvaluation[]): Record<string, number> {
  const classification: Record<string, number> = {
    CONCEPTUAL: 0,
    CALCULATION: 0,
    PRESENTATION: 0,
    TIME_MANAGEMENT: 0,
  };

  for (const ev of evaluations) {
    if (ev.error_type) {
      classification[ev.error_type]++;
    }
  }

  return classification;
}
