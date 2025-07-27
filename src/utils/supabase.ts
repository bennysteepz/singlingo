import { createClient } from '@supabase/supabase-js';

// You'll need to replace these with your actual Supabase credentials
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'your-supabase-url';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'your-supabase-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database schema for word tracking:
// Table: word_tracking
// Columns:
// - id (uuid, primary key)
// - user_id (uuid, references auth.users if using auth)
// - song_id (text)
// - word_text (text)
// - word_index (integer) - position in song
// - view_count (integer, default 0)
// - created_at (timestamp)
// - updated_at (timestamp) 