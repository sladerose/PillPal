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
import { supabase } from '../../lib/supabase';
import { useUser } from '../../features/profile/context/UserContext';
import type { RootStackParamList } from '../../../App';
import { getTheme } from '../../lib/colors';

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
  const { colors, spacing, typography } = getTheme();
  const styles = getStyles(colors, spacing, typography);

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

  // clearSearch: Clear the search field and results
  const clearSearch = () => {
    setSearchQuery('');
    setMedications([]);
    setSearched(false);
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
      accessible accessibilityRole="button" accessibilityLabel={`View details for ${item.name}`}
    >
      <Text style={styles.medicationName} allowFontScaling>{item.name}</Text>
      {item.usage && (
        <Text style={styles.medicationUsage} allowFontScaling>
          <Text style={styles.label} allowFontScaling>Usage: </Text>
          {item.usage}
        </Text>
      )}
      {item.dosage && (
        <Text style={styles.medicationDosage} allowFontScaling>
          <Text style={styles.label} allowFontScaling>Dosage: </Text>
          {item.dosage}
        </Text>
      )}
      <View style={styles.safetyInfo}>
        <View style={[styles.safetyBadge, item.safe_for_pregnant ? styles.safeBadge : styles.unsafeBadge]}>
          <Text style={styles.safetyText} allowFontScaling>
            {item.safe_for_pregnant ? '✓' : '✗'} Pregnancy
          </Text>
        </View>
        <View style={[styles.safetyBadge, item.safe_for_children ? styles.safeBadge : styles.unsafeBadge]}>
          <Text style={styles.safetyText} allowFontScaling>
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
          <Text style={styles.emptyStateText} allowFontScaling>
            Enter a medication name to search
          </Text>
        </View>
      );
    }
    
    if (medications.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText} allowFontScaling>
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
          accessible
          accessibilityLabel="Search medications"
          allowFontScaling
        />
        <TouchableOpacity
          style={[styles.searchButton, loading && styles.searchButtonDisabled]}
          onPress={searchMedications}
          disabled={loading}
          accessibilityRole="button"
          accessibilityLabel="Search"
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.searchButtonText} allowFontScaling>Search</Text>
          )}
        </TouchableOpacity>
        {searchQuery.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={clearSearch}
            accessible accessibilityRole="button" accessibilityLabel="Clear search"
          >
            <Text style={styles.clearButtonText} allowFontScaling>×</Text>
          </TouchableOpacity>
        )}
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

function getStyles(colors: any, spacing: any, typography: any) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.BACKGROUND,
    },
    searchContainer: {
      flexDirection: 'row',
      padding: spacing.MD,
      backgroundColor: colors.SURFACE,
      borderBottomWidth: 1,
      borderBottomColor: colors.BORDER,
    },
    searchInput: {
      flex: 1,
      height: 44,
      borderWidth: 1,
      borderColor: colors.OUTLINE,
      borderRadius: spacing.MD,
      paddingHorizontal: spacing.SM,
      fontSize: typography.FONT_SIZE_MD,
      marginRight: spacing.SM,
      color: colors.TEXT,
      backgroundColor: colors.SURFACE,
      fontFamily: typography.FONT_FAMILY,
    },
    searchButton: {
      backgroundColor: colors.PRIMARY,
      paddingHorizontal: spacing.MD,
      paddingVertical: spacing.SM,
      borderRadius: spacing.MD,
      justifyContent: 'center',
      alignItems: 'center',
    },
    searchButtonDisabled: {
      opacity: 0.6,
    },
    searchButtonText: {
      color: colors.TEXT_ON_PRIMARY,
      fontWeight: '600',
      fontSize: typography.FONT_SIZE_MD,
      fontFamily: typography.FONT_FAMILY,
    },
    listContainer: {
      padding: spacing.MD,
    },
    card: {
      backgroundColor: colors.SURFACE,
      borderRadius: spacing.MD,
      padding: spacing.MD,
      marginBottom: spacing.SM,
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
      fontSize: typography.FONT_SIZE_LG,
      fontWeight: typography.FONT_WEIGHT_BOLD,
      color: colors.PRIMARY,
      marginBottom: spacing.SM,
      fontFamily: typography.FONT_FAMILY,
    },
    medicationUsage: {
      fontSize: typography.FONT_SIZE_SM,
      color: colors.TEXT,
      marginBottom: 4,
      fontFamily: typography.FONT_FAMILY,
    },
    medicationDosage: {
      fontSize: typography.FONT_SIZE_SM,
      color: colors.TEXT,
      marginBottom: spacing.SM,
      fontFamily: typography.FONT_FAMILY,
    },
    label: {
      fontWeight: '600',
      color: colors.PRIMARY,
      fontFamily: typography.FONT_FAMILY,
    },
    safetyInfo: {
      flexDirection: 'row',
      gap: spacing.SM,
    },
    safetyBadge: {
      paddingHorizontal: spacing.SM,
      paddingVertical: spacing.XS,
      borderRadius: spacing.MD,
    },
    safeBadge: {
      backgroundColor: colors.SECONDARY,
    },
    unsafeBadge: {
      backgroundColor: colors.SECONDARY,
    },
    safetyText: {
      fontSize: typography.FONT_SIZE_XS,
      fontWeight: '600',
      color: colors.TEXT_ON_SECONDARY,
      fontFamily: typography.FONT_FAMILY,
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: spacing.XL,
    },
    emptyStateText: {
      fontSize: typography.FONT_SIZE_MD,
      color: colors.TEXT,
      textAlign: 'center',
      fontFamily: typography.FONT_FAMILY,
    },
    clearButton: {
      marginLeft: spacing.SM,
      backgroundColor: colors.SECONDARY,
      borderRadius: spacing.LG,
      width: 32,
      height: 32,
      alignItems: 'center',
      justifyContent: 'center',
    },
    clearButtonText: {
      color: colors.TEXT_ON_SECONDARY,
      fontSize: typography.FONT_SIZE_XL,
      fontWeight: 'bold',
      lineHeight: 28,
      fontFamily: typography.FONT_FAMILY,
    },
  });
}

export default Search; 