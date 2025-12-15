import { useState, useEffect, useRef } from "react";

interface UseFeedbackTimerProps {
  showFeedback: boolean;
  enableRealtimeFeedback: boolean;
  onSubmit: (answer: string, validationResult?: any) => void;
  validationResult?: any;
  frontendValidationResult?: any;
}

export function useFeedbackTimer({
  showFeedback,
  enableRealtimeFeedback,
  onSubmit,
  validationResult,
  frontendValidationResult,
}: UseFeedbackTimerProps) {
  const [feedbackTimer, setFeedbackTimer] = useState(0);
  const feedbackTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 10-second feedback timer
  useEffect(() => {
    if (showFeedback && enableRealtimeFeedback) {
      setFeedbackTimer(10);

      feedbackTimerRef.current = setInterval(() => {
        setFeedbackTimer((prev) => {
          if (prev <= 1) {
            // Timer finished - auto advance
            onSubmit("", validationResult || frontendValidationResult);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (feedbackTimerRef.current) {
        clearInterval(feedbackTimerRef.current);
        feedbackTimerRef.current = null;
      }
      setFeedbackTimer(0);
    }

    return () => {
      if (feedbackTimerRef.current) {
        clearInterval(feedbackTimerRef.current);
        feedbackTimerRef.current = null;
      }
    };
  }, [
    showFeedback,
    enableRealtimeFeedback,
    onSubmit,
    validationResult,
    frontendValidationResult,
  ]);

  const resetTimer = () => {
    setFeedbackTimer(0);
    if (feedbackTimerRef.current) {
      clearInterval(feedbackTimerRef.current);
      feedbackTimerRef.current = null;
    }
  };

  return {
    feedbackTimer,
    resetTimer,
  };
}
