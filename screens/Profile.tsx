import React from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity, Alert, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { signOut } from '../lib/supabase';
import { useUser } from '../context/UserContext';
import type { RootStackParamList } from '../App';
import { getColors } from '../lib/colors';

// Profile screen shows a summary of the user's info and navigation to other app sections.
const Profile = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { session, user, profile } = useUser();
  const colors = getColors();
  const styles = getStyles(colors);

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
          source={require('../assets/icon.png')}
          style={styles.avatar}
          resizeMode="cover"
        />
      </View>

      <View style={styles.userInfo}>
        <Text style={styles.email} allowFontScaling>Email: {user?.email}</Text>
        <Text style={styles.name} allowFontScaling>Name: {profile?.full_name || 'Not set'}</Text>
      </View>

      <View style={styles.navigationButtons}>
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => navigation.navigate('Search')}
          accessible accessibilityRole="button" accessibilityLabel="Search Medications"
        >
          <Text style={styles.navButtonText} allowFontScaling>🔍 Search Medications</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => navigation.navigate('Scanner')}
          accessible accessibilityRole="button" accessibilityLabel="Scan Barcode"
        >
          <Text style={styles.navButtonText} allowFontScaling>📷 Scan Barcode</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => navigation.navigate('ProfileScreen')}
          accessible accessibilityRole="button" accessibilityLabel="Edit Profile"
        >
          <Text style={styles.navButtonText} allowFontScaling>👤 Edit Profile</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={styles.logoutButton}
        onPress={handleLogout}
        accessibilityRole="button"
        accessibilityLabel="Logout"
      >
        <Text style={styles.logoutButtonText} allowFontScaling>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

function getStyles(colors: any) {
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
      backgroundColor: colors.BACKGROUND,
    },
    title: { 
      fontSize: 32, 
      fontWeight: 'bold',
      marginBottom: 8,
      color: colors.PRIMARY,
    },
    subtitle: {
      fontSize: 18,
      color: colors.PRIMARY,
      marginBottom: 30
    },
    userInfo: {
      backgroundColor: colors.SURFACE,
      padding: 20,
      borderRadius: 12,
      marginBottom: 30,
      width: '100%',
      shadowColor: colors.BORDER,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 6,
      elevation: 3
    },
    email: {
      fontSize: 16,
      marginBottom: 8,
      color: colors.TEXT,
    },
    name: {
      fontSize: 16,
      color: colors.TEXT,
    },
    navigationButtons: {
      width: '100%',
      marginBottom: 30
    },
    navButton: {
      backgroundColor: colors.PRIMARY,
      padding: 16,
      borderRadius: 12,
      marginBottom: 12,
      alignItems: 'center',
      shadowColor: colors.BORDER,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 6,
      elevation: 3
    },
    navButtonText: {
      color: colors.TEXT_ON_PRIMARY,
      fontSize: 18,
      fontWeight: '600'
    },
    logoutButton: {
      backgroundColor: colors.SECONDARY,
      padding: 16,
      borderRadius: 12,
      width: '100%',
      alignItems: 'center'
    },
    logoutButtonText: {
      color: colors.TEXT_ON_SECONDARY,
      fontSize: 18,
      fontWeight: '600'
    },
    avatarContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.SURFACE,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
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