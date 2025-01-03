/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useRef } from 'react';
import { Text } from 'react-native';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Button,
} from 'react-native';

import { useCameraPermission, useCameraDevice, Camera } from 'react-native-vision-camera';

function App(): React.JSX.Element {
  const device = useCameraDevice('back');
  const { hasPermission, requestPermission } = useCameraPermission();
  const camera = useRef(null);
  const onPressButton = async () => {
  }

  if(!hasPermission){
    return(
      <SafeAreaView>
        <ScrollView>
          <Text onPress={requestPermission}>
            No Permission
          </Text>
        </ScrollView>
      </SafeAreaView>
    );
  }
  if(device == null){
    return(
      <SafeAreaView>
        <ScrollView>
          <Text>
            No device
          </Text>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <>
      <Camera
        ref={camera}
        device={device}
        isActive={true}
        style={StyleSheet.absoluteFill}
        photo={true}
      />
      <Button title="dupa"
      onPress={onPressButton}
      />
    </>
  );
}

export default App;
