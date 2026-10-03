"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/components/auth/AuthProvider";
import { ChatArea } from "@/components/ai/ChatArea";
import { MessageComposer } from "@/components/ai/MessageComposer";
import { ModelSelector } from "@/components/ai/ModelSelector";
import { TeachingModeButtons } from "@/components/ai/TeachingModeButtons";
import { CitationCard } from "@/components/ai/CitationCard";
import { ChatMessage, Citation, ProviderName, TeachingMode } from "@/lib/ai/types";
import { getConversations, createConversation, addMessageToConversation, getConversation, deleteConversation } from "@/lib/ai/conversations";
import { Bot, Plus, BookOpen, Brain, Trash2, Settings, Sparkles, GraduationCap } from "lucide-react";
import Link from "next/link";

export default function AIHubPage() {
  const { user } = useAuth();
  const userId = user?.id || "mock-user";

  // Chat state
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<(ChatMessage & { citations?: Citation[] })[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [selectedProvider, setSelectedProvider] = useState<ProviderName>("mock");
  const [selectedModel, setSelectedModel] = useState<string>("mock-v1");
  const [selectedTeachingMode, setSelectedTeachingMode] = useState<TeachingMode>("default");
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [selectedExpert, setSelectedExpert] = useState<string>("");
  const [citations, setCitations] = useState<Citation[]>([]);
  const [showSettings, setShowSettings] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);

  // Load conversations
  useEffect(() => {
    const convs = getConversations(userId);
    setConversations(convs);
    if (convs.length > 0 && !selectedConversationId) {
      const first = convs[0];
      setSelectedConversationId(first.id);
      setMessages(first.messages || []);
      setSelectedProvider(first.provider);
      setSelectedModel(first.model_id);
      setSelectedTeachingMode(first.teaching_mode || "default");
      setSelectedCourse(first.course_id || "");
      setSelectedExpert(first.expert_id || "");
    }
  }, [userId]);

  // Create new conversation
  const handleNewConversation = () => {
    const conv = createConversation({
      user_id: userId,
      course_id: selectedCourse || undefined,
      expert_id: selectedExpert || undefined,
      title: "New Conversation",
      model_id: selectedModel,
      provider: selectedProvider,
      teaching_mode: selectedTeachingMode,
    });
    setConversations(getConversations(userId));
    setSelectedConversationId(conv.id);
    setMessages([]);
    setCitations([]);
  };

  // Select conversation
  const handleSelectConversation = (id: string) => {
    const conv = getConversation(id, userId);
    if (conv) {
      setSelectedConversationId(id);
      setMessages(conv.messages || []);
      setSelectedProvider(conv.provider);
      setSelectedModel(conv.model_id);
      setSelectedTeachingMode(conv.teaching_mode || "default");
      setSelectedCourse(conv.course_id || "");
      setSelectedExpert(conv.expert_id || "");
      setCitations([]);
    }
  };

  // Delete conversation
  const handleDeleteConversation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Delete this conversation?")) {
      deleteConversation(id, userId);
      setConversations(getConversations(userId));
      if (selectedConversationId === id) {
        setSelectedConversationId(null);
        setMessages([]);
      }
    }
  };

  // Send message with streaming
  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: ChatMessage = {
      role: "user",
      content,
      timestamp: new Date().toISOString(),
    };

    // Add user message to UI
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);

    // Save to conversation
    let convId = selectedConversationId;
    if (!convId) {
      const conv = createConversation({
        user_id: userId,
        course_id: selectedCourse || undefined,
        expert_id: selectedExpert || undefined,
        title: content.slice(0, 50),
        model_id: selectedModel,
        provider: selectedProvider,
        teaching_mode: selectedTeachingMode,
      });
      convId = conv.id;
      setSelectedConversationId(convId);
      setConversations(getConversations(userId));
    }

    if (convId) {
      addMessageToConversation(convId, userId, userMessage);
    }

    // Start streaming
    setIsStreaming(true);
    setStreamingContent("");
    setCitations([]);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          course_id: selectedCourse || undefined,
          expert_id: selectedExpert || undefined,
          provider: selectedProvider === "mock" && selectedModel === "auto" ? undefined : selectedProvider,
          model: selectedModel === "auto" ? undefined : selectedModel,
          teaching_mode: selectedTeachingMode,
          conversation_id: convId,
        }),
        signal: abortController.signal,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(JSON.stringify(errorData.error || { what: "Chat failed", why: response.statusText }));
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error("No reader");

      let fullContent = "";
      let finalCitations: Citation[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const dataStr = line.slice(6);
            if (!dataStr.trim()) continue;

            try {
              const data = JSON.parse(dataStr);

              if (data.type === "content") {
                fullContent += data.content;
                setStreamingContent(fullContent);
              } else if (data.type === "metadata") {
                if (data.citations) {
                  finalCitations = data.citations;
                  setCitations(data.citations);
                }
              } else if (data.type === "done") {
                if (data.citations) {
                  finalCitations = data.citations;
                  setCitations(data.citations);
                }
                if (data.full_content) {
                  fullContent = data.full_content;
                }
              } else if (data.type === "error") {
                fullContent += `\n\n[ERROR: ${data.error.what}\nWhy: ${data.error.why}\nWhat to do: ${data.error.what_to_do}]`;
                setStreamingContent(fullContent);
              }
            } catch (e) {
              // Ignore parse errors for incomplete chunks
            }
          }
        }
      }

      // Save assistant message
      const assistantMessage: ChatMessage & { citations?: Citation[] } = {
        role: "assistant",
        content: fullContent,
        timestamp: new Date().toISOString(),
        citations: finalCitations,
      };

      setMessages([...newMessages, assistantMessage]);

      if (convId) {
        addMessageToConversation(convId, userId, assistantMessage);
        setConversations(getConversations(userId));
      }
    } catch (error) {
      if ((error as Error).name === "AbortError") {
        console.log("Streaming aborted");
      } else {
        console.error("Chat error", error);
        const errorContent = `Error: ${error instanceof Error ? error.message : String(error)}`;
        setStreamingContent(errorContent);
      }
    } finally {
      setIsStreaming(false);
      setStreamingContent("");
      abortControllerRef.current = null;
    }
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
      setStreamingContent("");
    }
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const handleRetry = (index: number) => {
    const userMessage = messages[index - 1];
    if (userMessage && userMessage.role === "user") {
      handleSendMessage(userMessage.content);
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* Left Sidebar */}
      <div className="w-80 flex flex-col gap-4 overflow-hidden">
        <Card className="flex-1 flex flex-col overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Bot className="w-4 h-4" />
                Conversations
              </CardTitle>
              <Button size="sm" onClick={handleNewConversation} className="h-7">
                <Plus className="w-3 h-3 mr-1" />
                New
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto space-y-2 p-2">
            {conversations.length === 0 ? (
              <p className="text-xs text-muted-foreground p-2">No conversations yet. Start new chat!</p>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv.id)}
                  className={`p-2 rounded-lg border cursor-pointer group text-sm ${
                    selectedConversationId === conv.id ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-950/20" : "hover:bg-secondary"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{conv.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {conv.provider}/{conv.model_id} • {new Date(conv.updated_at).toLocaleDateString()}
                      </p>
                      {conv.course_id && <p className="text-xs text-indigo-600">📚 {conv.course_id}</p>}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100"
                      onClick={(e) => handleDeleteConversation(conv.id, e)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Course & Expert</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-xs font-medium">Course (for RAG + context)</label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full mt-1 px-2 py-1.5 rounded border bg-background text-sm"
              >
                <option value="">No course (general)</option>
                <option value="CS3353">CS3353 - C Programming</option>
                <option value="EC3352">EC3352 - Digital Systems Design</option>
                <option value="EC3401">EC3401 - Networks and Security</option>
                <option value="EC3402">EC3402 - Communication Systems</option>
                <option value="MA3151">MA3151 - Matrices and Calculus</option>
              </select>
              <p className="text-[10px] text-muted-foreground mt-1">When course selected, AI knows units, COs, and retrieves relevant docs</p>
            </div>

            <div>
              <label className="text-xs font-medium">Expert</label>
              <select
                value={selectedExpert}
                onChange={(e) => setSelectedExpert(e.target.value)}
                className="w-full mt-1 px-2 py-1.5 rounded border bg-background text-sm"
              >
                <option value="">ECE Professor (default)</option>
                <option value="web-development">Web Development Expert</option>
                <option value="photography">Photography Expert</option>
                <option value="ai-automation">AI Automation Expert</option>
                <option value="global-orchestrator">Global Orchestrator</option>
              </select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Center Chat */}
      <div className="flex-1 flex flex-col border rounded-xl bg-card overflow-hidden">
        {/* Chat Header */}
        <div className="border-b p-3 flex items-center justify-between bg-secondary/30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-medium text-sm">
                {selectedCourse ? `${selectedCourse} AI` : selectedExpert ? `${selectedExpert} AI` : "Polymath AI"} — {selectedModel}
              </p>
              <p className="text-xs text-muted-foreground">
                {selectedProvider} • {selectedTeachingMode !== "default" ? `${selectedTeachingMode} mode` : "Default"} • Streaming: {isStreaming ? "Yes" : "No"}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setShowSettings(!showSettings)}>
            <Settings className="w-4 h-4" />
          </Button>
        </div>

        {showSettings && (
          <div className="border-b p-3 bg-secondary/20 space-y-4 max-h-96 overflow-y-auto">
            <div>
              <p className="text-xs font-medium mb-2">Model (AUTO uses router)</p>
              <ModelSelector
                selectedProvider={selectedProvider}
                selectedModel={selectedModel}
                onSelect={(provider, modelId) => {
                  if (modelId === "auto") {
                    setSelectedProvider("mock");
                    setSelectedModel("auto");
                  } else {
                    setSelectedProvider(provider);
                    setSelectedModel(modelId);
                  }
                }}
              />
            </div>
            <div>
              <TeachingModeButtons selectedMode={selectedTeachingMode} onSelect={setSelectedTeachingMode} />
            </div>
          </div>
        )}

        <ChatArea messages={messages} isStreaming={isStreaming} streamingContent={streamingContent} onCopy={handleCopy} onRetry={handleRetry} />

        <MessageComposer
          onSend={handleSendMessage}
          isStreaming={isStreaming}
          onStop={handleStop}
          placeholder={
            selectedCourse
              ? `Ask about ${selectedCourse}... (e.g., Explain pointers, PYQ mode, Viva me)`
              : "Ask anything... (try: Explain simply, Deep dive, Visualize, PYQ mode, Exam mode)"
          }
        />
      </div>

      {/* Right Context Panel */}
      <div className="w-80 hidden lg:flex flex-col gap-4 overflow-y-auto">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <GraduationCap className="w-4 h-4" />
              Current Context
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs space-y-2">
            <div>
              <p className="font-medium">Course:</p>
              <p className="text-muted-foreground">{selectedCourse || "None selected — general chat"}</p>
              {selectedCourse && (
                <div className="mt-1 p-2 rounded bg-secondary text-[11px]">
                  <p>Units: 5 units • Topics: Sample topics • COs: CO1-CO5</p>
                  <p className="mt-1">Mastery: 45% (mock) • Weak: Pointers, K-Maps</p>
                </div>
              )}
            </div>
            <div>
              <p className="font-medium">Expert:</p>
              <p className="text-muted-foreground">{selectedExpert || "ECE Professor (default)"}</p>
            </div>
            <div>
              <p className="font-medium">Model:</p>
              <p className="text-muted-foreground">
                {selectedModel} ({selectedProvider}) • {selectedTeachingMode}
              </p>
            </div>
            <div>
              <p className="font-medium">RAG:</p>
              <p className="text-muted-foreground">
                {citations.length > 0 ? `${citations.length} citations retrieved` : "No docs — upload in Documents for RAG"}
              </p>
              {citations.length > 0 && <CitationCard citations={citations} />}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">How to Test (Workspace 2)</CardTitle>
          </CardHeader>
          <CardContent className="text-xs space-y-2">
            <p>✅ Open app → AI HUB → New Chat → Send message → See streaming</p>
            <p>✅ Select course → Ask → AI knows course context</p>
            <p>✅ Select teaching mode → e.g., "Simply" → Response changes</p>
            <p>✅ Select model → Mock always works, real needs API key in .env</p>
            <p>✅ Reload page → Conversation persists (localStorage, later Supabase)</p>
            <p>✅ Check citations when docs uploaded</p>
            <p className="mt-2">
              <Link href="/settings" className="text-indigo-600 hover:underline">
                Go to Settings → AI Providers to configure keys
              </Link>
            </p>
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
          <CardContent className="p-3 text-xs">
            <p className="font-medium text-amber-800 dark:text-amber-200">Mock Mode</p>
            <p className="text-amber-700 dark:text-amber-300 mt-1">
              Currently using Mock provider — no credits, clearly labeled MOCK RESPONSE. For real AI, set GEMINI_API_KEY (free tier) or OPENAI_API_KEY in .env and restart.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
