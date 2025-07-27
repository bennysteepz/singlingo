# 🚀 Sing Lingo Setup Instructions

## Prerequisites

- Node.js and npm installed
- Expo CLI: `npm install -g expo-cli`
- A Supabase account (free at supabase.com)

## 1. Install Dependencies

```bash
npm install
```

## 2. Supabase Setup

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Create a `.env` file in the root directory with:

```env
EXPO_PUBLIC_SUPABASE_URL=your-supabase-project-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

3. In your Supabase project dashboard, go to **SQL Editor** and run this query to create the word tracking table:

```sql
-- Create word_tracking table (for future word-level analytics)
-- This tracks words across all utterances - same word gets collective count
CREATE TABLE word_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID DEFAULT auth.uid(),
  song_id TEXT NOT NULL,
  word_text TEXT NOT NULL,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, song_id, word_text) -- Ensure one record per user/song/word
);

-- Create index for fast lookups
CREATE INDEX idx_word_tracking_lookup 
ON word_tracking(user_id, song_id, word_text);

-- Enable Row Level Security (optional, for user isolation)
ALTER TABLE word_tracking ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to access their own data
CREATE POLICY "Users can access their own word tracking data" 
ON word_tracking FOR ALL USING (auth.uid() = user_id);
```

## 3. Add Audio Files

The app expects audio files in the `assets/audio/` directory:
- `assets/audio/ua-like-no-a-like.mp3`
- `assets/audio/kalinka.mp3`

You can use any public domain audio files or create your own recordings.

## 4. Run the App

```bash
npm start
```

Then scan the QR code with the Expo Go app on your phone, or press `i` for iOS simulator / `a` for Android emulator.

## 🎵 How It Works

1. **Audio Sync**: The app polls audio position every ~100ms to sync with lyrics
2. **Utterance Display**: Each timed segment (utterance) can be tapped to jump to that point
3. **Fade Logic**: Utterances fade out after 10 views and disappear after 20 views
4. **Word Analytics** (Future): Track words across all utterances for learning analytics
5. **Ready for Expansion**: Infrastructure set up for word-level features like progress tracking

## 📝 Adding New Songs

1. Create a new entry in `src/data/songs.ts`
2. Add the audio file to `assets/audio/`
3. Create timing data with millisecond precision for each word

## 🔧 Development Notes

- The app works offline once audio files are cached
- Word tracking requires internet connection for Supabase sync
- Audio files should be optimized for mobile (MP3, reasonable bitrate)
- Timing data can be created using audio editing software like Audacity 