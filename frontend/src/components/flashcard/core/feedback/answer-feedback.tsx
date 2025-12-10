'use client';

import { BaseFeedbackProps } from "../../types/feedback";
import { getEnabledInputModes, getFeedbackContainerColor } from "./utils";
import { FeedbackTable } from "./feedback-table";

export function AnswerFeedback({
  item,
  userAnswer,
  isCorrect,
  matchedType,
  convertedAnswer,
  settings,
  frontendValidationResult,
  userAnswers = {},
  moduleName,
}: BaseFeedbackProps) {
  const enabledModes = getEnabledInputModes(settings, moduleName);
  const containerFeedbackColor = getFeedbackContainerColor(frontendValidationResult, isCorrect);

  return (
    <div className={`mt-4 p-4 rounded-lg border ${containerFeedbackColor}`}>
      <h4 className="text-sm font-medium text-white mb-3">Answer Feedback</h4>
      <FeedbackTable
        enabledModes={enabledModes}
        userAnswers={{ ...userAnswers, [matchedType || ""]: userAnswer }}
        item={item}
        frontendValidationResult={frontendValidationResult}
        isCorrect={isCorrect}
        matchedType={matchedType}
        convertedAnswer={convertedAnswer}
      />
    </div>
  );
}
