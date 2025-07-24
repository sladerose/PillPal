import React from 'react';
import { View, Text, StyleSheet, Alert, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { signOut } from '../../lib/supabase';
import { useUser } from '../../features/profile/context/UserContext';
import type { RootStackParamList } from '../../../App';
import { getTheme } from '../../lib/colors';
import Button from '../../components/Button';

// Profile screen shows a summary of the user's info and navigation to other app sections.
const Profile = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { session, user, profile } = useUser();
  const { colors, spacing, typography } = getTheme();
  const styles = getStyles(colors, spacing, typography);

  // useEffect: Redirect to Login if not authenticated
  React.useEffect(() => {
    if (!session) {
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    }
  }, [session]);

  // handleLogout: Show confirmation dialog before signing out
  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: async () => await signOut() },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title} allowFontScaling>MedMate</Text>
      <Text style={styles.subtitle} allowFontScaling>Welcome back!</Text>
      {/* Optional: Show a profile avatar (placeholder if not set) */}
      <View style={styles.avatarContainer} accessible accessibilityLabel="Profile avatar">
        <Image
          source={require('../../../assets/icon.png')}
          style={styles.avatar}
          resizeMode="cover"
        />
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.email} allowFontScaling>Email: {user?.email}</Text>
        <Text style={styles.name} allowFontScaling>Name: {profile?.full_name || 'Not set'}</Text>
      </View>
      <View style={styles.navigationButtons}>
        <Button
          onPress={() => navigation.navigate('Search')}
          style={{ marginBottom: spacing.SM }}
          accessibilityLabel="Search Medications"
        >
          🔍 Search Medications
        </Button>
        <Button
          onPress={() => navigation.navigate('Scanner')}
          style={{ marginBottom: spacing.SM }}
          accessibilityLabel="Scan Barcode"
        >
          📷 Scan Barcode
        </Button>
        <Button
          onPress={() => navigation.navigate('EditProfile')}
          style={{ marginBottom: spacing.SM }}
          accessibilityLabel="Edit Profile"
        >
          👤 Edit Profile
        </Button>
      </View>
      <Button
        onPress={handleLogout}
        variant="secondary"
        accessibilityLabel="Logout"
        style={{ width: '100%' }}
      >
        Logout
      </Button>
    </View>
  );
};

function getStyles(colors: any, spacing: any, typography: any) {
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.LG,
      backgroundColor: colors.BACKGROUND,
    },
    title: { 
      fontSize: typography.FONT_SIZE_XL, 
      fontWeight: typography.FONT_WEIGHT_BOLD,
      marginBottom: spacing.SM,
      color: colors.PRIMARY,
      fontFamily: typography.FONT_FAMILY,
    },
    subtitle: {
      fontSize: typography.FONT_SIZE_MD,
      color: colors.PRIMARY,
      marginBottom: spacing.XL,
      fontFamily: typography.FONT_FAMILY,
    },
    userInfo: {
      backgroundColor: colors.SURFACE,
      padding: spacing.LG,
      borderRadius: spacing.MD,
      marginBottom: spacing.XL,
      width: '100%',
      shadowColor: colors.BORDER,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 6,
      elevation: 3
    },
    email: {
      fontSize: typography.FONT_SIZE_MD,
      marginBottom: spacing.SM,
      color: colors.TEXT,
      fontFamily: typography.FONT_FAMILY,
    },
    name: {
      fontSize: typography.FONT_SIZE_MD,
      color: colors.TEXT,
      fontFamily: typography.FONT_FAMILY,
    },
    navigationButtons: {
      width: '100%',
      marginBottom: spacing.XL
    },
    navButton: {
      backgroundColor: colors.PRIMARY,
      padding: spacing.LG,
      borderRadius: spacing.MD,
      marginBottom: spacing.SM,
      alignItems: 'center',
      shadowColor: colors.BORDER,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 6,
      elevation: 3
    },
    navButtonText: {
      color: colors.TEXT_ON_PRIMARY,
      fontSize: typography.FONT_SIZE_LG,
      fontWeight: '600',
      fontFamily: typography.FONT_FAMILY,
    },
    logoutButton: {
      backgroundColor: colors.SECONDARY,
      padding: spacing.LG,
      borderRadius: spacing.MD,
      width: '100%',
      alignItems: 'center'
    },
    logoutButtonText: {
      color: colors.TEXT_ON_SECONDARY,
      fontSize: typography.FONT_SIZE_LG,
      fontWeight: '600',
      fontFamily: typography.FONT_FAMILY,
    },
    avatarContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.SURFACE,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.MD,
      borderWidth: 2,
      borderColor: colors.BORDER,
      shadowColor: colors.BORDER,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 6,
      elevation: 2,
    },
    avatar: {
      width: 72,
      height: 72,
      borderRadius: 36,
    },
  });
}

export default Profile; 