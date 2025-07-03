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
import { COLORS } from '../lib/colors';

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
          text2: 'Failed to save profile',
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
          text1: 'Success',
          text2: 'Profile saved successfully',
        });
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to save profile',
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
      <Text style={styles.title}>Profile</Text>
      
      <View style={styles.section}>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          value={fullName}
          onChangeText={setFullName}
          placeholder="Enter your full name"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Allergies</Text>
        <View style={styles.allergyInputContainer}>
          <TextInput
            style={styles.allergyInput}
            value={newAllergy}
            onChangeText={setNewAllergy}
            placeholder="Add an allergy"
            onSubmitEditing={addAllergy}
          />
          <TouchableOpacity style={styles.addButton} onPress={addAllergy}>
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.allergiesContainer}>
          {allergies.map((allergy, index) => (
            <TouchableOpacity
              key={index}
              style={styles.allergyPill}
              onPress={() => removeAllergy(index)}
            >
              <Text style={styles.allergyText}>{allergy}</Text>
              <Text style={styles.removeText}>×</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Intolerances</Text>
        <View style={styles.allergyInputContainer}>
          <TextInput
            style={styles.allergyInput}
            value={newIntolerance}
            onChangeText={setNewIntolerance}
            placeholder="Add an intolerance"
            onSubmitEditing={addIntolerance}
          />
          <TouchableOpacity style={styles.addButton} onPress={addIntolerance}>
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.allergiesContainer}>
          {intolerances.map((intolerance, index) => (
            <TouchableOpacity
              key={index}
              style={styles.allergyPill}
              onPress={() => removeIntolerance(index)}
            >
              <Text style={styles.allergyText}>{intolerance}</Text>
              <Text style={styles.removeText}>×</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Age</Text>
        <TextInput
          style={styles.input}
          value={age !== undefined ? String(age) : ''}
          onChangeText={text => setAge(text ? parseInt(text, 10) : undefined)}
          placeholder="Enter your age"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Pregnant</Text>
        <Switch
          value={!!isPregnant}
          onValueChange={setIsPregnant}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Medical Conditions</Text>
        <View style={styles.allergyInputContainer}>
          <TextInput
            style={styles.allergyInput}
            value={newCondition}
            onChangeText={setNewCondition}
            placeholder="Add a condition"
            onSubmitEditing={addCondition}
          />
          <TouchableOpacity style={styles.addButton} onPress={addCondition}>
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.allergiesContainer}>
          {medicalConditions.map((condition, index) => (
            <TouchableOpacity
              key={index}
              style={styles.allergyPill}
              onPress={() => removeCondition(index)}
            >
              <Text style={styles.allergyText}>{condition}</Text>
              <Text style={styles.removeText}>×</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity
        style={[styles.saveButton, saving && styles.saveButtonDisabled]}
        onPress={saveProfile}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveButtonText}>Save Profile</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: COLORS.BACKGROUND,
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
    color: COLORS.PRIMARY,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: COLORS.PRIMARY,
  },
  email: {
    fontSize: 16,
    color: COLORS.TEXT,
    padding: 12,
    backgroundColor: COLORS.SURFACE,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  input: {
    fontSize: 16,
    padding: 12,
    backgroundColor: COLORS.SURFACE,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  allergyInputContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  allergyInput: {
    flex: 1,
    fontSize: 16,
    padding: 12,
    backgroundColor: COLORS.SURFACE,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    marginRight: 8,
  },
  addButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },
  addButtonText: {
    color: COLORS.TEXT_ON_PRIMARY,
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
    backgroundColor: COLORS.SECONDARY,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  allergyText: {
    color: COLORS.PRIMARY,
    fontSize: 14,
    marginRight: 4,
  },
  removeText: {
    color: COLORS.PRIMARY,
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: COLORS.PRIMARY,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: COLORS.TEXT_ON_PRIMARY,
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: COLORS.SECONDARY,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: COLORS.TEXT_ON_SECONDARY,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProfileScreen; 