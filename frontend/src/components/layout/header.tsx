"use client";

import Link from "next/link";
import Image from "next/image";
import { UserMenu } from "@/components/common/layout/navigation/user-menu";
import { useAuth } from "@/lib/hooks/hooks";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

interface ProductsHeaderProps {
    title: string;
    subtitle: string;
    showLoginButton?: boolean;
}

export function ProductsHeader({
    title,
    subtitle,
    showLoginButton = false,
}: ProductsHeaderProps) {
    const { data: authData } = useAuth();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    return (
        <div className="relative z-10 p-6 flex justify-between items-center">
            <div className="flex items-center gap-4">
                <Link href="/home" className="flex items-center">
                    <Image
                        src="/logo1.webp"
                        alt="BenkoFY logo"
                        width={60}
                        height={36}
                        sizes="60px"
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                        unoptimized
                        priority
                    />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-foreground">{title}</h1>
                    <p className="text-foreground/80">{subtitle}</p>
                </div>
            </div>

            {isMounted && authData?.user ? (
                <UserMenu user={authData.user} />
            ) : showLoginButton ? (
                <Link href="/auth/login">
                    <Button className="bg-background text-primary hover:bg-background/90">
                        Sign In
                    </Button>
                </Link>
            ) : null}
        </div>
    );
}
