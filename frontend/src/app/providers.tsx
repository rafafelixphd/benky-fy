"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/core/query-client";
import { ThemeProvider } from "@/components/common/theme";
import { ErrorBoundaryWrapper } from "@/components/common/error";
import { UserProvider } from "@/core/user-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundaryWrapper>
      <UserProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </QueryClientProvider>
      </UserProvider>
    </ErrorBoundaryWrapper>
  );
}
