import React from 'react';
import { View, Text, Button, StyleSheet} from 'react-native'
import { useAuth } from '../providers/AuthProvider';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp, DrawerContentScrollView, DrawerItemList, DrawerContentComponentProps } from '@react-navigation/drawer';

const AuthDrawerSection: React.FC<DrawerContentComponentProps> = (props) => {
  const { user, logout } = useAuth();
  const navigation = useNavigation<DrawerNavigationProp<any>>();

  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.buttonsContainer}>
        <DrawerItemList {...props} />
      </View>
      <View style={styles.footerContainer}>
      {user ? (
        <>
          <Text style={styles.userText}>Logged in as: {user.email}</Text>
          <Button title="Log Out" onPress={logout} />
        </>
        ) : (
          <Button title="Log In" onPress={() => navigation.navigate('Login')} />
        )}
      </View>
  </DrawerContentScrollView>
  );
};

const styles = StyleSheet.create({
  userText: {
    fontSize: 16,
    marginBottom: 10,
  },
  buttonsContainer: {
    flex: 1,
    marginBottom: 20,
  },
  footerContainer: {
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    paddingVertical: 10,
  },
});

export default AuthDrawerSection;
