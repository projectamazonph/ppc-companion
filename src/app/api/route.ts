import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    app: "PPC Companion",
    version: "0.5.0",
    docs: "/api/health",
  });
}
