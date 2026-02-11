export const POS_COLORS: Record<string, string> = {
  NOUN: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  VERB: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  ADJ: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  ADV: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  PARTICLE: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
  AUX: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  AUX_PART: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  PRONOUN: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200",
  CONJ: "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
  DET: "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
  NUM: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200",
  INTJ: "bg-yellow-200 text-yellow-900 dark:bg-yellow-800 dark:text-yellow-100",
  SYM: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  PUNCT: "bg-transparent text-gray-400 dark:text-gray-500",
  OTHER: "bg-transparent",
};



export function getPosColor(pos: string): string {
  if (!pos) return "bg-transparent";
  const normalizedPos = pos.toUpperCase();
  console.log(normalizedPos);
  return POS_COLORS[normalizedPos] || "bg-transparent";
}

export function TokenizerLegend() {
  const commonTags = ["NOUN", "VERB", "ADJ", "PARTICLE", "AUX"];

  return (
    <div className="flex flex-wrap gap-2 text-xs p-2 border rounded-md mb-2 bg-muted/20">
      <span className="font-semibold mr-2 self-center">Legend:</span>
      {commonTags.map((tag) => (
        <span
          key={tag}
          className={`px-2 py-0.5 rounded ${POS_COLORS[tag]}`}
        >
          {tag}
        </span>
      ))}
    </div>
  );
}
