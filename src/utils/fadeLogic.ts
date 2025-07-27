/**
 * Calculate opacity based on how many times something has been viewed
 * Logic: fade after 10 views, disappear after 20
 */
export function getOpacity(views: number): number {
  if (views < 10) return 1; // fully visible
  if (views < 20) return 1 - (views - 10) / 10; // fade out gradually
  return 0; // completely hidden
}

/**
 * Determine if something should be completely hidden
 */
export function isHidden(views: number): boolean {
  return views >= 20;
}

/**
 * Get styling for utterances based on view count (current implementation)
 */
export function getUtteranceStyle(views: number) {
  return {
    opacity: getOpacity(views),
    textDecorationLine: views >= 10 ? 'line-through' as const : 'none' as const,
  };
}

/**
 * Get styling for words based on view count (ready for future word analytics)
 */
export function getWordStyle(views: number) {
  return {
    opacity: getOpacity(views),
    textDecorationLine: views >= 10 ? 'line-through' as const : 'none' as const,
  };
} 