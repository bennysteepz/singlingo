/**
 * Calculate opacity for a word based on how many times it's been viewed
 * Logic from README: fade after 10 views, disappear after 20
 */
export function getOpacity(views: number): number {
  if (views < 10) return 1; // fully visible
  if (views < 20) return 1 - (views - 10) / 10; // fade out gradually
  return 0; // completely hidden
}

/**
 * Determine if a word should be completely hidden
 */
export function isWordHidden(views: number): boolean {
  return views >= 20;
}

/**
 * Get styling for word based on view count
 */
export function getWordStyle(views: number) {
  return {
    opacity: getOpacity(views),
    textDecorationLine: views >= 10 ? 'line-through' as const : 'none' as const,
  };
} 