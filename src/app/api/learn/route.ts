import { NextResponse } from "next/server";
import { learn } from "@/lib/iris/engine";
import {
  handleError,
  requireUser,
  spreadInputSchema,
  toSpreadInput,
  unauthorized,
} from "../_shared";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(req: Request) {
  const user = await requireUser();
  if (!user) return unauthorized();

  try {
    const parsed = spreadInputSchema.parse(await req.json());
    const result = await learn(toSpreadInput(parsed));
    return NextResponse.json(result);
  } catch (err) {
    return handleError(err);
  }
}
