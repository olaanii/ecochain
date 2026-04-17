import { render, screen } from "@testing-library/react";
import { usePathname } from "next/navigation";
import { Breadcrumbs } from "../breadcrumbs";

// Mock Next.js navigation hooks
jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
}));

const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;

describe("Breadcrumbs", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Requirement 11.1, 11.4: Breadcrumb display on nested routes", () => {
    it("should display breadcrumbs for nested routes", () => {
      mockUsePathname.mockReturnValue("/merchants/hub-main");

      render(<Breadcrumbs />);

      expect(screen.getByText("Merchants")).toBeInTheDocument();
      expect(screen.getByText("Hub")).toBeInTheDocument();
    });

    it("should display breadcrumbs for verification nested routes", () => {
      mockUsePathname.mockReturnValue("/verification/camera");

      render(<Breadcrumbs />);

      expect(screen.getByText("Verification")).toBeInTheDocument();
      expect(screen.getByText("Camera")).toBeInTheDocument();
    });

    it("should display breadcrumbs for deeply nested routes", () => {
      mockUsePathname.mockReturnValue("/merchants/redemption");

      render(<Breadcrumbs />);

      expect(screen.getByText("Merchants")).toBeInTheDocument();
      expect(screen.getByText("Redemption")).toBeInTheDocument();
    });
  });

  describe("Requirement 11.2: Route label mapping", () => {
    it("should use predefined labels from route mapping", () => {
      mockUsePathname.mockReturnValue("/verification/status");

      render(<Breadcrumbs />);

      expect(screen.getByText("Verification")).toBeInTheDocument();
      expect(screen.getByText("Status")).toBeInTheDocument();
    });

    it("should generate labels for unmapped routes", () => {
      mockUsePathname.mockReturnValue("/merchants/custom-page");

      render(<Breadcrumbs />);

      expect(screen.getByText("Merchants")).toBeInTheDocument();
      expect(screen.getByText("Custom Page")).toBeInTheDocument();
    });
  });

  describe("Requirement 11.3: Clickable breadcrumb segments", () => {
    it("should render non-current segments as clickable links", () => {
      mockUsePathname.mockReturnValue("/merchants/hub-main");

      render(<Breadcrumbs />);

      const merchantsLink = screen.getByRole("link", { name: "Merchants" });
      expect(merchantsLink).toHaveAttribute("href", "/merchants");
    });

    it("should render current page segment as non-clickable text", () => {
      mockUsePathname.mockReturnValue("/merchants/hub-main");

      render(<Breadcrumbs />);

      const currentPage = screen.getByText("Hub");
      expect(currentPage).not.toHaveAttribute("href");
      expect(currentPage).toHaveAttribute("aria-current", "page");
    });
  });

  describe("Requirement 11.5: Hide breadcrumbs on top-level routes", () => {
    it("should not render breadcrumbs on root route", () => {
      mockUsePathname.mockReturnValue("/");

      const { container } = render(<Breadcrumbs />);

      expect(container.firstChild).toBeNull();
    });

    it("should not render breadcrumbs on /dashboard", () => {
      mockUsePathname.mockReturnValue("/dashboard");

      const { container } = render(<Breadcrumbs />);

      expect(container.firstChild).toBeNull();
    });

    it("should not render breadcrumbs on /discover", () => {
      mockUsePathname.mockReturnValue("/discover");

      const { container } = render(<Breadcrumbs />);

      expect(container.firstChild).toBeNull();
    });

    it("should not render breadcrumbs on /bridge", () => {
      mockUsePathname.mockReturnValue("/bridge");

      const { container } = render(<Breadcrumbs />);

      expect(container.firstChild).toBeNull();
    });
  });

  describe("Breadcrumb segment generation", () => {
    it("should generate correct number of segments", () => {
      mockUsePathname.mockReturnValue("/verification/camera");

      render(<Breadcrumbs />);

      const links = screen.getAllByRole("link");
      expect(links).toHaveLength(1); // Only "Verification" is a link, "Camera" is current
    });

    it("should handle maxItems prop to collapse breadcrumbs", () => {
      mockUsePathname.mockReturnValue("/a/b/c/d/e/f");

      render(<Breadcrumbs maxItems={3} />);

      expect(screen.getByText("...")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA labels", () => {
      mockUsePathname.mockReturnValue("/merchants/hub-main");

      render(<Breadcrumbs />);

      const nav = screen.getByRole("navigation", { name: "Breadcrumb" });
      expect(nav).toBeInTheDocument();
    });

    it("should mark current page with aria-current", () => {
      mockUsePathname.mockReturnValue("/merchants/hub-main");

      render(<Breadcrumbs />);

      const currentPage = screen.getByText("Hub");
      expect(currentPage).toHaveAttribute("aria-current", "page");
    });
  });

  describe("Responsive design", () => {
    it("should render with responsive classes", () => {
      mockUsePathname.mockReturnValue("/merchants/hub-main");

      const { container } = render(<Breadcrumbs />);

      const nav = container.querySelector("nav");
      expect(nav?.className).toContain("text-sm");
      expect(nav?.className).toContain("md:text-base");
    });
  });
});
