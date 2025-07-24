import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';
import Login from './src/features/auth/LoginScreen';
import Register from './src/features/auth/RegisterScreen';
import Profile from './src/features/profile/ProfileScreen';
import ProfileScreen from './src/features/profile/EditProfileScreen';
import Search from './src/features/medications/SearchScreen';
import LazyScreenWrapper from './src/components/LazyScreenWrapper';
import { UserProvider } from './src/features/profile/context/UserContext';
import { Medication } from './src/types/medication';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Profile: undefined;
  ProfileScreen: undefined;
  Search: undefined;
  Scanner: undefined;
  Result: { medication: Medication };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <UserProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Register" component={Register} />
          <Stack.Screen name="ViewProfile" component={Profile} />
          <Stack.Screen name="EditProfile" component={ProfileScreen} />
          <Stack.Screen name="Search" component={Search} />
          <Stack.Screen
            name="Scanner"
            component={(props) => <LazyScreenWrapper getComponent={() => import('./src/features/medications/ScannerScreen')} {...props} />}
          />
          <Stack.Screen
            name="Result"
            component={(props) => <LazyScreenWrapper getComponent={() => import('./src/features/medications/ResultScreen')} {...props} />}
          />
        </Stack.Navigator>
      </NavigationContainer>
      <Toast />
    </UserProvider>
  );
}
