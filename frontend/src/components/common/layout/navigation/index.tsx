'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useWindowScroll } from "@/core/hooks/use-window-scroll";
import { useAuth } from "@/core/hooks";
import {
  Home,
  LayoutDashboard,
  BookOpen,
  User,
  Settings,
  Brain,
  BarChart3,
} from "lucide-react";
import { NavigationHeaderProps, NavigationItem } from "./types";
import { DesktopNavigation } from "./desktop-navigation";
import { MobileNavigation } from "./mobile-navigation";
import { MobileMenu } from "./mobile-menu";
import { UserMenu } from "./user-menu";

const navigationItems: NavigationItem[] = [
  { href: "/", label: "Home", icon: Home },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/flashcards", label: "Flashcards", icon: Brain },
  { href: "/modules", label: "Modules", icon: BookOpen },
  { href: "/stats", label: "Stats", icon: BarChart3 },
];

export function NavigationHeader({
  showUserMenu = true,
}: NavigationHeaderProps) {
  const { data: authData } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { y, direction } = useWindowScroll();

  // Handle scroll effects
  useEffect(() => {
    if (typeof window === "undefined") return;
    setIsScrolled(y > 10);
  }, [y]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Determine if header should be visible (default to visible on server)
  const isHeaderVisible =
    typeof window === "undefined" || y < 100 || direction === "up";

  return (
    <>
      {/* Desktop Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 transform md:translate-y-0 ${
          isHeaderVisible ? "translate-y-0" : "-translate-y-full"
        } ${
          isScrolled
            ? "bg-background/95 backdrop-blur-md shadow-lg"
            : "bg-background/80 backdrop-blur-sm"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/home" className="flex items-center">
                <Image
                  src="/logo1.webp"
                  alt="BenkoFY logo"
                  width={60}
                  height={36}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  unoptimized
                  priority
                />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <DesktopNavigation items={navigationItems} currentPath={pathname} />

            {/* Right Side Actions */}
            <div className="flex items-center gap-2">
              {/* Desktop User Menu */}
              {showUserMenu && authData?.user && (
                <UserMenu
                  onProfileClick={() => router.push("/profile")}
                  onSettingsClick={() => router.push("/settings")}
                />
              )}

              {/* Mobile Menu */}
              <div className="md:hidden">
                <MobileMenu
                  items={[
                    ...navigationItems.map((item) => ({
                      icon: item.icon,
                      label: item.label,
                      onClick: () => router.push(item.href),
                    })),
                    ...(showUserMenu && authData?.user
                      ? [
                          {
                            icon: User,
                            label: "Profile",
                            onClick: () => router.push("/profile"),
                          },
                          {
                            icon: Settings,
                            label: "Settings",
                            onClick: () => router.push("/settings"),
                          },
                        ]
                      : []),
                  ]}
                  className="relative z-50"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <MobileNavigation
        items={navigationItems}
        currentPath={pathname}
        onMoreClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />
    </>
  );
}
