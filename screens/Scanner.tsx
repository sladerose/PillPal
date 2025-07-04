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
import { supabase } from '../lib/supabase';
import { useUser } from '../context/UserContext';
import type { RootStackParamList } from '../App';
import { getColors } from '../lib/colors';
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
  const colors = getColors();
  const styles = getStyles(colors);
  
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

function getStyles(colors: any) {
  return StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
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
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  manualButton: {
    backgroundColor: colors.PRIMARY,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  manualButtonText: {
    color: colors.TEXT_ON_PRIMARY,
    fontSize: 16,
    fontWeight: '600',
  },
  expoGoContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  expoGoText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  manualInputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  manualInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  searchButton: {
    backgroundColor: colors.PRIMARY,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  searchButtonDisabled: {
    opacity: 0.6,
  },
  searchButtonText: {
    color: colors.TEXT_ON_PRIMARY,
    fontSize: 16,
    fontWeight: '600',
  },
  alternativeButton: {
    backgroundColor: colors.SECONDARY,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  alternativeButtonText: {
    color: colors.TEXT_ON_SECONDARY,
    fontSize: 16,
    fontWeight: '600',
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
    marginTop: 16,
    fontSize: 16,
    color: colors.PRIMARY,
  },
  buttonContainer: {
    alignItems: 'center',
  },
  button: {
    backgroundColor: colors.PRIMARY,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginVertical: 8,
  },
  buttonText: {
    color: colors.TEXT_ON_PRIMARY,
    fontSize: 16,
    fontWeight: '600',
  },
  permissionText: {
    fontSize: 18,
    color: colors.PRIMARY,
    textAlign: 'center',
    marginBottom: 20,
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
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  barcodeText: {
    fontWeight: 'bold',
    color: '#333',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: colors.OUTLINE,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: colors.SURFACE,
    color: colors.TEXT,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  modalButtonPrimary: {
    backgroundColor: colors.PRIMARY,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.PRIMARY,
  },
  instructions: {
    fontSize: 16,
    color: colors.PRIMARY,
    marginBottom: 12,
    textAlign: 'center',
  },
  loadingSpinner: {
    marginVertical: 16,
  },
  permissionHelp: {
    color: colors.SECONDARY,
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  manualInputToggle: {
    marginTop: 16,
    marginBottom: 8,
    alignSelf: 'center',
  },
  manualInputToggleText: {
    color: colors.SECONDARY,
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});
}

export default Scanner; 