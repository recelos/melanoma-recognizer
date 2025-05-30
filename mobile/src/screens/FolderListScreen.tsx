import React, { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Button,
  Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getFolders, createNewFolder } from '../services/apiService';
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

  const [modalVisible, setModalVisible] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

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

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      Alert.alert('Error', 'Enter folder name');
      return;
    }

    if (!user) {
      return;
    }

    try {
      await createNewFolder(newFolderName, user.uid);
      setModalVisible(false);
      setNewFolderName('');
      fetchFolders();
    } catch (error: any) {
      console.error(error)
      Alert.alert('Error', error.response?.data?.detail || 'Could not create folder');
    }
  };

  const handleFolderPress = (folderId: number) => {
    navigation.navigate('Gallery', { folderId });
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" testID='ActivityIndicator'/>
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

  return (
    <>
      <FlatList
        data={folders}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.folderItem} onPress={() => handleFolderPress(item.id)}>
            <Text style={styles.folderName}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    {user && (
      <View style={{ padding: 16 }}>
        <Button title="Create new folder" onPress={() => setModalVisible(true)} />
      </View>)}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>New folder</Text>
            <TextInput
              placeholder="Folder name"
              value={newFolderName}
              onChangeText={setNewFolderName}
              style={styles.input}
            />
            <View style={{  }}>
              <Button title="Create" onPress={handleCreateFolder} />
              <Button title="Cancel" onPress={() => setModalVisible(false)} />
            </View>
          </View>
        </View>
      </Modal>
    </>
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
  modalBackground: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.5)',
  justifyContent: 'center',
  alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
});

export default FolderListScreen;
