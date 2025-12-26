/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { CharacterInput } from "../CharacterInput";

describe("CharacterInput Component", () => {
  const mockProps = {
    character: "あ",
    onSubmit: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            is_correct: true,
            feedback: ["All strokes correct"],
          }),
      }),
    ) as jest.Mock;
  });

  it("should render input method selection", () => {
    render(<CharacterInput {...mockProps} />);

    expect(screen.getByText("Draw")).toBeInTheDocument();
    expect(screen.getByText("Type")).toBeInTheDocument();
  });

  it("should switch between drawing and typing modes", () => {
    render(<CharacterInput {...mockProps} />);

    // Default: Drawing mode
    expect(screen.getByRole("button", { name: /draw/i })).toHaveClass(
      "bg-blue-600",
    );

    // Switch to typing mode
    fireEvent.click(screen.getByText("Type"));
    expect(
      screen.getByPlaceholderText(/type hiragana or romaji/i),
    ).toBeInTheDocument();
  });

  it("should validate text input", async () => {
    render(<CharacterInput {...mockProps} />);

    fireEvent.click(screen.getByText("Type"));
    const input = screen.getByPlaceholderText(/type hiragana or romaji/i);
    fireEvent.change(input, { target: { value: "a" } });
    fireEvent.click(screen.getByText("Check"));

    await waitFor(() => {
      expect(mockProps.onSubmit).toHaveBeenCalledWith({
        isCorrect: true,
        feedback: ["All strokes correct"],
      });
    });
  });

  it("should handle validation errors", async () => {
    global.fetch = jest.fn(() =>
      Promise.reject(new Error("API Error")),
    ) as jest.Mock;

    render(<CharacterInput {...mockProps} />);

    fireEvent.click(screen.getByText("Type"));
    const input = screen.getByPlaceholderText(/type hiragana or romaji/i);
    fireEvent.change(input, { target: { value: "wrong" } });
    fireEvent.click(screen.getByText("Check"));

    await waitFor(() => {
      expect(screen.getByText(/error validating input/i)).toBeInTheDocument();
    });
  });

  it("should show stroke feedback", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            is_correct: false,
            feedback: ["Stroke 1: Incorrect direction"],
          }),
      }),
    ) as jest.Mock;

    render(<CharacterInput {...mockProps} />);

    // Simulate stroke completion
    const canvas = screen.getByRole("img", { hidden: true });
    fireEvent.mouseDown(canvas, { clientX: 0, clientY: 0 });
    fireEvent.mouseMove(canvas, { clientX: 100, clientY: 100 });
    fireEvent.mouseUp(canvas);

    await waitFor(() => {
      expect(screen.getByText(/incorrect direction/i)).toBeInTheDocument();
    });
  });

  it("should be accessible", () => {
    render(<CharacterInput {...mockProps} />);

    expect(screen.getByRole("button", { name: /draw/i })).toHaveFocus();
  });
});
