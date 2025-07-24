import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getTheme } from '../../lib/colors';

// AlertBadge displays a status badge (safe, caution, danger) with an icon, color, and message for medication safety.

type AlertBadgeProps = {
  status: 'safe' | 'caution' | 'danger';
  message?: string;
  size?: 'small' | 'medium' | 'large';
};

const AlertBadge: React.FC<AlertBadgeProps> = ({ status, message, size = 'medium' }) => {
  const { colors, spacing, typography } = getTheme();
  // getStatusConfig: Return icon, background, border, and text color based on status
  const getStatusConfig = () => {
    switch (status) {
      case 'safe':
        return {
          icon: '✅',
          backgroundColor: colors.SECONDARY,
          borderColor: colors.OUTLINE,
          textColor: colors.PRIMARY,
          defaultMessage: 'Safe to use',
        };
      case 'caution':
        return {
          icon: '⚠️',
          backgroundColor: colors.SECONDARY,
          borderColor: colors.OUTLINE,
          textColor: colors.PRIMARY,
          defaultMessage: 'Use with caution',
        };
      case 'danger':
        return {
          icon: '❌',
          backgroundColor: colors.SECONDARY,
          borderColor: colors.OUTLINE,
          textColor: '#B71C1C',
          defaultMessage: 'Allergic conflict',
        };
      default:
        return {
          icon: '❓',
          backgroundColor: colors.SURFACE,
          borderColor: colors.BORDER,
          textColor: colors.TEXT,
          defaultMessage: 'Unknown status',
        };
    }
  };

  // getSizeConfig: Return padding and font sizes based on badge size
  const getSizeConfig = () => {
    switch (size) {
      case 'small':
        return {
          padding: spacing.XS,
          fontSize: 12,
          iconSize: 14,
        };
      case 'large':
        return {
          padding: spacing.MD,
          fontSize: 18,
          iconSize: 24,
        };
      default: // medium
        return {
          padding: spacing.MD,
          fontSize: 14,
          iconSize: 18,
        };
    }
  };

  const statusConfig = getStatusConfig();
  const sizeConfig = getSizeConfig();

  const styles = StyleSheet.create({
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: spacing.MD,
      borderWidth: 1,
      margin: spacing.XS,
    },
    icon: {
      marginRight: spacing.XS,
    },
    text: {
      fontWeight: '600',
      flex: 1,
      fontFamily: typography.FONT_FAMILY,
    },
  });

  // UI rendering: Show badge with icon and message
  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: statusConfig.backgroundColor,
          borderColor: statusConfig.borderColor,
          padding: sizeConfig.padding,
        },
      ]}
    >
      <Text style={[styles.icon, { fontSize: sizeConfig.iconSize }]}>
        {statusConfig.icon}
      </Text>
      <Text
        style={[
          styles.text,
          {
            color: statusConfig.textColor,
            fontSize: sizeConfig.fontSize,
          },
        ]}
      >
        {message || statusConfig.defaultMessage}
      </Text>
    </View>
  );
};

export default AlertBadge; 