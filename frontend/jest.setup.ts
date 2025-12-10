import "@testing-library/jest-dom";
import { expect } from "@jest/globals";

// Extend Jest matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveClass(className: string): R;
      toHaveFocus(): R;
      toBeDisabled(): R;
    }
  }
}
