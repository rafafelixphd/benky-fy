/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { QuizInterface } from "../QuizInterface";

describe("QuizInterface Component", () => {
  const mockQuestions = [
    {
      id: "1",
      question: "私",
      correctAnswer: "わたし",
      options: ["わたし", "あなた", "かれ", "かのじょ"],
      hint: "I, me",
    },
    {
      id: "2",
      question: "見る",
      correctAnswer: "みる",
      options: ["みる", "よむ", "きく", "はなす"],
      hint: "to see",
    },
  ];

  const mockProps = {
    questions: mockQuestions,
    onComplete: jest.fn(),
    onProgress: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render the first question initially", () => {
    render(<QuizInterface {...mockProps} />);

    expect(screen.getByText("私")).toBeInTheDocument();
    mockQuestions[0].options.forEach((option) => {
      expect(screen.getByText(option)).toBeInTheDocument();
    });
  });

  it("should show hint when hint button is clicked", () => {
    render(<QuizInterface {...mockProps} />);

    const hintButton = screen.getByRole("button", { name: /hint/i });
    fireEvent.click(hintButton);

    expect(screen.getByText("I, me")).toBeInTheDocument();
  });

  it("should handle correct answer selection", async () => {
    render(<QuizInterface {...mockProps} />);

    const correctOption = screen.getByText("わたし");
    fireEvent.click(correctOption);

    await waitFor(() => {
      expect(screen.getByText(/correct/i)).toBeInTheDocument();
      expect(mockProps.onProgress).toHaveBeenCalledWith(
        1,
        mockQuestions.length,
      );
    });
  });

  it("should handle incorrect answer selection", async () => {
    render(<QuizInterface {...mockProps} />);

    const incorrectOption = screen.getByText("あなた");
    fireEvent.click(incorrectOption);

    await waitFor(() => {
      expect(screen.getByText(/incorrect/i)).toBeInTheDocument();
      expect(screen.getByText("わたし")).toHaveClass("text-green-500");
    });
  });

  it("should complete quiz when all questions are answered", async () => {
    render(<QuizInterface {...mockProps} />);

    // Answer first question
    fireEvent.click(screen.getByText("わたし"));
    await waitFor(() => {
      expect(screen.getByText("見る")).toBeInTheDocument();
    });

    // Answer second question
    fireEvent.click(screen.getByText("みる"));
    await waitFor(() => {
      expect(mockProps.onComplete).toHaveBeenCalled();
    });
  });

  it("should show progress indicator", () => {
    render(<QuizInterface {...mockProps} />);

    expect(screen.getByText("1/2")).toBeInTheDocument();
  });

  it("should be keyboard navigable", () => {
    render(<QuizInterface {...mockProps} />);

    const options = screen.getAllByRole("button");
    options[0].focus();

    fireEvent.keyDown(options[0], { key: "ArrowDown" });
    expect(options[1]).toHaveFocus();

    fireEvent.keyDown(options[1], { key: "Enter" });
    expect(screen.getByText(/incorrect/i)).toBeInTheDocument();
  });

  it("should handle empty question list", () => {
    render(
      <QuizInterface
        questions={[]}
        onComplete={mockProps.onComplete}
        onProgress={mockProps.onProgress}
      />,
    );

    expect(screen.getByText(/no questions available/i)).toBeInTheDocument();
  });

  it("should disable options after selection", async () => {
    render(<QuizInterface {...mockProps} />);

    const option = screen.getByText("わたし");
    fireEvent.click(option);

    await waitFor(() => {
      mockQuestions[0].options.forEach((opt) => {
        expect(screen.getByText(opt)).toBeDisabled();
      });
    });
  });

  it("should show romaji readings in options", () => {
    render(<QuizInterface {...mockProps} showRomaji />);

    expect(screen.getByText("watashi")).toBeInTheDocument();
  });
});
