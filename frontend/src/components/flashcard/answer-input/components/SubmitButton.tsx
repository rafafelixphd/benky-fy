import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/core/utils";

interface SubmitButtonProps {
  onSubmit: () => void;
  disabled?: boolean;
  isSubmitting?: boolean;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Submit button component for AnswerInput
 */
export const SubmitButton: React.FC<SubmitButtonProps> = ({
  onSubmit,
  disabled = false,
  isSubmitting = false,
  className,
  children = "Submit",
}) => {
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !disabled && !isSubmitting) {
      event.preventDefault();
      onSubmit();
    }
  };

  const getButtonContent = () => {
    if (isSubmitting) {
      return (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Submitting...
        </>
      );
    }
    return children;
  };

  const getButtonIcon = () => {
    if (isSubmitting) {
      return <Loader2 className="w-4 h-4 animate-spin" />;
    }
    return null;
  };

  return (
    <Button
      onClick={onSubmit}
      disabled={disabled || isSubmitting}
      onKeyDown={handleKeyDown}
      className={cn(
        "w-full transition-all duration-200",
        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
        disabled && "opacity-50 cursor-not-allowed",
        isSubmitting && "opacity-75 cursor-wait",
        className,
      )}
    >
      {getButtonContent()}
    </Button>
  );
};
