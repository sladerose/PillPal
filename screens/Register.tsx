import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';
import { signUp } from '../lib/supabase';
import type { RootStackParamList } from '../App';
import { getColors } from '../lib/colors';

// Register screen allows users to create a new account with email and password, handling validation, registration, and navigation.
const Register = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const colors = getColors();
  const styles = getStyles(colors);

  // handleRegister: Validate input, check password match, sign up with Supabase, show errors or success, and navigate to Login
  const handleRegister = async () => {
    if (!email.trim() || !password || !confirmPassword) {
      Toast.show({
        type: 'error',
        text1: '😅 Oops!',
        text2: 'Please fill in all fields.',
      });
      return;
    }
    if (password !== confirmPassword) {
      Toast.show({
        type: 'error',
        text1: '🔑 Passwords do not match!',
        text2: 'Please make sure your passwords match.',
      });
      return;
    }
    setLoading(true);
    const { error } = await signUp(email.trim(), password);
    if (error) {
      Toast.show({
        type: 'error',
        text1: '🚫 Registration Failed',
        text2: error.message,
      });
    } else {
      Toast.show({
        type: 'success',
        text1: '🎉 Welcome!',
        text2: 'Account created. Please check your email to verify.',
      });
      navigation.navigate('Login');
    }
    setLoading(false);
  };

  // UI rendering: Show registration form, error messages, and navigation to Login
  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.BACKGROUND }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        <Text style={styles.emoji}>💊</Text>
        <Text style={styles.appName}>MedMate</Text>
        <Text style={styles.welcome}>Create your account! ✨</Text>
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
              textContentType="newPassword"
            />
          </View>
          <View style={styles.inputRow}>
            <Text style={styles.inputEmoji}>🔒</Text>
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              textContentType="newPassword"
            />
          </View>
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={styles.buttonText}>{loading ? 'Registering...' : '✍️ Register'}</Text>
          </TouchableOpacity>
          <Text style={styles.tip}>🌈 Join the MedMate family!</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.switchText}>Already have an account? <Text style={{ color: colors.PRIMARY }}>🚀 Login!</Text></Text>
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

export default Register; 