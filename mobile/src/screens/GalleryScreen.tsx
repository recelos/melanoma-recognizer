import React, { useState, useEffect } from 'react';
import { View, FlatList, Image, StyleSheet, Text, Alert } from 'react-native';
import { fetchFiles } from '../services/fileService';

const GalleryScreen: React.FC = () => {
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const photoPaths = await fetchFiles();
        console.log(photoPaths)
        if (!photoPaths) {
          Alert.alert('Info', 'No photos found in the gallery.');
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

    fetchPhotos();
  }, []);

  const renderPhoto = ({ item }: { item: string }) => (
    <Image source={{ uri: item }} style={styles.photo} />
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <Text style={styles.loadingText}>Loading photos...</Text>
      ) : photos.length > 0 ? (
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
});

export default GalleryScreen;
