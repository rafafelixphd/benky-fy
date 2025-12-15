/**
 * Performance tracking utilities for React components
 */

import React from "react";

interface PerformanceMetrics {
  componentName: string;
  renderTime: number;
  mountTime: number;
  updateTime: number;
}

interface PerformanceConfig {
  enableTracking?: boolean;
  logToConsole?: boolean;
  threshold?: number;
}

const defaultConfig: PerformanceConfig = {
  enableTracking: true,
  logToConsole: false,
  threshold: 16, // 16ms threshold for 60fps
};

/**
 * Higher-order component that wraps a component with performance tracking
 * @param WrappedComponent The component to wrap
 * @param componentName The name of the component for tracking
 * @param config Performance tracking configuration
 * @returns Wrapped component with performance tracking
 */
export function withPerformanceTracking<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName: string,
  config: PerformanceConfig = {},
) {
  const finalConfig = { ...defaultConfig, ...config };

  const PerformanceTrackedComponent = (props: P) => {
    const startTime = performance.now();

    React.useEffect(() => {
      const mountTime = performance.now() - startTime;

      if (finalConfig.enableTracking) {
        const metrics: PerformanceMetrics = {
          componentName,
          renderTime: mountTime,
          mountTime,
          updateTime: 0,
        };

        if (finalConfig.logToConsole) {
          console.log(`[Performance] ${componentName}:`, metrics);
        }

        // Check if performance is below threshold
        if (mountTime > finalConfig.threshold!) {
          console.warn(
            `[Performance Warning] ${componentName} took ${mountTime.toFixed(2)}ms to mount (threshold: ${finalConfig.threshold}ms)`,
          );
        }
      }
    }, []);

    return React.createElement(WrappedComponent, props);
  };

  PerformanceTrackedComponent.displayName = `withPerformanceTracking(${componentName})`;

  return PerformanceTrackedComponent;
}

/**
 * Hook for measuring component performance
 * @param componentName Name of the component
 * @returns Performance measurement functions
 */
export function usePerformanceTracking(componentName: string) {
  const startTime = React.useRef(performance.now());
  const renderCount = React.useRef(0);

  React.useEffect(() => {
    renderCount.current += 1;
    const renderTime = performance.now() - startTime.current;

    if (renderTime > 16) {
      // 60fps threshold
      console.warn(
        `[Performance] ${componentName} render #${renderCount.current} took ${renderTime.toFixed(2)}ms`,
      );
    }
  });

  return {
    startMeasurement: () => {
      startTime.current = performance.now();
    },
    endMeasurement: (label?: string) => {
      const duration = performance.now() - startTime.current;
      if (label) {
        console.log(
          `[Performance] ${componentName} - ${label}: ${duration.toFixed(2)}ms`,
        );
      }
      return duration;
    },
  };
}

/**
 * Utility function to measure async operations
 * @param operation The async operation to measure
 * @param operationName Name of the operation
 * @returns Promise with the result and timing information
 */
export async function measureAsyncOperation<T>(
  operation: () => Promise<T>,
  operationName: string,
): Promise<{ result: T; duration: number }> {
  const startTime = performance.now();

  try {
    const result = await operation();
    const duration = performance.now() - startTime;

    console.log(`[Performance] ${operationName}: ${duration.toFixed(2)}ms`);

    return { result, duration };
  } catch (error) {
    const duration = performance.now() - startTime;
    console.error(
      `[Performance] ${operationName} failed after ${duration.toFixed(2)}ms:`,
      error,
    );
    throw error;
  }
}
