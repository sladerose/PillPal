import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';
import { supabase } from '../lib/supabase';
import { useUser } from '../context/UserContext';
import type { RootStackParamList } from '../App';
import { getColors } from '../lib/colors';

interface Medication {
  id: string;
  name: string;
  usage: string;
  dosage: string;
  ingredients: string[];
  safe_for_pregnant: boolean;
  safe_for_children: boolean;
  barcode?: string;
  explanation: string;
}

// Search screen allows users to search for medications by name, view results, and navigate to medication details.
const Search = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { session } = useUser();
  const [searchQuery, setSearchQuery] = useState('');
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const colors = getColors();
  const styles = getStyles(colors);

  // useEffect: Redirect to Login if not authenticated
  React.useEffect(() => {
    if (!session) {
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    }
  }, [session]);

  // searchMedications: Query Supabase for medications matching the search query
  const searchMedications = async () => {
    if (!searchQuery.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Search Error',
        text2: 'Please enter a search term',
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('medications')
        .select('*')
        .ilike('name', `%${searchQuery.trim()}%`)
        .limit(20);

      if (error) {
        console.error('Error searching medications:', error);
        Toast.show({
          type: 'error',
          text1: 'Search Error',
          text2: 'Failed to search medications',
        });
      } else {
        setMedications(data || []);
        setSearched(true);
        
        // Show toast for no results
        if (data && data.length === 0) {
          Toast.show({
            type: 'info',
            text1: 'No Results',
            text2: `No medications found for "${searchQuery.trim()}"`,
          });
        }
      }
    } catch (error) {
      console.error('Error searching medications:', error);
      Toast.show({
        type: 'error',
        text1: 'Search Error',
        text2: 'Failed to search medications',
      });
    } finally {
      setLoading(false);
    }
  };

  // handleMedicationPress: Navigate to Result screen for selected medication
  const handleMedicationPress = (medication: Medication) => {
    navigation.navigate('Result', { medication });
  };

  // renderMedicationCard: Render a medication result card with usage, dosage, and safety badges
  const renderMedicationCard = ({ item }: { item: Medication }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handleMedicationPress(item)}
    >
      <Text style={styles.medicationName}>{item.name}</Text>
      {item.usage && (
        <Text style={styles.medicationUsage}>
          <Text style={styles.label}>Usage: </Text>
          {item.usage}
        </Text>
      )}
      {item.dosage && (
        <Text style={styles.medicationDosage}>
          <Text style={styles.label}>Dosage: </Text>
          {item.dosage}
        </Text>
      )}
      <View style={styles.safetyInfo}>
        <View style={[styles.safetyBadge, item.safe_for_pregnant ? styles.safeBadge : styles.unsafeBadge]}>
          <Text style={styles.safetyText}>
            {item.safe_for_pregnant ? '✓' : '✗'} Pregnancy
          </Text>
        </View>
        <View style={[styles.safetyBadge, item.safe_for_children ? styles.safeBadge : styles.unsafeBadge]}>
          <Text style={styles.safetyText}>
            {item.safe_for_children ? '✓' : '✗'} Children
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  // renderEmptyState: Show empty state message if no search or no results
  const renderEmptyState = () => {
    if (!searched) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            Enter a medication name to search
          </Text>
        </View>
      );
    }
    
    if (medications.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            No medications found for "{searchQuery}"
          </Text>
        </View>
      );
    }
    
    return null;
  };

  // UI rendering: Show search input, button, and medication results list
  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search medications..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={searchMedications}
          returnKeyType="search"
        />
        <TouchableOpacity
          style={[styles.searchButton, loading && styles.searchButtonDisabled]}
          onPress={searchMedications}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.searchButtonText}>Search</Text>
          )}
        </TouchableOpacity>
      </View>

      <FlatList
        data={medications}
        renderItem={renderMedicationCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

function getStyles(colors: any) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.BACKGROUND,
    },
    searchContainer: {
      flexDirection: 'row',
      padding: 16,
      backgroundColor: colors.SURFACE,
      borderBottomWidth: 1,
      borderBottomColor: colors.BORDER,
    },
    searchInput: {
      flex: 1,
      height: 44,
      borderWidth: 1,
      borderColor: colors.OUTLINE,
      borderRadius: 8,
      paddingHorizontal: 12,
      fontSize: 16,
      marginRight: 8,
      color: colors.TEXT,
      backgroundColor: colors.SURFACE,
    },
    searchButton: {
      backgroundColor: colors.PRIMARY,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
    },
    searchButtonDisabled: {
      opacity: 0.6,
    },
    searchButtonText: {
      color: colors.TEXT_ON_PRIMARY,
      fontWeight: '600',
    },
    listContainer: {
      padding: 16,
    },
    card: {
      backgroundColor: colors.SURFACE,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.BORDER,
      shadowColor: colors.BORDER,
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.04,
      shadowRadius: 3,
      elevation: 1,
    },
    medicationName: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.PRIMARY,
      marginBottom: 8,
    },
    medicationUsage: {
      fontSize: 14,
      color: colors.TEXT,
      marginBottom: 4,
    },
    medicationDosage: {
      fontSize: 14,
      color: colors.TEXT,
      marginBottom: 8,
    },
    label: {
      fontWeight: '600',
      color: colors.PRIMARY,
    },
    safetyInfo: {
      flexDirection: 'row',
      gap: 8,
    },
    safetyBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    safeBadge: {
      backgroundColor: colors.SECONDARY,
    },
    unsafeBadge: {
      backgroundColor: colors.SECONDARY,
    },
    safetyText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.PRIMARY,
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 40,
    },
    emptyStateText: {
      fontSize: 16,
      color: colors.TEXT,
      textAlign: 'center',
    },
  });
}

export default Search; 