import {
  sanitizeInput,
  sanitizeObject,
  ValidationSchemas,
} from "../../src/lib/api/middleware/validation";

describe("Validation Middleware", () => {
  describe("sanitizeInput", () => {
    it("should remove HTML tags", () => {
      const input = "<script>alert('xss')</script>Hello";
      const result = sanitizeInput(input);
      expect(result).not.toContain("<script>");
      expect(result).toContain("Hello");
    });

    it("should remove event handlers", () => {
      const input = '<div onclick="alert(\'xss\')">Click me</div>';
      const result = sanitizeInput(input);
      expect(result).not.toContain("onclick");
    });

    it("should trim whitespace", () => {
      const input = "  hello world  ";
      const result = sanitizeInput(input);
      expect(result).toBe("hello world");
    });
  });

  describe("sanitizeObject", () => {
    it("should sanitize string values", () => {
      const obj = {
        name: "<script>alert('xss')</script>John",
      };
      const result = sanitizeObject(obj);
      expect(result.name).not.toContain("<script>");
    });

    it("should sanitize nested objects", () => {
      const obj = {
        user: {
          name: "<b>John</b>",
        },
      };
      const result = sanitizeObject(obj);
      expect(result.user.name).not.toContain("<b>");
    });

    it("should sanitize arrays", () => {
      const obj = {
        items: ["<script>xss</script>", "safe"],
      };
      const result = sanitizeObject(obj);
      expect(result.items[0]).not.toContain("<script>");
    });
  });

  describe("ValidationSchemas", () => {
    it("should validate token amount", () => {
      const schema = ValidationSchemas.tokenAmount;
      expect(schema.safeParse(100).success).toBe(true);
      expect(schema.safeParse(-100).success).toBe(false);
      expect(schema.safeParse(1.5).success).toBe(false);
    });

    it("should validate stake duration", () => {
      const schema = ValidationSchemas.stakeDuration;
      expect(schema.safeParse(30).success).toBe(true);
      expect(schema.safeParse(90).success).toBe(true);
      expect(schema.safeParse(180).success).toBe(true);
      expect(schema.safeParse(365).success).toBe(true);
      expect(schema.safeParse(60).success).toBe(false);
    });

    it("should validate category", () => {
      const schema = ValidationSchemas.category;
      expect(schema.safeParse("transit").success).toBe(true);
      expect(schema.safeParse("recycling").success).toBe(true);
      expect(schema.safeParse("invalid").success).toBe(false);
    });
  });
});
