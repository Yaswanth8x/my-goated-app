import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { fallbackSystem, ProviderConfig } from "@/lib/ai/fallback";
import { aiRouter } from "@/lib/ai/router";
import { usageTracker } from "@/lib/ai/usage";
import { getAcademicPersona } from "@/lib/ai/personas/academic";
import { getExpertPersona } from "@/lib/ai/personas/orchestrator";
import { retrieveRelevantChunks, addChunksToMemory, getMemoryChunks } from "@/lib/rag/retrieve";
import { buildCitationsFromChunks } from "@/lib/rag/citations";
import { AIRequest, ChatMessage, ProviderName, TeachingMode } from "@/lib/ai/types";
import { logger } from "@/lib/logger";
import { chatRequestSchema } from "@/lib/validation";

// ============================================================
// Chat API Route — Streaming + RAG + Router + Fallback + Usage
// Workspace 2 Parts 35, 36, 37, 39, 40, 42, 43, 44, 45, 48, 49
// ============================================================

export async function POST(req: NextRequest) {
  try {
    // Malformed JSON is a client mistake, not a server crash — return 400, not 500.
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        {
          error: {
            what: "Invalid JSON body",
            why: "The request body could not be parsed as JSON.",
            what_to_do: 'Send valid JSON, e.g. {"messages":[{"role":"user","content":"hello"}]}',
          },
        },
        { status: 400 }
      );
    }

    // Validate
    const validation = chatRequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: {
            what: "Invalid request body",
            why: validation.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(", "),
            what_to_do: "Check request format: { messages: [{ role, content }], course_id, expert_id, provider, model, teaching_mode }",
          },
        },
        { status: 400 }
      );
    }

    const { messages, course_id, expert_id, provider, model, teaching_mode, conversation_id } = body as {
      messages: ChatMessage[];
      course_id?: string;
      expert_id?: string;
      provider?: ProviderName;
      model?: string;
      teaching_mode?: TeachingMode;
      conversation_id?: string;
    };

    // Get user (if Supabase configured, else mock)
    const supabase = await createClient();
    let userId = "mock-user";
    let userEmail = "yaswanth@local";

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        userId = user.id;
        userEmail = user.email || "unknown";
      }
    } catch {
      // Mock mode
      logger.warn("Supabase auth not available, using mock user");
    }

    // Get provider configs (from env for now, later from DB)
    const providerConfigs: ProviderConfig[] = [
      { provider: "mock", enabled: true },
    ];

    // From env
    if (process.env.OPENAI_API_KEY) {
      providerConfigs.push({
        provider: "openai",
        apiKey: process.env.OPENAI_API_KEY,
        baseUrl: process.env.OPENAI_BASE_URL,
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        enabled: true,
      });
    }
    if (process.env.GEMINI_API_KEY) {
      providerConfigs.push({
        provider: "gemini",
        apiKey: process.env.GEMINI_API_KEY,
        model: process.env.GEMINI_MODEL || "gemini-1.5-flash",
        enabled: true,
      });
    }
    if (process.env.ANTHROPIC_API_KEY) {
      providerConfigs.push({
        provider: "anthropic",
        apiKey: process.env.ANTHROPIC_API_KEY,
        model: process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-20241022",
        enabled: true,
      });
    }
    if (process.env.OPENROUTER_API_KEY) {
      providerConfigs.push({
        provider: "openrouter",
        apiKey: process.env.OPENROUTER_API_KEY,
        baseUrl: process.env.OPENROUTER_BASE_URL,
        model: process.env.OPENROUTER_MODEL,
        enabled: true,
      });
    }

    // Router: Select provider/model if not specified or AUTO
    let selectedProvider = provider as ProviderName | undefined;
    let selectedModel = model;

    if (!selectedProvider || selectedProvider === ("auto" as any)) {
      const lastUserMessage = messages.filter((m) => m.role === "user").pop();
      const task = lastUserMessage?.content || "general explanation";

      const routerResult = aiRouter.route({
        task,
        teaching_mode: teaching_mode as any,
        has_attachments: false, // TODO: detect attachments
        has_large_context: false,
        available_providers: providerConfigs.map((c) => ({
          provider: c.provider,
          api_key: c.apiKey,
          enabled: c.enabled,
        })),
        user_preferences: { prefer_free: true },
      });

      selectedProvider = routerResult.provider;
      selectedModel = routerResult.model_id;

      logger.info(`Router selected ${selectedProvider}/${selectedModel}: ${routerResult.reason}`);
    }

    // RAG: Retrieve relevant chunks if course_id provided
    let retrievedChunks: any[] = [];
    let citations: any[] = [];

    if (course_id) {
      try {
        const lastUserMessage = messages.filter((m) => m.role === "user").pop();
        const query = lastUserMessage?.content || "";

        if (query) {
          retrievedChunks = await retrieveRelevantChunks({
            query,
            user_id: userId,
            course_id,
            topK: 5,
            threshold: 0.1,
            embedConfig: {
              provider: "mock", // Use mock embeddings for now, real when configured
              apiKey: providerConfigs.find((c) => c.provider === "openai")?.apiKey,
            },
          });

          citations = buildCitationsFromChunks(retrievedChunks);

          logger.info(`RAG retrieved ${retrievedChunks.length} chunks for course ${course_id}`);
        }
      } catch (error) {
        logger.warn(`RAG retrieval failed, continuing without RAG`, { error: String(error) });
      }
    }

    // Build AIRequest with context
    const aiRequest: AIRequest = {
      messages,
      course_context: course_id
        ? {
            course_id,
            course_name: course_id, // TODO: Fetch real course name from DB
            // In real implementation, fetch course details from Supabase
          }
        : undefined,
      expert_context: expert_id
        ? {
            expert_id,
            expert_name: expert_id,
            persona: expert_id === "ece-professor" || expert_id?.includes("ece")
              ? getAcademicPersona(course_id, course_id)
              : getExpertPersona(expert_id),
          }
        : {
            persona: getAcademicPersona(course_id, course_id),
          },
      user_context: {
        user_id: userId,
        email: userEmail,
        display_name: userEmail.split("@")[0],
      },
      memory_context: {
        academic: [], // TODO: Fetch from memories table
        global: [],
      },
      retrieved_chunks: retrievedChunks.map((c) => ({
        id: c.id,
        document_id: c.document_id,
        document_title: c.document_title,
        content: c.content,
        page: c.page,
        section: c.section,
        score: c.score,
        course_id: c.course_id,
        unit_id: c.unit_id,
      })),
      teaching_mode: (teaching_mode as TeachingMode) || "default",
      provider: selectedProvider,
      model_id: selectedModel,
      stream: true,
    };

    // Check budget
    const budgetCheck = await usageTracker.checkBudget(userId, {
      monthly_budget: 10, // $10 default, configurable
      warning_threshold: 0.8,
      hard_stop: false,
    });

    if (!budgetCheck.allowed) {
      return NextResponse.json(
        {
          error: {
            what: "Budget exceeded",
            why: budgetCheck.warning,
            what_to_do: "Increase budget in Settings → AI Usage, or use Mock provider (free), or wait for next month.",
          },
        },
        { status: 429 }
      );
    }

    // Streaming response
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        try {
          // Send initial metadata
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "metadata", provider: selectedProvider, model: selectedModel, citations, budget_warning: budgetCheck.warning })}\n\n`
            )
          );

          let fullContent = "";
          let tokensInput = 0;
          let tokensOutput = 0;

          // Stream with fallback
          for await (const chunk of fallbackSystem.streamChatWithFallback(aiRequest, providerConfigs, selectedProvider)) {
            fullContent += chunk;
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "content", content: chunk })}\n\n`));
          }

          // Estimate tokens (rough)
          tokensInput = Math.floor(JSON.stringify(messages).length / 4);
          tokensOutput = Math.floor(fullContent.length / 4);

          // Track usage
          await usageTracker.track({
            user_id: userId,
            provider: selectedProvider!,
            model: selectedModel!,
            tokens_input: tokensInput,
            tokens_output: tokensOutput,
            cost_estimate: 0, // Mock cost, real would be calculated
            task: teaching_mode || "chat",
            course_id,
            expert_id,
            conversation_id,
            created_at: new Date().toISOString(),
          });

          // Send final usage and citations
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "done",
                usage: {
                  provider: selectedProvider,
                  model: selectedModel,
                  tokens_input: tokensInput,
                  tokens_output: tokensOutput,
                },
                citations,
                full_content: fullContent,
              })}\n\n`
            )
          );

          controller.close();
        } catch (error) {
          logger.error("Chat streaming failed", { error: String(error) });
          const errorMessage = error instanceof Error ? error.message : String(error);

          // Try to parse structured error
          let structuredError;
          try {
            structuredError = JSON.parse(errorMessage);
          } catch {
            structuredError = {
              what: "Chat failed",
              why: errorMessage,
              what_to_do: "Check Settings → AI Providers, try Mock provider, or check network.",
            };
          }

          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "error", error: structuredError })}\n\n`)
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    logger.error("Chat API error", { error: String(error) });
    return NextResponse.json(
      {
        error: {
          what: "Chat API failed",
          why: error instanceof Error ? error.message : String(error),
          what_to_do: "Check logs, verify env vars, try Mock provider.",
        },
      },
      { status: 500 }
    );
  }
}

// For non-streaming (optional)
export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "Chat API — POST to /api/chat with { messages, course_id, expert_id, provider, model, teaching_mode }",
    available_providers: ["mock", "openai", "gemini", "anthropic", "openrouter"],
    teaching_modes: [
      "explain",
      "explain_simply",
      "deep_dive",
      "visualize",
      "example",
      "analogy",
      "derive",
      "solve",
      "hint",
      "quiz",
      "viva",
      "pyq_mode",
      "exam_mode",
      "common_mistakes",
      "connect",
      "real_world",
    ],
  });
}
