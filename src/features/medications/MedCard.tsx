import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getTheme } from '../../lib/colors';

// MedCard displays a medication's name and description in a styled card.
type MedCardProps = {
  name: string;
  description: string;
};

const MedCard: React.FC<MedCardProps> = ({ name, description }) => {
  const { colors, spacing, typography } = getTheme();
  const styles = StyleSheet.create({
    card: {
      backgroundColor: colors.SURFACE,
      borderRadius: spacing.LG,
      padding: spacing.MD,
      margin: spacing.SM,
      shadowColor: colors.BORDER,
      shadowOpacity: 0.08,
      shadowRadius: 6,
      elevation: 2,
    },
    name: {
      fontWeight: '700',
      fontSize: typography.FONT_SIZE_LG,
      marginBottom: spacing.XS,
      color: colors.PRIMARY,
      fontFamily: typography.FONT_FAMILY,
    },
    description: {
      color: colors.PRIMARY,
      fontFamily: typography.FONT_FAMILY,
    },
  });
  return (
    <View style={styles.card}>
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
};

export default React.memo(MedCard); 