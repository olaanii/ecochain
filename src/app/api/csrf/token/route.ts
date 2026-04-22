/**
 * CSRF token endpoint
 * GET /api/csrf/token — returns a fresh CSRF token for the client
 */

import { NextResponse } from "next/server";
import { generateCsrfToken } from "@/lib/security/csrf";

export const runtime = "nodejs";

export async function GET(): Promise<NextResponse> {
  try {
    const token = await generateCsrfToken();
    return NextResponse.json({ token });
  } catch (err) {
    console.error("[CSRF] Failed to generate token:", err);
    return NextResponse.json({ error: "Failed to generate CSRF token" }, { status: 500 });
  }
}
