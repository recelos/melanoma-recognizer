import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CameraScreen from './screens/CameraScreen';
import ResultScreen from './screens/ResultScreen';

const NativeStackNavigator = createNativeStackNavigator();

function Stack(): React.JSX.Element {
  return (
    <NavigationContainer>
      <NativeStackNavigator.Navigator>
        <NativeStackNavigator.Screen
          name="CameraScreen"
          component={CameraScreen}
          />
          <NativeStackNavigator.Screen
          name="ResultScreen"
          component={ResultScreen}
          />
      </NativeStackNavigator.Navigator>
    </NavigationContainer>
  );
}

export default Stack;
