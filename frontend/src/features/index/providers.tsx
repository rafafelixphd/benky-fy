"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/services/utils/query-client";
import { ThemeProvider } from "@/shared/components/common/theme";
import { ErrorBoundaryWrapper } from "@/shared/components/common/error";
import { UserProvider } from "@/services/hooks/user-context";

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
