export interface ConversionResult {
  converted: string;
  isValid: boolean;
  isConverting: boolean;
  error?: string;
  debouncedConvert?: () => Promise<ConversionResult>;
}

export function useRomajiConversion(
  value: string,
  type: "hiragana" | "katakana" | "auto",
  debounceMs: number = 150
): ConversionResult {
  let timeoutId: NodeJS.Timeout;

  const convert = (): ConversionResult => {
    if (!value.trim()) {
      return { converted: "", isValid: true, isConverting: false };
    }

    try {
      let converted = "";

      if (type === "katakana") {
        converted = value.toUpperCase(); // Placeholder - implement actual conversion
      } else if (type === "hiragana") {
        converted = value.toLowerCase(); // Placeholder - implement actual conversion
      } else {
        // Auto-detect based on input
        converted = value.toLowerCase(); // Placeholder - implement actual conversion
      }

      return {
        converted,
        isValid: true,
        isConverting: false,
      };
    } catch (error) {
      return {
        converted: "",
        isValid: false,
        isConverting: false,
        error: error instanceof Error ? error.message : "Conversion error",
      };
    }
  };

  const debouncedConvert = (): Promise<ConversionResult> => {
    return new Promise((resolve) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(() => {
        resolve(convert());
      }, debounceMs);
    });
  };

  return {
    converted: "",
    isValid: true,
    isConverting: true,
    debouncedConvert,
  };
}