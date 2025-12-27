import { getGoogleAuthUrl as getGoogleLoginUrl } from "@/api/public/auth/google/route";
import { redirect } from "next/navigation";

export default async function GoogleAuthPage() {
    const url = await getGoogleLoginUrl();
    redirect(url);
}



