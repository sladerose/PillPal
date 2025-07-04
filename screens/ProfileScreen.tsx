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
import { supabase } from '../lib/supabase';
import { useUser } from '../context/UserContext';
import type { RootStackParamList } from '../App';
import { getColors } from '../lib/colors';

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
  const colors = getColors();
  const styles = getStyles(colors);

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
          <TouchableOpacity style={styles.addButton} onPress={addAllergy} accessibilityRole="button" accessibilityLabel="Add allergy">
            <Text style={styles.addButtonText} allowFontScaling>Add</Text>
          </TouchableOpacity>
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
          <TouchableOpacity style={styles.addButton} onPress={addIntolerance} accessibilityRole="button" accessibilityLabel="Add intolerance">
            <Text style={styles.addButtonText} allowFontScaling>Add</Text>
          </TouchableOpacity>
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
          <TouchableOpacity style={styles.addButton} onPress={addCondition} accessibilityRole="button" accessibilityLabel="Add medical condition">
            <Text style={styles.addButtonText} allowFontScaling>Add</Text>
          </TouchableOpacity>
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

      <TouchableOpacity
        style={[styles.saveButton, saving && styles.saveButtonDisabled]}
        onPress={saveProfile}
        disabled={saving}
        accessibilityRole="button"
        accessibilityLabel="Save Profile"
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveButtonText} allowFontScaling>Save Profile</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} accessibilityRole="button" accessibilityLabel="Logout">
        <Text style={styles.logoutButtonText} allowFontScaling>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

function getStyles(colors: any) {
  return StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: colors.BACKGROUND,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
    color: colors.PRIMARY,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: colors.PRIMARY,
  },
  email: {
    fontSize: 16,
    color: colors.TEXT,
    padding: 12,
    backgroundColor: colors.SURFACE,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.BORDER,
  },
  input: {
    fontSize: 16,
    padding: 12,
    backgroundColor: colors.SURFACE,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.BORDER,
  },
  allergyInputContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  allergyInput: {
    flex: 1,
    fontSize: 16,
    padding: 12,
    backgroundColor: colors.SURFACE,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.BORDER,
    marginRight: 8,
  },
  addButton: {
    backgroundColor: colors.PRIMARY,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },
  addButtonText: {
    color: colors.TEXT_ON_PRIMARY,
    fontWeight: '600',
  },
  allergiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  allergyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.SECONDARY,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  allergyText: {
    color: colors.PRIMARY,
    fontSize: 14,
    marginRight: 4,
  },
  removeText: {
    color: colors.PRIMARY,
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: colors.PRIMARY,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: colors.TEXT_ON_PRIMARY,
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: colors.SECONDARY,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: colors.TEXT_ON_SECONDARY,
    fontSize: 16,
    fontWeight: '600',
  },
});
}

export default ProfileScreen; 