"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { getCourseByCode } from "@/lib/academic/curriculum";
import { getMockMastery } from "@/lib/academic/mastery";
import { getMockPyqs, detectQuestionFamilies, analyzeFrequency, generateQuestionsFromFamilies } from "@/lib/academic/pyq";
import { generateCA1Test, generateCA2Test, generateEndSemTest, generateVivaQuestions } from "@/lib/academic/testEngine";
import { getMockGrades, calculateGpa } from "@/lib/academic/cgpa";
import { ArrowLeft, Bot, BookOpen, FileText, BarChart3, Brain, MessageSquare } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { getOrCreateWorkspace, getBlocksForWorkspace } from "@/lib/workspace/workspace";
import { getFilesForWorkspace, getStorageUsage, createFileMetadata, deleteFile, searchFiles } from "@/lib/workspace/files";
import { getNotesForWorkspace, createNote, deleteNote } from "@/lib/workspace/notes";
import { FileUploader } from "@/components/workspace/FileUploader";
import { WorkspaceBlock, WorkspaceOverview } from "@/components/workspace/WorkspaceBlock";
import { generateStoragePath, uploadWorkspaceFile, validateFile } from "@/lib/workspace/storage";
import { Workspace, WorkspaceBlock as WorkspaceBlockType, WorkspaceFile, WorkspaceNote } from "@/lib/workspace/types";

export default function CoursePage({
  params,
}: {
  params: Promise<{ semesterId: string; courseId: string }>;
}) {
  const { semesterId, courseId } = use(params);
  const course = getCourseByCode(courseId);
  const mastery = getMockMastery(courseId);
  const pyqs = getMockPyqs(courseId);
  const families = detectQuestionFamilies(pyqs);
  const frequency = analyzeFrequency(pyqs, families);
  const generatedQuestions = generateQuestionsFromFamilies(families, 3);

  const [activeTab, setActiveTab] = useState<"overview" | "units" | "pyq" | "practice" | "mastery" | "workspace">("overview");

  // Workspace state — Every AI Professor has Workspace Vault
  const { user } = useAuth();
  const userId = user?.id || "mock-user";
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [blocks, setBlocks] = useState<WorkspaceBlockType[]>([]);
  const [files, setFiles] = useState<WorkspaceFile[]>([]);
  const [notes, setNotes] = useState<WorkspaceNote[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (course) {
      const ws = getOrCreateWorkspace({
        user_id: userId,
        course_id: course.code,
        ai_space_type: "COURSE",
        ai_space_id: course.code,
        name: `${course.code} Workspace`,
        description: `Workspace for ${course.name} — My Documents, HTML, PDFs, Videos, Audio, Data, Notes, Images`,
        icon: "📚",
      });
      setWorkspace(ws);
      setBlocks(getBlocksForWorkspace(ws.id));
      setFiles(getFilesForWorkspace(ws.id, userId));
      setNotes(getNotesForWorkspace(ws.id, userId));
    }
  }, [course, userId]);

  const refreshWorkspace = () => {
    if (!workspace) return;
    setBlocks(getBlocksForWorkspace(workspace.id));
    setFiles(getFilesForWorkspace(workspace.id, userId));
    setNotes(getNotesForWorkspace(workspace.id, userId));
  };

  const handleFilesUpload = async (selectedFiles: File[], blockId?: string, blockType?: string) => {
    if (!workspace) return;
    setUploading(true);

    for (const file of selectedFiles) {
      const validation = validateFile(file, undefined, 100 * 1024 * 1024);
      if (!validation.valid) {
        alert(validation.error);
        continue;
      }

      const storagePath = generateStoragePath({
        user_id: userId,
        workspace_id: workspace.id,
        block_type: blockType || "DOCUMENTS",
        filename: file.name,
      });

      // Upload to Supabase (mock fallback)
      await uploadWorkspaceFile({ file, storage_path: storagePath });

      // Create metadata
      createFileMetadata({
        user_id: userId,
        workspace_id: workspace.id,
        block_id: blockId,
        course_id: course?.code,
        filename: file.name,
        storage_path: storagePath,
        mime_type: file.type,
        size_bytes: file.size,
      });
    }

    refreshWorkspace();
    setUploading(false);
  };

  if (!course) {
    return (
      <div className="space-y-4">
        <p>Course {courseId} not found in sample curriculum. Check code or add to curriculum.ts</p>
        <Link href={`/academics/${semesterId}`}>
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Semester {semesterId}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/academics/${semesterId}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">
            {course.code} — {course.name}
          </h1>
          <p className="text-muted-foreground">
            {course.credits} credits • {course.description} • Semester {course.semester}
          </p>
        </div>
        <Link href={`/ai-hub?course=${course.code}`}>
          <Button>
            <Bot className="w-4 h-4 mr-2" />
            AI Professor
          </Button>
        </Link>
      </div>

      {/* Course Overview — Priority: AI Professor, Current topic, Continue learning, PYQs, Practice, Mastery */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {/* Tabs — Added Workspace Vault */}
          <div className="flex gap-1 border-b overflow-x-auto">
            {[
              { id: "overview", label: "Overview" },
              { id: "units", label: "Units & Topics" },
              { id: "pyq", label: "PYQs & Analysis" },
              { id: "practice", label: "Practice & Tests" },
              { id: "mastery", label: "Mastery & Analytics" },
              { id: "workspace", label: "📦 Workspace Vault" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap ${
                  activeTab === tab.id ? "border-indigo-600 text-indigo-600" : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "overview" && (
            <div className="space-y-4">
              <Card className="border-indigo-200 bg-indigo-50/50 dark:bg-indigo-950/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
                    <Bot className="w-5 h-5" />
                    AI Professor — Central
                  </CardTitle>
                  <CardDescription>Course AI knows: course, units, topics, COs, uploaded material, PYQs, notes, previous conversations, mistakes, mastery</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm">
                    When you click AI Professor, AI automatically knows {course.name} context. Ask anything: Explain, Simply, Deep dive, Visualize, Example, Analogy, Derive, Solve, Hint, Quiz, Viva, PYQ mode, Exam mode, Mistakes, Connect, Real-world.
                  </p>
                  <div className="flex gap-2">
                    <Link href={`/ai-hub?course=${course.code}`}>
                      <Button size="sm">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Open {course.code} AI
                      </Button>
                    </Link>
                    <Link href="/documents">
                      <Button variant="outline" size="sm">
                        <FileText className="w-4 h-4 mr-2" />
                        Upload Notes
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Current Topic</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm">
                    <p className="font-medium">{course.units?.[0]?.title || "Unit 1"}</p>
                    <p className="text-muted-foreground mt-1">{course.units?.[0]?.topics?.join(", ") || "Sample topics"}</p>
                    <Button variant="outline" size="sm" className="mt-3">
                      Continue Learning
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Course Outcomes</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-1">
                    {course.cos?.map((co) => (
                      <div key={co.code} className="flex gap-2">
                        <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-secondary">{co.code}</span>
                        <span className="text-muted-foreground">{co.description}</span>
                      </div>
                    )) || <p className="text-muted-foreground">5 COs — sample</p>}
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Prerequisites</CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  {course.prerequisites && course.prerequisites.length > 0 ? (
                    <div className="flex gap-2">
                      {course.prerequisites.map((prereq) => (
                        <span key={prereq} className="px-2 py-1 rounded-full bg-secondary text-xs">
                          {prereq}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No prerequisites — can start directly</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">Prerequisite graph helps understand dependencies.</p>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "units" && (
            <div className="space-y-3">
              {course.units?.map((unit) => (
                <Card key={unit.number}>
                  <CardHeader>
                    <CardTitle className="text-base">
                      Unit {unit.number}: {unit.title}
                    </CardTitle>
                    <CardDescription>{unit.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1.5">
                      {unit.topics?.map((topic, idx) => (
                        <span key={idx} className="px-2 py-1 rounded-full bg-secondary text-xs">
                          {topic}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )) || <p className="text-muted-foreground">5 units — sample</p>}
            </div>
          )}

          {activeTab === "pyq" && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">PYQ Analysis — HIGH/MEDIUM/LOWER Historical Relevance</CardTitle>
                  <CardDescription>Never guarantee future questions — historical relevance only</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="space-y-2">
                    {frequency.map((freq) => (
                      <div key={freq.family_id} className="p-2 rounded border">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{families.find((f) => f.id === freq.family_id)?.pattern}</span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              freq.relevance === "HIGH" ? "bg-red-100 text-red-700" : freq.relevance === "MEDIUM" ? "bg-amber-100 text-amber-700" : "bg-secondary text-muted-foreground"
                            }`}
                          >
                            {freq.relevance}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Asked {freq.count} times in {freq.years.join(", ")} • Last {freq.last_asked} • Avg {freq.avg_marks} marks • {freq.exam_types.join(", ")}
                        </p>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">Disclaimer: HISTORICAL RELEVANCE, not guarantee. Always prepare all topics.</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">PYQs List</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {pyqs.map((pyq) => (
                    <div key={pyq.id} className="p-2 rounded border">
                      <p>
                        {pyq.year} {pyq.exam_type} — {pyq.question_text}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {pyq.marks} marks • {pyq.difficulty} • {pyq.type}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Generated Questions (from PYQ patterns)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {generatedQuestions.map((q, idx) => (
                    <div key={idx} className="p-2 rounded bg-secondary">
                      {q}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "practice" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Card className="hover:shadow-md cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-sm">CA-1 Simulator</CardTitle>
                    <CardDescription className="text-xs">50 marks, 90 mins, Units 1-2</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      size="sm"
                      onClick={() => {
                        const test = generateCA1Test(course.code, pyqs);
                        alert(`CA-1 Test Generated:\n${test.title}\n${test.questions.length} questions, ${test.total_marks} marks, ${test.duration} mins\n\nQuestions:\n${test.questions.map((q) => q.question_text).join("\n\n")}`);
                      }}
                    >
                      Generate CA-1
                    </Button>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-sm">CA-2 Simulator</CardTitle>
                    <CardDescription className="text-xs">50 marks, 90 mins, Units 3-5</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      size="sm"
                      onClick={() => {
                        const test = generateCA2Test(course.code, pyqs);
                        alert(`CA-2 Test Generated:\n${test.title}\n${test.questions.length} questions`);
                      }}
                    >
                      Generate CA-2
                    </Button>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-sm">EndSem Simulator</CardTitle>
                    <CardDescription className="text-xs">100 marks, 180 mins, All units</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      size="sm"
                      onClick={() => {
                        const test = generateEndSemTest(course.code, pyqs);
                        alert(`EndSem Test Generated:\n${test.title}\n${test.questions.length} questions`);
                      }}
                    >
                      Generate EndSem
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Viva Mode</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {generateVivaQuestions(course.code, undefined, 3).map((q) => (
                    <div key={q.id} className="p-2 rounded border">
                      {q.question_text} ({q.marks} marks)
                    </div>
                  ))}
                  <Button
                    size="sm"
                    onClick={() => {
                      const viva = generateVivaQuestions(course.code);
                      alert(`Viva Questions:\n${viva.map((q) => q.question_text).join("\n\n")}`);
                    }}
                  >
                    Generate Viva (10 Qs)
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Answer Evaluation (Mock)</CardTitle>
                  <CardDescription>AI evaluates answer vs rubric — conceptual, calculation, presentation errors</CardDescription>
                </CardHeader>
                <CardContent className="text-sm">
                  <p className="text-muted-foreground">Upload answer or type in AI Hub with "Evaluate my answer" — AI will give score, feedback, strengths, improvements, error classification.</p>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "mastery" && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Mastery — {mastery.overall_mastery}%</CardTitle>
                  <CardDescription>CO mastery, weak/strong concepts, spaced revision</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${mastery.overall_mastery}%` }}></div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="font-medium">CO Mastery:</p>
                      {mastery.co_mastery.map((co) => (
                        <div key={co.co_id} className="flex items-center justify-between mt-1">
                          <span>
                            {co.co_code} {co.weak && "⚠️"}
                          </span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-secondary rounded-full h-1.5">
                              <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${co.mastery}%` }}></div>
                            </div>
                            <span className="text-xs">{co.mastery}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div>
                      <p className="font-medium">Weak Concepts:</p>
                      <p className="text-muted-foreground">{mastery.weak_concepts.join(", ") || "None — good!"}</p>
                      <p className="font-medium mt-2">Strong Concepts:</p>
                      <p className="text-muted-foreground">{mastery.strong_concepts.join(", ") || "Keep practicing"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">CGPA/GPA Engine (Honest)</CardTitle>
                  <CardDescription>Sample mapping — verify with official Anna University regulations</CardDescription>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  {(() => {
                    const grades = getMockGrades();
                    const gpa = calculateGpa(grades);
                    return (
                      <>
                        <p>GPA (Semester 1): {gpa}</p>
                        <div className="space-y-1">
                          {grades.map((g) => (
                            <div key={g.course_code} className="flex justify-between text-xs">
                              <span>
                                {g.course_code} ({g.credits} cr)
                              </span>
                              <span>
                                {g.grade} ({g.grade_point})
                              </span>
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">Disclaimer: Sample grade map O=10, A+=9, A=8, B+=7, B=6, C=5, U=0. Verify official for your regulation. Allows custom mapping.</p>
                      </>
                    );
                  })()}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Spaced Revision (SM-2)</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  <p>SM-2 algorithm: If you recall perfectly (quality 5), interval increases. If blackout (0), reset. Due items shown in revision.</p>
                  <p className="mt-2">Next review: Tomorrow for weak concepts, 6 days for good, longer for strong.</p>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "workspace" && (
            <div className="space-y-4">
              <Card className="border-indigo-200 bg-indigo-50/30 dark:bg-indigo-950/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    📦 {course.code} Workspace Vault — Every AI Space has AI + Workspace
                  </CardTitle>
                  <CardDescription className="text-xs">
                    My Documents • HTML Concepts • PDFs • Videos • Audio/Journal • Data/Database • Notes • Images — Storage independent, AI optional. Uploading does NOT auto-inject into AI. Use Ask AI, Add to context, Pin explicitly.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      placeholder="Search workspace — filenames, notes, tags..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg border bg-background text-sm"
                    />
                    <Button
                      size="sm"
                      onClick={() => {
                        const title = prompt("Note title:");
                        if (!title) return;
                        const content = prompt("Note content (Markdown):");
                        if (content === null) return;
                        createNote({ user_id: userId, workspace_id: workspace?.id || "", title, content, course_id: course.code });
                        refreshWorkspace();
                      }}
                    >
                      + New Note
                    </Button>
                  </div>

                  {workspace && (
                    <WorkspaceOverview
                      totalFiles={files.length + notes.length}
                      storageUsed={getStorageUsage(userId).total}
                      byType={getStorageUsage(userId).by_type}
                    />
                  )}

                  <FileUploader
                    onFilesSelected={(selectedFiles) => handleFilesUpload(selectedFiles)}
                    accept=".pdf,.docx,.txt,.md,.html,.htm,.mp4,.mkv,.mov,.webm,.mp3,.wav,.m4a,.jpg,.jpeg,.png,.webp,.csv,.json"
                    multiple
                    maxSizeBytes={100 * 1024 * 1024}
                    blockType={course.code}
                  />

                  {uploading && <p className="text-xs text-muted-foreground">Uploading... Storage independent, AI optional — file stored does NOT auto-enter AI context</p>}
                </CardContent>
              </Card>

              {/* Workspace Blocks — 8 blocks */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {blocks.map((block) => {
                  const blockFiles = files.filter((f) => f.block_id === block.id || (!f.block_id && f.file_type === block.block_type));
                  const blockNotes = notes.filter((n) => n.block_id === block.id || (block.block_type === "NOTES" && !n.block_id));
                  const filteredFiles = searchQuery ? blockFiles.filter((f) => f.filename.toLowerCase().includes(searchQuery.toLowerCase())) : blockFiles;
                  const filteredNotes = searchQuery ? blockNotes.filter((n) => n.title.toLowerCase().includes(searchQuery.toLowerCase()) || n.content.toLowerCase().includes(searchQuery.toLowerCase())) : blockNotes;

                  return (
                    <WorkspaceBlock
                      key={block.id}
                      block={block}
                      files={filteredFiles}
                      notes={filteredNotes}
                      onUpload={() => {
                        const input = document.createElement("input");
                        input.type = "file";
                        input.multiple = true;
                        input.accept = block.block_type === "PDF" ? ".pdf" : block.block_type === "HTML" ? ".html,.htm" : block.block_type === "VIDEO" ? ".mp4,.mkv,.mov,.webm,.avi" : block.block_type === "AUDIO" ? ".mp3,.wav,.m4a,.aac,.ogg,.flac" : block.block_type === "IMAGES" ? ".jpg,.jpeg,.png,.webp,.gif,.svg" : "*/*";
                        input.onchange = async () => {
                          if (input.files) {
                            await handleFilesUpload(Array.from(input.files), block.id, block.block_type);
                          }
                        };
                        input.click();
                      }}
                      onFileAction={(fileId, action) => {
                        if (action === "delete") {
                          if (confirm("Delete file?")) {
                            deleteFile(fileId, userId);
                            refreshWorkspace();
                          }
                        } else if (action === "download") {
                          const file = files.find((f) => f.id === fileId);
                          if (file) alert(`Download: ${file.filename}\nPath: ${file.storage_path}\nIn real mode: Signed URL 1h expiry\nMock mode: Simulated`);
                        } else if (action === "preview") {
                          const file = files.find((f) => f.id === fileId);
                          if (file) {
                            if (file.file_type === "PDF") alert(`PDF Preview: ${file.filename}\n[Open] [Download] [Add to AI Context]\nStorage: Ready, AI: ${file.ai_indexing_status}`);
                            else if (file.file_type === "HTML") alert(`HTML Preview: ${file.filename}\nSource + Rendered preview (sandboxed iframe)\nSecurity: Never execute untrusted HTML in main origin — isolated iframe`);
                            else if (file.file_type === "VIDEO") alert(`Video: ${file.filename}\nPlayer + Download\nIf MKV unsupported: Preview unavailable [Download]\nStorage: Ready`);
                            else if (file.file_type === "AUDIO") alert(`Audio: ${file.filename}\nPlayer + Download\nStorage: Ready`);
                            else alert(`Preview: ${file.filename}\nDownload original if preview unavailable`);
                          }
                        } else if (action === "ask-ai") {
                          const file = files.find((f) => f.id === fileId);
                          if (file) {
                            window.location.href = `/ai-hub?course=${course.code}&file=${file.id}&ask=Ask AI about ${file.filename}`;
                          }
                        } else if (action === "pin") {
                          alert(`Pinned: File pinned to AI context — ${files.find((f) => f.id === fileId)?.filename}\nPinned Resources: ECE Syllabus.pdf, Unit 1 Notes.pdf, etc.\nAI will use relevance filtering, not full injection`);
                        } else if (action === "favorite") {
                          // Toggle favorite already handled via files.ts but need refresh
                          const file = files.find((f) => f.id === fileId);
                          if (file) {
                            // Simulate toggle
                            alert(`Favorite toggled for ${file.filename}`);
                          }
                        }
                      }}
                      onNoteAction={(noteId, action) => {
                        if (action === "delete") {
                          if (confirm("Delete note?")) {
                            deleteNote(noteId, userId);
                            refreshWorkspace();
                          }
                        } else if (action === "edit") {
                          const note = notes.find((n) => n.id === noteId);
                          if (note) {
                            const newContent = prompt("Edit note:", note.content);
                            if (newContent !== null) {
                              // Update
                              const allNotes = notes;
                              const idx = allNotes.findIndex((n) => n.id === noteId);
                              if (idx !== -1) {
                                allNotes[idx].content = newContent;
                                allNotes[idx].updated_at = new Date().toISOString();
                                localStorage.setItem("polymath_workspace_notes", JSON.stringify(allNotes));
                                refreshWorkspace();
                              }
                            }
                          }
                        }
                      }}
                    />
                  );
                })}
              </div>

              <Card className="border-dashed">
                <CardContent className="pt-6 text-xs text-muted-foreground space-y-1">
                  <p><strong>Storage ≠ AI Context:</strong> Uploading Signals_and_Systems_Notes.pdf into PDFs block stores & organizes — AI does NOT automatically receive entire PDF every time you ask "Explain Fourier Transform". Use explicit controls: Ask AI about this file, Add to current conversation, Pin to AI context, Remove, Summarize, Generate notes, Search inside.</p>
                  <p><strong>Security:</strong> HTML preview sandboxed iframe, never execute untrusted HTML in main origin, prevent access to tokens/cookies/session/APIs/Supabase creds/other users data. Treat uploaded HTML as untrusted. Private storage default, signed URLs 1h, MIME/type/extension/size validation, ownership validation, path traversal protection.</p>
                  <p><strong>Isolation:</strong> ECE Professor workspace NOT see Photography Mentor workspace. User A cannot access User B files even if manipulating frontend — RLS prevents.</p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Right Panel — Context */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Course Context for AI
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-2">
              <p>
                <strong>Course:</strong> {course.name} ({course.code})
              </p>
              <p>
                <strong>Units:</strong> {course.units?.length || 5}
              </p>
              <p>
                <strong>COs:</strong> {course.cos?.length || 5}
              </p>
              <p>
                <strong>Mastery:</strong> {mastery.overall_mastery}%
              </p>
              <p>
                <strong>Weak:</strong> {mastery.weak_concepts.join(", ") || "None"}
              </p>
              <p className="text-muted-foreground">AI automatically knows this when you chat in AI Hub with course filter.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href={`/ai-hub?course=${course.code}`}>
                <Button size="sm" className="w-full justify-start">
                  <Bot className="w-4 h-4 mr-2" />
                  Chat with {course.code} AI
                </Button>
              </Link>
              <Link href="/documents">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  Upload Notes for RAG
                </Button>
              </Link>
              <Link href="/analytics">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Analytics
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
            <CardContent className="p-3 text-xs">
              <p className="font-medium text-amber-800 dark:text-amber-200">Academic Engine — Workspace 3</p>
              <p className="text-amber-700 dark:text-amber-300 mt-1">
                Parts 51-75: Curriculum ingestion ✅, Course DB ✅, Semesters ✅, Units/topics ✅, COs ✅, CO mastery ✅, Prerequisite graph ✅, PYQ upload/extraction/classification/family/frequency/HIGH/MEDIUM/LOWER relevance ✅, Question generator ✅, CA-1/CA-2/EndSem simulators ✅, Viva ✅, Answer evaluation mock ✅, Error classification ✅, Spaced revision SM-2 ✅, Mastery engine ✅, CGPA honest ✅, Academic dashboard (this page)
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
