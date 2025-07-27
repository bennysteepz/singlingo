import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Audio, AVPlaybackStatus } from 'expo-av';
import { Song, LyricLine, Utterance } from '../types';
import { getUtteranceStyle } from '../utils/fadeLogic';
// Word tracking ready for future analytics features
// import { trackWordView, getWordViewCounts } from '../utils/wordTracking';

interface SingLingoPlayerProps {
  song: Song;
  onUtteranceTap?: (utterance: Utterance, utteranceIndex: number) => void;
}

export default function SingLingoPlayer({ song, onUtteranceTap }: SingLingoPlayerProps) {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentUtteranceIndex, setCurrentUtteranceIndex] = useState(0);
  const [utteranceViewCounts, setUtteranceViewCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const trackedUtterances = useRef<Set<string>>(new Set());

  // Load audio and utterance view counts on mount
  useEffect(() => {
    loadAudio();
    loadUtteranceViewCounts();
    
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

  const loadUtteranceViewCounts = async () => {
    try {
      // For now, start with empty counts - utterances start fresh each session
      // TODO: Later add persistent utterance tracking if needed
      setUtteranceViewCounts({});
    } catch (error) {
      console.error('Error loading utterance view counts:', error);
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
            trackCurrentUtterances(currentMs);
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
      
      // Find current utterance within the line
      const currentLine = song.lyrics[lineIndex];
      const utteranceIndex = currentLine.utterances.findIndex(utterance => 
        currentMs >= utterance.start && currentMs <= utterance.end
      );
      
      if (utteranceIndex !== -1) {
        setCurrentUtteranceIndex(utteranceIndex);
      }
    }
  };

  const trackCurrentUtterances = async (currentMs: number) => {
    const currentLine = song.lyrics[currentLineIndex];
    if (!currentLine) return;

    // Track utterances that are currently being heard
    currentLine.utterances.forEach(async (utterance, utteranceIndex) => {
      if (currentMs >= utterance.start && currentMs <= utterance.end) {
        const trackingKey = `${song.id}_${currentLineIndex}_${utteranceIndex}`;
        
        // Only track each utterance once per playthrough
        if (!trackedUtterances.current.has(trackingKey)) {
          trackedUtterances.current.add(trackingKey);
          
          // For now, just increment local count (no persistent storage)
          const viewKey = `${currentLineIndex}_${utteranceIndex}`;
          setUtteranceViewCounts(prev => ({
            ...prev,
            [viewKey]: (prev[viewKey] || 0) + 1
          }));

          // TODO: Future word-level tracking for analytics
          // await trackWordView(song.id, utterance.text, wordPosition);
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

  const jumpToUtterance = async (utterance: Utterance) => {
    if (!sound) return;

    try {
      await sound.setPositionAsync(utterance.start);
      setCurrentTime(utterance.start);
      
      // Clear tracked utterances so they can be re-tracked
      trackedUtterances.current.clear();
      
      if (onUtteranceTap) {
        onUtteranceTap(utterance, currentUtteranceIndex);
      }
    } catch (error) {
      console.error('Error jumping to utterance:', error);
    }
  };

  const renderUtterance = (utterance: Utterance, utteranceIndex: number, lineIndex: number) => {
    // Get view count for this specific utterance
    const viewKey = `${lineIndex}_${utteranceIndex}`;
    const viewCount = utteranceViewCounts[viewKey] || 0;
    const isCurrentUtterance = lineIndex === currentLineIndex && utteranceIndex === currentUtteranceIndex;
    
    return (
      <TouchableOpacity
        key={`${lineIndex}-${utteranceIndex}`}
        onPress={() => jumpToUtterance(utterance)}
        style={[
          styles.utterance,
          isCurrentUtterance && styles.currentUtterance
        ]}
      >
        <Text style={[
          styles.utteranceText,
          getUtteranceStyle(viewCount),
          isCurrentUtterance && styles.currentUtteranceText
        ]}>
          {utterance.text}
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
          {line.utterances.map((utterance, utteranceIndex) => 
            renderUtterance(utterance, utteranceIndex, lineIndex)
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
  utterance: {
    marginRight: 8,
    marginBottom: 5,
    padding: 4,
    borderRadius: 4,
  },
  currentUtterance: {
    backgroundColor: '#ffeb3b',
  },
  utteranceText: {
    fontSize: 18,
    color: '#333',
  },
  currentUtteranceText: {
    fontWeight: 'bold',
  },
  translation: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  },
}); 