import React, { useState, useCallback } from 'react';
import { View, FlatList, Image, StyleSheet, Text, Alert, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { fetchFiles } from '../services/fileService';
import { useAuth } from '../providers/AuthProvider';

const GalleryScreen: React.FC = () => {
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { user } = useAuth();

  const fetchPhotos = async () => {
    try {
      const photoPaths = await fetchFiles();
      if (!photoPaths) {
        setLoading(false);
        return;
      }
      setPhotos(photoPaths);
      } catch (error) {
        Alert.alert('Error', `Failed to load photos: ${error instanceof Error ? error.message : String(error)}`);
      } finally {
        setLoading(false);
      }
    };

  useFocusEffect(useCallback(() => {
      fetchPhotos();
    }, [])
  );

  const renderPhoto = ({ item }: { item: string }) => (
    <Image source={{ uri: item }} style={styles.photo} />
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator style={styles.loadingIndicator} />
      ) : photos.length > 0 && user ? (
        <FlatList
          data={photos}
          renderItem={renderPhoto}
          keyExtractor={(item, index) => index.toString()}
          numColumns={3}
          contentContainerStyle={styles.gallery}
        />
      ) : (
        <Text style={styles.emptyText}>No photos available.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gallery: {
    padding: 10,
  },
  photo: {
    width: 100,
    height: 100,
    margin: 5,
    borderRadius: 5,
  },
  loadingText: {
    fontSize: 16,
    color: '#007AFF',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  loadingIndicator: {
    marginTop: 20,
  },
});

export default GalleryScreen;
