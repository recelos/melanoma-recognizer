import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, Image, Alert, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { uploadPhoto, isApiResponse, ApiResponse } from '../services/apiService';
import { addFile } from '../services/fileService';

const ResultScreen: React.FC<{route: any}> = ({route}) => {
  const { photoPath } = route.params;
  const navigation = useNavigation();
  const [response, setResponse] = useState<string>();
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

  useEffect(() => {
    const fetchApiResponse = async () => {
      try {
        const apiResponse: ApiResponse | string = await uploadPhoto(photoPath);

        if (isApiResponse(apiResponse)) {
          setResponse(apiResponse.result);
          await addFile(photoPath);
        }
      } catch (error) {
        Alert.alert('Error', `${error instanceof Error ? error.message : String(error)}`);
        navigation.pop();
      } finally {
        setLoading(false);
      }
    };

    fetchApiResponse();
  }, [photoPath]);

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={styles.loadingIndicator} />
      ) : (
        <>
          <Image source={{ uri: photoPath }} style={styles.image} />
          <Text style={styles.apiResponse}>Result of the classification: {response}</Text>
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
});

export default ResultScreen;
