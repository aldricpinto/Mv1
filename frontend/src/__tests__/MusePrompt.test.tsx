import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PromptForm } from "@/components/PromptForm";

describe("PromptForm", () => {
  it("matches snapshot", () => {
    const { container } = render(<PromptForm onSubmit={vi.fn()} loading={false} error={null} />);
    expect(container).toMatchSnapshot();
  });

  it("shows backend errors inline", () => {
    const { getByText } = render(
      <PromptForm onSubmit={vi.fn()} loading={false} error="Boom" />
    );
    expect(getByText("Boom")).toBeInTheDocument();
  });
});
