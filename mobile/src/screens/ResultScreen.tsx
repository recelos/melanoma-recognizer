import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, Image, Alert, Button, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { uploadPhoto, isApiResponse, ApiResponse, getFolders, saveFile } from '../services/apiService';
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '../providers/AuthProvider';

const ResultScreen: React.FC<{route: any}> = ({route}) => {
  const { photoPath } = route.params;
  const navigation = useNavigation();
  const { user } = useAuth();

  const [response, setResponse] = useState<string>();
  const [loading, setLoading] = useState<boolean>(true);
  const [folders, setFolders] = useState<{ id: number; name: string }[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<number | null>(null);
  const [saving, setSaving] = useState<boolean>(false);

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

 useEffect(() => {
    const fetchApiResponse = async () => {
      try {
        const apiResponse: ApiResponse | string = await uploadPhoto(photoPath);
        if (isApiResponse(apiResponse)) {
          setResponse(apiResponse.result);
        }
      } catch (error) {
        Alert.alert('Error', `Unable to upload picture: ${error}`);
        navigation.pop();
      } finally {
        setLoading(false);
      }
    };

    const loadFolders = async () => {
      if (!user) return;
      try {
        const res = await getFolders(user.uid);
        setFolders(res.data);
        if (res.data.length > 0) {
          setSelectedFolder(res.data[0].id);
        }
      } catch (err) {
        console.log('Błąd pobierania folderów:', err);
      }
    };

    fetchApiResponse();
    loadFolders();
  }, [photoPath, user]);

  const handleSave = async () => {
    if (!user || !selectedFolder || !response) {
      Alert.alert('Error', 'Folder not selected.');
      return;
    }

    try {
      setSaving(true);
      await saveFile(photoPath, selectedFolder, response);

      Alert.alert('Success', 'Picture was succesfully saved!');
    } catch (err: any) {
      Alert.alert('Save Error', err.message || 'An error ocurred during saving.');
    } finally {
      setSaving(false);
    }
  };


 return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator testID="ActivityIndicator" size="large" color="#007AFF" style={styles.loadingIndicator} />
      ) : (
        <>
          <Image source={{ uri: photoPath }} style={styles.image} />
          <Text style={styles.apiResponse}>
            Result of the classification: {response}
          </Text>

        {user && (
            <View style={styles.saveSection}>
              <Text style={styles.label}>Choose folder:</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={selectedFolder}
                  onValueChange={(itemValue) => setSelectedFolder(itemValue)}
                  mode="dropdown"
                  style={styles.picker}
                >
                  {folders.map((folder: any) => (
                    <Picker.Item key={folder.id} label={folder.name} value={folder.id} />
                  ))}
                </Picker>
              </View>

              <Button
                testID="save-button"
                title={saving ? 'Saving...' : 'Save picture'}
                onPress={handleSave}
                disabled={saving || !selectedFolder}
              />
            </View>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  image: {
    width: 300,
    height: 300,
    borderRadius: 10,
  },
  apiResponse: {
    marginTop: 20,
    fontSize: 16,
    textAlign: 'center',
  },
  loadingIndicator: {
    marginTop: 20,
  },
  saveSection: {
    marginTop: 30,
    width: '100%',
    alignItems: 'center',
  },
  pickerContainer: {
    marginVertical: 20,
    width: '100%',
  },
  label: {
    marginBottom: 8,
    fontSize: 16,
  },
  picker: {
    backgroundColor: '#323232',
  },
});

export default ResultScreen;
