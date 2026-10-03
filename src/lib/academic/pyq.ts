// ============================================================
// Academic Engine — PYQ Analysis
// Workspace 3 Parts 58-64
// ============================================================

export type ExamType = "CA1" | "CA2" | "ENDSEM" | "ASSIGNMENT" | "OTHER";
export type RelevanceLevel = "HIGH" | "MEDIUM" | "LOWER"; // Historical relevance, not guarantee

export interface Pyq {
  id: string;
  course_id: string;
  unit_id?: string;
  year: number;
  exam_type: ExamType;
  question_text: string;
  marks?: number;
  co_id?: string;
  topic_id?: string;
  difficulty?: "EASY" | "MEDIUM" | "HARD";
  type?: "THEORY" | "PROBLEM" | "DERIVATION" | "DIAGRAM";
  source_file?: string;
  created_at: string;
}

export interface QuestionFamily {
  id: string;
  representative_question: string;
  pattern: string; // e.g., "Explain X with diagram"
  count: number;
  pyq_ids: string[];
  course_id: string;
}

export interface FrequencyAnalysis {
  family_id: string;
  count: number;
  years: number[]; // years when asked
  exam_types: ExamType[];
  avg_marks: number;
  relevance: RelevanceLevel;
  last_asked?: number;
}

export interface PyqClassification {
  pyq_id: string;
  co_id?: string;
  topic_id?: string;
  unit_id?: string;
  family_id?: string;
  relevance: RelevanceLevel;
}

// Classify PYQ by unit, CO, marks, type
export function classifyPyq(pyq: Pyq, courseUnits: { id: string; number: number; title: string }[]): PyqClassification {
  // Simple heuristic: Look for unit keywords in question
  const lowerQuestion = pyq.question_text.toLowerCase();

  let unit_id: string | undefined;
  let relevance: RelevanceLevel = "MEDIUM";

  // Try to match unit
  for (const unit of courseUnits) {
    const unitKeywords = unit.title.toLowerCase().split(/\s+/);
    for (const keyword of unitKeywords) {
      if (keyword.length > 3 && lowerQuestion.includes(keyword)) {
        unit_id = unit.id;
        break;
      }
    }
    if (unit_id) break;
  }

  // Determine relevance based on marks and frequency (mock logic)
  if (pyq.marks && pyq.marks >= 8) {
    relevance = "HIGH";
  } else if (pyq.marks && pyq.marks >= 5) {
    relevance = "MEDIUM";
  } else {
    relevance = "LOWER";
  }

  return {
    pyq_id: pyq.id,
    unit_id,
    relevance,
  };
}

// Detect question families (similar questions)
export function detectQuestionFamilies(pyqs: Pyq[]): QuestionFamily[] {
  const families: QuestionFamily[] = [];
  const grouped: Record<string, Pyq[]> = {};

  // Group by pattern: e.g., "Explain X with diagram" → family
  for (const pyq of pyqs) {
    // Extract pattern: first 3 words + last 2 words, or question type
    const words = pyq.question_text.split(/\s+/);
    let pattern = "";

    if (pyq.question_text.toLowerCase().includes("explain") && pyq.question_text.toLowerCase().includes("diagram")) {
      pattern = "Explain with diagram";
    } else if (pyq.question_text.toLowerCase().includes("derive")) {
      pattern = "Derivation";
    } else if (pyq.question_text.toLowerCase().includes("solve") || pyq.question_text.toLowerCase().includes("calculate")) {
      pattern = "Problem solving";
    } else if (pyq.question_text.toLowerCase().includes("what is") || pyq.question_text.toLowerCase().includes("define")) {
      pattern = "Definition";
    } else {
      pattern = words.slice(0, 3).join(" ");
    }

    if (!grouped[pattern]) grouped[pattern] = [];
    grouped[pattern].push(pyq);
  }

  // Create families
  let familyId = 1;
  for (const [pattern, pyqList] of Object.entries(grouped)) {
    if (pyqList.length >= 2) {
      families.push({
        id: `family_${familyId++}`,
        representative_question: pyqList[0].question_text,
        pattern,
        count: pyqList.length,
        pyq_ids: pyqList.map((p) => p.id),
        course_id: pyqList[0].course_id,
      });
    }
  }

  return families;
}

// Frequency analysis
export function analyzeFrequency(pyqs: Pyq[], families: QuestionFamily[]): FrequencyAnalysis[] {
  const analysis: FrequencyAnalysis[] = [];

  for (const family of families) {
    const familyPyqs = pyqs.filter((p) => family.pyq_ids.includes(p.id));
    const years = [...new Set(familyPyqs.map((p) => p.year))].sort();
    const exam_types = [...new Set(familyPyqs.map((p) => p.exam_type))] as ExamType[];
    const avg_marks = familyPyqs.reduce((sum, p) => sum + (p.marks || 0), 0) / familyPyqs.length;
    const last_asked = Math.max(...years);

    // Determine relevance based on count and recency
    let relevance: RelevanceLevel = "LOWER";
    if (family.count >= 4 && last_asked >= new Date().getFullYear() - 2) {
      relevance = "HIGH";
    } else if (family.count >= 2) {
      relevance = "MEDIUM";
    }

    analysis.push({
      family_id: family.id,
      count: family.count,
      years,
      exam_types,
      avg_marks,
      relevance,
      last_asked,
    });
  }

  return analysis.sort((a, b) => {
    // Sort by relevance HIGH first, then count
    const relevanceOrder = { HIGH: 0, MEDIUM: 1, LOWER: 2 };
    if (relevanceOrder[a.relevance] !== relevanceOrder[b.relevance]) {
      return relevanceOrder[a.relevance] - relevanceOrder[b.relevance];
    }
    return b.count - a.count;
  });
}

// Three-level probability classification (never guarantee future)
export function classifyRelevance(frequency: FrequencyAnalysis): {
  level: RelevanceLevel;
  explanation: string;
  disclaimer: string;
} {
  let explanation = "";
  let disclaimer = "This is HISTORICAL RELEVANCE based on past PYQs, not a guarantee of future questions. Always prepare all topics.";

  switch (frequency.relevance) {
    case "HIGH":
      explanation = `HIGH HISTORICAL RELEVANCE: Asked ${frequency.count} times in years ${frequency.years.join(", ")}, last asked ${frequency.last_asked}, avg ${frequency.avg_marks} marks. This pattern has high historical frequency.`;
      break;
    case "MEDIUM":
      explanation = `MEDIUM HISTORICAL RELEVANCE: Asked ${frequency.count} times in years ${frequency.years.join(", ")}, avg ${frequency.avg_marks} marks. Moderate historical frequency.`;
      break;
    case "LOWER":
      explanation = `LOWER HISTORICAL RELEVANCE: Asked ${frequency.count} time(s) in years ${frequency.years.join(", ")}. Lower historical frequency, but could still appear.`;
      break;
  }

  return { level: frequency.relevance, explanation, disclaimer };
}

// Question generator from PYQ patterns
export function generateQuestionsFromFamilies(families: QuestionFamily[], count: number = 5): string[] {
  const generated: string[] = [];

  for (let i = 0; i < Math.min(count, families.length); i++) {
    const family = families[i];
    // Generate similar question by rephrasing representative
    const base = family.representative_question;

    // Simple generation: Replace X with Y, or add "with diagram", "with example", etc.
    const variations = [
      base,
      base.replace("Explain", "Describe") + " with neat diagram",
      base.replace("What is", "Define and explain") + " with example",
      `Derive ${base.toLowerCase()}`,
      `Solve: ${base}`,
    ];

    generated.push(variations[Math.floor(Math.random() * variations.length)]);
  }

  return generated;
}

// Mock PYQs for testing
export function getMockPyqs(courseId: string): Pyq[] {
  return [
    {
      id: "pyq1",
      course_id: courseId,
      year: 2024,
      exam_type: "ENDSEM",
      question_text: "Explain pointers in C with neat diagram and example (8 marks)",
      marks: 8,
      type: "THEORY",
      difficulty: "MEDIUM",
      created_at: new Date().toISOString(),
    },
    {
      id: "pyq2",
      course_id: courseId,
      year: 2023,
      exam_type: "ENDSEM",
      question_text: "Explain pointers in C with example (10 marks)",
      marks: 10,
      type: "THEORY",
      difficulty: "MEDIUM",
      created_at: new Date().toISOString(),
    },
    {
      id: "pyq3",
      course_id: courseId,
      year: 2023,
      exam_type: "CA1",
      question_text: "What is pointer? Define with example (5 marks)",
      marks: 5,
      type: "THEORY",
      difficulty: "EASY",
      created_at: new Date().toISOString(),
    },
    {
      id: "pyq4",
      course_id: courseId,
      year: 2022,
      exam_type: "ENDSEM",
      question_text: "Derive pointer arithmetic with example (8 marks)",
      marks: 8,
      type: "DERIVATION",
      difficulty: "HARD",
      created_at: new Date().toISOString(),
    },
    {
      id: "pyq5",
      course_id: courseId,
      year: 2021,
      exam_type: "CA2",
      question_text: "Explain array of pointers vs pointer to array with diagram (6 marks)",
      marks: 6,
      type: "THEORY",
      difficulty: "MEDIUM",
      created_at: new Date().toISOString(),
    },
  ];
}
