import React, { useState, useRef } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, Image, Alert } from 'react-native';
import { Camera, useCameraPermission, useCameraDevice, PhotoFile } from 'react-native-vision-camera';

const CameraScreen: React.FC = () => {
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const cameraRef = useRef<Camera>(null);
  const device = useCameraDevice('back');
  const { hasPermission, requestPermission } = useCameraPermission();

  if (!hasPermission) {
    requestPermission();
    return <Text>Requesting camera permission...</Text>;
  }

  if (!device) {
    return <Text>No access to camera</Text>;
  }

  const handleCapture = async (photo: PhotoFile): Promise<void> => {
    try {
      setPhotoUri(photo.path);
    } catch (error) {
      Alert.alert('Error', `Failed to process photo: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const takePicture = async (): Promise<void> => {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePhoto({
        flash: 'off',
      });
      await handleCapture(photo);
    } catch (error) {
      Alert.alert('Error', `Failed to take photo: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  if (!device) return <Text>Loading camera...</Text>;

  return (
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        photo={true}
        ref={cameraRef}
      />
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.button}
          onPress={takePicture}
        >
          <Text style={styles.buttonText}>Take Photo</Text>
        </TouchableOpacity>
      </View>
      {photoUri && (
        <Image source={{ uri: photoUri }} style={styles.preview} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controls: {
    position: 'absolute',
    bottom: 30,
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  preview: {
    width: 300,
    height: 300,
    marginTop: 20,
    borderRadius: 10,
  },
});

export default CameraScreen;