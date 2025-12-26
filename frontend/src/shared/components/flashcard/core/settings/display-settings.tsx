'use client';

import { DisplaySettingsProps } from "../../types/settings";

export function DisplaySettings({
  settings,
  moduleType,
  moduleName,
  onSettingChange,
}: DisplaySettingsProps) {
  return (
    <div className="space-y-3">
      <div className="p-3 bg-gray-50 rounded-lg">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Display Mode
        </label>
        <select
          value={settings.display_mode || "kana"}
          onChange={(e) => onSettingChange("display_mode", e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="kana">Kana only (hiragana/katakana)</option>
          <option value="kanji">Kanji only</option>
          <option value="kanji_furigana">Kanji with furigana</option>
          <option value="english">English only</option>
          <option value="weighted">Mixed display (weighted)</option>
        </select>
      </div>

      {/* Kana Type - Show for all modules that use kana */}
      {(moduleType.hasKatakana || moduleName === "hiragana") && (
        <div className="p-3 bg-gray-50 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Kana Type
          </label>
          <select
            value={settings.kana_type || "hiragana"}
            onChange={(e) => onSettingChange("kana_type", e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="hiragana">Hiragana (ひらがな)</option>
            <option value="katakana">Katakana (カタカナ)</option>
          </select>
        </div>
      )}

      {/* Furigana Style - Only show for modules with kanji/furigana */}
      {moduleType.hasFurigana && (
        <div className="p-3 bg-gray-50 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Furigana Style
          </label>
          <select
            value={settings.furigana_style || "ruby"}
            onChange={(e) => onSettingChange("furigana_style", e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="ruby">Ruby tags (default browser)</option>
            <option value="hover">Hover tooltips</option>
            <option value="inline">Inline text</option>
            <option value="brackets">Bracket notation</option>
          </select>
        </div>
      )}
    </div>
  );
}
