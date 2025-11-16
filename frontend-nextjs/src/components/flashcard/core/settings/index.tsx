'use client';

import { useState, useMemo } from "react";
import { useSettingsStore } from "@/core/settings-store";
import { useUpdateSettings } from "@/core/hooks";
import { Button } from "@/components/ui/button";
import { X, Settings as SettingsIcon } from "lucide-react";
import { SettingsModalProps } from "../../types/settings";
import { SettingsSection } from "./settings-section";
import { DisplaySettings } from "./display-settings";
import { InputSettings } from "./input-settings";
import { WordTypeSelector } from "./word-type-selector";
import { DisplayConfig } from "./display-config";
import { InputConfig } from "./input-config";
import { ModuleSelector } from "./module-selector";
import { getModuleType } from "../input/helpers/module-type";

// Export custom configuration components
export { WordTypeSelector } from "./word-type-selector";
export { DisplayConfig } from "./display-config";
export { InputConfig } from "./input-config";
export { ModuleSelector } from "./module-selector";
export { CustomFlashcardSettingsModal } from "./custom-flashcard-settings-modal";
export type { CustomFlashcardSettings } from "./custom-flashcard-settings-modal";
export type { ModuleConfig } from "./module-selector";

export function SettingsModal({ moduleName, onClose }: SettingsModalProps) {
  const { getSettings, updateSettings } = useSettingsStore();
  const updateSettingsMutation = useUpdateSettings();
  const [localSettings, setLocalSettings] = useState(getSettings(moduleName));
  const [isSaving, setIsSaving] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    display: true,
    input: true,
  });

  const moduleType = useMemo(() => getModuleType(moduleName), [moduleName]);

  const handleSettingChange = (key: string, value: any) => {
    setLocalSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      updateSettings(moduleName, localSettings);
      await updateSettingsMutation.mutateAsync({
        moduleName,
        settings: localSettings,
      });
      onClose();
    } catch (error) {
      console.error("Failed to save settings:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setLocalSettings(getSettings(moduleName));
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto border border-border">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2">
            <SettingsIcon className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Settings</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-6 space-y-4">
          <SettingsSection
            title="Display Mode"
            isExpanded={expandedSections.display}
            onToggle={() => toggleSection("display")}
            indicatorColor="bg-blue-500"
          >
            <DisplaySettings
              settings={localSettings}
              moduleType={moduleType}
              moduleName={moduleName}
              onSettingChange={handleSettingChange}
            />
          </SettingsSection>

          <SettingsSection
            title="Answer Input Mode"
            isExpanded={expandedSections.input}
            onToggle={() => toggleSection("input")}
            indicatorColor="bg-green-500"
          >
            <InputSettings
              settings={localSettings}
              moduleType={moduleType}
              onSettingChange={handleSettingChange}
            />
          </SettingsSection>
        </div>

        <div className="flex gap-3 p-6 border-t">
          <Button onClick={handleSave} disabled={isSaving} className="flex-1">
            {isSaving ? "Saving..." : "Save Settings"}
          </Button>
          <Button variant="outline" onClick={handleReset} disabled={isSaving}>
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
}
