import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';
import { signInWithPassword } from '../lib/supabase';
import { useUser } from '../context/UserContext';
import type { RootStackParamList } from '../App';
import { getColors } from '../lib/colors';

// Login screen allows users to sign in with email and password, and handles navigation and error display.
const Login = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { session } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const colors = getColors();
  const styles = getStyles(colors);

  // useEffect: Redirect to Profile if already authenticated
  React.useEffect(() => {
    if (session) {
      // If already authenticated, redirect to Profile
      navigation.reset({ index: 0, routes: [{ name: 'Profile' }] });
    }
  }, [session]);

  // handleLogin: Validate input, sign in with Supabase, show errors if any
  const handleLogin = async () => {
    try {
      if (!email.trim() || !password) {
        Toast.show({
          type: 'error',
          text1: '😅 Oops!',
          text2: 'Please enter your email and password.',
        });
        return;
      }
      
      setLoading(true);
      const { error } = await signInWithPassword(email.trim(), password);
      
      if (error) {
        Toast.show({
          type: 'error',
          text1: '🚫 Login Failed',
          text2: error.message,
        });
      }
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: '🚫 Login Error',
        text2: err instanceof Error ? err.message : 'An unexpected error occurred',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.BACKGROUND }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        <Text style={styles.emoji}>💊</Text>
        <Text style={styles.appName}>MedMate</Text>
        <Text style={styles.welcome}>Welcome back! 👋</Text>
        <View style={styles.card}>
          <View style={styles.inputRow}>
            <Text style={styles.inputEmoji}>✉️</Text>
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              textContentType="emailAddress"
            />
          </View>
          <View style={styles.inputRow}>
            <Text style={styles.inputEmoji}>🔒</Text>
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              textContentType="password"
            />
          </View>
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.buttonText}>{loading ? 'Logging in...' : '🚀 Login'}</Text>
          </TouchableOpacity>
          <Text style={styles.tip}>🔐 Your info is safe with us!</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.switchText}>New here? <Text style={{ color: colors.PRIMARY }}>✨ Register!</Text></Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

function getStyles(colors: any) {
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
      backgroundColor: 'transparent',
    },
    emoji: {
      fontSize: 56,
      marginBottom: 8,
    },
    appName: {
      fontSize: 32,
      fontWeight: 'bold',
      color: colors.PRIMARY,
      marginBottom: 4,
    },
    welcome: {
      fontSize: 18,
      color: colors.PRIMARY,
      marginBottom: 24,
    },
    card: {
      backgroundColor: colors.SURFACE,
      borderRadius: 16,
      padding: 24,
      width: '100%',
      maxWidth: 400,
      marginBottom: 24,
      shadowColor: colors.BORDER,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 6,
      elevation: 2,
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
      backgroundColor: colors.SURFACE,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.BORDER,
      paddingHorizontal: 12,
    },
    inputEmoji: {
      fontSize: 22,
      marginRight: 8,
    },
    input: {
      flex: 1,
      fontSize: 16,
      paddingVertical: 12,
      color: colors.TEXT,
      backgroundColor: 'transparent',
    },
    button: {
      backgroundColor: colors.PRIMARY,
      paddingVertical: 14,
      borderRadius: 10,
      alignItems: 'center',
      marginTop: 8,
      marginBottom: 8,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    buttonText: {
      color: colors.TEXT_ON_PRIMARY,
      fontSize: 18,
      fontWeight: 'bold',
    },
    tip: {
      color: colors.SECONDARY,
      fontSize: 14,
      textAlign: 'center',
      marginTop: 8,
    },
    switchText: {
      fontSize: 16,
      color: colors.PRIMARY,
      marginTop: 12,
    },
  });
}

export default Login; 