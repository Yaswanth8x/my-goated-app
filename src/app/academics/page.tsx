import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { sampleCurriculum, getTotalCredits } from "@/lib/academic/curriculum";

export default function AcademicsPage() {
  const totalCredits = getTotalCredits();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">ACADEMICS — CEG ECE</h1>
        <p className="text-muted-foreground">
          8 Semesters • {totalCredits} Credits (Sample, Unofficial) • Course AI Professors • PYQs • Tests • Mastery • CGPA
        </p>
      </div>

      <Card className="border-indigo-200 bg-indigo-50/50 dark:bg-indigo-950/20">
        <CardHeader>
          <CardTitle className="text-indigo-700 dark:text-indigo-300">Course AI Workspace UX — Target</CardTitle>
          <CardDescription>When you click ACADEMICS → SEMESTER 1 → PROGRAMMING IN C, you should see:</CardDescription>
        </CardHeader>
        <CardContent className="text-sm space-y-1">
          <p>COURSE OVERVIEW, UNITS, TOPICS, COs, AI PROFESSOR (central), NOTES, DOCUMENTS, PYQs, PRACTICE, TESTS, VIVA, MASTERY, MISTAKES, REVISION, ANALYTICS</p>
          <p className="text-muted-foreground">AI is central, not decorative cards. Function {" > "} Decoration.</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {sampleCurriculum.map((sem) => (
          <Link key={sem.number} href={`/academics/${sem.number}`}>
            <Card className="hover:shadow-md cursor-pointer h-full">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Semester {sem.number}
                  {sem.is_current && <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">Current</span>}
                </CardTitle>
                <CardDescription>
                  {sem.total_credits} credits • {sem.regulation} • {sem.courses.length} courses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-xs space-y-1">
                  {sem.courses.slice(0, 3).map((course) => (
                    <div key={course.code} className="truncate">
                      {course.code} - {course.name}
                    </div>
                  ))}
                  {sem.courses.length > 3 && <div className="text-muted-foreground">+{sem.courses.length - 3} more</div>}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Academic Engine — Parts 51-75</CardTitle>
          <CardDescription>Curriculum ingestion, CO mastery, PYQ analysis, test simulators, CGPA</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-medium">✅ Implemented (51-57):</p>
            <ul className="list-disc pl-5 text-muted-foreground">
              <li>Curriculum ingestion (sampleCurriculum, ingestCurriculumFromText)</li>
              <li>Course DB (Course model, getCourseByCode)</li>
              <li>Semester structure (8 semesters, ~170 credits)</li>
              <li>Units/topics (5 units per course, 3 topics per unit)</li>
              <li>COs (5 COs per course)</li>
              <li>CO mastery (calculateCourseMastery, weak/strong concepts)</li>
              <li>Prerequisite graph (getPrerequisiteGraph)</li>
            </ul>
          </div>
          <div>
            <p className="font-medium">⏳ Next (58-75):</p>
            <ul className="list-disc pl-5 text-muted-foreground">
              <li>PYQ upload, extraction, classification, family, frequency, HIGH/MEDIUM/LOWER relevance</li>
              <li>Question generator, CA-1/CA-2/End-sem simulators, Viva, Answer evaluation, Error classification</li>
              <li>Spaced revision (SM-2), Mastery engine, CGPA/GPA engine (honest), Academic dashboard</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
