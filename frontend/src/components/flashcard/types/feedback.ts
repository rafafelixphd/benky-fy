import { FlashcardItem, UserSettings } from "@/core/api-client";
import { ValidationResult } from "@/core/validation";

export interface BaseFeedbackProps {
  item: FlashcardItem;
  userAnswer: string;
  isCorrect: boolean;
  matchedType?: string;
  convertedAnswer?: string;
  settings: UserSettings;
  frontendValidationResult?: ValidationResult | null;
  userAnswers?: Record<string, string>;
  moduleName?: string;
}

export interface FloatingFeedbackProps extends BaseFeedbackProps {
  timerDuration?: number;
  onClose: () => void;
}

export interface FeedbackTableProps {
  enabledModes: string[];
  userAnswers: Record<string, string>;
  item: FlashcardItem;
  frontendValidationResult?: ValidationResult | null;
  isCorrect: boolean;
  matchedType?: string;
  convertedAnswer?: string;
}
