import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { CharacterRecognition } from "../CharacterRecognition";

describe("CharacterRecognition Component", () => {
  const mockProps = {
    text: "私は日本語を勉強します",
    onCharacterIdentified: jest.fn(),
    onError: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render text with clickable characters", () => {
    render(<CharacterRecognition {...mockProps} />);

    const characters = screen.getAllByRole("button");
    expect(characters).toHaveLength(mockProps.text.length);
  });

  it("should identify hiragana characters correctly", () => {
    render(<CharacterRecognition {...mockProps} />);

    const hiraganaChar = screen.getByText("は");
    fireEvent.click(hiraganaChar);

    expect(mockProps.onCharacterIdentified).toHaveBeenCalledWith({
      character: "は",
      type: "hiragana",
      reading: "は",
    });
  });

  it("should identify kanji characters correctly", () => {
    render(<CharacterRecognition {...mockProps} />);

    const kanjiChar = screen.getByText("私");
    fireEvent.click(kanjiChar);

    expect(mockProps.onCharacterIdentified).toHaveBeenCalledWith({
      character: "私",
      type: "kanji",
      reading: "わたし",
    });
  });

  it("should identify katakana characters correctly", () => {
    render(<CharacterRecognition text="コーヒー" {...mockProps} />);

    const katakanaChar = screen.getByText("コ");
    fireEvent.click(katakanaChar);

    expect(mockProps.onCharacterIdentified).toHaveBeenCalledWith({
      character: "コ",
      type: "katakana",
      reading: "ko",
    });
  });

  it("should handle unknown characters gracefully", () => {
    render(<CharacterRecognition text="Hello123" {...mockProps} />);

    const unknownChar = screen.getByText("H");
    fireEvent.click(unknownChar);

    expect(mockProps.onError).toHaveBeenCalledWith("Unknown character type");
  });

  it("should provide character details on hover", async () => {
    render(<CharacterRecognition {...mockProps} />);

    const kanjiChar = screen.getByText("私");
    fireEvent.mouseEnter(kanjiChar);

    expect(await screen.findByText("わたし")).toBeInTheDocument();
    expect(await screen.findByText("Kanji")).toBeInTheDocument();
  });

  it("should be keyboard navigable", () => {
    render(<CharacterRecognition {...mockProps} />);

    const characters = screen.getAllByRole("button");
    characters[0].focus();

    fireEvent.keyDown(characters[0], { key: "Enter" });
    expect(mockProps.onCharacterIdentified).toHaveBeenCalled();

    fireEvent.keyDown(characters[0], { key: "ArrowRight" });
    expect(characters[1]).toHaveFocus();
  });

  it("should maintain high accuracy in character recognition", () => {
    const testCases = [
      { input: "あ", expected: { type: "hiragana", reading: "あ" } },
      { input: "私", expected: { type: "kanji", reading: "わたし" } },
      { input: "ア", expected: { type: "katakana", reading: "a" } },
    ];

    testCases.forEach(({ input, expected }) => {
      render(<CharacterRecognition text={input} {...mockProps} />);

      const char = screen.getByText(input);
      fireEvent.click(char);

      expect(mockProps.onCharacterIdentified).toHaveBeenCalledWith(
        expect.objectContaining({
          character: input,
          type: expected.type,
          reading: expected.reading,
        }),
      );
    });
  });
});
