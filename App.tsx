import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import SingLingoPlayer from './src/components/SingLingoPlayer';
import { sampleSongs } from './src/data/songs';
import { Song } from './src/types';

export default function App() {
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);

  if (selectedSong) {
    return (
      <SafeAreaView style={styles.container}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => setSelectedSong(null)}
        >
          <Text style={styles.backButtonText}>← Back to Songs</Text>
        </TouchableOpacity>
        <SingLingoPlayer 
          song={selectedSong}
          onUtteranceTap={(utterance, utteranceIndex) => {
            console.log(`Tapped utterance: ${utterance.text} at index ${utteranceIndex}`);
          }}
        />
        <StatusBar style="auto" />
      </SafeAreaView>
    );
  }

  const renderSongItem = ({ item }: { item: Song }) => (
    <TouchableOpacity 
      style={styles.songItem}
      onPress={() => setSelectedSong(item)}
    >
      <Text style={styles.songTitle}>{item.title}</Text>
      <Text style={styles.songLanguage}>{item.language}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.appTitle}>🎤 Sing Lingo</Text>
        <Text style={styles.appSubtitle}>Learn languages through music</Text>
      </View>
      
      <FlatList
        data={sampleSongs}
        renderItem={renderSongItem}
        keyExtractor={(item) => item.id}
        style={styles.songList}
        showsVerticalScrollIndicator={false}
      />
      
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  appSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  songList: {
    flex: 1,
    padding: 20,
  },
  songItem: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  songTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  songLanguage: {
    fontSize: 16,
    color: '#666',
  },
  backButton: {
    padding: 15,
    backgroundColor: '#2196F3',
    margin: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
