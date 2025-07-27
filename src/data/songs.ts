import { Song } from '../types';

export const sampleSongs: Song[] = [
  {
    id: 'ua-like-no-a-like',
    title: 'Ua Like Nō A Like',
    language: 'Hawaiian',
    audioFile: 'assets/audio/ua-like-no-a-like.mp3', // You'll need to add this file
    lyrics: [
      {
        start: 0,
        end: 4000,
        original: "Ua like nō a like",
        translation: "So very much alike",
        words: [
          { text: "Ua", start: 0, end: 800, views: 0 },
          { text: "like", start: 800, end: 1600, views: 0 },
          { text: "nō", start: 1600, end: 2400, views: 0 },
          { text: "a", start: 2400, end: 2800, views: 0 },
          { text: "like", start: 2800, end: 4000, views: 0 }
        ]
      },
      {
        start: 4000,
        end: 8000,
        original: "E ku'u sweetheart",
        translation: "Oh my sweetheart",
        words: [
          { text: "E", start: 4000, end: 4500, views: 0 },
          { text: "ku'u", start: 4500, end: 6000, views: 0 },
          { text: "sweetheart", start: 6000, end: 8000, views: 0 }
        ]
      }
    ]
  },
  {
    id: 'kalinka',
    title: 'Kalinka',
    language: 'Russian',
    audioFile: 'assets/audio/kalinka.mp3', // You'll need to add this file
    lyrics: [
      {
        start: 0,
        end: 6000,
        original: "Калинка, калинка, калинка моя!",
        translation: "Little snowball tree, my snowball!",
        words: [
          { text: "Калинка,", start: 0, end: 1500, views: 0 },
          { text: "калинка,", start: 1500, end: 3000, views: 0 },
          { text: "калинка", start: 3000, end: 4500, views: 0 },
          { text: "моя!", start: 4500, end: 6000, views: 0 }
        ]
      },
      {
        start: 6000,
        end: 12000,
        original: "В саду ягода малинка, малинка моя!",
        translation: "In the garden berry raspberry, my raspberry!",
        words: [
          { text: "В", start: 6000, end: 6500, views: 0 },
          { text: "саду", start: 6500, end: 7500, views: 0 },
          { text: "ягода", start: 7500, end: 8500, views: 0 },
          { text: "малинка,", start: 8500, end: 10000, views: 0 },
          { text: "малинка", start: 10000, end: 11000, views: 0 },
          { text: "моя!", start: 11000, end: 12000, views: 0 }
        ]
      }
    ]
  }
];

// For development, you can use a placeholder audio file or create silent audio
export const PLACEHOLDER_AUDIO = 'https://www.soundjay.com/misc/sounds-yawning-5.mp3'; 