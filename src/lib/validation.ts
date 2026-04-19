import { z } from "zod";

// Address validation
export const addressSchema = z
  .string()
  .min(42, "Address must be 42 characters")
  .max(42, "Address must be 42 characters")
  .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid address format");

// Amount validation
export const amountSchema = z
  .string()
  .refine((val) => !isNaN(parseFloat(val)), "Amount must be a number")
  .refine((val) => parseFloat(val) > 0, "Amount must be greater than 0")
  .refine((val) => parseFloat(val) <= Number.MAX_SAFE_INTEGER, "Amount is too large");

// Transaction hash validation
export const txHashSchema = z
  .string()
  .min(66, "Transaction hash must be 66 characters")
  .max(66, "Transaction hash must be 66 characters")
  .regex(/^0x[a-fA-F0-9]{64}$/, "Invalid transaction hash format");

// Email validation
export const emailSchema = z
  .string()
  .email("Invalid email address");

// Username validation
export const usernameSchema = z
  .string()
  .min(3, "Username must be at least 3 characters")
  .max(30, "Username must be at most 30 characters")
  .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, hyphens, and underscores");

// Validation functions
export function validateAddress(address: string): boolean {
  try {
    addressSchema.parse(address);
    return true;
  } catch {
    return false;
  }
}

export function validateAmount(amount: string): boolean {
  try {
    amountSchema.parse(amount);
    return true;
  } catch {
    return false;
  }
}

export function validateTxHash(hash: string): boolean {
  try {
    txHashSchema.parse(hash);
    return true;
  } catch {
    return false;
  }
}

export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+=/gi, "")
    .replace(/data:/gi, "")
    .slice(0, 1000); // Limit length
}

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export function sanitizeHTML(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

/**
 * Sanitize URL to prevent malicious URLs
 */
export function sanitizeURL(url: string): string {
  const sanitized = url.trim().toLowerCase();
  
  // Block javascript: and data: protocols
  if (sanitized.startsWith('javascript:') || 
      sanitized.startsWith('data:') ||
      sanitized.startsWith('vbscript:')) {
    return '';
  }
  
  // Ensure URL starts with http:// or https://
  if (!sanitized.startsWith('http://') && !sanitized.startsWith('https://')) {
    return '';
  }
  
  return url.trim();
}

/**
 * Sanitize numeric input to prevent injection
 */
export function sanitizeNumber(input: string): string {
  return input.replace(/[^\d.-]/g, '');
}

/**
 * Sanitize address input for blockchain
 */
export function sanitizeAddress(address: string): string {
  return address.trim().toLowerCase();
}

/**
 * Validate and sanitize JSON input
 */
export function sanitizeJSON(input: string): string | null {
  try {
    const parsed = JSON.parse(input);
    JSON.stringify(parsed); // Re-stringify to ensure it's valid
    return input;
  } catch {
    return null;
  }
}

/**
 * Deep sanitize an object recursively
 */
export function deepSanitize(obj: any): any {
  if (typeof obj === 'string') {
    return sanitizeInput(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(deepSanitize);
  }
  
  if (obj !== null && typeof obj === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      // Sanitize keys as well
      const sanitizedKey = sanitizeInput(key);
      sanitized[sanitizedKey] = deepSanitize(value);
    }
    return sanitized;
  }
  
  return obj;
}
