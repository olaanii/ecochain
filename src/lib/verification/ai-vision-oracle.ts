/**
 * AI Vision Oracle Integration
 * 
 * Requirement 3.4
 * Integrates with OpenAI API for image verification
 */

import { logger } from "@/lib/api/middleware/logging";

export interface VisionAnalysisResult {
  confidence: number; // 0.0 to 1.0
  description: string;
  labels: string[];
  metadata: Record<string, unknown>;
}

/**
 * Analyze image using OpenAI Vision API
 * Requirement 3.4
 */
export async function analyzeImageWithVision(
  imageUrl: string,
  taskContext: string,
  timeout: number = 30000
): Promise<VisionAnalysisResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY not configured");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze this image for the following task: ${taskContext}. 
                
                Provide your response in JSON format with:
                - confidence: a number between 0.0 and 1.0 indicating how confident you are that this image matches the task requirements
                - description: a brief description of what you see in the image
                - labels: an array of relevant labels/tags for the image
                
                Be strict in your analysis. Only give high confidence (>0.7) if the image clearly shows evidence of the task being completed.`,
              },
              {
                type: "image_url",
                image_url: {
                  url: imageUrl,
                },
              },
            ],
          },
        ],
        max_tokens: 500,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const error = await response.json();
      logger.error("OpenAI API error", {
        status: response.status,
        error,
      });
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Parse JSON response from OpenAI
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to parse OpenAI response");
    }

    const result = JSON.parse(jsonMatch[0]);

    // Validate confidence score
    if (typeof result.confidence !== "number" || result.confidence < 0 || result.confidence > 1) {
      throw new Error("Invalid confidence score from OpenAI");
    }

    return {
      confidence: result.confidence,
      description: result.description || "",
      labels: result.labels || [],
      metadata: {
        model: "gpt-4-vision-preview",
        timestamp: new Date().toISOString(),
      },
    };
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error) {
      if (error.name === "AbortError") {
        throw new Error("Vision analysis timeout (30 seconds)");
      }
      throw error;
    }

    throw new Error("Unknown error during vision analysis");
  }
}

/**
 * Validate confidence score
 * Requirement 3.4, 3.5
 */
export function validateConfidenceScore(confidence: number): boolean {
  return confidence >= 0.0 && confidence <= 1.0;
}

/**
 * Check if confidence meets threshold
 * Requirement 3.5
 */
export function meetsConfidenceThreshold(confidence: number, threshold: number = 0.7): boolean {
  return confidence >= threshold;
}
