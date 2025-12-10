export interface Point {
  x: number;
  y: number;
  time: number;
}

export interface Stroke {
  points: Point[];
}

export interface StrokeData {
  strokes: number[][];
  timing: number[];
}

export interface CharacterInputProps {
  character: string;
  onSubmit: (result: { isCorrect: boolean; feedback: string[] }) => void;
}

export interface StrokeCanvasProps {
  character: string;
  onStrokeComplete: (strokeData: StrokeData) => void;
  width?: number;
  height?: number;
}

export interface RomajiInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  outputType?: "hiragana" | "katakana" | "auto";
  showPreview?: boolean;
  onKeyPress?: (e: React.KeyboardEvent) => void;
}

export interface RomajiInputWithOptionsProps extends Omit<RomajiInputProps, "outputType" | "showPreview"> {}
