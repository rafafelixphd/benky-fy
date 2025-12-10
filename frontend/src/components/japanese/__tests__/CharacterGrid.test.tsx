import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { CharacterGrid } from "../CharacterGrid";

describe("CharacterGrid Component", () => {
  const mockCharacters = [
    { character: "あ", reading: "a" },
    { character: "い", reading: "i" },
    { character: "う", reading: "u" },
    { character: "漢", reading: "かん" },
  ];

  const mockProps = {
    characters: mockCharacters,
    onCharacterClick: jest.fn(),
    showReadings: true,
    columns: 4,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render all characters in a grid", () => {
    render(<CharacterGrid {...mockProps} />);

    mockCharacters.forEach(({ character }) => {
      expect(screen.getByText(character)).toBeInTheDocument();
    });
  });

  it("should show readings when showReadings is true", () => {
    render(<CharacterGrid {...mockProps} />);

    mockCharacters.forEach(({ reading }) => {
      expect(screen.getByText(reading)).toBeInTheDocument();
    });
  });

  it("should hide readings when showReadings is false", () => {
    render(<CharacterGrid {...mockProps} showReadings={false} />);

    mockCharacters.forEach(({ reading }) => {
      expect(screen.queryByText(reading)).not.toBeInTheDocument();
    });
  });

  it("should call onCharacterClick when a character is clicked", () => {
    render(<CharacterGrid {...mockProps} />);

    const firstCharacter = screen.getByText(mockCharacters[0].character);
    fireEvent.click(firstCharacter);

    expect(mockProps.onCharacterClick).toHaveBeenCalledWith(mockCharacters[0]);
  });

  it("should adjust grid columns based on columns prop", () => {
    const { container } = render(<CharacterGrid {...mockProps} columns={2} />);

    const grid = container.firstChild;
    expect(grid).toHaveClass("md:grid-cols-2");
  });

  it("should be keyboard navigable", () => {
    render(<CharacterGrid {...mockProps} />);

    const characters = screen.getAllByRole("button");
    characters[0].focus();

    fireEvent.keyDown(characters[0], { key: "ArrowRight" });
    expect(characters[1]).toHaveFocus();

    fireEvent.keyDown(characters[1], { key: "ArrowLeft" });
    expect(characters[0]).toHaveFocus();
  });

  it("should handle empty character list", () => {
    render(<CharacterGrid {...mockProps} characters={[]} />);
    expect(screen.getByText(/no characters/i)).toBeInTheDocument();
  });

  it("should apply correct styles to focused character", () => {
    render(<CharacterGrid {...mockProps} />);

    const firstCharacter = screen
      .getByText(mockCharacters[0].character)
      .closest("button");
    expect(firstCharacter).toHaveClass("focus:ring-2");
  });

  it("should show tooltips on hover", async () => {
    render(<CharacterGrid {...mockProps} />);

    const firstCharacter = screen
      .getByText(mockCharacters[0].character)
      .closest("button");
    fireEvent.mouseEnter(firstCharacter!);

    expect(await screen.findByText(mockCharacters[0].reading)).toBeVisible();
  });
});
