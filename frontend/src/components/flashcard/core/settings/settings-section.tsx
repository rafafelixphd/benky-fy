'use client';

import { SettingsSectionProps } from "../../types/settings";

export function SettingsSection({
  title,
  isExpanded,
  onToggle,
  indicatorColor,
  children,
}: SettingsSectionProps) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
      <div
        className="flex justify-between items-center p-4 bg-gray-100 border-b border-gray-200 cursor-pointer hover:bg-gray-200 transition-colors"
        onClick={onToggle}
      >
        <h3 className="font-semibold text-gray-900 flex items-center">
          <span className={`w-2 h-2 ${indicatorColor} rounded-full mr-2`}></span>
          {title}
        </h3>
        <span className="text-gray-500 text-sm transition-transform">
          {isExpanded ? "▼" : "▶"}
        </span>
      </div>

      {isExpanded && (
        <div className="p-4 bg-white">
          {children}
        </div>
      )}
    </div>
  );
}
