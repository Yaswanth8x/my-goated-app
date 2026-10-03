// ============================================================
// Prisma Seed — Sample Data for Polymath OS
// Workspace 1 Part 15-16
// ============================================================

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Semesters 1-8
  const semesters = [];
  for (let i = 1; i <= 8; i++) {
    const sem = await prisma.semester.upsert({
      where: { number: i },
      update: {},
      create: {
        number: i,
        name: `Semester ${i}`,
        total_credits: i <= 2 ? 20 : 22,
        is_current: i === 3, // Example: current sem 3
        regulation: "R2021",
      },
    });
    semesters.push(sem);
    console.log(`  Created ${sem.name}`);
  }

  // Sample Courses (ECE)
  const sampleCourses = [
    { code: "HS3152", name: "Professional English I", sem: 1, credits: 3 },
    { code: "MA3151", name: "Matrices and Calculus", sem: 1, credits: 4 },
    { code: "PH3151", name: "Engineering Physics", sem: 1, credits: 3 },
    { code: "CY3151", name: "Engineering Chemistry", sem: 1, credits: 3 },
    { code: "GE3151", name: "Problem Solving and Python Programming", sem: 1, credits: 3 },
    { code: "GE3152", name: "Heritage of Tamils", sem: 1, credits: 1 },
    { code: "EC3401", name: "Networks and Security", sem: 3, credits: 3 },
    { code: "EC3402", name: "Communication Systems", sem: 3, credits: 3 },
    { code: "EC3351", name: "Control Systems", sem: 3, credits: 3 },
    { code: "EC3352", name: "Digital Systems Design", sem: 3, credits: 3 },
    { code: "CS3353", name: "C Programming and Data Structures", sem: 3, credits: 3 },
    { code: "EC3353", name: "Electronic Devices", sem: 3, credits: 3 },
  ];

  for (const c of sampleCourses) {
    const semester = semesters.find((s) => s.number === c.sem);
    const course = await prisma.course.upsert({
      where: { code: c.code },
      update: {},
      create: {
        code: c.code,
        name: c.name,
        semester_id: semester?.id,
        credits: c.credits,
        regulation: "R2021",
        description: `Sample course ${c.name} — labelled unofficial sample ingest. Replace with official Anna University syllabus.`,
      },
    });
    console.log(`  Created course ${course.code}`);

    // Create 5 units per course
    for (let u = 1; u <= 5; u++) {
      const unit = await prisma.unit.upsert({
        where: {
          course_id_number: {
            course_id: course.id,
            number: u,
          },
        },
        update: {},
        create: {
          course_id: course.id,
          number: u,
          title: `Unit ${u}: ${c.name} - Unit ${u}`,
          description: `Sample unit ${u} for ${c.name}`,
        },
      });

      // 3 topics per unit
      for (let t = 1; t <= 3; t++) {
        await prisma.topic.createMany({
          data: [
            {
              unit_id: unit.id,
              title: `Topic ${u}.${t}: Sample Topic`,
              description: `Sample topic ${u}.${t}`,
            },
          ],
          skipDuplicates: true,
        });
      }
    }

    // Create 5 COs per course
    for (let co = 1; co <= 5; co++) {
      await prisma.courseOutcome.upsert({
        where: {
          course_id_code: {
            course_id: course.id,
            code: `CO${co}`,
          },
        },
        update: {},
        create: {
          course_id: course.id,
          code: `CO${co}`,
          description: `Course Outcome ${co} for ${c.name} — sample`,
        },
      });
    }
  }

  // Skills
  const skills = [
    { name: "Web Development", category: "Development" },
    { name: "App Development", category: "Development" },
    { name: "Full Stack", category: "Development" },
    { name: "AI Automation", category: "AI" },
    { name: "Video Editing", category: "Media" },
    { name: "Photography", category: "Media" },
    { name: "Cybersecurity", category: "Security" },
    { name: "Finance", category: "Business" },
  ];

  for (const s of skills) {
    await prisma.skill.upsert({
      where: { name: s.name },
      update: {},
      create: {
        name: s.name,
        category: s.category,
        description: `Skill: ${s.name}`,
      },
    });
    console.log(`  Created skill ${s.name}`);
  }

  // Builtin Experts
  const builtinExperts = [
    {
      name: "ECE Professor",
      persona: "Deep explainer, Socratic teacher, exam analyst, problem solver, visual teacher, viva examiner, mentor. Feynman-style clarity.",
      expertise: "Electronics and Communication Engineering, all semesters",
      is_builtin: true,
    },
    {
      name: "Web Development Expert",
      persona: "Senior full-stack developer, mentor, project-based teaching",
      expertise: "HTML, CSS, JavaScript, React, Next.js, Node.js",
      is_builtin: true,
    },
    {
      name: "Photography Expert",
      persona: "Professional photographer, visual storytelling, technical and artistic",
      expertise: "Photography, composition, lighting, editing",
      is_builtin: true,
    },
    {
      name: "Global Orchestrator",
      persona: "Coordination expert, not a teacher. Understands academics, skills, projects, deadlines, mastery, career, portfolio, freelancing. Answers 'What should I do next?' with prioritization.",
      expertise: "Polymath coordination, goal setting, priority management, anti-overload",
      is_builtin: true,
    },
  ];

  for (const e of builtinExperts) {
    await prisma.expert.upsert({
      where: { id: e.name.toLowerCase().replace(/\s+/g, "-") },
      update: {},
      create: {
        id: e.name.toLowerCase().replace(/\s+/g, "-"),
        name: e.name,
        persona: e.persona,
        expertise: e.expertise,
        is_builtin: true,
        is_custom: false,
      },
    });
    console.log(`  Created expert ${e.name}`);
  }

  // Model Registry — sample models
  const models = [
    {
      provider: "mock",
      model_id: "mock-v1",
      display_name: "Mock Provider (Free, No Credits)",
      capabilities: { text: true, vision: false, tools: false },
      context_window: 4096,
      supports_vision: false,
      cost_class: "FREE" as const,
      enabled: true,
    },
    {
      provider: "openai",
      model_id: "gpt-4o-mini",
      display_name: "OpenAI GPT-4o Mini (Low Cost)",
      capabilities: { text: true, vision: true, tools: true },
      context_window: 128000,
      supports_vision: true,
      supports_tools: true,
      cost_class: "LOW_COST" as const,
      enabled: true,
    },
    {
      provider: "gemini",
      model_id: "gemini-1.5-flash",
      display_name: "Gemini 1.5 Flash (Free Tier)",
      capabilities: { text: true, vision: true, tools: true },
      context_window: 1000000,
      supports_vision: true,
      cost_class: "FREE" as const,
      enabled: true,
    },
    {
      provider: "anthropic",
      model_id: "claude-3-5-sonnet-20241022",
      display_name: "Claude 3.5 Sonnet (Premium)",
      capabilities: { text: true, vision: true, tools: true, reasoning: true },
      context_window: 200000,
      supports_vision: true,
      cost_class: "PREMIUM" as const,
      enabled: true,
    },
  ];

  for (const m of models) {
    await prisma.modelRegistry.upsert({
      where: { model_id: m.model_id },
      update: {},
      create: m,
    });
    console.log(`  Created model ${m.model_id}`);
  }

  console.log("✅ Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
