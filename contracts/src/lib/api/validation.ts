/**
 * Validation utilities for API requests
 * Includes Bech32 address validation, input sanitization, and common validators
 * Requirements: 25.1, 25.2, 25.3, 25.5, 25.6, 25.7, 25.8
 */

/**
 * Validate Bech32 address format
 * Bech32 addresses start with a prefix (e.g., "initia1") followed by 38 alphanumeric characters
 * @param address Address to validate
 * @returns True if valid Bech32 address
 */
export function validateBech32Address(address: string): boolean {
  if (!address || typeof address !== "string") {
    return false;
  }

  // Bech32 format: prefix (1-83 chars) + "1" + data (6-90 chars)
  // For Initia: "initia1" + 38 alphanumeric chars
  const bech32Regex = /^[a-z0-9]{2,83}1[a-z0-9]{6,90}$/;
  return bech32Regex.test(address);
}

/**
 * Validate token amount
 * Must be a positive integer
 * @param amount Amount to validate
 * @returns True if valid token amount
 */
export function validateTokenAmount(amount: unknown): boolean {
  if (typeof amount !== "number") {
    return false;
  }

  return Number.isInteger(amount) && amount > 0 && amount <= Number.MAX_SAFE_INTEGER;
}

/**
 * Validate timestamp
 * Must be within 48 hours of current time and not in the future
 * @param timestamp Timestamp to validate (milliseconds since epoch)
 * @returns True if valid timestamp
 */
export function validateTimestamp(timestamp: unknown): boolean {
  if (typeof timestamp !== "number") {
    return false;
  }

  const now = Date.now();
  const fortyEightHoursMs = 48 * 60 * 60 * 1000;

  // Timestamp must not be in the future
  if (timestamp > now) {
    return false;
  }

  // Timestamp must be within 48 hours
  if (now - timestamp > fortyEightHoursMs) {
    return false;
  }

  return true;
}

/**
 * Validate proof hash format
 * SHA-256 hash: 64 hexadecimal characters
 * @param hash Hash to validate
 * @returns True if valid proof hash
 */
export function validateProofHash(hash: string): boolean {
  if (!hash || typeof hash !== "string") {
    return false;
  }

  // SHA-256 produces 64 hex characters
  const sha256Regex = /^[a-f0-9]{64}$/i;
  return sha256Regex.test(hash);
}

/**
 * Validate task ID format
 * Alphanumeric with hyphens
 * @param taskId Task ID to validate
 * @returns True if valid task ID
 */
export function validateTaskId(taskId: string): boolean {
  if (!taskId || typeof taskId !== "string") {
    return false;
  }

  const taskIdRegex = /^[a-z0-9-]+$/;
  return taskIdRegex.test(taskId);
}

/**
 * Validate stake duration
 * Must be one of: 30, 90, 180, 365 days
 * @param duration Duration in days
 * @returns True if valid stake duration
 */
export function validateStakeDuration(duration: unknown): boolean {
  if (typeof duration !== "number") {
    return false;
  }

  return [30, 90, 180, 365].includes(duration);
}

/**
 * Sanitize string input to prevent XSS attacks
 * Removes HTML tags, script tags, and event handlers
 * @param input String to sanitize
 * @returns Sanitized string
 */
export function sanitizeString(input: string): string {
  if (typeof input !== "string") {
    return "";
  }

  let sanitized = input;

  // Remove HTML tags
  sanitized = sanitized.replace(/<[^>]*>/g, "");

  // Remove script tags and content
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");

  // Remove event handlers (onclick, onload, etc.)
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, "");

  // Remove javascript: protocol
  sanitized = sanitized.replace(/javascript:/gi, "");

  // Trim whitespace
  sanitized = sanitized.trim();

  return sanitized;
}

/**
 * Sanitize object recursively
 * Applies sanitization to all string values
 * @param obj Object to sanitize
 * @returns Sanitized object
 */
export function sanitizeObject(obj: unknown): unknown {
  if (typeof obj === "string") {
    return sanitizeString(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  if (obj !== null && typeof obj === "object") {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObject(value);
    }
    return sanitized;
  }

  return obj;
}

/**
 * Validate geolocation coordinates
 * @param latitude Latitude (-90 to 90)
 * @param longitude Longitude (-180 to 180)
 * @returns True if valid coordinates
 */
export function validateGeolocation(latitude: unknown, longitude: unknown): boolean {
  if (typeof latitude !== "number" || typeof longitude !== "number") {
    return false;
  }

  return latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
}

/**
 * Validate file size
 * @param sizeInBytes File size in bytes
 * @param maxSizeInMB Maximum allowed size in MB
 * @returns True if file size is valid
 */
export function validateFileSize(sizeInBytes: number, maxSizeInMB: number = 10): boolean {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return sizeInBytes > 0 && sizeInBytes <= maxSizeInBytes;
}

/**
 * Validate email format
 * @param email Email to validate
 * @returns True if valid email
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== "string") {
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate URL format
 * @param url URL to validate
 * @returns True if valid URL
 */
export function validateUrl(url: string): boolean {
  if (!url || typeof url !== "string") {
    return false;
  }

  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
