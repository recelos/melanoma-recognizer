import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import GalleryScreen from '../screens/GalleryScreen';
import { NavigationContainer } from '@react-navigation/native';
import CameraStack from './CameraStack';
import AuthDrawerSection from './AuthDrawerSection';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import { AuthProvider } from '../providers/AuthProvider';

const DrawerNavigator = createDrawerNavigator();

const Root: React.FC = () => {
  return (
    <AuthProvider>
      <NavigationContainer>
        <DrawerNavigator.Navigator initialRouteName="CameraStack" drawerContent={AuthDrawerSection}>
          <DrawerNavigator.Screen name="CameraStack" component={CameraStack} options={{title: 'Camera'}}/>
          <DrawerNavigator.Screen name="Gallery" component={GalleryScreen} />
          <DrawerNavigator.Screen name="Login" component={LoginScreen} options={{drawerItemStyle: { display: 'none' }}}/>
          <DrawerNavigator.Screen name="Register" component={RegisterScreen} options={{drawerItemStyle: {display: 'none' }}} />
        </DrawerNavigator.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
};

export default Root;
