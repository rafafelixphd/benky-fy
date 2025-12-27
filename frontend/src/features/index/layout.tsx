import { Providers } from "./providers";
import { FloatingThemeToggle } from "@/shared/components/common/theme";



export default function AppLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <Providers>
            {children}
            <FloatingThemeToggle />
        </Providers>
    );
}
