"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/utils/query-client";
import { ThemeProvider } from "@/components/common/theme";
import { ErrorBoundaryWrapper } from "@/components/common/error";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ErrorBoundaryWrapper>
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
        </ErrorBoundaryWrapper>
    );
}