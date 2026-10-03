"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Send, Paperclip, Square } from "lucide-react";

interface MessageComposerProps {
  onSend: (content: string) => void;
  isStreaming: boolean;
  onStop: () => void;
  placeholder?: string;
  disabled?: boolean;
}

export function MessageComposer({ onSend, isStreaming, onStop, placeholder, disabled }: MessageComposerProps) {
  const [content, setContent] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (!content.trim() || disabled) return;
    onSend(content.trim());
    setContent("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    // Auto-resize
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  return (
    <div className="border-t bg-card p-3">
      <div className="flex items-end gap-2 max-w-4xl mx-auto">
        <Button variant="ghost" size="icon" className="flex-shrink-0" disabled title="Attachments — coming soon (vision support)">
          <Paperclip className="w-4 h-4" />
        </Button>

        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || "Ask anything... (Shift+Enter for new line, Enter to send)"}
            className="w-full px-4 py-3 rounded-xl border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[48px] max-h-[120px] text-sm"
            rows={1}
            disabled={disabled || isStreaming}
          />
        </div>

        {isStreaming ? (
          <Button onClick={onStop} variant="outline" size="icon" className="flex-shrink-0" title="Stop generation">
            <Square className="w-4 h-4" />
          </Button>
        ) : (
          <Button onClick={handleSend} disabled={!content.trim() || disabled} size="icon" className="flex-shrink-0">
            <Send className="w-4 h-4" />
          </Button>
        )}
      </div>

      <div className="text-[10px] text-muted-foreground text-center mt-2">
        AI can make mistakes. Verify important info. RAG citations shown when documents uploaded. Mock provider labeled clearly, no credits used.
      </div>
    </div>
  );
}
