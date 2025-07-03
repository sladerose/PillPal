import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, Modal, ActivityIndicator, Platform } from 'react-native';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { useUser } from '../context/UserContext';
import AlertBadge from '../components/AlertBadge';
import { supabase } from '../lib/supabase';
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

interface MedicationDocument {
  id: string;
  medication_id: string;
  type: string;
  pdf_url: string;
  extracted_text: string;
  date_uploaded?: string;
  ai_extracted_tags?: string[];
  summary?: any;
}

type ResultScreenRouteProp = RouteProp<RootStackParamList, 'Result'>;

type AllergyStatus = 'safe' | 'caution' | 'danger';

const OPENAI_API_KEY = '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';

// Result screen displays medication details, AI-generated safety summaries, and personalized safety info based on user profile.
const Result = () => {
  const route = useRoute<ResultScreenRouteProp>();
  const { medication } = route.params;
  const { session, profile } = useUser();
  const [allergyStatus, setAllergyStatus] = useState<AllergyStatus>('safe');
  const [conflictingIngredients, setConflictingIngredients] = useState<string[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [documents, setDocuments] = useState<MedicationDocument[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(true);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [aiStatus, setAiStatus] = useState<AllergyStatus | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [showAiDetails, setShowAiDetails] = useState(false);
  const [aiGeneralSummary, setAiGeneralSummary] = useState<string | null>(null);
  const [aiPersonalizedSummary, setAiPersonalizedSummary] = useState<string | null>(null);
  const [aiSource, setAiSource] = useState<string | null>(null);
  const colors = getColors();
  const styles = getStyles(colors);

  // useEffect: On mount or when session/medication/profile changes, check allergies and fetch documents
  useEffect(() => {
    if (!session) {
      // Handle unauthenticated state if needed
      return;
    }
    checkAllergies();
    fetchDocuments();
  }, [session, medication, profile]);

  // useEffect: When documents and profile are loaded, fetch AI summaries
  useEffect(() => {
    if (!loadingDocuments && documents.length > 0 && profile) {
      getAiSummaries();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingDocuments, documents, profile]);

  // fetchDocuments: Fetch medication documents from Supabase
  const fetchDocuments = async () => {
    setLoadingDocuments(true);
    const { data, error } = await supabase
      .from('medication_documents')
      .select('*')
      .eq('medication_id', medication.id);
    if (!error && data) {
      setDocuments(data);
    } else {
      setDocuments([]);
    }
    setLoadingDocuments(false);
  };

  // checkAllergies: Compare user allergies/intolerances to medication ingredients
  const checkAllergies = () => {
    if (!profile?.allergies || profile.allergies.length === 0) {
      setAllergyStatus('safe');
      setConflictingIngredients([]);
      return;
    }

    const userAllergies = profile.allergies.map(allergy => allergy.toLowerCase());
    const medicationIngredients = medication.ingredients.map(ingredient => ingredient.toLowerCase());
    
    const exactMatches: string[] = [];
    const possibleMatches: string[] = [];

    // Check for exact matches
    userAllergies.forEach(allergy => {
      medicationIngredients.forEach(ingredient => {
        if (ingredient.includes(allergy) || allergy.includes(ingredient)) {
          if (ingredient === allergy) {
            exactMatches.push(ingredient);
          } else {
            possibleMatches.push(ingredient);
          }
        }
      });
    });

    if (exactMatches.length > 0) {
      setAllergyStatus('danger');
      setConflictingIngredients(exactMatches);
    } else if (possibleMatches.length > 0) {
      setAllergyStatus('caution');
      setConflictingIngredients(possibleMatches);
    } else {
      setAllergyStatus('safe');
      setConflictingIngredients([]);
    }
  };

  const getSafetyIcon = (isSafe: boolean) => {
    return isSafe ? '✅' : '❌';
  };

  const getSafetyColor = (isSafe: boolean) => {
    return isSafe ? '#28a745' : '#dc3545';
  };

  // getAiSummaries: Call OpenAI API to generate general and personalized summaries
  const getAiSummaries = async () => {
    setAiLoading(true);
    setAiSummary(null);
    setAiStatus(null);
    setAiGeneralSummary(null);
    setAiPersonalizedSummary(null);
    setAiSource(null);
    try {
      const allergies = profile?.allergies || [];
      const intolerances = profile?.intolerances || [];
      const age = profile?.age;
      const isPregnant = profile?.is_pregnant;
      const medicalConditions = profile?.medical_conditions || [];
      const ingredients = medication.ingredients || [];
      const docTexts = documents.map(doc => `Type: ${doc.type}\n${doc.extracted_text}`).join('\n---\n');
      const prompt = `You are a medical safety assistant for South African medications. ONLY use the provided ingredient list and PI/PIL text for risk assessment. If you cannot find enough information, search reputable, up-to-date medical sources (preferably South African) and cite your source.\n\n- Medication ingredients: ${ingredients.join(", ")}\n- Extracted PI/PIL text: ${docTexts}\n\nFirst, write a one-sentence, friendly, emoji-enhanced general summary of the product and any general warnings/cautions (not personalized).\n\nSecond, given the user profile:\n- Allergies: ${allergies.join(", ")}\n- Intolerances: ${intolerances.join(", ")}\n- Age: ${age !== undefined ? age : 'unknown'}\n- Pregnant: ${isPregnant ? 'yes' : 'no'}\n- Medical conditions: ${medicalConditions.join(", ")}\nWrite a one-sentence, friendly, emoji-enhanced personalized safety summary, comparing the user's profile to the medication, and highlight any conflicts or risks. ONLY mention a risk if the ingredient or warning is present in the provided data or a reputable cited source. If there are no conflicts, say so with a positive emoji.\n\nIf you use information from a web search, cite the source (URL or publication).\n\nRespond in this JSON format:\n{\n  \"general_summary\": \"...\",\n  \"personalized_summary\": \"...\",\n  \"status\": \"safe|caution|danger\",\n  \"source\": \"...\" (optional)\n}`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'You are a helpful medical assistant.' },
            { role: 'user', content: prompt },
          ],
          max_tokens: 512,
        }),
      });
      const data = await response.json();
      let content = data.choices?.[0]?.message?.content || '';
      // Log the AI response for debugging
      console.log('OpenAI response:', content);
      // Try to parse JSON
      let status: AllergyStatus = 'safe';
      let generalSummary = '';
      let personalizedSummary = '';
      let source = '';
      try {
        const parsed = JSON.parse(content);
        status = parsed.status || 'safe';
        generalSummary = parsed.general_summary || '';
        personalizedSummary = parsed.personalized_summary || '';
        source = parsed.source || '';
      } catch {
        generalSummary = content;
        personalizedSummary = content;
        source = '';
      }
      setAiStatus(status);
      setAiGeneralSummary(generalSummary);
      setAiPersonalizedSummary(personalizedSummary);
      setAiSource(source);
    } catch (e) {
      setAiStatus('caution');
      setAiGeneralSummary('Could not analyze medication documents. Please try again later.');
      setAiPersonalizedSummary('Could not analyze medication documents. Please try again later.');
      setAiSource(null);
    } finally {
      setAiLoading(false);
    }
  };

  // getBannerColor: Determine color for personalized safety card based on AI status
  const getBannerColor = (status: AllergyStatus | null) => {
    if (status === 'danger') return colors.SECONDARY;
    if (status === 'caution') return colors.SECONDARY;
    if (status === 'safe') return colors.OUTLINE;
    return colors.PRIMARY;
  };

  // Helper for banner icon
  const getBannerIcon = (status: AllergyStatus | null) => {
    if (status === 'danger') return '⛔️';
    if (status === 'caution') return '⚠️';
    if (status === 'safe') return '✅';
    return 'ℹ️';
  };

  // Show user context at the top
  const renderUserContext = () => (
    <View style={styles.userContextBox}>
      <Text style={styles.userContextTitle}>Your Profile Context</Text>
      {profile?.allergies && profile.allergies.length > 0 && (
        <Text style={styles.userContextItem}><Text style={styles.userContextLabel}>Allergies:</Text> {profile.allergies.join(', ')}</Text>
      )}
      {profile?.intolerances && profile.intolerances.length > 0 && (
        <Text style={styles.userContextItem}><Text style={styles.userContextLabel}>Intolerances:</Text> {profile.intolerances.join(', ')}</Text>
      )}
      {profile?.age !== undefined && (
        <Text style={styles.userContextItem}><Text style={styles.userContextLabel}>Age:</Text> {profile.age}</Text>
      )}
      {profile?.is_pregnant !== undefined && (
        <Text style={styles.userContextItem}><Text style={styles.userContextLabel}>Pregnant:</Text> {profile.is_pregnant ? 'Yes' : 'No'}</Text>
      )}
      {profile?.medical_conditions && profile.medical_conditions.length > 0 && (
        <Text style={styles.userContextItem}><Text style={styles.userContextLabel}>Medical Conditions:</Text> {profile.medical_conditions.join(', ')}</Text>
      )}
    </View>
  );

  // Medication description card
  const renderDescriptionCard = () => (
    <View style={styles.card}>
      <Text style={styles.medName}>{medication.name}</Text>
      {medication.usage && <Text style={styles.cardText}>{medication.usage}</Text>}
    </View>
  );

  // AI general summary card
  const renderGeneralSummaryCard = () => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Product Summary</Text>
      {aiLoading ? (
        <ActivityIndicator size="small" />
      ) : (
        <Text style={styles.cardText}>{aiGeneralSummary}</Text>
      )}
      {aiSource && (
        <Text style={styles.cardSource}>Source: {aiSource}</Text>
      )}
    </View>
  );

  // Personalized safety card
  const renderPersonalizedSafetyCard = () => (
    <View style={[styles.card, { borderColor: getBannerColor(aiStatus), borderWidth: 2 }]}> 
      <Text style={[styles.cardTitle, { color: getBannerColor(aiStatus) }]}>Personalized Safety</Text>
      {aiLoading ? (
        <ActivityIndicator size="small" />
      ) : (
        <Text style={styles.cardText}>{aiPersonalizedSummary}</Text>
      )}
    </View>
  );

  // Details card
  const renderDetailsCard = () => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Details</Text>
      {medication.usage && (
        <Text style={styles.cardLabel}>Usage: <Text style={styles.cardText}>{medication.usage}</Text></Text>
      )}
      {medication.dosage && (
        <Text style={styles.cardLabel}>Dosage: <Text style={styles.cardText}>{medication.dosage}</Text></Text>
      )}
      {medication.ingredients && medication.ingredients.length > 0 && (
        <Text style={styles.cardLabel}>Ingredients:</Text>
      )}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 }}>
        {medication.ingredients && medication.ingredients.map((ingredient, idx) => {
          // Highlight if in user allergies/intolerances/medical_conditions
          const isConflict = (
            (profile?.allergies || []).map(a => a.toLowerCase()).includes(ingredient.toLowerCase()) ||
            (profile?.intolerances || []).map(i => i.toLowerCase()).includes(ingredient.toLowerCase()) ||
            (profile?.medical_conditions || []).map(m => m.toLowerCase()).includes(ingredient.toLowerCase())
          );
          return (
            <Text
              key={idx}
              style={{
                backgroundColor: isConflict ? '#ffcdd2' : '#e0e0e0',
                color: isConflict ? '#b71c1c' : '#333',
                borderRadius: 12,
                paddingHorizontal: 10,
                paddingVertical: 4,
                marginRight: 8,
                marginBottom: 6,
                fontWeight: isConflict ? 'bold' : 'normal',
              }}
            >
              {ingredient}
            </Text>
          );
        })}
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {renderDescriptionCard()}
      {renderGeneralSummaryCard()}
      {renderPersonalizedSafetyCard()}
      {renderDetailsCard()}
      {renderUserContext()}
    </ScrollView>
  );
};

function getStyles(colors: any) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.BACKGROUND,
      padding: 16,
    },
    card: {
      backgroundColor: colors.SURFACE,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.BORDER,
      shadowColor: colors.BORDER,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 3,
      elevation: 1,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 8,
      color: colors.PRIMARY,
    },
    cardText: {
      fontSize: 16,
      color: colors.TEXT,
      marginBottom: 4,
    },
    cardLabel: {
      fontSize: 15,
      color: colors.PRIMARY,
      marginTop: 4,
      marginBottom: 2,
    },
    medName: {
      fontSize: 22,
      fontWeight: 'bold',
      color: colors.PRIMARY,
      marginBottom: 6,
      textAlign: 'center',
    },
    userContextBox: {
      backgroundColor: colors.SURFACE,
      borderRadius: 8,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.BORDER,
      shadowColor: colors.BORDER,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 3,
      elevation: 1,
    },
    userContextTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.PRIMARY,
      marginBottom: 8,
    },
    userContextItem: {
      fontSize: 16,
      color: colors.TEXT,
      marginBottom: 4,
    },
    userContextLabel: {
      fontWeight: 'bold',
    },
    cardSource: {
      fontSize: 13,
      color: colors.SECONDARY,
      marginTop: 4,
      fontStyle: 'italic',
    },
  });
}

export default Result; 