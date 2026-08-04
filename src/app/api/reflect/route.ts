import { NextResponse } from "next/server";
import { reflect, buildReadout } from "@/lib/iris/engine";
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
    const input = toSpreadInput(parsed);
    const [analysis] = await Promise.all([reflect(input)]);
    return NextResponse.json({
      ...analysis,
      structural_readout: buildReadout(input.cards),
    });
  } catch (err) {
    return handleError(err);
  }
}
