export interface Utterance {
  text: string;
  start: number; // milliseconds
  end: number;   // milliseconds
  views: number; // how many times user has heard this utterance
}

export interface LyricLine {
  start: number;        // milliseconds
  end: number;          // milliseconds
  original: string;     // original language text
  translation: string;  // English translation
  utterances: Utterance[];
}

export interface Song {
  id: string;
  title: string;
  language: string;
  audioFile: string;   // path to audio file
  lyrics: LyricLine[];
}

export interface AppState {
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  currentLine: number;
  currentUtterance: number;
} 