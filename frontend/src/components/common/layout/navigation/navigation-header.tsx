'use client';

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Home,
  LayoutDashboard,
  BookOpen,
  User,
  Settings,
  Brain,
  BarChart3,
  Menu,
} from "lucide-react";
import { MobileMenu } from "@/components/ui/mobile-menu";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useWindowScroll } from "@/core/hooks/use-window-scroll";
import { useAuth } from "@/core/hooks";

interface NavigationHeaderProps {
  currentPage?: string;
  showUserMenu?: boolean;
}

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

  const navigationItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/flashcards", label: "Flashcards", icon: Brain },
    { href: "/modules", label: "Modules", icon: BookOpen },
    { href: "/stats", label: "Stats", icon: BarChart3 },
  ];

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
            <nav className="hidden md:flex items-center space-x-4">
              {navigationItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "text-primary-purple bg-primary-purple/10 shadow-sm"
                        : "text-foreground/80 hover:text-primary-purple hover:bg-accent/50"
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2">
              {/* Desktop User Menu */}
              {showUserMenu && authData?.user && (
                <div className="hidden md:flex items-center gap-2">
                  <Link href="/profile">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hover:bg-accent/50"
                    >
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </Button>
                  </Link>
                  <Link href="/settings">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hover:bg-accent/50"
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              )}
            </div>

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
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-primary-purple/10 shadow-lg">
        <div className="flex items-center justify-around h-16 px-2">
          {navigationItems.slice(0, 4).map((item) => {
            const IconComponent = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center min-w-[64px] min-h-[44px] rounded-lg px-2 py-1 transition-all duration-200 ${
                  isActive
                    ? "text-primary-purple"
                    : "text-foreground/60 hover:text-primary-purple"
                }`}
              >
                <IconComponent className="w-6 h-6 mb-1" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex flex-col items-center justify-center min-w-[64px] min-h-[44px] rounded-lg px-2 py-1 text-foreground/60 hover:text-primary-purple transition-all duration-200"
          >
            <Menu className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">More</span>
          </button>
        </div>
      </nav>
    </>
  );
}
