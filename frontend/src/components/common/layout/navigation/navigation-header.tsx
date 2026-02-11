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
  BookText,
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
    { href: "/products", label: "Modules", icon: BookOpen },
    { href: "/flashcards", label: "Flashcards", icon: Brain },
    { href: "/vocabulary", label: "Vocabulary", icon: BookText },
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  ];

  return (
    <>
      {/* Desktop Header - Floating Glass Island */}
      <header
        className={cn(
          "fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 w-[95%] max-w-7xl rounded-2xl",
          isScrolled || isHeaderVisible
            ? "bg-black/20 backdrop-blur-xl border border-white/10 shadow-2xl translate-y-0 opacity-100"
            : "-translate-y-full opacity-0 pointer-events-none"
        )}
      >
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo Area */}
            <div className="flex-shrink-0 flex items-center gap-3 group cursor-pointer" onClick={() => router.push("/home")}>
              <div className="relative w-10 h-10 transition-transform duration-300 group-hover:scale-110">
                <Image
                  src="/logo1.webp"
                  alt="BenkyFY"
                  width={40}
                  height={40}
                  className="object-contain drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]"
                  unoptimized
                  priority
                />
              </div>
              <span className="font-bold text-xl tracking-tight hidden sm:block text-white">
                Benky<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-purple to-pink-400">FY</span>
              </span>
            </div>

            {/* Desktop Navigation - Pill Design */}
            <nav className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/5 shadow-inner">
              {navigationItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
                      isActive
                        ? "text-white bg-primary-purple shadow-[0_0_20px_rgba(168,85,247,0.4)]"
                        : "text-white/60 hover:text-white hover:bg-white/10"
                    )}
                  >
                    <IconComponent className={cn("w-4 h-4", isActive && "animate-pulse")} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right Side Actions & User */}
            <div className="flex items-center gap-4">
              {showUserMenu && authData?.user && (
                <div className="hidden md:block">
                  <UserMenu 
                    user={authData.user} 
                    onProfileClick={() => router.push("/profile")}
                    onSettingsClick={() => router.push("/settings")}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation - Floating Glass Dock */}
      <nav className="md:hidden fixed bottom-6 left-4 right-4 z-50">
        <div className="bg-black/40 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] rounded-2xl px-2 py-3 flex items-center justify-around">
          {navigationItems.slice(0, 4).map((item) => {
            const IconComponent = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative group"
              >
                <div className={cn(
                   "absolute inset-0 bg-primary-purple/20 blur-xl rounded-full transition-opacity duration-300",
                   isActive ? "opacity-100" : "opacity-0"
                )} />
                <div className={cn(
                  "relative flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all duration-300",
                  isActive
                    ? "text-white bg-white/10 shadow-inner"
                    : "text-white/40 hover:text-white hover:bg-white/5"
                )}>
                  <IconComponent className={cn("w-5 h-5 mb-0.5 transition-transform duration-300", isActive && "scale-110")} />
                  {isActive && <span className="absolute -bottom-1 w-1 h-1 bg-primary-purple rounded-full shadow-[0_0_5px_currentColor]" />}
                </div>
              </Link>
            );
          })}
          
           {/* Mobile Menu More Button */}
           <MobileMenu
             trigger={
               <button className="relative group">
                 <div className="relative flex flex-col items-center justify-center w-12 h-12 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all duration-300">
                   <Menu className="w-5 h-5" />
                 </div>
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
