import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";

/**
 * GET /api/health
 * Check API and KV connection health
 */
export async function GET() {
  try {
    // Test KV connection
    const testKey = "health-check-test";
    const testValue = Date.now();
    
    await kv.set(testKey, testValue);
    const retrievedValue = await kv.get(testKey);
    await kv.del(testKey);

    const kvWorking = retrievedValue === testValue;

    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      kv: {
        connected: kvWorking,
        hasUrl: !!process.env.KV_REST_API_URL,
        hasToken: !!process.env.KV_REST_API_TOKEN,
      },
      env: process.env.NODE_ENV,
    });
  } catch (error) {
    console.error("Health check failed:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        error: errorMessage,
        kv: {
          connected: false,
          hasUrl: !!process.env.KV_REST_API_URL,
          hasToken: !!process.env.KV_REST_API_TOKEN,
        },
        env: process.env.NODE_ENV,
      },
      { status: 500 }
    );
  }
}
