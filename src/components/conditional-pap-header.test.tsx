import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";

// next/navigation is a client-only API; mock it so we can drive pathname.
const usePathnameMock = vi.fn();
vi.mock("next/navigation", () => ({
  usePathname: () => usePathnameMock(),
}));

// The component imports the legacy header; mock it so we can assert when it
// renders vs. when it doesn't.
const papHeaderMock = vi.fn(() => <div data-testid="pap-header" />);
vi.mock("@/components/header", () => ({
  PapHeader: () => papHeaderMock(),
}));

import { ConditionalPapHeader } from "@/components/conditional-pap-header";

describe("ConditionalPapHeader", () => {
  it("renders nothing for /sampler", async () => {
    usePathnameMock.mockReturnValue("/sampler");
    const { container, queryByTestId } = render(<ConditionalPapHeader />);
    expect(container.firstChild).toBeNull();
    expect(queryByTestId("pap-header")).toBeNull();
    expect(papHeaderMock).not.toHaveBeenCalled();
  });

  it("renders nothing for nested /sampler/... paths", async () => {
    usePathnameMock.mockReturnValue("/sampler/some/deeper/route");
    const { container, queryByTestId } = render(<ConditionalPapHeader />);
    expect(container.firstChild).toBeNull();
    expect(queryByTestId("pap-header")).toBeNull();
    expect(papHeaderMock).not.toHaveBeenCalled();
  });

  it("renders PapHeader for non-sampler routes", async () => {
    usePathnameMock.mockReturnValue("/dashboard");
    papHeaderMock.mockClear();
    const { getByTestId } = render(<ConditionalPapHeader />);
    expect(getByTestId("pap-header")).toBeInTheDocument();
    expect(papHeaderMock).toHaveBeenCalledTimes(1);
  });

  it("renders PapHeader for / (root)", async () => {
    usePathnameMock.mockReturnValue("/");
    papHeaderMock.mockClear();
    const { getByTestId } = render(<ConditionalPapHeader />);
    expect(getByTestId("pap-header")).toBeInTheDocument();
    expect(papHeaderMock).toHaveBeenCalledTimes(1);
  });
});