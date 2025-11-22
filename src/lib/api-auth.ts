import { NextResponse } from "next/server";
import { env } from "@/lib/env";

/**
 * Validates the API key from the request headers.
 * Checks for the key in 'x-api-key' header or 'Authorization: Bearer <key>' header.
 * 
 * @param request - The incoming request
 * @returns The API key if valid, null otherwise
 */
export function getApiKeyFromRequest(request: Request): string | null {
  // Check x-api-key header first
  const apiKeyHeader = request.headers.get("x-api-key");
  if (apiKeyHeader) {
    return apiKeyHeader.trim();
  }

  // Check Authorization header with Bearer token
  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7).trim();
  }

  // Check api-key header as fallback
  const fallbackHeader = request.headers.get("api-key");
  if (fallbackHeader) {
    return fallbackHeader.trim();
  }

  return null;
}

/**
 * Validates the API key against the configured API_KEY environment variable.
 * Allows same-origin requests without an API key (from your own frontend).
 * Requires API key for all external/cross-origin requests.
 * 
 * @param request - The incoming request
 * @returns NextResponse with error if invalid, null if valid
 */
export function validateApiKey(request: Request): NextResponse | null {
  // Check if this is a same-origin request (from your own frontend)
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const host = request.headers.get("host");
  
  // Extract host from origin or referer
  let requestHost: string | null = null;
  if (origin) {
    try {
      const originUrl = new URL(origin);
      requestHost = originUrl.host;
    } catch {
      // Invalid origin, ignore
    }
  } else if (referer) {
    try {
      const refererUrl = new URL(referer);
      requestHost = refererUrl.host;
    } catch {
      // Invalid referer, ignore
    }
  }
  
  // If request is from same origin as the server, allow without API key
  if (requestHost && host && requestHost === host) {
    return null; // Same-origin request allowed
  }
  
  // For cross-origin requests, require API key
  const providedKey = getApiKeyFromRequest(request);
  
  if (!providedKey) {
    return NextResponse.json(
      { error: "API key required. Please provide an API key in the 'x-api-key' header or 'Authorization: Bearer <key>' header." },
      { status: 401 }
    );
  }

  const validApiKey = env.API_KEY;

  if (!validApiKey) {
    // If API_KEY is not configured, allow the request (for public endpoints)
    // Protected endpoints should not call validateApiKey if API_KEY is optional
    return NextResponse.json(
      { error: "API key validation is not configured. This endpoint requires API key authentication." },
      { status: 401 }
    );
  }

  // Use constant-time comparison to prevent timing attacks
  if (!constantTimeEquals(providedKey, validApiKey)) {
    return NextResponse.json(
      { error: "Invalid API key" },
      { status: 401 }
    );
  }

  return null;
}

/**
 * Constant-time string comparison to prevent timing attacks.
 * 
 * @param a - First string
 * @param b - Second string
 * @returns true if strings are equal, false otherwise
 */
function constantTimeEquals(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

