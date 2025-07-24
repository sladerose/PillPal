import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { CameraView, CameraType, BarcodeScanningResult, useCameraPermissions } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';
import { supabase } from '../../lib/supabase';
import { useUser } from '../../features/profile/context/UserContext';
import type { RootStackParamList } from '../../../App';
import { getTheme } from '../../lib/colors';
import Constants from 'expo-constants';

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

// Scanner allows users to scan medication barcodes or enter them manually to search for medications in the database.
const Scanner = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { session } = useUser();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [manualBarcode, setManualBarcode] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [showNotFoundModal, setShowNotFoundModal] = useState(false);
  const [notFoundBarcode, setNotFoundBarcode] = useState('');
  const isExpoGo = Constants.appOwnership === 'expo';
  const { colors, spacing, typography } = getTheme();
  const styles = getStyles(colors, spacing, typography);
  
  // Use the modern camera permissions hook
  const [permission, requestPermission] = useCameraPermissions();

  // useEffect: Redirect to Login if not authenticated
  useEffect(() => {
    if (!session) {
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    }
  }, [session, navigation]);

  // searchMedicationByBarcode: Query Supabase for medication by barcode
  const searchMedicationByBarcode = async (barcode: string) => {
    setLoading(true);
    
    try {
      console.log('Searching for barcode:', barcode);
      
      const { data: medications, error } = await supabase
        .from('medications')
        .select('*')
        .eq('barcode', barcode)
        .limit(1);

      if (error) {
        console.error('Error searching medication:', error);
        Toast.show({
          type: 'error',
          text1: 'Search Error',
          text2: 'Failed to search for medication',
        });
        return false;
      }

      if (medications && medications.length > 0) {
        navigation.navigate('Result', { medication: medications[0] });
        return true;
      } else {
        Toast.show({
          type: 'info',
          text1: 'Medication Not Found',
          text2: `No medication found with barcode: ${barcode}`,
        });
        return false;
      }
    } catch (error) {
      console.error('Error processing barcode:', error);
      Toast.show({
        type: 'error',
        text1: 'Search Error',
        text2: 'Failed to process barcode',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // handleBarCodeScanned: Handle successful barcode scan and search
  const handleBarCodeScanned = async (scanResult: BarcodeScanningResult) => {
    if (scanned) return;
    
    setScanned(true);
    const success = await searchMedicationByBarcode(scanResult.data);
    
    if (!success) {
      setNotFoundBarcode(scanResult.data);
      setShowNotFoundModal(true);
    }
  };

  // handleManualBarcodeSubmit: Handle manual barcode entry and search
  const handleManualBarcodeSubmit = async () => {
    if (!manualBarcode.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Input Error',
        text2: 'Please enter a barcode',
      });
      return;
    }

    const success = await searchMedicationByBarcode(manualBarcode.trim());
    
    if (!success) {
      setNotFoundBarcode(manualBarcode.trim());
      setShowNotFoundModal(true);
    } else {
      setManualBarcode('');
    }
  };

  // resetScanner: Reset scanner state
  const resetScanner = () => {
    setScanned(false);
    setLoading(false);
  };

  // handleScanAgain: Reset modal and scanner for another attempt
  const handleScanAgain = () => {
    setShowNotFoundModal(false);
    setScanned(false);
  };

  // handleSearchManually: Navigate to Search screen from modal
  const handleSearchManually = () => {
    setShowNotFoundModal(false);
    setScanned(false);
    navigation.navigate('Search');
  };

  // handleDismissModal: Dismiss not found modal
  const handleDismissModal = () => {
    setShowNotFoundModal(false);
    setScanned(false);
  };

  // UI rendering: Show camera view with scan instructions, manual entry, and loading spinner
  // Handle camera permissions
  if (!permission) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Checking camera permissions...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText} allowFontScaling>We need your permission to show the camera</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission} accessible accessibilityRole="button" accessibilityLabel="Grant camera permission">
          <Text style={styles.buttonText} allowFontScaling>Grant Permission</Text>
        </TouchableOpacity>
        <Text style={styles.permissionHelp} allowFontScaling>If you denied permission, enable it in your device settings.</Text>
      </View>
    );
  }

  // Expo Go fallback - Manual barcode input
  if (isExpoGo) {
    return (
      <View style={styles.container}>
        <View style={styles.expoGoContainer}>
          <Text style={styles.title}>Barcode Scanner</Text>
          <Text style={styles.expoGoText}>
            Camera scanning is not available in Expo Go.{'\n'}
            Please enter the barcode manually or use a development build.
          </Text>
          
          <View style={styles.manualInputContainer}>
            <TextInput
              style={styles.manualInput}
              placeholder="Enter barcode number"
              value={manualBarcode}
              onChangeText={setManualBarcode}
              keyboardType="numeric"
              autoCapitalize="none"
              onSubmitEditing={handleManualBarcodeSubmit}
              accessible
              accessibilityLabel="Manual barcode entry"
            />
            <TouchableOpacity
              style={[styles.searchButton, loading && styles.searchButtonDisabled]}
              onPress={handleManualBarcodeSubmit}
              disabled={loading}
              accessible accessibilityRole="button" accessibilityLabel="Submit barcode"
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.searchButtonText}>Search</Text>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.alternativeButton}
            onPress={() => navigation.navigate('Search')}
            accessible accessibilityRole="button" accessibilityLabel="Search by name instead"
          >
            <Text style={styles.alternativeButtonText}>Search by Name Instead</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Modern CameraView with barcode scanning
  return (
    <View style={styles.container}>
      <Text style={styles.title} allowFontScaling>Barcode Scanner</Text>
      <Text style={styles.instructions} allowFontScaling>Align the barcode within the frame to scan automatically.</Text>
      {/* CameraView and scan UI would go here */}
      {loading && <ActivityIndicator size="large" color={colors.PRIMARY} style={styles.loadingSpinner} />}
      <TouchableOpacity
        style={styles.manualInputToggle}
        onPress={() => setShowManualInput(!showManualInput)}
        accessible accessibilityRole="button" accessibilityLabel="Toggle manual barcode entry"
      >
        <Text style={styles.manualInputToggleText} allowFontScaling>{showManualInput ? 'Hide Manual Entry' : 'Enter Barcode Manually'}</Text>
      </TouchableOpacity>
      {showManualInput && (
        <View style={styles.manualInputContainer}>
          <TextInput
            style={styles.manualInput}
            placeholder="Enter barcode number"
            value={manualBarcode}
            onChangeText={setManualBarcode}
            keyboardType="numeric"
            accessible
            accessibilityLabel="Manual barcode entry"
            allowFontScaling
            returnKeyType="done"
          />
          <TouchableOpacity style={styles.button} onPress={handleManualBarcodeSubmit} accessible accessibilityRole="button" accessibilityLabel="Submit barcode">
            <Text style={styles.buttonText} allowFontScaling>Submit</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

function getStyles(colors: any, spacing: any, typography: any) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.BACKGROUND,
    },
    camera: {
      flex: 1,
    },
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    scanArea: {
      width: 250,
      height: 250,
      position: 'relative',
    },
    corner: {
      position: 'absolute',
      width: 30,
      height: 30,
      borderColor: '#fff',
      borderTopWidth: 3,
      borderLeftWidth: 3,
    },
    cornerTopRight: {
      top: 0,
      right: 0,
      borderTopWidth: 3,
      borderRightWidth: 3,
      borderLeftWidth: 0,
    },
    cornerBottomLeft: {
      bottom: 0,
      left: 0,
      borderBottomWidth: 3,
      borderLeftWidth: 3,
      borderTopWidth: 0,
    },
    cornerBottomRight: {
      bottom: 0,
      right: 0,
      borderBottomWidth: 3,
      borderRightWidth: 3,
      borderTopWidth: 0,
      borderLeftWidth: 0,
    },
    instructionText: {
      color: '#fff',
      fontSize: typography.FONT_SIZE_MD,
      textAlign: 'center',
      marginTop: spacing.MD,
      paddingHorizontal: spacing.MD,
      fontFamily: typography.FONT_FAMILY,
    },
    manualButton: {
      backgroundColor: colors.PRIMARY,
      paddingHorizontal: spacing.LG,
      paddingVertical: spacing.SM,
      borderRadius: spacing.MD,
      marginTop: spacing.MD,
    },
    manualButtonText: {
      color: colors.TEXT_ON_PRIMARY,
      fontSize: typography.FONT_SIZE_MD,
      fontWeight: '600',
      fontFamily: typography.FONT_FAMILY,
    },
    expoGoContainer: {
      flex: 1,
      padding: spacing.LG,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.SURFACE,
    },
    title: {
      fontSize: typography.FONT_SIZE_XL,
      fontWeight: typography.FONT_WEIGHT_BOLD,
      marginBottom: spacing.MD,
      textAlign: 'center',
      fontFamily: typography.FONT_FAMILY,
      color: colors.PRIMARY,
    },
    expoGoText: {
      fontSize: typography.FONT_SIZE_MD,
      color: colors.TEXT,
      textAlign: 'center',
      marginBottom: spacing.XL,
      lineHeight: 24,
      fontFamily: typography.FONT_FAMILY,
    },
    manualInputContainer: {
      width: '100%',
      marginBottom: spacing.MD,
    },
    manualInput: {
      borderWidth: 1,
      borderColor: colors.OUTLINE,
      borderRadius: spacing.MD,
      padding: spacing.SM,
      fontSize: typography.FONT_SIZE_MD,
      marginBottom: spacing.SM,
      backgroundColor: colors.SURFACE,
      color: colors.TEXT,
      fontFamily: typography.FONT_FAMILY,
    },
    searchButton: {
      backgroundColor: colors.PRIMARY,
      padding: spacing.SM,
      borderRadius: spacing.MD,
      alignItems: 'center',
    },
    searchButtonDisabled: {
      opacity: 0.6,
    },
    searchButtonText: {
      color: colors.TEXT_ON_PRIMARY,
      fontSize: typography.FONT_SIZE_MD,
      fontWeight: '600',
      fontFamily: typography.FONT_FAMILY,
    },
    alternativeButton: {
      backgroundColor: colors.SECONDARY,
      padding: spacing.SM,
      borderRadius: spacing.MD,
      alignItems: 'center',
    },
    alternativeButtonText: {
      color: colors.TEXT_ON_SECONDARY,
      fontSize: typography.FONT_SIZE_MD,
      fontWeight: '600',
      fontFamily: typography.FONT_FAMILY,
    },
    resultContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.SURFACE,
    },
    loadingContainer: {
      alignItems: 'center',
    },
    loadingText: {
      marginTop: spacing.MD,
      fontSize: typography.FONT_SIZE_MD,
      color: colors.PRIMARY,
      fontFamily: typography.FONT_FAMILY,
    },
    buttonContainer: {
      alignItems: 'center',
    },
    button: {
      backgroundColor: colors.PRIMARY,
      paddingHorizontal: spacing.XL,
      paddingVertical: spacing.SM,
      borderRadius: spacing.MD,
      marginVertical: spacing.SM,
    },
    buttonText: {
      color: colors.TEXT_ON_PRIMARY,
      fontSize: typography.FONT_SIZE_MD,
      fontWeight: '600',
      fontFamily: typography.FONT_FAMILY,
    },
    permissionText: {
      fontSize: typography.FONT_SIZE_LG,
      color: colors.PRIMARY,
      textAlign: 'center',
      marginBottom: spacing.MD,
      fontFamily: typography.FONT_FAMILY,
    },
    modalOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: colors.SURFACE,
      borderRadius: spacing.MD,
      padding: spacing.LG,
      width: '80%',
      maxWidth: 300,
    },
    modalTitle: {
      fontSize: typography.FONT_SIZE_LG,
      fontWeight: typography.FONT_WEIGHT_BOLD,
      marginBottom: spacing.MD,
      textAlign: 'center',
      fontFamily: typography.FONT_FAMILY,
    },
    modalMessage: {
      fontSize: typography.FONT_SIZE_MD,
      color: colors.TEXT,
      textAlign: 'center',
      marginBottom: spacing.LG,
      lineHeight: 22,
      fontFamily: typography.FONT_FAMILY,
    },
    barcodeText: {
      fontWeight: typography.FONT_WEIGHT_BOLD,
      color: colors.TEXT,
      fontFamily: typography.FONT_FAMILY,
    },
    modalInput: {
      borderWidth: 1,
      borderColor: colors.OUTLINE,
      borderRadius: spacing.MD,
      padding: spacing.SM,
      fontSize: typography.FONT_SIZE_MD,
      marginBottom: spacing.MD,
      backgroundColor: colors.SURFACE,
      color: colors.TEXT,
      fontFamily: typography.FONT_FAMILY,
    },
    modalButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    modalButton: {
      flex: 1,
      padding: spacing.SM,
      borderRadius: spacing.MD,
      alignItems: 'center',
      marginHorizontal: 4,
    },
    modalButtonPrimary: {
      backgroundColor: colors.PRIMARY,
    },
    modalButtonText: {
      fontSize: typography.FONT_SIZE_MD,
      fontWeight: '600',
      color: colors.TEXT_ON_PRIMARY, // Default to text on primary for better contrast
      fontFamily: typography.FONT_FAMILY,
    },
    instructions: {
      fontSize: typography.FONT_SIZE_MD,
      color: colors.PRIMARY,
      marginBottom: spacing.SM,
      textAlign: 'center',
      fontFamily: typography.FONT_FAMILY,
    },
    loadingSpinner: {
      marginVertical: spacing.MD,
    },
    permissionHelp: {
      color: colors.TEXT,
      fontSize: typography.FONT_SIZE_SM,
      marginTop: spacing.SM,
      textAlign: 'center',
      fontFamily: typography.FONT_FAMILY,
    },
    manualInputToggle: {
      marginTop: spacing.MD,
      marginBottom: spacing.XS,
      alignSelf: 'center',
    },
    manualInputToggleText: {
      color: colors.PRIMARY,
      fontSize: typography.FONT_SIZE_MD,
      textDecorationLine: 'underline',
      fontFamily: typography.FONT_FAMILY,
    },
  });
}

export default Scanner; 