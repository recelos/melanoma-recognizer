import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CameraScreen from '../screens/CameraScreen';
import ResultScreen from '../screens/ResultScreen';

const CameraStackNavigator = createNativeStackNavigator();

const CameraStack = (): React.JSX.Element => {
  return (
    <CameraStackNavigator.Navigator>
      <CameraStackNavigator.Screen
        name="Camera"
        component={CameraScreen}
        options={{ headerShown:false }}
        />
        <CameraStackNavigator.Screen
        name="Result"
        component={ResultScreen}
        />
    </CameraStackNavigator.Navigator>
  );
};

export default CameraStack;
