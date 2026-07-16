import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { CampaignBuilder } from "@/components/sections/tools/campaign-builder";

describe("CampaignBuilder", () => {
  it("renders the four layers", () => {
    render(<CampaignBuilder />);
    for (const layer of ["discovery", "expansion", "heroes", "defense"]) {
      expect(screen.getByTestId(`layer-${layer}`)).toBeInTheDocument();
    }
    // Each layer renders its target budget percentage in the header badge.
    expect(screen.getAllByText((_, el) => !!el?.textContent?.includes("30%")).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText((_, el) => !!el?.textContent?.includes("10%")).length).toBeGreaterThanOrEqual(1);
  });

  it("renders preset campaigns in their layers", () => {
    render(<CampaignBuilder />);
    expect(screen.getByDisplayValue("WaterBottle – SP – Auto – Discovery")).toBeInTheDocument();
    expect(screen.getByDisplayValue("WaterBottle – SD – ASIN – Conquest")).toBeInTheDocument();
  });

  it("adds a campaign to the layer whose Add button was clicked", () => {
    render(<CampaignBuilder />);
    const defense = screen.getByTestId("layer-defense");
    expect(within(defense).getByText(/1 campaign/)).toBeInTheDocument();

    fireEvent.click(within(defense).getByRole("button", { name: /Add/ }));
    expect(within(defense).getByText(/2 campaigns/)).toBeInTheDocument();
  });

  it("does not add to a different layer", () => {
    render(<CampaignBuilder />);
    const heroes = screen.getByTestId("layer-heroes");
    const before = within(heroes).getByText(/\d+ campaign/).textContent;
    fireEvent.click(within(screen.getByTestId("layer-discovery")).getByRole("button", { name: /Add/ }));
    expect(within(heroes).getByText(/\d+ campaign/).textContent).toBe(before);
  });
});
