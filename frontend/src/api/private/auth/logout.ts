import { API_BASE_URL } from "@/lib/utils/api-utils";
import { cookies } from "next/headers";

export const logout = async () => {
    try {
        const cookieStore = await cookies();
        const session = cookieStore.get("benkyfy_session");

        await fetch(`${API_BASE_URL}/v2/auth/logout`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                // Pass session cookie to backend if required for authentication
                ...(session && { "Cookie": `${session.name}=${session.value}` })
            }
        });
    } catch (error) {
        console.error("Backend logout failed:", error);
    }
};
