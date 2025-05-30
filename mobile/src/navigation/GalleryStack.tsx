import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import FolderListScreen from '../screens/FolderListScreen';
import GalleryScreen from '../screens/GalleryScreen';
import { GalleryStackParamList } from '../types/types';

const GalleryStackNavigator = createNativeStackNavigator<GalleryStackParamList>();

const GalleryStack = (): React.JSX.Element => {
  return (
    <GalleryStackNavigator.Navigator>
      <GalleryStackNavigator.Screen
        name="Folders"
        component={FolderListScreen}
        options={{ headerShown:false }}
        />
        <GalleryStackNavigator.Screen
        name="Gallery"
        component={GalleryScreen}
        />
    </GalleryStackNavigator.Navigator>
  );
};

export default GalleryStack;
