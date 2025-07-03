import React from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity } from 'react-native';
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

  // handleLogout: Sign out the user
  const handleLogout = async () => {
    await signOut();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>MedMate</Text>
      <Text style={styles.subtitle}>Welcome back!</Text>
      
      <View style={styles.userInfo}>
        <Text style={styles.email}>Email: {user?.email}</Text>
        <Text style={styles.name}>Name: {profile?.full_name || 'Not set'}</Text>
      </View>

      <View style={styles.navigationButtons}>
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => navigation.navigate('Search')}
        >
          <Text style={styles.navButtonText}>🔍 Search Medications</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => navigation.navigate('Scanner')}
        >
          <Text style={styles.navButtonText}>📷 Scan Barcode</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => navigation.navigate('ProfileScreen')}
        >
          <Text style={styles.navButtonText}>👤 Edit Profile</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Text style={styles.logoutButtonText}>Logout</Text>
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
    }
  });
}

export default Profile; 