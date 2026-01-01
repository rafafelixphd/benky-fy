"use client";

import { NavigationHeader } from "@/components/common/layout/navigation/navigation-header";
import { FloatingElements } from "@/components/common/layout/background";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { learningModules } from "./contents";

export default function ModulesPage() {
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-purple to-secondary-purple relative overflow-hidden">
      <FloatingElements />

      <NavigationHeader />

      <div className="relative z-10 pt-24 px-6 pb-6 text-center">
        <h1 className="text-4xl font-bold text-white mb-2">Learning Modules</h1>
        <p className="text-white/80 text-lg">Choose your learning path</p>
      </div>

      {/* Modules Grid */}
      <div className="relative z-10 px-6 pb-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {learningModules.map((module) => {
              const IconComponent = module.icon;
              const isAvailable = module.status === "Available";

              return (
                <Card
                  key={module.id}
                  className="p-6 bg-background/10 backdrop-blur-sm border-primary-foreground/20"
                >
                  <div className="flex items-center mb-4">
                    <div
                      className={`w-12 h-12 rounded-lg bg-gradient-to-r ${module.color} flex items-center justify-center mr-4`}
                    >
                      <IconComponent className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-foreground">
                        {module.name}
                      </h3>
                      <span
                        className={`text-sm px-2 py-1 rounded ${module.status === "Available"
                          ? "dark:bg-green-900 dark:text-green-200 bg-green-100 text-green-800"
                          : module.status === "Mock Up"
                            ? "dark:bg-blue-900 dark:text-blue-200 bg-blue-100 text-blue-800"
                            : "dark:bg-yellow-900 dark:text-yellow-200 bg-yellow-100 text-yellow-800"
                          }`}
                      >
                        {module.status}
                      </span>
                    </div>
                  </div>
                  <p className="text-foreground/80 mb-4">
                    {module.description}
                  </p>

                  {module.status === "Coming Soon" ? (
                    <Button className="w-full" disabled>
                      Coming Soon
                    </Button>
                  ) : (
                    <Button
                      asChild
                      className={`w-full ${module.status === "Mock Up" ? "bg-blue-500 hover:bg-blue-600" : ""}`}
                    >
                      <Link
                        href={
                          isAvailable
                            ? `/${module.id}`
                            : `/products/${module.id}`
                        }
                      >
                        <span className="flex items-center justify-center">
                          {module.status === "Mock Up"
                            ? "View Demo"
                            : "Start Learning"}
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </span>
                      </Link>
                    </Button>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div >
  );
}
