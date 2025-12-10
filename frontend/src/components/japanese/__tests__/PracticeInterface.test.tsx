import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { PracticeInterface } from "../PracticeInterface";

describe("PracticeInterface Component", () => {
  const mockWords = [
    {
      id: "1",
      kanji: "私",
      hiragana: "わたし",
      english: "I, me",
      type: "noun" as const,
    },
    {
      id: "2",
      kanji: "見る",
      hiragana: "みる",
      english: "to see",
      type: "verb" as const,
    },
  ];

  const mockProps = {
    words: mockWords,
    onComplete: jest.fn(),
    onProgress: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render the first word initially", () => {
    render(<PracticeInterface {...mockProps} />);

    expect(screen.getByText("私")).toBeInTheDocument();
    expect(screen.getByText("I, me")).toBeInTheDocument();
  });

  it("should handle correct answers", async () => {
    render(<PracticeInterface {...mockProps} />);

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "わたし" } });
    fireEvent.click(screen.getByRole("button", { name: /check/i }));

    await waitFor(() => {
      expect(screen.getByText(/correct/i)).toBeInTheDocument();
      expect(mockProps.onProgress).toHaveBeenCalledWith(1, mockWords.length);
    });
  });

  it("should accept romaji answers", async () => {
    render(<PracticeInterface {...mockProps} />);

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "watashi" } });
    fireEvent.click(screen.getByRole("button", { name: /check/i }));

    await waitFor(() => {
      expect(screen.getByText(/correct/i)).toBeInTheDocument();
    });
  });

  it("should handle incorrect answers", async () => {
    render(<PracticeInterface {...mockProps} />);

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "wrong" } });
    fireEvent.click(screen.getByRole("button", { name: /check/i }));

    await waitFor(() => {
      expect(screen.getByText(/incorrect/i)).toBeInTheDocument();
      expect(screen.getByText("わたし")).toBeInTheDocument(); // Shows correct answer
    });
  });

  it("should complete practice when all words are done", async () => {
    render(<PracticeInterface {...mockProps} />);

    // Answer first word
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "わたし" } });
    fireEvent.click(screen.getByRole("button", { name: /check/i }));

    // Answer second word
    await waitFor(() => {
      fireEvent.change(input, { target: { value: "みる" } });
    });
    fireEvent.click(screen.getByRole("button", { name: /check/i }));

    await waitFor(() => {
      expect(mockProps.onComplete).toHaveBeenCalled();
    });
  });

  it("should show progress indicator", () => {
    render(<PracticeInterface {...mockProps} />);

    expect(screen.getByText("1/2")).toBeInTheDocument();
  });

  it("should handle keyboard submission", async () => {
    render(<PracticeInterface {...mockProps} />);

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "わたし" } });
    fireEvent.keyPress(input, { key: "Enter", code: 13, charCode: 13 });

    await waitFor(() => {
      expect(screen.getByText(/correct/i)).toBeInTheDocument();
    });
  });

  it("should show word type indicator", () => {
    render(<PracticeInterface {...mockProps} />);

    expect(screen.getByText(/noun/i)).toBeInTheDocument();
  });

  it("should be accessible", () => {
    render(<PracticeInterface {...mockProps} />);

    expect(screen.getByRole("textbox")).toHaveAttribute("aria-label");
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("should handle empty word list", () => {
    render(
      <PracticeInterface
        words={[]}
        onComplete={mockProps.onComplete}
        onProgress={mockProps.onProgress}
      />,
    );

    expect(screen.getByText(/no words available/i)).toBeInTheDocument();
  });
});
