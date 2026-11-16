import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { usageTracker } from "@/lib/ai/usage";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    let userId = "mock-user";

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) userId = user.id;
    } catch {
      // mock mode
    }

    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get("days") || "30", 10);

    const usage = await usageTracker.getUsageForUser(userId, days);
    const totalCost = await usageTracker.getTotalCost(userId, days);
    const byProvider = await usageTracker.getUsageByProvider(userId, days);

    return NextResponse.json({
      user_id: userId,
      period_days: days,
      total_cost: totalCost,
      total_requests: usage.length,
      by_provider: byProvider,
      usage: usage.slice(-50), // last 50
      budget: {
        monthly_budget: 10,
        warning_threshold: 0.8,
        hard_stop: false,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          what: "Failed to get usage",
          why: error instanceof Error ? error.message : String(error),
          what_to_do: "Check logs, try again",
        },
      },
      { status: 500 }
    );
  }
}
