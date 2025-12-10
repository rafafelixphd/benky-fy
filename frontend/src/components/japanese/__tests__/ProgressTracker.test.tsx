import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { ProgressTracker } from "../ProgressTracker";

describe("ProgressTracker Component", () => {
  const mockStats = {
    correct: 8,
    incorrect: 2,
    total: 10,
    streakCount: 3,
    bestStreak: 5,
    averageTime: 2.5,
  };

  const mockProps = {
    stats: mockStats,
    onReset: jest.fn(),
    showDetails: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should display accuracy percentage", () => {
    render(<ProgressTracker {...mockProps} />);

    expect(screen.getByText("80%")).toBeInTheDocument();
  });

  it("should show progress bar with correct percentage", () => {
    render(<ProgressTracker {...mockProps} />);

    const progressBar = screen.getByRole("progressbar");
    expect(progressBar).toHaveAttribute("aria-valuenow", "80");
  });

  it("should display streak information", () => {
    render(<ProgressTracker {...mockProps} />);

    expect(screen.getByText(/current streak: 3/i)).toBeInTheDocument();
    expect(screen.getByText(/best streak: 5/i)).toBeInTheDocument();
  });

  it("should show average response time", () => {
    render(<ProgressTracker {...mockProps} />);

    expect(screen.getByText(/2.5s/i)).toBeInTheDocument();
  });

  it("should call onReset when reset button is clicked", () => {
    render(<ProgressTracker {...mockProps} />);

    const resetButton = screen.getByRole("button", { name: /reset/i });
    fireEvent.click(resetButton);

    expect(mockProps.onReset).toHaveBeenCalled();
  });

  it("should hide details when showDetails is false", () => {
    render(<ProgressTracker {...mockProps} showDetails={false} />);

    expect(screen.queryByText(/current streak/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/average time/i)).not.toBeInTheDocument();
  });

  it("should display correct color based on accuracy", () => {
    const { rerender } = render(<ProgressTracker {...mockProps} />);

    // Good accuracy (green)
    expect(screen.getByRole("progressbar")).toHaveClass("bg-green-500");

    // Medium accuracy (yellow)
    rerender(
      <ProgressTracker
        {...mockProps}
        stats={{ ...mockStats, correct: 6, incorrect: 4 }}
      />,
    );
    expect(screen.getByRole("progressbar")).toHaveClass("bg-yellow-500");

    // Low accuracy (red)
    rerender(
      <ProgressTracker
        {...mockProps}
        stats={{ ...mockStats, correct: 3, incorrect: 7 }}
      />,
    );
    expect(screen.getByRole("progressbar")).toHaveClass("bg-red-500");
  });

  it("should be keyboard accessible", () => {
    render(<ProgressTracker {...mockProps} />);

    const resetButton = screen.getByRole("button", { name: /reset/i });
    resetButton.focus();
    fireEvent.keyDown(resetButton, { key: "Enter" });

    expect(mockProps.onReset).toHaveBeenCalled();
  });

  it("should handle zero total attempts", () => {
    render(
      <ProgressTracker
        {...mockProps}
        stats={{ ...mockStats, correct: 0, incorrect: 0, total: 0 }}
      />,
    );

    expect(screen.getByText("0%")).toBeInTheDocument();
  });

  it("should show encouraging message based on progress", () => {
    render(<ProgressTracker {...mockProps} />);

    expect(screen.getByText(/great progress/i)).toBeInTheDocument();
  });
});
