// ============================================================
// AI Usage Tracking & Cost Control
// Workspace 2 Parts 37-38
// ============================================================

import { ProviderName } from "./types";
import { logger } from "@/lib/logger";

export interface UsageRecord {
  user_id: string;
  provider: ProviderName;
  model: string;
  tokens_input?: number;
  tokens_output?: number;
  cost_estimate?: number;
  task?: string;
  course_id?: string;
  expert_id?: string;
  conversation_id?: string;
  created_at?: string;
}

export interface BudgetConfig {
  monthly_budget?: number; // in USD
  warning_threshold?: number; // e.g., 0.8 = 80% of budget
  hard_stop?: boolean; // if true, block requests when budget exceeded
}

// In-memory storage for mock mode, real would be Supabase
const inMemoryUsage: UsageRecord[] = [];

export class UsageTracker {
  // Track usage
  async track(record: UsageRecord): Promise<void> {
    const fullRecord = {
      ...record,
      created_at: record.created_at || new Date().toISOString(),
    };

    // In mock mode or when Supabase not configured, store in memory
    inMemoryUsage.push(fullRecord);

    logger.ai(record.provider, `Usage tracked: ${record.tokens_input || 0} input, ${record.tokens_output || 0} output, cost $${record.cost_estimate?.toFixed(4) || 0}`, {
      model: record.model,
      task: record.task,
      user_id: record.user_id,
    });

    // TODO: Save to Supabase ai_usage table when configured
    // const supabase = createAdminClient()
    // await supabase.from('ai_usage').insert(fullRecord)

    // Keep only last 1000 in memory to avoid memory leak
    if (inMemoryUsage.length > 1000) {
      inMemoryUsage.shift();
    }
  }

  // Get usage for user
  async getUsageForUser(userId: string, days: number = 30): Promise<UsageRecord[]> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    return inMemoryUsage.filter((r) => r.user_id === userId && new Date(r.created_at!) >= cutoff);

    // TODO: Query Supabase
  }

  // Get total cost for user in period
  async getTotalCost(userId: string, days: number = 30): Promise<number> {
    const usage = await this.getUsageForUser(userId, days);
    return usage.reduce((sum, r) => sum + (r.cost_estimate || 0), 0);
  }

  // Get usage by provider
  async getUsageByProvider(userId: string, days: number = 30): Promise<Record<string, { tokens: number; cost: number; requests: number }>> {
    const usage = await this.getUsageForUser(userId, days);
    const byProvider: Record<string, { tokens: number; cost: number; requests: number }> = {};

    for (const record of usage) {
      if (!byProvider[record.provider]) {
        byProvider[record.provider] = { tokens: 0, cost: 0, requests: 0 };
      }
      byProvider[record.provider].tokens += (record.tokens_input || 0) + (record.tokens_output || 0);
      byProvider[record.provider].cost += record.cost_estimate || 0;
      byProvider[record.provider].requests += 1;
    }

    return byProvider;
  }

  // Check budget
  async checkBudget(userId: string, budgetConfig: BudgetConfig): Promise<{ allowed: boolean; warning?: string; totalCost: number }> {
    if (!budgetConfig.monthly_budget) {
      return { allowed: true, totalCost: 0 };
    }

    const totalCost = await this.getTotalCost(userId, 30);
    const budget = budgetConfig.monthly_budget;
    const warningThreshold = budgetConfig.warning_threshold || 0.8;

    if (totalCost >= budget) {
      if (budgetConfig.hard_stop) {
        return {
          allowed: false,
          warning: `Monthly budget of $${budget} exceeded. Total cost: $${totalCost.toFixed(4)}. Enable more budget or use Mock provider.`,
          totalCost,
        };
      } else {
        return {
          allowed: true,
          warning: `Monthly budget of $${budget} exceeded. Total cost: $${totalCost.toFixed(4)}. Consider using cheaper models or Mock provider.`,
          totalCost,
        };
      }
    }

    if (totalCost >= budget * warningThreshold) {
      return {
        allowed: true,
        warning: `Warning: ${Math.round((totalCost / budget) * 100)}% of monthly budget used. Total: $${totalCost.toFixed(4)} / $${budget}`,
        totalCost,
      };
    }

    return { allowed: true, totalCost };
  }

  // For testing: clear in-memory
  clear(): void {
    inMemoryUsage.length = 0;
  }

  // Get all in-memory (for admin dashboard)
  getAll(): UsageRecord[] {
    return [...inMemoryUsage];
  }
}

export const usageTracker = new UsageTracker();

// Cost estimation helpers (rough, update with real pricing)
export function estimateCost(provider: ProviderName, model: string, inputTokens: number, outputTokens: number): number {
  const pricing: Record<string, { input: number; output: number }> = {
    // OpenAI
    "gpt-4o-mini": { input: 0.00000015, output: 0.0000006 },
    "gpt-4o": { input: 0.0000025, output: 0.00001 },
    // Gemini (free tier, so 0, but show if paid)
    "gemini-1.5-flash": { input: 0, output: 0 },
    "gemini-1.5-pro": { input: 0, output: 0 },
    // Anthropic
    "claude-3-5-sonnet-20241022": { input: 0.000003, output: 0.000015 },
    "claude-3-5-haiku-20241022": { input: 0.0000008, output: 0.000004 },
    // Mock
    "mock-v1": { input: 0, output: 0 },
    "mock-vision": { input: 0, output: 0 },
  };

  const price = pricing[model] || { input: 0.000001, output: 0.000002 }; // default rough
  return inputTokens * price.input + outputTokens * price.output;
}
