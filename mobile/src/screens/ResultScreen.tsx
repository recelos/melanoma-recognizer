import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, Image, StyleSheet } from 'react-native';
import { uploadPhoto, isApiResponse, ApiResponse } from '../services/apiService';

const ResultScreen: React.FC<{route: any}> = ({route}) => {
  const {photoPath} = route.params;
  const [response, setResponse] = useState<string>();
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchApiResponse = async () => {
      try {
        const apiResponse:ApiResponse | string = await uploadPhoto(photoPath);
        if (isApiResponse(apiResponse)) {
          const result = apiResponse.result;
          setResponse(result);
        }
      } catch (error) {
        setResponse(`Error: ${error instanceof Error ? error.message : String(error)}`);
      } finally {
        setLoading(false);
      }
    };

    fetchApiResponse();
  }, [photoPath]);

  return (
    <View style={styles.container}>
      <Image source={{ uri: photoPath }} style={styles.image} />
      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={styles.loadingIndicator} />
      ) : (
        <Text style={styles.apiResponse}>{response}</Text>
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
