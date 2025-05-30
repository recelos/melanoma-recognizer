import React, { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getFolders } from '../services/apiService';
import { useAuth } from '../providers/AuthProvider';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { GalleryStackParamList } from '../types/types';

type Folder = {
  id: number;
  name: string;
};

const FolderListScreen = () => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigation = useNavigation<NativeStackNavigationProp<GalleryStackParamList, 'Folders'>>();
  const { user } = useAuth();

const fetchFolders = async () => {
  setLoading(true);
  setError(null);
  if (!user){
    setError('Log in to access benigns');
    setLoading(false);
    return;
  }

  try {
    const response = await getFolders(user!.uid);
    setFolders(response.data);
  } catch (err: any) {
    if (err.response?.status === 404) {
      setFolders([]);
    } else {
      setError('Issue during loading folders');
    }
  } finally {
    setLoading(false);
  }
};


useFocusEffect(useCallback(() => {
  fetchFolders();
  }, [user])
);

  const handleFolderPress = (folderId: number) => {
    navigation.navigate('Gallery', { folderId });
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.message}>{error}</Text>
      </View>
    );
  }

  if (folders.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.message}>No benigns monitored.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={folders}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <TouchableOpacity style={styles.folderItem} onPress={() => handleFolderPress(item.id)}>
          <Text style={styles.folderName}>{item.name}</Text>
        </TouchableOpacity>
      )}
    />
  );
};

const styles = StyleSheet.create({
  folderItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  folderName: {
    fontSize: 18,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    fontSize: 16,
    color: '#666',
  },
});

export default FolderListScreen;
