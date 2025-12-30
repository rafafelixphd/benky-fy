'use client';

import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ErrorDisplayProps } from "./types";

export function ErrorDisplay({
  title = "Something went wrong",
  message = "We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.",
  error,
  showDetails = true,
  actions = [
    {
      label: "Try Again",
      icon: RefreshCw,
      onClick: () => window.location.reload(),
      variant: "default",
      className: "bg-white text-primary hover:bg-white/90",
    },
    {
      label: "Refresh Page",
      onClick: () => window.location.reload(),
      variant: "outline",
      className: "border-white text-white hover:bg-white/10",
    },
  ],
}: ErrorDisplayProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-secondary">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8">
          <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-4">{title}</h1>
          <p className="text-white/80 mb-6">{message}</p>

          {showDetails && error && (
            <details className="text-left text-sm text-white/60 mb-6">
              <summary className="cursor-pointer mb-2">Error Details</summary>
              <pre className="bg-black/20 p-3 rounded text-xs overflow-auto">
                {error.message}
              </pre>
            </details>
          )}

          <div className="flex gap-3 justify-center">
            {actions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Button
                  key={index}
                  variant={action.variant}
                  onClick={action.onClick}
                  className={action.className}
                >
                  {Icon && <Icon className="w-4 h-4 mr-2" />}
                  {action.label}
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
