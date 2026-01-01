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
import { MobileMenu } from "@/components/common/layout/navigation/mobile-menu";
import { UserMenu } from "@/components/common/layout/navigation/user-menu";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useWindowScroll } from "@/lib/hooks/use-window-scroll";
import { useAuth } from "@/lib/hooks/hooks";
import { cn } from "@/lib/utils/utils";

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

  // Determine if header should be visible
  const isHeaderVisible =
    typeof window === "undefined" || y < 100 || direction === "up";

  const navigationItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/flashcards", label: "Flashcards", icon: Brain },
    { href: "/products", label: "Modules", icon: BookOpen },
  ];

  return (
    <>
      {/* Desktop Header */}
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300 transform",
          isHeaderVisible ? "translate-y-0" : "-translate-y-full",
          isScrolled
            ? "bg-background/95 backdrop-blur-md shadow-sm border-b border-border/50"
            : "bg-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/home" className="flex items-center gap-2">
                <Image
                  src="/logo1.webp"
                  alt="BenkoFY logo"
                  width={40}
                  height={40}
                  className="cursor-pointer hover:opacity-80 transition-opacity w-auto h-8"
                  unoptimized
                  priority
                />
                <span className="font-bold text-xl tracking-tight hidden sm:block">
                  Benky<span className="text-primary">FY</span>
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navigationItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                      isActive
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    )}
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
              {showUserMenu && authData?.user ? (
                <div className="hidden md:block">
                  <UserMenu 
                    user={authData.user} 
                    onProfileClick={() => router.push("/profile")}
                    onSettingsClick={() => router.push("/settings")}
                  />
                </div>
              ) : (
                 // Placeholder for logic if needed when no user, e.g. Login button
                 null
              )}
              
              {/* Mobile Menu Trigger (replaces the old one in header, but we actually use the one below for bottom nav or side drawer) */}
              <div className="md:hidden">
                 <MobileMenu
                  trigger={
                     <Button variant="ghost" size="icon" className="md:hidden">
                       <Menu className="w-5 h-5" />
                     </Button>
                  }
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
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation - kept for quick access, but maybe redundant if MobileMenu is comprehensive. 
          The user requested "better components", so improving this to be cleaner. */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border shadow-[0_-1px_3px_rgba(0,0,0,0.05)] pb-safe">
        <div className="flex items-center justify-around h-16 px-2">
          {navigationItems.slice(0, 4).map((item) => {
            const IconComponent = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center min-w-[64px] min-h-[44px] rounded-lg px-2 py-1 transition-all duration-200",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-primary"
                )}
              >
                <IconComponent className={cn("w-6 h-6 mb-1 transition-transform", isActive && "scale-110")} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
          
           {/* "More" button for mobile menu if needing more items than fit */}
           <MobileMenu
             trigger={
               <button
                 className="flex flex-col items-center justify-center min-w-[64px] min-h-[44px] rounded-lg px-2 py-1 text-muted-foreground hover:text-primary transition-all duration-200"
               >
                 <Menu className="w-6 h-6 mb-1" />
                 <span className="text-[10px] font-medium">More</span>
               </button>
             }
             items={[
               ...navigationItems.map(item => ({...item, onClick: () => router.push(item.href)})),
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
           />
        </div>
      </nav>
    </>
  );
}
