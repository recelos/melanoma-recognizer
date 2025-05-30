import React, { useState, useEffect, useCallback } from 'react';
import { View, FlatList, Image, StyleSheet, Text, Alert, ActivityIndicator, Dimensions } from 'react-native';
import { useFocusEffect, useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { fetchPhotosByFolder } from '../services/apiService';
import { useAuth } from '../providers/AuthProvider';
import { GalleryStackParamList } from '../types/types';

type Photo = {
  id: number;
  url: string;
  classification_result: string;
};

type GalleryRouteProp = RouteProp<GalleryStackParamList, 'Gallery'>;

const { width, height } = Dimensions.get('window');

const GalleryScreen: React.FC = () => {
  const { user } = useAuth();

  const navigation = useNavigation();
  const route = useRoute<GalleryRouteProp>();

  const [photos, setPhotos] = useState<Photo[]>([]);
  const { folderId } = route.params;

  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    navigation.getParent()?.setOptions({
        headerShown:false,
      });
    return () => {
      navigation.getParent()?.setOptions({
        headerShown:true,
      });
    };
  }, [navigation]);

  const fetchPhotos = async () => {
    if (!folderId) return;

    try {
      const response = await fetchPhotosByFolder(folderId);
      setPhotos(response);
    } catch (error) {
      Alert.alert('Error', `Could not load pictures: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchPhotos();
    }, [folderId])
  );

  const renderPhoto = ({ item }: { item: Photo }) => (
    <View style={styles.slide}>
      <Image source={{ uri: item.url }} style={styles.fullscreenImage} />
      <Text style={styles.caption}>{item.classification_result}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator style={styles.loadingIndicator} />
      ) : photos.length > 0 && user ? (
        <FlatList
          data={photos}
          renderItem={renderPhoto}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
        />
      ) : (
        <Text style={styles.emptyText}>No photos assigned to this benign.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  slide: {
    width,
    height,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenImage: {
    width,
    height: height * 0.8,
    resizeMode: 'contain',
  },
  caption: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
  emptyText: {
    color: '#ccc',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
  loadingIndicator: {
    marginTop: 20,
  },
});

export default GalleryScreen;
