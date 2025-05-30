import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import CameraStack from './CameraStack';
import AuthDrawerSection from './AuthDrawerSection';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import { useAuth } from '../providers/AuthProvider';
import GalleryStack from './GalleryStack';

const DrawerNavigator = createDrawerNavigator();

const Root: React.FC = () => {
  const { user } = useAuth();
  return (
      <NavigationContainer>
        <DrawerNavigator.Navigator initialRouteName="CameraStack" drawerContent={AuthDrawerSection}>
          <DrawerNavigator.Screen name="CameraStack" component={CameraStack} options={{title: 'Camera'}}/>
          <DrawerNavigator.Screen name="GalleryStack"
                                  key={user?.uid ?? 'guest'}
                                  component={GalleryStack}
                                  options={{title: 'Gallery'}} />
          <DrawerNavigator.Screen name="Login" component={LoginScreen} options={{drawerItemStyle: { display: 'none' }}}/>
          <DrawerNavigator.Screen name="Register" component={RegisterScreen} options={{drawerItemStyle: {display: 'none' }}} />
        </DrawerNavigator.Navigator>
      </NavigationContainer>
  );
};

export default Root;
