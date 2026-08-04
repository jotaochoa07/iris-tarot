import { NextResponse } from "next/server";
import { z } from "zod";
import { detectCards } from "@/lib/iris/engine";
import { handleError, requireUser, unauthorized } from "../_shared";

export const runtime = "nodejs";
export const maxDuration = 60;

const bodySchema = z.object({
  imageBase64: z.string().min(100),
  mediaType: z.enum(["image/jpeg", "image/png", "image/webp"]),
});

export async function POST(req: Request) {
  const user = await requireUser();
  if (!user) return unauthorized();

  try {
    const body = bodySchema.parse(await req.json());
    const result = await detectCards(body);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[IRIS] fallo en /api/detect:", err);
    return handleError(err);
  }
}
