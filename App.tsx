import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';
import Login from './screens/Login';
import Register from './screens/Register';
import Profile from './screens/Profile';
import ProfileScreen from './screens/ProfileScreen';
import Search from './screens/Search';
import Scanner from './screens/Scanner';
import Result from './screens/Result';
import { UserProvider } from './context/UserContext';

interface Medication {
  id: string;
  name: string;
  usage: string;
  dosage: string;
  ingredients: string[];
  safe_for_pregnant: boolean;
  safe_for_children: boolean;
  barcode?: string;
  explanation: string;
}

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
          <Stack.Screen name="Profile" component={Profile} />
          <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
          <Stack.Screen name="Search" component={Search} />
          <Stack.Screen name="Scanner" component={Scanner} />
          <Stack.Screen name="Result" component={Result} />
        </Stack.Navigator>
      </NavigationContainer>
      <Toast />
    </UserProvider>
  );
}
