// ============================================================
// Error / Logging System — Workspace 1 Part 24 (starter)
// ============================================================

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  timestamp: string;
  user_id?: string;
  course_id?: string;
  provider?: string;
}

class Logger {
  private isDev = process.env.NODE_ENV === "development";

  private log(level: LogLevel, message: string, context?: Record<string, unknown>) {
    const entry: LogEntry = {
      level,
      message,
      context,
      timestamp: new Date().toISOString(),
    };

    // In dev, log to console with colors
    if (this.isDev) {
      const colors: Record<LogLevel, string> = {
        debug: "\x1b[90m", // gray
        info: "\x1b[36m", // cyan
        warn: "\x1b[33m", // yellow
        error: "\x1b[31m", // red
      };
      const reset = "\x1b[0m";
      console.log(`${colors[level]}[${level.toUpperCase()}]${reset} ${message}`, context ? context : "");
    } else {
      // In production, you could send to Supabase logs table or external service
      // For now, console.log but structured
      console.log(JSON.stringify(entry));
    }

    // Future: Save to Supabase table `system_logs` for admin dashboard
  }

  debug(message: string, context?: Record<string, unknown>) {
    this.log("debug", message, context);
  }

  info(message: string, context?: Record<string, unknown>) {
    this.log("info", message, context);
  }

  warn(message: string, context?: Record<string, unknown>) {
    this.log("warn", message, context);
  }

  error(message: string, context?: Record<string, unknown>) {
    this.log("error", message, context);
  }

  // Specialized loggers
  ai(provider: string, message: string, context?: Record<string, unknown>) {
    this.info(`[AI:${provider}] ${message}`, context);
  }

  auth(message: string, context?: Record<string, unknown>) {
    this.info(`[AUTH] ${message}`, context);
  }

  db(message: string, context?: Record<string, unknown>) {
    this.info(`[DB] ${message}`, context);
  }

  rag(message: string, context?: Record<string, unknown>) {
    this.info(`[RAG] ${message}`, context);
  }
}

export const logger = new Logger();

// Error handling helper — returns WHAT, WHY, WHAT TO DO
export function createErrorResponse(
  what: string,
  why: string,
  whatToDo: string,
  status: number = 500
) {
  logger.error(what, { why, whatToDo, status });
  return {
    error: {
      what,
      why,
      what_to_do: whatToDo,
    },
    status,
  };
}

// For API routes
export function handleApiError(error: unknown) {
  if (error instanceof Error) {
    return createErrorResponse(
      error.message,
      error.stack || "Unknown stack",
      "Check logs, verify env vars, and try again. If persists, report in GitHub issues.",
      500
    );
  }
  return createErrorResponse(
    "Unknown error",
    String(error),
    "Check logs and try again",
    500
  );
}
