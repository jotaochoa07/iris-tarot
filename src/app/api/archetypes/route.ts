import { NextResponse } from "next/server";
import { archetypes } from "@/lib/iris/engine";
import {
  handleError,
  readerNameFor,
  requireUser,
  spreadInputSchema,
  toSpreadInput,
  unauthorized,
} from "../_shared";

export const runtime = "nodejs";
export const maxDuration = 90;

export async function POST(req: Request) {
  const user = await requireUser();
  if (!user) return unauthorized();

  try {
    const parsed = spreadInputSchema.parse(await req.json());
    const result = await archetypes(toSpreadInput(parsed, await readerNameFor(user.id)));
    return NextResponse.json(result);
  } catch (err) {
    return handleError(err);
  }
}
