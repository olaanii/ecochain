/**
 * CSRF protection via double-submit cookie pattern.
 * Generates CSRF token, validates token on state-changing requests.
 *
 * Implementation:
 * 1. Server sets HttpOnly `csrf_secret` cookie (random 32 bytes)
 * 2. Client reads cookie via /api/csrf/token endpoint
 * 3. Client sends token in X-CSRF-Token header for POST/PUT/DELETE
 * 4. Server validates token matches cookie secret + signature
 */

import { cookies } from "next/headers";
import { createHmac, randomBytes, timingSafeEqual } from "crypto";

const CSRF_COOKIE_NAME = "csrf_secret";
const CSRF_TOKEN_LENGTH = 32;
const TOKEN_VERSION = "v1";

function generateSecret(): string {
  return randomBytes(32).toString("base64url");
}

function signToken(secret: string, token: string): string {
  const hmac = createHmac("sha256", secret);
  hmac.update(token);
  return hmac.digest("base64url").slice(0, 16);
}

function generateToken(secret: string): string {
  const random = randomBytes(CSRF_TOKEN_LENGTH).toString("base64url");
  const signature = signToken(secret, random);
  return `${TOKEN_VERSION}.${random}.${signature}`;
}

function validateTokenFormat(token: string): { random: string; signature: string } | null {
  const parts = token.split(".");
  if (parts.length !== 3 || parts[0] !== TOKEN_VERSION) return null;
  return { random: parts[1], signature: parts[2] };
}

/**
 * Get or create CSRF secret from cookie
 */
export async function getCsrfSecret(): Promise<string> {
  const cookieStore = await cookies();
  const existing = cookieStore.get(CSRF_COOKIE_NAME);
  if (existing?.value) return existing.value;

  const secret = generateSecret();
  cookieStore.set(CSRF_COOKIE_NAME, secret, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24, // 24 hours
  });
  return secret;
}

/**
 * Generate a CSRF token for the client
 */
export async function generateCsrfToken(): Promise<string> {
  const secret = await getCsrfSecret();
  return generateToken(secret);
}

/**
 * Validate a CSRF token against the cookie secret
 */
export async function validateCsrfToken(token: string): Promise<boolean> {
  const cookieStore = await cookies();
  const secret = cookieStore.get(CSRF_COOKIE_NAME)?.value;
  if (!secret) return false;

  const parsed = validateTokenFormat(token);
  if (!parsed) return false;

  const expectedSignature = signToken(secret, parsed.random);

  try {
    return timingSafeEqual(
      Buffer.from(parsed.signature),
      Buffer.from(expectedSignature)
    );
  } catch {
    return false;
  }
}

/**
 * Check if request method requires CSRF protection
 */
export function requiresCsrfProtection(method: string): boolean {
  return ["POST", "PUT", "PATCH", "DELETE"].includes(method.toUpperCase());
}
