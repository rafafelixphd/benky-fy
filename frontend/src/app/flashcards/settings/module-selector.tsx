"use client";

import { useState, useMemo } from "react";
import { SettingsSection } from "./settings-section";

export interface ModuleConfig {
  id: string;
  name: string;
  enabled: boolean;
  weight: number;
  category: string;
  difficulty: string;
  cardCount: number;
}

export interface ModuleSelectorProps {
  modules: ModuleConfig[];
  onModulesChange: (modules: ModuleConfig[]) => void;
}

const moduleCategories = [
  {
    id: "foundations",
    name: "Foundations",
    color: "from-blue-500 to-blue-600",
    icon: "🔤",
  },
  {
    id: "numbers-time",
    name: "Numbers & Time",
    color: "from-green-500 to-green-600", 
    icon: "🕐",
  },
  {
    id: "essential-vocab",
    name: "Essential Vocabulary",
    color: "from-purple-500 to-purple-600",
    icon: "💬",
  },
  {
    id: "grammar-structure",
    name: "Grammar & Structure",
    color: "from-orange-500 to-orange-600",
    icon: "📝",
  },
];

// Complete module structure matching flashcards page exactly
const allModules: ModuleConfig[] = [
  // Foundations
  { id: "hiragana", name: "Hiragana", enabled: true, weight: 25, category: "foundations", difficulty: "Beginner", cardCount: 46 },
  { id: "katakana", name: "Katakana", enabled: true, weight: 25, category: "foundations", difficulty: "Beginner", cardCount: 46 },
  { id: "katakana_words", name: "Katakana Words", enabled: false, weight: 0, category: "foundations", difficulty: "Intermediate", cardCount: 20 },
  
  // Numbers & Time
  { id: "numbers_basic", name: "Basic Numbers", enabled: true, weight: 20, category: "numbers-time", difficulty: "Beginner", cardCount: 10 },
  { id: "numbers_extended", name: "Extended Numbers", enabled: false, weight: 0, category: "numbers-time", difficulty: "Intermediate", cardCount: 20 },
  { id: "days_of_week", name: "Days of Week", enabled: true, weight: 15, category: "numbers-time", difficulty: "Beginner", cardCount: 7 },
  { id: "months_complete", name: "Months", enabled: false, weight: 0, category: "numbers-time", difficulty: "Beginner", cardCount: 12 },
  
  // Essential Vocabulary
  { id: "greetings_essential", name: "Greetings", enabled: true, weight: 15, category: "essential-vocab", difficulty: "Beginner", cardCount: 15 },
  { id: "question_words", name: "Question Words", enabled: false, weight: 0, category: "essential-vocab", difficulty: "Beginner", cardCount: 12 },
  { id: "base_nouns", name: "Basic Nouns", enabled: false, weight: 0, category: "essential-vocab", difficulty: "Beginner", cardCount: 25 },
  { id: "colors_basic", name: "Colors", enabled: false, weight: 0, category: "essential-vocab", difficulty: "Beginner", cardCount: 10 },
  
  // Grammar & Structure
  { id: "adjectives", name: "Adjectives", enabled: false, weight: 0, category: "grammar-structure", difficulty: "Intermediate", cardCount: 30 },
  { id: "verbs", name: "Japanese Verbs", enabled: false, weight: 0, category: "grammar-structure", difficulty: "Intermediate", cardCount: 50 },
  { id: "vocab", name: "Vocabulary", enabled: false, weight: 0, category: "grammar-structure", difficulty: "Intermediate", cardCount: 40 },
];

export function ModuleSelector({ modules, onModulesChange }: ModuleSelectorProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  // Group modules by category
  const modulesByCategory = useMemo(() => {
    const grouped: Record<string, ModuleConfig[]> = {};
    moduleCategories.forEach(category => {
      grouped[category.id] = modules.filter(module => module.category === category.id);
    });
    return grouped;
  }, [modules]);

  // Calculate total weight
  const totalWeight = useMemo(() => {
    return modules.filter(m => m.enabled).reduce((sum, module) => sum + module.weight, 0);
  }, [modules]);

  // Normalize weights to 100%
  const normalizeWeights = (updatedModules: ModuleConfig[]) => {
    const enabledModules = updatedModules.filter(m => m.enabled);
    if (enabledModules.length === 0) return updatedModules;

    const totalWeight = enabledModules.reduce((sum, module) => sum + module.weight, 0);
    if (totalWeight === 0) return updatedModules;

    return updatedModules.map(module => {
      if (!module.enabled) return module;
      return {
        ...module,
        weight: Math.round((module.weight / totalWeight) * 100),
      };
    });
  };

  const handleModuleToggle = (moduleId: string) => {
    const updatedModules = modules.map(module => {
      if (module.id === moduleId) {
        return { ...module, enabled: !module.enabled };
      }
      return module;
    });

    // Auto-normalize weights when enabling/disabling modules
    const normalizedModules = normalizeWeights(updatedModules);
    onModulesChange(normalizedModules);
  };

  const handleWeightChange = (moduleId: string, weight: number) => {
    const updatedModules = modules.map(module => {
      if (module.id === moduleId) {
        return { ...module, weight };
      }
      return module;
    });

    const normalizedModules = normalizeWeights(updatedModules);
    onModulesChange(normalizedModules);
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  const [isSectionExpanded, setIsSectionExpanded] = useState(true);

  return (
    <SettingsSection
      title="Module Selection"
      isExpanded={isSectionExpanded}
      onToggle={() => setIsSectionExpanded(!isSectionExpanded)}
      indicatorColor="bg-purple-500"
    >
      <div className="space-y-4">
        {/* Module Categories */}
        {moduleCategories.map(category => {
          const categoryModules = modulesByCategory[category.id] || [];
          const enabledCount = categoryModules.filter(m => m.enabled).length;
          const totalCount = categoryModules.length;

          return (
            <div key={category.id} className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
              <div 
                className="flex justify-between items-center p-4 bg-gray-100 border-b border-gray-200 cursor-pointer hover:bg-gray-200 transition-colors"
                onClick={() => toggleCategory(category.id)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{category.icon}</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">{category.name}</h4>
                    <p className="text-sm text-gray-600">
                      {enabledCount}/{totalCount} modules selected
                    </p>
                  </div>
                </div>
                <span className="text-gray-500 text-sm transition-transform">
                  {expandedCategory === category.id ? "▲" : "▼"}
                </span>
              </div>

              {expandedCategory === category.id && (
                <div className="p-4 bg-white">
                  <div className="space-y-3">
                    {categoryModules.map(module => (
                      <div key={module.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50">
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={module.enabled}
                            onChange={() => handleModuleToggle(module.id)}
                            className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-700">{module.name}</span>
                              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                                {module.difficulty}
                              </span>
                              <span className="text-xs text-gray-500">
                                {module.cardCount} cards
                              </span>
                            </div>
                          </div>
                        </div>

                        {module.enabled && (
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600 w-12 text-right">
                              {module.weight}%
                            </span>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={module.weight}
                              onChange={(e) => handleWeightChange(module.id, parseInt(e.target.value))}
                              className="w-20 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Weight Distribution Visualization */}
        {modules.filter(m => m.enabled).length > 0 && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-700">Module Distribution</h4>
              <span className="text-xs text-gray-500">
                Total: {totalWeight}%
              </span>
            </div>
            
            <div className="flex h-6 bg-gray-200 rounded-lg overflow-hidden">
              {modules
                .filter(m => m.enabled)
                .map((module, index) => {
                  const colors = ["bg-blue-400", "bg-green-400", "bg-purple-400", "bg-orange-400", "bg-yellow-400", "bg-red-400"];
                  const color = colors[index % colors.length];
                  
                  return (
                    <div
                      key={module.id}
                      className={`${color} transition-all duration-300 flex items-center justify-center`}
                      style={{ width: `${module.weight}%` }}
                      title={`${module.name}: ${module.weight}%`}
                    >
                      {module.weight > 10 && (
                        <span className="text-xs font-medium text-white truncate px-1">
                          {module.name}
                        </span>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
          <p className="text-xs text-purple-700">
            <span className="font-medium">💡 Tip:</span>
            Select modules to include in your custom flashcard sessions. Weights control frequency - higher weights appear more often.
          </p>
        </div>
      </div>
    </SettingsSection>
  );
}
