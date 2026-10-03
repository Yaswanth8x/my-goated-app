import { NextResponse } from "next/server";
import { modelRegistry, getEnabledModels, getFreeModels, getVisionModels } from "@/lib/ai/models";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const filter = searchParams.get("filter"); // free, vision, all
  const provider = searchParams.get("provider");

  let models = getEnabledModels();

  if (filter === "free") {
    models = getFreeModels();
  } else if (filter === "vision") {
    models = getVisionModels();
  }

  if (provider) {
    models = models.filter((m) => m.provider === provider);
  }

  return NextResponse.json({
    models,
    total: models.length,
    registry: modelRegistry, // full registry for admin
  });
}
