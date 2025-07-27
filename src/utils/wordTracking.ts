import { supabase } from './supabase';
import { Utterance } from '../types';

/**
 * FUTURE FEATURE: Track that a word has been viewed/heard across all utterances
 * This will enable analytics like "most heard words", "learning progress", etc.
 */
export async function trackWordView(
  songId: string, 
  wordText: string, 
  userId?: string
): Promise<number> {
  try {
    // First, try to get existing record for this word (across all utterances)
    const { data: existing, error: fetchError } = await supabase
      .from('word_tracking')
      .select('view_count')
      .eq('song_id', songId)
      .eq('word_text', wordText)
      .eq('user_id', userId || 'anonymous')
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching word tracking:', fetchError);
      return 0;
    }

    const newCount = (existing?.view_count || 0) + 1;

    // Upsert the record (word-level, not utterance-specific)
    const { error: upsertError } = await supabase
      .from('word_tracking')
      .upsert({
        user_id: userId || 'anonymous',
        song_id: songId,
        word_text: wordText,
        view_count: newCount,
        updated_at: new Date().toISOString()
      });

    if (upsertError) {
      console.error('Error updating word tracking:', upsertError);
      return existing?.view_count || 0;
    }

    return newCount;
  } catch (error) {
    console.error('Error in trackWordView:', error);
    return 0;
  }
}

/**
 * FUTURE FEATURE: Get view counts for all words in a song
 * Returns word-level counts (same word from different utterances combined)
 */
export async function getWordViewCounts(
  songId: string, 
  userId?: string
): Promise<Record<string, number>> {
  try {
    const { data, error } = await supabase
      .from('word_tracking')
      .select('word_text, view_count')
      .eq('song_id', songId)
      .eq('user_id', userId || 'anonymous');

    if (error) {
      console.error('Error fetching word view counts:', error);
      return {};
    }

    // Create a lookup object by word_text only (not position-specific)
    const counts: Record<string, number> = {};
    data?.forEach(record => {
      counts[record.word_text] = record.view_count;
    });

    return counts;
  } catch (error) {
    console.error('Error in getWordViewCounts:', error);
    return {};
  }
}

/**
 * FUTURE FEATURE: Get analytics about most/least heard words
 */
export async function getWordAnalytics(songId: string, userId?: string) {
  const wordCounts = await getWordViewCounts(songId, userId);
  const words = Object.entries(wordCounts);
  
  return {
    totalWords: words.length,
    mostHeardWords: words.sort(([,a], [,b]) => b - a).slice(0, 10),
    leastHeardWords: words.sort(([,a], [,b]) => a - b).slice(0, 10),
    averageViews: words.reduce((sum, [,count]) => sum + count, 0) / words.length || 0
  };
} 