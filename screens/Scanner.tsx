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
import { COLORS } from '../lib/colors';

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
  const [isExpoGo, setIsExpoGo] = useState(false);
  
  // Use the modern camera permissions hook
  const [permission, requestPermission] = useCameraPermissions();

  // useEffect: Redirect to Login if not authenticated, otherwise check camera availability
  useEffect(() => {
    if (!session) {
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
      return;
    }
    checkCameraAvailability();
  }, [session]);

  // checkCameraAvailability: Detect if CameraView is available (Expo Go fallback)
  const checkCameraAvailability = async () => {
    try {
      // Try to import CameraView to check if it's available
      const { CameraView } = await import('expo-camera');
      setIsExpoGo(false);
    } catch (error) {
      console.log('Camera not available, using manual input fallback');
      setIsExpoGo(true);
    }
  };

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
        <Text style={styles.permissionText}>We need your permission to show the camera</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
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
            />
            <TouchableOpacity
              style={[styles.searchButton, loading && styles.searchButtonDisabled]}
              onPress={handleManualBarcodeSubmit}
              disabled={loading}
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
      {!scanned ? (
        <CameraView
          style={styles.camera}
          facing="back"
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: [
              'upc_a',
              'upc_e',
              'ean13',
              'ean8',
              'code128',
              'code39',
            ],
          }}
        >
          <View style={styles.overlay}>
            <View style={styles.scanArea}>
              <View style={styles.corner} />
              <View style={[styles.corner, styles.cornerTopRight]} />
              <View style={[styles.corner, styles.cornerBottomLeft]} />
              <View style={[styles.corner, styles.cornerBottomRight]} />
            </View>
            <Text style={styles.instructionText}>
              Position the barcode within the frame
            </Text>
            <TouchableOpacity
              style={styles.manualButton}
              onPress={() => setShowManualInput(true)}
            >
              <Text style={styles.manualButtonText}>Enter Barcode Manually</Text>
            </TouchableOpacity>
          </View>
        </CameraView>
      ) : (
        <View style={styles.resultContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" />
              <Text style={styles.loadingText}>Searching for medication...</Text>
            </View>
          ) : (
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.button} onPress={resetScanner}>
                <Text style={styles.buttonText}>Scan Again</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* Manual input modal */}
      {showManualInput && (
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowManualInput(false)}
        >
          <TouchableOpacity 
            style={styles.modalContent}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={styles.modalTitle}>Enter Barcode</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter barcode number"
              value={manualBarcode}
              onChangeText={setManualBarcode}
              keyboardType="numeric"
              autoCapitalize="none"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setShowManualInput(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={() => {
                  setShowManualInput(false);
                  handleManualBarcodeSubmit();
                }}
              >
                <Text style={styles.modalButtonText}>Search</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      )}

      {/* Not found modal */}
      {showNotFoundModal && (
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={handleDismissModal}
        >
          <TouchableOpacity 
            style={styles.modalContent}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={styles.modalTitle}>Medication Not Found</Text>
            <Text style={styles.modalMessage}>
              No medication found with barcode:{'\n'}
              <Text style={styles.barcodeText}>{notFoundBarcode}</Text>
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleScanAgain}
              >
                <Text style={styles.modalButtonText}>Scan Again</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={handleSearchManually}
              >
                <Text style={styles.modalButtonText}>Search Manually</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
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
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  manualButtonText: {
    color: COLORS.TEXT_ON_PRIMARY,
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
    backgroundColor: COLORS.PRIMARY,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  searchButtonDisabled: {
    opacity: 0.6,
  },
  searchButtonText: {
    color: COLORS.TEXT_ON_PRIMARY,
    fontSize: 16,
    fontWeight: '600',
  },
  alternativeButton: {
    backgroundColor: COLORS.SECONDARY,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  alternativeButtonText: {
    color: COLORS.TEXT_ON_SECONDARY,
    fontSize: 16,
    fontWeight: '600',
  },
  resultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.SURFACE,
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.PRIMARY,
  },
  buttonContainer: {
    alignItems: 'center',
  },
  button: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginVertical: 8,
  },
  buttonText: {
    color: COLORS.TEXT_ON_PRIMARY,
    fontSize: 16,
    fontWeight: '600',
  },
  permissionText: {
    fontSize: 18,
    color: COLORS.PRIMARY,
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
    backgroundColor: COLORS.SURFACE,
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
    borderColor: COLORS.OUTLINE,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: COLORS.SURFACE,
    color: COLORS.TEXT,
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
    backgroundColor: COLORS.PRIMARY,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.PRIMARY,
  },
});

export default Scanner; 