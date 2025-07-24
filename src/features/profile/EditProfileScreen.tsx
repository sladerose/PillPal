import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';
import { supabase } from '../../lib/supabase';
import { useUser } from '../../features/profile/context/UserContext';
import type { RootStackParamList } from '../../../App';
import { getTheme } from '../../lib/colors';
import Button from '../../components/Button';

// ProfileScreen allows users to view and edit their profile, including allergies, intolerances, age, pregnancy, and medical conditions.
const ProfileScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { session, user, profile, setProfile } = useUser();
  const [fullName, setFullName] = useState('');
  const [newAllergy, setNewAllergy] = useState('');
  const [allergies, setAllergies] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [intolerances, setIntolerances] = useState<string[]>([]);
  const [newIntolerance, setNewIntolerance] = useState('');
  const [age, setAge] = useState<number | undefined>(undefined);
  const [isPregnant, setIsPregnant] = useState<boolean | undefined>(undefined);
  const [medicalConditions, setMedicalConditions] = useState<string[]>([]);
  const [newCondition, setNewCondition] = useState('');
  const { colors, spacing, typography } = getTheme();
  const styles = getStyles(colors, spacing, typography);

  // useEffect: Redirect to Login if not authenticated, otherwise fetch profile from Supabase
  useEffect(() => {
    if (!session) {
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
      return;
    }
    fetchProfile();
  }, [session]);

  // useEffect: Populate local state from profile context when profile changes
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setAllergies(profile.allergies || []);
      setIntolerances(profile.intolerances || []);
      setAge(profile.age);
      setIsPregnant(profile.is_pregnant);
      setMedicalConditions(profile.medical_conditions || []);
    }
  }, [profile]);

  const fetchProfile = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('Error fetching profile:', error);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to load profile',
        });
      } else if (data) {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load profile',
      });
    } finally {
      setLoading(false);
    }
  };

  // saveProfile: Save the user's profile to Supabase and update context
  const saveProfile = async () => {
    if (!user?.id) return;
    if (!fullName.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Missing Name',
        text2: 'Please enter your full name.'
      });
      return;
    }
    if (age !== undefined && (isNaN(age) || age < 0 || age > 120)) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Age',
        text2: 'Please enter a valid age.'
      });
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: fullName,
          allergies: allergies,
          intolerances: intolerances,
          age: age,
          is_pregnant: isPregnant,
          medical_conditions: medicalConditions,
        });

      if (error) {
        console.error('Error saving profile:', error);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to save profile'
        });
      } else {
        // Update the profile in context
        setProfile({
          id: user.id,
          full_name: fullName,
          allergies,
          intolerances,
          age,
          is_pregnant: isPregnant,
          medical_conditions: medicalConditions,
        });
        Toast.show({
          type: 'success',
          text1: 'Profile Saved',
          text2: 'Your profile was saved successfully.'
        });
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to save profile'
      });
    } finally {
      setSaving(false);
    }
  };

  // addAllergy: Add a new allergy to the list if not already present
  const addAllergy = () => {
    if (newAllergy.trim() && !allergies.includes(newAllergy.trim())) {
      setAllergies([...allergies, newAllergy.trim()]);
      setNewAllergy('');
    }
  };

  // removeAllergy: Remove an allergy by index
  const removeAllergy = (index: number) => {
    setAllergies(allergies.filter((_, i) => i !== index));
  };

  // addIntolerance: Add a new intolerance to the list if not already present
  const addIntolerance = () => {
    if (newIntolerance.trim() && !intolerances.includes(newIntolerance.trim())) {
      setIntolerances([...intolerances, newIntolerance.trim()]);
      setNewIntolerance('');
    }
  };

  // removeIntolerance: Remove an intolerance by index
  const removeIntolerance = (index: number) => {
    setIntolerances(intolerances.filter((_, i) => i !== index));
  };

  // addCondition: Add a new medical condition to the list if not already present
  const addCondition = () => {
    if (newCondition.trim() && !medicalConditions.includes(newCondition.trim())) {
      setMedicalConditions([...medicalConditions, newCondition.trim()]);
      setNewCondition('');
    }
  };

  // removeCondition: Remove a medical condition by index
  const removeCondition = (index: number) => {
    setMedicalConditions(medicalConditions.filter((_, i) => i !== index));
  };

  // handleLogout: Sign out the user
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title} allowFontScaling>Profile</Text>
      
      <View style={styles.section}>
        <Text style={styles.label} allowFontScaling>Email</Text>
        <Text style={styles.email} allowFontScaling>{user?.email}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label} allowFontScaling>Full Name</Text>
        <TextInput
          style={styles.input}
          value={fullName}
          onChangeText={setFullName}
          placeholder="Enter your full name"
          accessible
          accessibilityLabel="Full name"
          allowFontScaling
          returnKeyType="next"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label} allowFontScaling>Allergies</Text>
        <View style={styles.allergyInputContainer}>
          <TextInput
            style={styles.allergyInput}
            value={newAllergy}
            onChangeText={setNewAllergy}
            placeholder="Add an allergy"
            onSubmitEditing={addAllergy}
            accessible
            accessibilityLabel="Add allergy"
            allowFontScaling
            returnKeyType="done"
          />
          <Button
            onPress={addAllergy}
            accessibilityLabel="Add allergy"
            style={{ marginLeft: spacing.SM }}
            textStyle={{ fontSize: typography.FONT_SIZE_SM }}
          >
            Add
          </Button>
        </View>
        
        <View style={styles.allergiesContainer}>
          {allergies.map((allergy, index) => (
            <TouchableOpacity
              key={index}
              style={styles.allergyPill}
              onPress={() => removeAllergy(index)}
              accessible accessibilityRole="button" accessibilityLabel={`Remove allergy ${allergy}`}
            >
              <Text style={styles.allergyText} allowFontScaling>{allergy}</Text>
              <Text style={styles.removeText} allowFontScaling>×</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label} allowFontScaling>Intolerances</Text>
        <View style={styles.allergyInputContainer}>
          <TextInput
            style={styles.allergyInput}
            value={newIntolerance}
            onChangeText={setNewIntolerance}
            placeholder="Add an intolerance"
            onSubmitEditing={addIntolerance}
            accessible
            accessibilityLabel="Add intolerance"
            allowFontScaling
            returnKeyType="done"
          />
          <Button
            onPress={addIntolerance}
            accessibilityLabel="Add intolerance"
            style={{ marginLeft: spacing.SM }}
            textStyle={{ fontSize: typography.FONT_SIZE_SM }}
          >
            Add
          </Button>
        </View>
        <View style={styles.allergiesContainer}>
          {intolerances.map((intolerance, index) => (
            <TouchableOpacity
              key={index}
              style={styles.allergyPill}
              onPress={() => removeIntolerance(index)}
              accessible accessibilityRole="button" accessibilityLabel={`Remove intolerance ${intolerance}`}
            >
              <Text style={styles.allergyText} allowFontScaling>{intolerance}</Text>
              <Text style={styles.removeText} allowFontScaling>×</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label} allowFontScaling>Age</Text>
        <TextInput
          style={styles.input}
          value={age !== undefined ? String(age) : ''}
          onChangeText={text => setAge(text ? parseInt(text, 10) : undefined)}
          placeholder="Enter your age"
          keyboardType="numeric"
          accessible
          accessibilityLabel="Age"
          allowFontScaling
          returnKeyType="done"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label} allowFontScaling>Pregnant</Text>
        <Switch
          value={!!isPregnant}
          onValueChange={setIsPregnant}
          accessibilityRole="switch"
          accessibilityLabel="Pregnant"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label} allowFontScaling>Medical Conditions</Text>
        <View style={styles.allergyInputContainer}>
          <TextInput
            style={styles.allergyInput}
            value={newCondition}
            onChangeText={setNewCondition}
            placeholder="Add a condition"
            onSubmitEditing={addCondition}
            accessible
            accessibilityLabel="Add medical condition"
            allowFontScaling
            returnKeyType="done"
          />
          <Button
            onPress={addCondition}
            accessibilityLabel="Add medical condition"
            style={{ marginLeft: spacing.SM }}
            textStyle={{ fontSize: typography.FONT_SIZE_SM }}
          >
            Add
          </Button>
        </View>
        <View style={styles.allergiesContainer}>
          {medicalConditions.map((condition, index) => (
            <TouchableOpacity
              key={index}
              style={styles.allergyPill}
              onPress={() => removeCondition(index)}
              accessible accessibilityRole="button" accessibilityLabel={`Remove condition ${condition}`}
            >
              <Text style={styles.allergyText} allowFontScaling>{condition}</Text>
              <Text style={styles.removeText} allowFontScaling>×</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <Button
        onPress={saveProfile}
        loading={saving}
        disabled={saving}
        accessibilityLabel="Save Profile"
        style={{ marginBottom: spacing.MD }}
      >
        Save Profile
      </Button>

      <Button
        onPress={handleLogout}
        variant="secondary"
        accessibilityLabel="Logout"
        style={{ width: '100%' }}
      >
        Logout
      </Button>
    </ScrollView>
  );
};

function getStyles(colors: any, spacing: any, typography: any) {
  return StyleSheet.create({
    container: {
      flex: 1,
      padding: spacing.MD,
      backgroundColor: colors.BACKGROUND,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    title: {
      fontSize: typography.FONT_SIZE_XL,
      fontWeight: typography.FONT_WEIGHT_BOLD,
      marginBottom: spacing.XL,
      textAlign: 'center',
      color: colors.PRIMARY,
      fontFamily: typography.FONT_FAMILY,
    },
    section: {
      marginBottom: spacing.XL,
    },
    label: {
      fontSize: typography.FONT_SIZE_MD,
      fontWeight: '600',
      marginBottom: spacing.SM,
      color: colors.PRIMARY,
      fontFamily: typography.FONT_FAMILY,
    },
    email: {
      fontSize: typography.FONT_SIZE_MD,
      color: colors.TEXT,
      padding: spacing.SM,
      backgroundColor: colors.SURFACE,
      borderRadius: spacing.MD,
      borderWidth: 1,
      borderColor: colors.BORDER,
      fontFamily: typography.FONT_FAMILY,
    },
    input: {
      fontSize: typography.FONT_SIZE_MD,
      padding: spacing.SM,
      backgroundColor: colors.SURFACE,
      borderRadius: spacing.MD,
      borderWidth: 1,
      borderColor: colors.BORDER,
      fontFamily: typography.FONT_FAMILY,
    },
    allergyInputContainer: {
      flexDirection: 'row',
      marginBottom: spacing.SM,
    },
    allergyInput: {
      flex: 1,
      fontSize: typography.FONT_SIZE_MD,
      padding: spacing.SM,
      backgroundColor: colors.SURFACE,
      borderRadius: spacing.MD,
      borderWidth: 1,
      borderColor: colors.BORDER,
      marginRight: spacing.SM,
      fontFamily: typography.FONT_FAMILY,
    },
    addButton: {
      backgroundColor: colors.PRIMARY,
      paddingHorizontal: spacing.MD,
      paddingVertical: spacing.SM,
      borderRadius: spacing.MD,
      justifyContent: 'center',
    },
    addButtonText: {
      color: colors.TEXT_ON_PRIMARY,
      fontWeight: '600',
      fontFamily: typography.FONT_FAMILY,
    },
    allergiesContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.SM,
    },
    allergyPill: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.SECONDARY,
      paddingHorizontal: spacing.MD,
      paddingVertical: spacing.XS,
      borderRadius: spacing.XL,
    },
    allergyText: {
      color: colors.TEXT_ON_SECONDARY,
      fontSize: typography.FONT_SIZE_SM,
      marginRight: spacing.XS,
      fontFamily: typography.FONT_FAMILY,
    },
    removeText: {
      color: colors.TEXT_ON_SECONDARY,
      fontSize: typography.FONT_SIZE_MD,
      fontWeight: 'bold',
      fontFamily: typography.FONT_FAMILY,
    },
    saveButton: {
      backgroundColor: colors.PRIMARY,
      padding: spacing.MD,
      borderRadius: spacing.MD,
      alignItems: 'center',
      marginBottom: spacing.MD,
    },
    saveButtonDisabled: {
      opacity: 0.6,
    },
    saveButtonText: {
      color: colors.TEXT_ON_PRIMARY,
      fontSize: typography.FONT_SIZE_MD,
      fontWeight: '600',
      fontFamily: typography.FONT_FAMILY,
    },
    logoutButton: {
      backgroundColor: colors.SECONDARY,
      padding: spacing.MD,
      borderRadius: spacing.MD,
      alignItems: 'center',
    },
    logoutButtonText: {
      color: colors.TEXT_ON_SECONDARY,
      fontSize: typography.FONT_SIZE_MD,
      fontWeight: '600',
      fontFamily: typography.FONT_FAMILY,
    },
  });
}

export default ProfileScreen; 