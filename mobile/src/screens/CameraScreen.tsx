import React, { useRef } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native'
import { Camera, useCameraPermission, useCameraDevice, useCameraFormat } from 'react-native-vision-camera';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

const addFilePrefix = (photoPath: string) : string => photoPath.startsWith('file://') ? photoPath : `file://${photoPath}`;

const CameraScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const cameraRef = useRef<Camera>(null);
  const device = useCameraDevice('back');
  const { hasPermission, requestPermission } = useCameraPermission();
  const format = useCameraFormat(device, [
    { photoResolution: { width: 300, height: 300 } },
  ]);

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

      navigation.navigate('Result', { photoPath: photoPath });
    } catch (error) {
      Alert.alert('Error', `Failed to take photo: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  if (!device) {
    return <Text>Loading camera...</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.infoText}>Please focus the camera on the birthmark</Text>
      <View style={styles.cameraContainer}>
        <Camera
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={true}
          photo={true}
          ref={cameraRef}
          format={format}
          />
      </View>
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
  cameraContainer: {
    width: 300,
    height: 300,
  },
  controls: {
    position: 'absolute',
    bottom: 30,
    flexDirection: 'column',
    justifyContent: 'center',
    width: '100%',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 3,
    margin: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  infoText: {
    color: '#000',
    padding: 10,
    margin: 10,
    fontSize:16,
  },
});

export default CameraScreen;
