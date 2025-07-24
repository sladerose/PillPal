import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';
import { useAuth } from './hooks/useAuth';
import { getTheme } from '../../lib/colors';
import type { RootStackParamList } from '../../../App';
import Button from '../../components/Button';

// Register screen allows users to create a new account with email and password, handling validation, registration, and navigation.
const Register = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { loading, handleRegister } = useAuth();
  const { colors, spacing, typography } = getTheme();
  const styles = getStyles(colors, spacing, typography);

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
            <Text style={styles.inputEmoji} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">✉️</Text>
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              textContentType="emailAddress"
              accessible
              accessibilityLabel="Email address"
              allowFontScaling
              returnKeyType="next"
            />
          </View>
          <View style={styles.inputRow}>
            <Text style={styles.inputEmoji} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">🔒</Text>
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              textContentType="newPassword"
              accessible
              accessibilityLabel="Password"
              allowFontScaling
              returnKeyType="next"
            />
          </View>
          <View style={styles.inputRow}>
            <Text style={styles.inputEmoji} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">🔒</Text>
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              textContentType="newPassword"
              accessible
              accessibilityLabel="Confirm password"
              allowFontScaling
              returnKeyType="done"
            />
          </View>
          <Button
            onPress={() => handleRegister(email, password, confirmPassword)}
            loading={loading}
            disabled={loading || !email.trim() || !password || !confirmPassword || password !== confirmPassword}
            accessibilityLabel="Register"
            style={{ marginTop: spacing.SM, marginBottom: spacing.SM }}
          >
            ✍️ Register
          </Button>
          <Text style={[styles.tip, { color: colors.TEXT }]}>🌈 Join the MedMate family!</Text>
        </View>
        <Button
          onPress={() => navigation.navigate('Login')}
          variant="secondary"
          accessibilityLabel="Go to login"
          style={{ marginTop: spacing.SM }}
          textStyle={{ fontSize: typography.FONT_SIZE_MD }}
        >
          Already have an account? <Text style={{ color: colors.PRIMARY }}>🚀 Login!</Text>
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
};

function getStyles(colors: any, spacing: any, typography: any) {
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.LG,
      backgroundColor: 'transparent',
    },
    emoji: {
      fontSize: 56,
      marginBottom: spacing.XS,
    },
    appName: {
      fontSize: typography.FONT_SIZE_XL,
      fontWeight: typography.FONT_WEIGHT_BOLD,
      color: colors.PRIMARY,
      marginBottom: spacing.XS,
      fontFamily: typography.FONT_FAMILY,
    },
    welcome: {
      fontSize: typography.FONT_SIZE_MD,
      color: colors.PRIMARY,
      marginBottom: spacing.XL,
      fontFamily: typography.FONT_FAMILY,
    },
    card: {
      backgroundColor: colors.SURFACE,
      borderRadius: spacing.XL,
      padding: spacing.LG,
      width: '100%',
      maxWidth: 400,
      marginBottom: spacing.XL,
      shadowColor: colors.BORDER,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 6,
      elevation: 2,
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.MD,
      backgroundColor: colors.SURFACE,
      borderRadius: spacing.MD,
      borderWidth: 1,
      borderColor: colors.BORDER,
      paddingHorizontal: spacing.SM,
    },
    inputEmoji: {
      fontSize: 22,
      marginRight: spacing.XS,
    },
    input: {
      flex: 1,
      fontSize: typography.FONT_SIZE_MD,
      paddingVertical: spacing.SM,
      color: colors.TEXT,
      backgroundColor: 'transparent',
      fontFamily: typography.FONT_FAMILY,
    },
    button: {
      backgroundColor: colors.PRIMARY,
      paddingVertical: spacing.MD,
      borderRadius: spacing.LG,
      alignItems: 'center',
      marginTop: spacing.SM,
      marginBottom: spacing.SM,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    buttonText: {
      color: colors.TEXT_ON_PRIMARY,
      fontSize: typography.FONT_SIZE_LG,
      fontWeight: typography.FONT_WEIGHT_BOLD,
      fontFamily: typography.FONT_FAMILY,
    },
    tip: {
      color: colors.SECONDARY,
      fontSize: typography.FONT_SIZE_SM,
      textAlign: 'center',
      marginTop: spacing.SM,
      fontFamily: typography.FONT_FAMILY,
    },
    switchText: {
      fontSize: typography.FONT_SIZE_MD,
      color: colors.PRIMARY,
      marginTop: spacing.MD,
      fontFamily: typography.FONT_FAMILY,
    },
  });
}

export default Register; 