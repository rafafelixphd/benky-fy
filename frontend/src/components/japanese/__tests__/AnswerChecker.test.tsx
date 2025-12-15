import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { AnswerChecker } from "../AnswerChecker";

describe("AnswerChecker Component", () => {
  const mockProps = {
    question: "私",
    expectedAnswer: "わたし",
    acceptableAnswers: ["watashi", "わたし"],
    onCorrectAnswer: jest.fn(),
    onIncorrectAnswer: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render input field and submit button", () => {
    render(<AnswerChecker {...mockProps} />);

    expect(screen.getByRole("textbox")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /check/i })).toBeInTheDocument();
  });

  it("should validate hiragana answer correctly", () => {
    render(<AnswerChecker {...mockProps} />);

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "わたし" } });
    fireEvent.click(screen.getByRole("button", { name: /check/i }));

    expect(mockProps.onCorrectAnswer).toHaveBeenCalled();
    expect(mockProps.onIncorrectAnswer).not.toHaveBeenCalled();
  });

  it("should validate romaji answer correctly", () => {
    render(<AnswerChecker {...mockProps} />);

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "watashi" } });
    fireEvent.click(screen.getByRole("button", { name: /check/i }));

    expect(mockProps.onCorrectAnswer).toHaveBeenCalled();
    expect(mockProps.onIncorrectAnswer).not.toHaveBeenCalled();
  });

  it("should handle incorrect answers", () => {
    render(<AnswerChecker {...mockProps} />);

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "incorrect" } });
    fireEvent.click(screen.getByRole("button", { name: /check/i }));

    expect(mockProps.onIncorrectAnswer).toHaveBeenCalled();
    expect(mockProps.onCorrectAnswer).not.toHaveBeenCalled();
  });

  it("should normalize input before checking", () => {
    render(<AnswerChecker {...mockProps} />);

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: " わたし " } });
    fireEvent.click(screen.getByRole("button", { name: /check/i }));

    expect(mockProps.onCorrectAnswer).toHaveBeenCalled();
  });

  it("should handle empty input", () => {
    render(<AnswerChecker {...mockProps} />);

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "" } });
    fireEvent.click(screen.getByRole("button", { name: /check/i }));

    expect(screen.getByText(/please enter an answer/i)).toBeInTheDocument();
  });

  it("should be accessible", () => {
    const { container } = render(<AnswerChecker {...mockProps} />);

    expect(screen.getByRole("textbox")).toHaveAttribute("aria-label");
    expect(container).toBeInTheDocument();
  });

  it("should handle keyboard submission", () => {
    render(<AnswerChecker {...mockProps} />);

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "わたし" } });
    fireEvent.keyPress(input, { key: "Enter", code: 13, charCode: 13 });

    expect(mockProps.onCorrectAnswer).toHaveBeenCalled();
  });
});
