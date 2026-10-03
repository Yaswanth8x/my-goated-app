// ============================================================
// Academic Engine — Curriculum Ingestion
// Workspace 3 Parts 51-57
// ============================================================

export interface CurriculumCourse {
  code: string;
  name: string;
  semester: number;
  credits: number;
  regulation?: string;
  description?: string;
  is_elective?: boolean;
  units?: {
    number: number;
    title: string;
    description?: string;
    topics?: string[];
  }[];
  cos?: {
    code: string;
    description: string;
  }[];
  prerequisites?: string[]; // course codes
}

export interface SemesterStructure {
  number: number;
  name: string;
  total_credits: number;
  is_current?: boolean;
  regulation?: string;
  courses: CurriculumCourse[];
}

// Sample ECE curriculum — 8 semesters, ~170 credits, labelled unofficial sample ingest
// Replace with official Anna University syllabus when available
export const sampleCurriculum: SemesterStructure[] = [
  {
    number: 1,
    name: "Semester 1",
    total_credits: 20,
    regulation: "R2021",
    courses: [
      {
        code: "HS3152",
        name: "Professional English I",
        semester: 1,
        credits: 3,
        description: "English for academic and professional communication",
        units: [
          { number: 1, title: "Introduction to Effective Communication", topics: ["Communication", "Listening", "Speaking"] },
          { number: 2, title: "Reading and Language Development", topics: ["Reading", "Vocabulary", "Grammar"] },
          { number: 3, title: "Writing", topics: ["Writing", "Paragraph", "Essay"] },
          { number: 4, title: "Professional Communication", topics: ["Presentation", "Group Discussion"] },
          { number: 5, title: "Workplace Communication", topics: ["Email", "Report", "Resume"] },
        ],
        cos: [
          { code: "CO1", description: "Use English effectively" },
          { code: "CO2", description: "Develop reading skills" },
          { code: "CO3", description: "Write effectively" },
        ],
      },
      {
        code: "MA3151",
        name: "Matrices and Calculus",
        semester: 1,
        credits: 4,
        description: "Matrices, differential and integral calculus",
        units: [
          { number: 1, title: "Matrices", topics: ["Eigenvalues", "Eigenvectors", "Diagonalization"] },
          { number: 2, title: "Differential Calculus", topics: ["Limits", "Derivatives", "Applications"] },
          { number: 3, title: "Functions of Several Variables", topics: ["Partial derivatives", "Jacobian"] },
          { number: 4, title: "Integral Calculus", topics: ["Multiple integrals", "Applications"] },
          { number: 5, title: "Vector Calculus", topics: ["Gradient", "Divergence", "Curl"] },
        ],
        cos: [
          { code: "CO1", description: "Use matrices" },
          { code: "CO2", description: "Apply differential calculus" },
          { code: "CO3", description: "Apply integral calculus" },
        ],
      },
      {
        code: "PH3151",
        name: "Engineering Physics",
        semester: 1,
        credits: 3,
        description: "Physics for engineers",
        units: [
          { number: 1, title: "Crystal Physics", topics: ["Crystal structure", "Defects"] },
          { number: 2, title: "Properties of Matter and Thermal Physics", topics: ["Elasticity", "Thermal"] },
          { number: 3, title: "Quantum Physics", topics: ["Schrodinger", "Particles"] },
          { number: 4, title: "Applied Optics", topics: ["Interference", "Diffraction"] },
          { number: 5, title: "Applied Quantum Mechanics", topics: ["Semiconductors", "Superconductors"] },
        ],
        cos: [{ code: "CO1", description: "Understand crystal physics" }],
      },
      {
        code: "CY3151",
        name: "Engineering Chemistry",
        semester: 1,
        credits: 3,
        description: "Chemistry for engineers",
        units: [
          { number: 1, title: "Water Technology", topics: ["Hard water", "Treatment"] },
          { number: 2, title: "Polymers", topics: ["Polymerization", "Types"] },
          { number: 3, title: "Electrochemistry", topics: ["Cells", "Corrosion"] },
        ],
        cos: [{ code: "CO1", description: "Understand water technology" }],
      },
      {
        code: "GE3151",
        name: "Problem Solving and Python Programming",
        semester: 1,
        credits: 3,
        description: "Python programming and problem solving",
        units: [
          { number: 1, title: "Algorithmic Problem Solving", topics: ["Algorithms", "Flowcharts"] },
          { number: 2, title: "Data, Expressions, Statements", topics: ["Variables", "Operators"] },
          { number: 3, title: "Control Flow, Functions", topics: ["If", "Loops", "Functions"] },
          { number: 4, title: "Lists, Tuples, Dictionaries", topics: ["Lists", "Tuples", "Dicts"] },
          { number: 5, title: "Files, Modules, Packages", topics: ["Files", "Modules"] },
        ],
        cos: [{ code: "CO1", description: "Develop algorithmic thinking" }],
      },
    ],
  },
  {
    number: 2,
    name: "Semester 2",
    total_credits: 20,
    regulation: "R2021",
    courses: [
      { code: "HS3252", name: "Professional English II", semester: 2, credits: 3, description: "Advanced English" },
      { code: "MA3251", name: "Statistics and Numerical Methods", semester: 2, credits: 4, description: "Stats and numerical methods" },
      { code: "PH3256", name: "Physics for Information Science", semester: 2, credits: 3, description: "Physics for IT" },
      { code: "BE3251", name: "Basic Electrical and Electronics Engineering", semester: 2, credits: 3, description: "Basic EEE" },
      { code: "GE3251", name: "Engineering Graphics", semester: 2, credits: 4, description: "Engineering drawing" },
      { code: "GE3252", name: "Tamils and Technology", semester: 2, credits: 1, description: "Tamil heritage" },
    ],
  },
  {
    number: 3,
    name: "Semester 3",
    total_credits: 22,
    regulation: "R2021",
    is_current: true,
    courses: [
      {
        code: "MA3354",
        name: "Discrete Mathematics",
        semester: 3,
        credits: 4,
        description: "Discrete math for ECE",
        prerequisites: ["MA3151"],
        units: [
          { number: 1, title: "Logic and Proofs", topics: ["Propositional logic", "Predicates", "Proofs"] },
          { number: 2, title: "Combinatorics", topics: ["Counting", "Pigeonhole", "Inclusion-exclusion"] },
          { number: 3, title: "Graphs", topics: ["Graphs", "Trees", "Connectivity"] },
          { number: 4, title: "Algebraic Structures", topics: ["Groups", "Rings", "Fields"] },
          { number: 5, title: "Lattices and Boolean Algebra", topics: ["Lattices", "Boolean algebra"] },
        ],
        cos: [
          { code: "CO1", description: "Apply logic and proofs" },
          { code: "CO2", description: "Apply combinatorics" },
        ],
      },
      {
        code: "CS3353",
        name: "C Programming and Data Structures",
        semester: 3,
        credits: 3,
        description: "C programming and data structures — core for ECE",
        prerequisites: ["GE3151"],
        units: [
          { number: 1, title: "C Programming Fundamentals", topics: ["Data types", "Operators", "Control flow"] },
          { number: 2, title: "Arrays, Strings, Functions", topics: ["Arrays", "Strings", "Functions", "Recursion"] },
          { number: 3, title: "Pointers and Structures", topics: ["Pointers", "Structures", "Unions", "Memory"] },
          { number: 4, title: "Linear Data Structures", topics: ["Linked lists", "Stacks", "Queues"] },
          { number: 5, title: "Non-linear Data Structures", topics: ["Trees", "Graphs", "Hashing"] },
        ],
        cos: [
          { code: "CO1", description: "Write C programs" },
          { code: "CO2", description: "Use pointers and structures" },
          { code: "CO3", description: "Implement data structures" },
        ],
      },
      {
        code: "EC3351",
        name: "Control Systems",
        semester: 3,
        credits: 3,
        description: "Control systems analysis",
        units: [
          { number: 1, title: "Systems and Representations", topics: ["Open loop", "Closed loop", "Transfer function"] },
          { number: 2, title: "Time Response", topics: ["Transient", "Steady state", "Error"] },
          { number: 3, title: "Frequency Response", topics: ["Bode", "Polar", "Nyquist"] },
          { number: 4, title: "Stability", topics: ["Routh", "Root locus"] },
          { number: 5, title: "Compensators and Controllers", topics: ["Lead", "Lag", "PID"] },
        ],
        cos: [{ code: "CO1", description: "Analyze control systems" }],
      },
      {
        code: "EC3352",
        name: "Digital Systems Design",
        semester: 3,
        credits: 3,
        description: "Digital electronics and design",
        units: [
          { number: 1, title: "Number Systems and Boolean Algebra", topics: ["Number systems", "Boolean algebra", "Gates"] },
          { number: 2, title: "Combinational Circuits", topics: ["K-Maps", "Adders", "Multiplexers"] },
          { number: 3, title: "Sequential Circuits", topics: ["Flip-flops", "Counters", "Registers"] },
          { number: 4, title: "Memory and Programmable Logic", topics: ["Memory", "PLD", "FPGA"] },
          { number: 5, title: "HDL and Design", topics: ["Verilog", "Design"] },
        ],
        cos: [{ code: "CO1", description: "Design digital circuits" }],
      },
      {
        code: "EC3353",
        name: "Electronic Devices",
        semester: 3,
        credits: 3,
        description: "Semiconductor devices",
        units: [
          { number: 1, title: "Semiconductor Physics", topics: ["Intrinsic", "Extrinsic", "PN junction"] },
          { number: 2, title: "Diodes", topics: ["PN diode", "Zener", "Applications"] },
          { number: 3, title: "BJT", topics: ["BJT operation", "Configurations", "Biasing"] },
          { number: 4, title: "FET", topics: ["JFET", "MOSFET", "Biasing"] },
          { number: 5, title: "Special Devices", topics: ["LED", "Photodiode", "SCR"] },
        ],
        cos: [{ code: "CO1", description: "Understand electronic devices" }],
      },
      {
        code: "EC3354",
        name: "Signals and Systems",
        semester: 3,
        credits: 4,
        description: "Signals and systems analysis",
        units: [
          { number: 1, title: "Classification of Signals and Systems", topics: ["Continuous", "Discrete", "Properties"] },
          { number: 2, title: "Analysis of Continuous Time Signals", topics: ["Fourier series", "Fourier transform"] },
          { number: 3, title: "Linear Time Invariant Continuous Time Systems", topics: ["Impulse response", "Convolution"] },
          { number: 4, title: "Analysis of Discrete Time Signals", topics: ["DTFT", "DFT", "Z-transform"] },
          { number: 5, title: "Linear Time Invariant Discrete Time Systems", topics: ["Difference equations", "Realization"] },
        ],
        cos: [{ code: "CO1", description: "Analyze signals and systems" }],
      },
    ],
  },
  // Semesters 4-8 as placeholders with total ~170 credits
  {
    number: 4,
    name: "Semester 4",
    total_credits: 22,
    regulation: "R2021",
    courses: [
      { code: "EC3401", name: "Networks and Security", semester: 4, credits: 3, description: "Networks and security" },
      { code: "EC3402", name: "Communication Systems", semester: 4, credits: 3, description: "Analog and digital communication" },
      { code: "EC3451", name: "Linear Integrated Circuits", semester: 4, credits: 3, description: "Op-amps and linear ICs" },
      { code: "EC3452", name: "Electromagnetic Fields", semester: 4, credits: 4, description: "EM fields and waves" },
      { code: "EC3403", name: "Electronic Circuits", semester: 4, credits: 3, description: "Electronic circuits" },
    ],
  },
  {
    number: 5,
    name: "Semester 5",
    total_credits: 22,
    regulation: "R2021",
    courses: [
      { code: "EC3501", name: "Wireless Communication", semester: 5, credits: 3, description: "Wireless comm" },
      { code: "EC3551", name: "Transmission Lines and RF Systems", semester: 5, credits: 3, description: "TL and RF" },
      { code: "EC3552", name: "VLSI and Chip Design", semester: 5, credits: 3, description: "VLSI" },
    ],
  },
  {
    number: 6,
    name: "Semester 6",
    total_credits: 22,
    regulation: "R2021",
    courses: [
      { code: "EC3601", name: "Microwave and Optical Communication", semester: 6, credits: 3, description: "Microwave and optical" },
      { code: "EC3602", name: "Embedded Systems and IoT", semester: 6, credits: 3, description: "Embedded and IoT" },
    ],
  },
  {
    number: 7,
    name: "Semester 7",
    total_credits: 22,
    regulation: "R2021",
    courses: [
      { code: "EC3701", name: "5G and Beyond", semester: 7, credits: 3, description: "5G" },
      { code: "EC3711", name: "Summer Internship", semester: 7, credits: 2, description: "Internship" },
    ],
  },
  {
    number: 8,
    name: "Semester 8",
    total_credits: 20,
    regulation: "R2021",
    courses: [
      { code: "EC3811", name: "Project Work", semester: 8, credits: 10, description: "Final year project" },
      { code: "EC3001", name: "Elective", semester: 8, credits: 3, description: "Elective" },
    ],
  },
];

// Helper functions

export function getSemester(number: number): SemesterStructure | undefined {
  return sampleCurriculum.find((s) => s.number === number);
}

export function getCourseByCode(code: string): CurriculumCourse | undefined {
  for (const sem of sampleCurriculum) {
    const course = sem.courses.find((c) => c.code === code);
    if (course) return course;
  }
  return undefined;
}

export function getAllCourses(): CurriculumCourse[] {
  return sampleCurriculum.flatMap((s) => s.courses);
}

export function getTotalCredits(): number {
  return sampleCurriculum.reduce((sum, sem) => sum + sem.total_credits, 0);
}

export function getPrerequisiteGraph(): Record<string, string[]> {
  const graph: Record<string, string[]> = {};

  for (const course of getAllCourses()) {
    graph[course.code] = course.prerequisites || [];
  }

  return graph;
}

// Curriculum ingestion from external file (e.g., PDF syllabus)
// This would parse official Anna University syllabus PDFs
// For now, placeholder that returns sample

export function ingestCurriculumFromText(text: string): CurriculumCourse[] {
  // Simple heuristic: Look for course codes like EC3401, CS3353, etc.
  const courseCodeRegex = /\b[A-Z]{2}\d{4}\b/g;
  const codes = text.match(courseCodeRegex) || [];

  // For each code, try to find name nearby
  // This is placeholder — real implementation would use more sophisticated parsing

  const courses: CurriculumCourse[] = codes.slice(0, 20).map((code) => ({
    code,
    name: `Course ${code} — Extracted from syllabus (verify official)`,
    semester: 3,
    credits: 3,
    description: `Extracted from uploaded syllabus text — labelled unofficial sample ingest. Verify with official Anna University syllabus.`,
  }));

  return courses;
}
