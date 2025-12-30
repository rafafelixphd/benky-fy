"use client";

import { useEffect } from "react";
import { logoutAction } from "@/lib/auth/actions";
import { Loader2 } from "lucide-react";

export default function LogoutPage() {
    useEffect(() => {
        // Add a small delay for better UX or just call immediately
        const performLogout = async () => {
            await logoutAction();
        };
        performLogout();
    }, []);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
            <Loader2 className="h-10 w-10 animate-spin text-primary-purple mb-4" />
            <h1 className="text-xl font-semibold">Signing out...</h1>
            <p className="text-muted-foreground mt-2">Please wait while we log you out.</p>
        </div>
    );
}
