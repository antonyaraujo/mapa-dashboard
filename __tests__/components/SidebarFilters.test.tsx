import { render, screen } from "@testing-library/react";
import { SidebarFilters } from "@/components/panels/SidebarFilters";
import { useStations } from "@/hooks/useStations";

// Mocks
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock("@/hooks/useStations");

describe("SidebarFilters", () => {
  it("renderiza a quantidade correta de estações", () => {
    (useStations as jest.Mock).mockReturnValue({
      data: {
        features: [
          { properties: { country: "Brasil" } },
          { properties: { country: "Peru" } },
        ],
      },
      isLoading: false,
    });

    render(<SidebarFilters />);

    expect(screen.getByText(/Total de estações:/)).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });
});
