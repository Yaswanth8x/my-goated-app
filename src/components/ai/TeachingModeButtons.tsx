"use client";

import { TeachingMode } from "@/lib/ai/types";

interface TeachingModeButtonsProps {
  selectedMode?: TeachingMode;
  onSelect: (mode: TeachingMode) => void;
}

const teachingModes: { id: TeachingMode; label: string; description: string; icon: string }[] = [
  { id: "explain", label: "Explain", description: "Clear explanation", icon: "📖" },
  { id: "explain_simply", label: "Simply", description: "Like to 10-year-old", icon: "👶" },
  { id: "deep_dive", label: "Deep Dive", description: "Derivations, proofs", icon: "🔬" },
  { id: "visualize", label: "Visualize", description: "Diagrams, graphs", icon: "🎨" },
  { id: "example", label: "Example", description: "Concrete examples", icon: "💡" },
  { id: "analogy", label: "Analogy", description: "Powerful analogies", icon: "🔗" },
  { id: "derive", label: "Derive", description: "From first principles", icon: "📐" },
  { id: "solve", label: "Solve", description: "Step by step", icon: "✅" },
  { id: "hint", label: "Hint", description: "Socratic hint", icon: "🤔" },
  { id: "quiz", label: "Quiz Me", description: "Ask me questions", icon: "❓" },
  { id: "viva", label: "Viva Me", description: "Viva examiner", icon: "🎤" },
  { id: "pyq_mode", label: "PYQ Mode", description: "PYQ patterns", icon: "📝" },
  { id: "exam_mode", label: "Exam Mode", description: "Exam prep", icon: "⏱️" },
  { id: "common_mistakes", label: "Mistakes", description: "Common errors", icon: "⚠️" },
  { id: "connect", label: "Connect", description: "Cross-subject", icon: "🌐" },
  { id: "real_world", label: "Real-World", description: "Applications", icon: "🌍" },
];

export function TeachingModeButtons({ selectedMode, onSelect }: TeachingModeButtonsProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground">Teaching Modes</p>
        {selectedMode && selectedMode !== "default" && (
          <button onClick={() => onSelect("default")} className="text-xs text-indigo-600 hover:underline">
            Clear
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5">
        {teachingModes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => onSelect(mode.id)}
            className={`p-2 rounded-lg border text-left text-xs transition-colors ${
              selectedMode === mode.id
                ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300"
                : "border-border hover:bg-secondary"
            }`}
            title={mode.description}
          >
            <div className="flex items-center gap-1">
              <span>{mode.icon}</span>
              <span className="font-medium">{mode.label}</span>
            </div>
            <div className="text-[10px] text-muted-foreground mt-0.5">{mode.description}</div>
          </button>
        ))}
      </div>

      {selectedMode && selectedMode !== "default" && (
        <div className="text-xs p-2 rounded bg-indigo-50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-300">
          Active: {teachingModes.find((m) => m.id === selectedMode)?.label} — {teachingModes.find((m) => m.id === selectedMode)?.description}
        </div>
      )}
    </div>
  );
}
