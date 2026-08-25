import { render, screen } from "@testing-library/react";
import DashboardPage from "./page";
import { getDashboardCounts } from "@/services/dashboard/queries";

jest.mock("@/services/dashboard/queries", () => ({
  getDashboardCounts: jest.fn(),
}));

jest.mock("@/components/dashboard/DashboardHeader", () => {
  return function MockDashboardHeader() {
    return <div>Dashboard Header</div>;
  };
});

describe("DashboardPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders real counts for sports and organisers", async () => {
    (getDashboardCounts as jest.Mock).mockResolvedValue({
      sports: 5,
      organisers: 3,
    });

    const ui = await DashboardPage();
    render(ui);

    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("Sports")).toBeInTheDocument();
    expect(screen.getByText("Organisers")).toBeInTheDocument();
  });

  it("shows a placeholder for tournaments since that data does not exist yet", async () => {
    (getDashboardCounts as jest.Mock).mockResolvedValue({
      sports: 0,
      organisers: 0,
    });

    const ui = await DashboardPage();
    render(ui);

    expect(screen.getByText("—")).toBeInTheDocument();
    expect(screen.getByText("Active Tournaments")).toBeInTheDocument();
  });
});
