import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { getSemester } from "@/lib/academic/curriculum";
import { ArrowLeft } from "lucide-react";

export default function SemesterPage({ params }: { params: { semesterId: string } }) {
  const semNumber = parseInt(params.semesterId, 10);
  const semester = getSemester(semNumber);

  if (!semester) {
    return (
      <div className="space-y-4">
        <p>Semester {semNumber} not found</p>
        <Link href="/academics">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Academics
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/academics">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{semester.name}</h1>
          <p className="text-muted-foreground">
            {semester.total_credits} credits • {semester.regulation} • {semester.courses.length} courses {semester.is_current && "• Current"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {semester.courses.map((course) => (
          <Link key={course.code} href={`/academics/${semNumber}/${course.code}`}>
            <Card className="hover:shadow-md cursor-pointer h-full">
              <CardHeader>
                <CardTitle className="text-base">
                  {course.code} — {course.name}
                </CardTitle>
                <CardDescription>
                  {course.credits} credits • {course.description?.slice(0, 60)}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-xs space-y-1">
                <p>Units: {course.units?.length || 5} • COs: {course.cos?.length || 5}</p>
                {course.prerequisites && course.prerequisites.length > 0 && <p>Prereqs: {course.prerequisites.join(", ")}</p>}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
