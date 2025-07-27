
# 🎤 Sing Lingo

A minimalist React Native app for learning languages by singing along — sing-style.

Instead of drills or flashcards, users learn through *vibes*: listening, repetition, and real song lyrics. As you hear each word more, it fades away — until you're singing fluently with only the translation to guide you.

---

## ✨ Features

- 🎵 **Word-by-Word Lyric Sync**
  - Tap any word to jump to that part of the song
- 👁️ **Silent Word Tracking**
  - App logs how many times you’ve heard each word
- 🌫️ **Fade-Away Learning**
  - Words fade/disappear as you become more familiar
- 🌍 **Line-by-Line Translations**
  - Translations appear under each line, always visible
- ⚡ **Offline Friendly**
  - Designed to work with local assets (audio + lyrics)

---

## 🧠 Learning Method

Language is best learned with emotion, music, and rhythm.  
**Sing Lingo** doesn't test you — it lets you vibe your way to fluency.

---

## 🌺 Example Song Snippets

### Hawaiian
- **Song**: *Ua Like Nō A Like*
- **Line**: `Ua like nō a like`  
- **Translation**: `So very much alike`

### Russian
- **Song**: *Kalinka*
- **Line**: `Калинка, калинка, калинка моя!`  
- **Translation**: `Little snowball tree, my snowball!`

All sourced from **public domain** lyrics and recordings.

---

## 🧱 Tech Stack

- React Native (Expo for iOS)
- `expo-av` for audio
- AsyncStorage or Supabase for view tracking
- Simple JSON-based lyric data

---

## 📁 Lyric Data Format

```json
[
  {
    "start": 0,
    "end": 2000,
    "original": "Ua like nō a like",
    "translation": "So very much alike",
    "words": [
      { "text": "Ua", "start": 0, "end": 500, "views": 0 },
      { "text": "like", "start": 500, "end": 1000, "views": 0 },
      { "text": "nō", "start": 1000, "end": 1500, "views": 0 },
      { "text": "a", "start": 1500, "end": 1800, "views": 0 },
      { "text": "like", "start": 1800, "end": 2000, "views": 0 }
    ]
  }
]
```

---

## 🎚️ Word Fade Logic

```ts
function getOpacity(views) {
  if (views < 10) return 1; // visible
  if (views < 20) return 1 - (views - 10) / 10; // fade out
  return 0; // hidden
}
```

---

## 🔐 Legal Notes

- ✅ All songs used are public domain (pre-1925)
- ✅ All lyrics and recordings are either original or cleared
- ❌ No Spotify/YouTube content is used

---

## 🙌 Why "Sing Lingo"?

Because it's not just about music — it's about learning language through sound, culture, and good vibes.  
Whether you're at a singing room in Hawaiʻi or learning on your phone in bed, you're picking up real, memorable language — one verse at a time.

---

## 📦 Coming Soon

- Stats view: "Your most-played words"
- Daily play goals
- Reverse mode (translation only)
- Upload your own songs

---

## 🧡 Built By

A linguist + singing lover from Hawaiʻi, with a soft spot for singing with friends and learning through music.
