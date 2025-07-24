import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';
import { useAuth } from './hooks/useAuth';
import { getTheme } from '../../lib/colors';
import { useUser } from '../../features/profile/context/UserContext';
import type { RootStackParamList } from '../../../App';
import Button from '../../components/Button';

// Login screen allows users to sign in with email and password, and handles navigation and error display.
const Login = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { session } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { loading, handleLogin } = useAuth();
  const { colors, spacing, typography } = getTheme();
  const styles = getStyles(colors, spacing, typography);

  // useEffect: Redirect to Profile if already authenticated
  React.useEffect(() => {
    if (session) {
      // If already authenticated, redirect to Profile
      navigation.reset({ index: 0, routes: [{ name: 'ViewProfile' }] });
    }
  }, [session]);

  // handleForgotPassword: Navigate to a (future) password reset screen or show a toast
  const handleForgotPassword = () => {
    Toast.show({
      type: 'info',
      text1: 'Password Reset',
      text2: 'Password reset is coming soon. Please contact support if needed.'
    });
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
              textContentType="password"
              accessible
              accessibilityLabel="Password"
              allowFontScaling
              returnKeyType="done"
            />
          </View>
          <Button
            onPress={() => handleLogin(email, password)}
            loading={loading}
            disabled={loading || !email.trim() || !password}
            accessibilityLabel="Login"
            style={{ marginTop: spacing.SM, marginBottom: spacing.SM }}
          >
            🚀 Login
          </Button>
          <Button
            onPress={handleForgotPassword}
            variant="secondary"
            accessibilityLabel="Forgot password?"
            style={{ alignSelf: 'flex-end', marginTop: spacing.XS, marginBottom: spacing.SM }}
            textStyle={{ textDecorationLine: 'underline', fontSize: typography.FONT_SIZE_SM }}
          >
            Forgot password?
          </Button>
          <Text style={[styles.tip, { color: colors.TEXT }]}>🔐 Your info is safe with us!</Text>
        </View>
        <Button
          onPress={() => navigation.navigate('Register')}
          variant="secondary"
          accessibilityLabel="Go to registration"
          style={{ marginTop: spacing.SM }}
          textStyle={{ fontSize: typography.FONT_SIZE_MD }}
        >
          New here? <Text style={{ color: colors.PRIMARY }}>✨ Register!</Text>
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
    tip: {
      color: colors.SECONDARY,
      fontSize: typography.FONT_SIZE_SM,
      textAlign: 'center',
      marginTop: spacing.SM,
      fontFamily: typography.FONT_FAMILY,
    },
  });
}

export default Login; 