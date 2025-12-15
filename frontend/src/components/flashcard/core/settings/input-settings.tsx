'use client';

import { InputSettingsProps } from "../../types/settings";

export function InputSettings({
  settings,
  moduleType,
  onSettingChange,
}: InputSettingsProps) {
  return (
    <div className="space-y-4">
      {/* Input Type Checkboxes */}
      <div className="grid grid-cols-1 gap-2">
        <InputCheckbox
          label="Hiragana"
          checked={settings.input_hiragana || false}
          onChange={(checked) => onSettingChange("input_hiragana", checked)}
        />

        <InputCheckbox
          label="Romaji"
          checked={settings.input_romaji || false}
          onChange={(checked) => onSettingChange("input_romaji", checked)}
        />

        {moduleType.hasKatakana && (
          <InputCheckbox
            label="Katakana"
            checked={settings.input_katakana || false}
            onChange={(checked) => onSettingChange("input_katakana", checked)}
          />
        )}

        {moduleType.hasKanji && (
          <InputCheckbox
            label="Kanji"
            checked={settings.input_kanji || false}
            onChange={(checked) => onSettingChange("input_kanji", checked)}
          />
        )}

        <InputCheckbox
          label="English"
          checked={settings.input_english || false}
          onChange={(checked) => onSettingChange("input_english", checked)}
        />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-xs text-blue-700">
          <span className="font-medium">💡 Tip:</span> You can select more than one.
          Your answer will be accepted if it matches any selected type.
        </p>
      </div>
    </div>
  );
}

interface InputCheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function InputCheckbox({ label, checked, onChange }: InputCheckboxProps) {
  return (
    <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
      />
    </label>
  );
}
