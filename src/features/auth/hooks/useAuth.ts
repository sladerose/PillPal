import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';
import { signInWithPassword, signUp } from '../../services/supabase';
import type { RootStackParamList } from '../../../App';

export const useAuth = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (email, password) => {
    try {
      if (!email.trim() || !password) {
        Toast.show({
          type: 'error',
          text1: '😅 Oops!',
          text2: 'Please enter your email and password.'
        });
        return;
      }
      if (!isValidEmail(email.trim())) {
        Toast.show({
          type: 'error',
          text1: 'Invalid Email',
          text2: 'Please enter a valid email address.'
        });
        return;
      }
      setLoading(true);
      const { error } = await signInWithPassword(email.trim(), password);
      if (error) {
        Toast.show({
          type: 'error',
          text1: '🚫 Login Failed',
          text2: error.message
        });
      }
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: '🚫 Login Error',
        text2: err instanceof Error ? err.message : 'An unexpected error occurred'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (email, password, confirmPassword) => {
    if (!email.trim() || !password || !confirmPassword) {
      Toast.show({
        type: 'error',
        text1: '😅 Oops!',
        text2: 'Please fill in all fields.'
      });
      return;
    }
    if (!isValidEmail(email.trim())) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Email',
        text2: 'Please enter a valid email address.'
      });
      return;
    }
    if (!isValidPassword(password)) {
      Toast.show({
        type: 'error',
        text1: 'Weak Password',
        text2: 'Password must be at least 6 characters.'
      });
      return;
    }
    if (password !== confirmPassword) {
      Toast.show({
        type: 'error',
        text1: '🔑 Passwords do not match!',
        text2: 'Please make sure your passwords match.'
      });
      return;
    }
    setLoading(true);
    const { error } = await signUp(email.trim(), password);
    if (error) {
      Toast.show({
        type: 'error',
        text1: '🚫 Registration Failed',
        text2: error.message
      });
    } else {
      Toast.show({
        type: 'success',
        text1: '🎉 Welcome!',
        text2: 'Account created. Please check your email to verify.'
      });
      navigation.navigate('Login');
    }
    setLoading(false);
  };

  function isValidEmail(email: string): boolean {
    return /^\S+@\S+\.\S+$/.test(email);
  }

  function isValidPassword(password: string): boolean {
    return password.length >= 6;
  }

  return { loading, handleLogin, handleRegister };
};