import { supabase } from './supabase';
import { Word } from '../types';

/**
 * Track that a word has been viewed/heard
 */
export async function trackWordView(
  songId: string, 
  wordText: string, 
  wordIndex: number,
  userId?: string
): Promise<number> {
  try {
    // First, try to get existing record
    const { data: existing, error: fetchError } = await supabase
      .from('word_tracking')
      .select('view_count')
      .eq('song_id', songId)
      .eq('word_text', wordText)
      .eq('word_index', wordIndex)
      .eq('user_id', userId || 'anonymous')
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching word tracking:', fetchError);
      return 0;
    }

    const newCount = (existing?.view_count || 0) + 1;

    // Upsert the record
    const { error: upsertError } = await supabase
      .from('word_tracking')
      .upsert({
        user_id: userId || 'anonymous',
        song_id: songId,
        word_text: wordText,
        word_index: wordIndex,
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
 * Get view counts for all words in a song
 */
export async function getWordViewCounts(
  songId: string, 
  userId?: string
): Promise<Record<string, number>> {
  try {
    const { data, error } = await supabase
      .from('word_tracking')
      .select('word_text, word_index, view_count')
      .eq('song_id', songId)
      .eq('user_id', userId || 'anonymous');

    if (error) {
      console.error('Error fetching word view counts:', error);
      return {};
    }

    // Create a lookup object by word_text and word_index
    const counts: Record<string, number> = {};
    data?.forEach(record => {
      const key = `${record.word_text}_${record.word_index}`;
      counts[key] = record.view_count;
    });

    return counts;
  } catch (error) {
    console.error('Error in getWordViewCounts:', error);
    return {};
  }
} 