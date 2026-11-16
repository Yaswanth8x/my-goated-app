"use client";

import { useState, useRef, useEffect } from "react";
import { ChatMessage, Citation, ProviderName, TeachingMode } from "@/lib/ai/types";
import { CitationCard } from "./CitationCard";
import { Button } from "@/components/ui/Button";
import { Bot, User, Copy, RotateCcw, ThumbsUp, ThumbsDown } from "lucide-react";

interface ChatAreaProps {
  messages: (ChatMessage & { citations?: Citation[] })[];
  isStreaming: boolean;
  streamingContent: string;
  onCopy: (content: string) => void;
  onRetry: (index: number) => void;
}

export function ChatArea({ messages, isStreaming, streamingContent, onCopy, onRetry }: ChatAreaProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-6">
      {messages.length === 0 && !isStreaming && (
        <div className="text-center py-12">
          <Bot className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-medium">Start a conversation</h3>
          <p className="text-sm text-muted-foreground mt-1">Ask about your course, upload documents for RAG, select teaching mode</p>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-2 max-w-2xl mx-auto text-left">
            <div className="p-3 rounded-lg border bg-card text-sm">
              <p className="font-medium">💡 Try:</p>
              <p className="text-muted-foreground">"Explain pointers in C simply"</p>
            </div>
            <div className="p-3 rounded-lg border bg-card text-sm">
              <p className="font-medium">📝 PYQ Mode:</p>
              <p className="text-muted-foreground">"What is HIGH relevance for Digital Electronics?"</p>
            </div>
            <div className="p-3 rounded-lg border bg-card text-sm">
              <p className="font-medium">🎤 Viva Mode:</p>
              <p className="text-muted-foreground">"Viva me on Control Systems"</p>
            </div>
            <div className="p-3 rounded-lg border bg-card text-sm">
              <p className="font-medium">🔬 Deep Dive:</p>
              <p className="text-muted-foreground">"Derive K-Map from first principles"</p>
            </div>
          </div>
        </div>
      )}

      {messages.map((message, idx) => (
        <div key={idx} className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
          {message.role === "assistant" && (
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
          )}

          <div className={`flex-1 max-w-[80%] ${message.role === "user" ? "flex justify-end" : ""}`}>
            <div
              className={`p-3 rounded-2xl ${
                message.role === "user" ? "bg-indigo-600 text-white rounded-br-sm" : "bg-card border rounded-bl-sm"
              }`}
            >
              <div className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</div>

              {message.citations && message.citations.length > 0 && <CitationCard citations={message.citations} />}

              {message.role === "assistant" && (
                <div className="flex items-center gap-1 mt-3 pt-2 border-t">
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => onCopy(message.content)}>
                    <Copy className="w-3 h-3 mr-1" />
                    Copy
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => onRetry(idx)}>
                    <RotateCcw className="w-3 h-3 mr-1" />
                    Retry
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                    <ThumbsUp className="w-3 h-3" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                    <ThumbsDown className="w-3 h-3" />
                  </Button>
                  {message.tokens && <span className="text-[10px] text-muted-foreground ml-auto">{message.tokens} tokens</span>}
                </div>
              )}
            </div>
          </div>

          {message.role === "user" && (
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4" />
            </div>
          )}
        </div>
      ))}

      {isStreaming && (
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 max-w-[80%]">
            <div className="p-3 rounded-2xl bg-card border rounded-bl-sm">
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {streamingContent}
                <span className="inline-block w-2 h-4 bg-indigo-600 ml-1 animate-pulse"></span>
              </div>
              <div className="text-xs text-muted-foreground mt-2">Streaming... (real-time from provider)</div>
            </div>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
