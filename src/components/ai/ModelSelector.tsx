"use client";

import { useState } from "react";
import { modelRegistry, getEnabledModels, sortByCost } from "@/lib/ai/models";
import { ProviderName } from "@/lib/ai/types";

interface ModelSelectorProps {
  selectedProvider?: ProviderName;
  selectedModel?: string;
  onSelect: (provider: ProviderName, modelId: string) => void;
}

export function ModelSelector({ selectedProvider, selectedModel, onSelect }: ModelSelectorProps) {
  const [filter, setFilter] = useState<"all" | "free" | "low_cost" | "premium">("all");

  let models = getEnabledModels();
  
  if (filter !== "all") {
    models = models.filter((m) => m.cost_class.toLowerCase() === filter);
  }

  models = sortByCost(models);

  return (
    <div className="space-y-3">
      <div className="flex gap-1">
        {[
          { id: "all", label: "All" },
          { id: "free", label: "Free" },
          { id: "low_cost", label: "Low Cost" },
          { id: "premium", label: "Premium" },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id as any)}
            className={`px-2 py-1 text-xs rounded-full ${
              filter === f.id ? "bg-indigo-600 text-white" : "bg-secondary text-muted-foreground hover:bg-secondary/80"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="space-y-2 max-h-60 overflow-y-auto">
        {/* Auto option */}
        <button
          onClick={() => onSelect("mock" as ProviderName, "auto")}
          className={`w-full text-left p-2 rounded-lg border text-sm ${
            selectedModel === "auto" ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-950/20" : "border-border hover:bg-secondary"
          }`}
        >
          <div className="font-medium">AUTO (Router)</div>
          <div className="text-xs text-muted-foreground">Let AI choose best model for task — cheap for simple, capable for coding/vision</div>
        </button>

        {models.map((model) => (
          <button
            key={model.model_id}
            onClick={() => onSelect(model.provider, model.model_id)}
            className={`w-full text-left p-2 rounded-lg border text-sm ${
              selectedModel === model.model_id ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-950/20" : "border-border hover:bg-secondary"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">{model.display_name}</span>
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full ${
                  model.cost_class === "FREE"
                    ? "bg-green-100 text-green-700"
                    : model.cost_class === "LOW_COST"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {model.cost_class}
              </span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {model.provider} • {model.context_window.toLocaleString()} context • {model.supports_vision ? "Vision" : "Text"}
            </div>
            <div className="text-xs text-muted-foreground">{model.description}</div>
          </button>
        ))}
      </div>

      <div className="text-xs text-muted-foreground p-2 rounded bg-secondary">
        <p>💡 Tip: Start with FREE models (Gemini Flash, Mock). Mock always works with no credits, clearly labeled.</p>
      </div>
    </div>
  );
}
