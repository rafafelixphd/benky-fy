"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { logout } from "@/api/private/auth/logout";

export async function logoutAction() {
    const cookieStore = await cookies();

    // Call backend to invalidate session if needed
    await logout();

    // Clear all cookies to ensure complete logout
    const allCookies = cookieStore.getAll();
    allCookies.forEach((cookie) => {
        cookieStore.set({
            name: cookie.name,
            value: "",
            expires: new Date(0),
            path: "/",
        });
    });

    // Redirect to login
    redirect("/auth/login?logout=success");
}
