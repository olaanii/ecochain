/**
 * OpenAPI specification endpoint
 * GET /api/openapi — returns OpenAPI 3.1 JSON spec
 */

import { NextResponse } from "next/server";
import { generateOpenApiSpec } from "@/lib/api/openapi";

export const runtime = "nodejs";

export async function GET(): Promise<NextResponse> {
  try {
    const spec = generateOpenApiSpec();
    return NextResponse.json(spec, {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    console.error("[OpenAPI] Failed to generate spec:", err);
    return NextResponse.json({ error: "Failed to generate OpenAPI spec" }, { status: 500 });
  }
}
