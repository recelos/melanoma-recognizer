import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import GalleryScreen from '../screens/GalleryScreen';
import { NavigationContainer } from '@react-navigation/native';
import CameraStack from './CameraStack';
import LoginScreen from '../screens/LoginScreen';

const DrawerNavigator = createDrawerNavigator();

const Root: React.FC = () => {
  return (
    <NavigationContainer>
      <DrawerNavigator.Navigator initialRouteName="CameraStack">
        <DrawerNavigator.Screen name="CameraStack" component={CameraStack} options={{title: 'Camera'}}/>
        <DrawerNavigator.Screen name="Gallery" component={GalleryScreen} />
        <DrawerNavigator.Screen name="Login" component={LoginScreen} />
      </DrawerNavigator.Navigator>
    </NavigationContainer>
  );
};

export default Root;
