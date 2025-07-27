import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Audio, AVPlaybackStatus } from 'expo-av';
import { Song, LyricLine, Word } from '../types';
import { getWordStyle } from '../utils/fadeLogic';
import { trackWordView, getWordViewCounts } from '../utils/wordTracking';

interface KaraokePlayerProps {
  song: Song;
  onWordTap?: (word: Word, wordIndex: number) => void;
}

export default function KaraokePlayer({ song, onWordTap }: KaraokePlayerProps) {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [wordViewCounts, setWordViewCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const trackedWords = useRef<Set<string>>(new Set());

  // Load audio and word view counts on mount
  useEffect(() => {
    loadAudio();
    loadWordViewCounts();
    
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [song]);

  const loadAudio = async () => {
    try {
      setIsLoading(true);
      const { sound: audioSound } = await Audio.Sound.createAsync(
        { uri: song.audioFile },
        { shouldPlay: false }
      );
      setSound(audioSound);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading audio:', error);
      setIsLoading(false);
    }
  };

  const loadWordViewCounts = async () => {
    try {
      const counts = await getWordViewCounts(song.id);
      setWordViewCounts(counts);
    } catch (error) {
      console.error('Error loading word view counts:', error);
    }
  };

  // Audio sync polling - runs every ~100ms when playing
  useEffect(() => {
    if (isPlaying && sound) {
      intervalRef.current = setInterval(async () => {
        try {
          const status = await sound.getStatusAsync();
          if (status.isLoaded) {
            const currentMs = status.positionMillis || 0;
            setCurrentTime(currentMs);
            updateCurrentIndices(currentMs);
            trackCurrentWords(currentMs);
          }
        } catch (error) {
          console.error('Error getting audio status:', error);
        }
      }, 100); // 100ms polling as discussed
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, sound]);

  const updateCurrentIndices = (currentMs: number) => {
    // Find current line
    const lineIndex = song.lyrics.findIndex(line => 
      currentMs >= line.start && currentMs <= line.end
    );
    
    if (lineIndex !== -1) {
      setCurrentLineIndex(lineIndex);
      
      // Find current word within the line
      const currentLine = song.lyrics[lineIndex];
      const wordIndex = currentLine.words.findIndex(word => 
        currentMs >= word.start && currentMs <= word.end
      );
      
      if (wordIndex !== -1) {
        setCurrentWordIndex(wordIndex);
      }
    }
  };

  const trackCurrentWords = async (currentMs: number) => {
    const currentLine = song.lyrics[currentLineIndex];
    if (!currentLine) return;

    // Track words that are currently being heard
    currentLine.words.forEach(async (word, wordIndex) => {
      if (currentMs >= word.start && currentMs <= word.end) {
        const trackingKey = `${song.id}_${word.text}_${wordIndex}`;
        
        // Only track each word once per playthrough
        if (!trackedWords.current.has(trackingKey)) {
          trackedWords.current.add(trackingKey);
          
          try {
            const newCount = await trackWordView(song.id, word.text, wordIndex);
            
            // Update local state
            const viewKey = `${word.text}_${wordIndex}`;
            setWordViewCounts(prev => ({
              ...prev,
              [viewKey]: newCount
            }));
          } catch (error) {
            console.error('Error tracking word view:', error);
          }
        }
      }
    });
  };

  const playPause = async () => {
    if (!sound || isLoading) return;

    try {
      if (isPlaying) {
        await sound.pauseAsync();
      } else {
        await sound.playAsync();
      }
      setIsPlaying(!isPlaying);
    } catch (error) {
      console.error('Error playing/pausing audio:', error);
    }
  };

  const jumpToWord = async (word: Word) => {
    if (!sound) return;

    try {
      await sound.setPositionAsync(word.start);
      setCurrentTime(word.start);
      
      // Clear tracked words so they can be re-tracked
      trackedWords.current.clear();
      
      if (onWordTap) {
        onWordTap(word, currentWordIndex);
      }
    } catch (error) {
      console.error('Error jumping to word:', error);
    }
  };

  const renderWord = (word: Word, wordIndex: number, lineIndex: number) => {
    const viewKey = `${word.text}_${wordIndex}`;
    const viewCount = wordViewCounts[viewKey] || 0;
    const isCurrentWord = lineIndex === currentLineIndex && wordIndex === currentWordIndex;
    
    return (
      <TouchableOpacity
        key={`${lineIndex}-${wordIndex}`}
        onPress={() => jumpToWord(word)}
        style={[
          styles.word,
          isCurrentWord && styles.currentWord
        ]}
      >
        <Text style={[
          styles.wordText,
          getWordStyle(viewCount),
          isCurrentWord && styles.currentWordText
        ]}>
          {word.text}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderLine = (line: LyricLine, lineIndex: number) => {
    const isCurrentLine = lineIndex === currentLineIndex;
    
    return (
      <View key={lineIndex} style={[
        styles.lineContainer,
        isCurrentLine && styles.currentLineContainer
      ]}>
        <View style={styles.originalLine}>
          {line.words.map((word, wordIndex) => 
            renderWord(word, wordIndex, lineIndex)
          )}
        </View>
        <Text style={styles.translation}>{line.translation}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{song.title}</Text>
        <Text style={styles.language}>{song.language}</Text>
      </View>

      <TouchableOpacity 
        style={[styles.playButton, isLoading && styles.disabledButton]} 
        onPress={playPause}
        disabled={isLoading}
      >
        <Text style={styles.playButtonText}>
          {isLoading ? 'Loading...' : (isPlaying ? '⏸️ Pause' : '▶️ Play')}
        </Text>
      </TouchableOpacity>

      <ScrollView style={styles.lyricsContainer}>
        {song.lyrics.map((line, index) => renderLine(line, index))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  language: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  playButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 20,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  playButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  lyricsContainer: {
    flex: 1,
  },
  lineContainer: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  currentLineContainer: {
    backgroundColor: '#e3f2fd',
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  originalLine: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  word: {
    marginRight: 8,
    marginBottom: 5,
    padding: 4,
    borderRadius: 4,
  },
  currentWord: {
    backgroundColor: '#ffeb3b',
  },
  wordText: {
    fontSize: 18,
    color: '#333',
  },
  currentWordText: {
    fontWeight: 'bold',
  },
  translation: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  },
}); 