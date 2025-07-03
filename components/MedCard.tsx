import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../lib/colors';

// MedCard displays a medication's name and description in a styled card.
type MedCardProps = {
  name: string;
  description: string;
};

const MedCard: React.FC<MedCardProps> = ({ name, description }) => {
  // UI rendering: Show medication name and description
  return (
    <View style={styles.card}>
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.SURFACE,
    borderRadius: 10,
    padding: 16,
    margin: 8,
    shadowColor: COLORS.BORDER,
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 4,
    color: COLORS.PRIMARY,
  },
  description: {
    color: COLORS.PRIMARY,
  },
});

export default MedCard; 