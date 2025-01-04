import React, { useRef } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, Alert } from 'react-native';
import { Camera, useCameraPermission, useCameraDevice } from 'react-native-vision-camera';
import uploadPhoto from '../services/apiService';

const addFilePrefix = (photoPath: string) : string => photoPath.startsWith('file://') ? photoPath : `file://${photoPath}`;

const CameraScreen: React.FC = () => {
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

  const takePicture = async (): Promise<void> => {
    if (!cameraRef.current) {
      Alert.alert('Error', 'Camera is not available');
      return;
    }

    try {
      const photo = await cameraRef.current.takePhoto({
        flash: 'off',
      });

      const photoPath = addFilePrefix(photo.path);
      const response = await uploadPhoto(photoPath);

      Alert.alert('Response from API', response);
    } catch (error) {
      Alert.alert('Error', `Failed to take photo: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  if (!device) {
    return <Text>Loading camera...</Text>;
  }

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
