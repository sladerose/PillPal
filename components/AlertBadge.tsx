import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../lib/colors';

// AlertBadge displays a status badge (safe, caution, danger) with an icon, color, and message for medication safety.

type AlertBadgeProps = {
  status: 'safe' | 'caution' | 'danger';
  message?: string;
  size?: 'small' | 'medium' | 'large';
};

const AlertBadge: React.FC<AlertBadgeProps> = ({ 
  status, 
  message, 
  size = 'medium' 
}) => {
  // getStatusConfig: Return icon, background, border, and text color based on status
  const getStatusConfig = () => {
    switch (status) {
      case 'safe':
        return {
          icon: '✅',
          backgroundColor: COLORS.SECONDARY,
          borderColor: COLORS.OUTLINE,
          textColor: COLORS.PRIMARY,
          defaultMessage: 'Safe to use',
        };
      case 'caution':
        return {
          icon: '⚠️',
          backgroundColor: COLORS.SECONDARY,
          borderColor: COLORS.OUTLINE,
          textColor: COLORS.PRIMARY,
          defaultMessage: 'Use with caution',
        };
      case 'danger':
        return {
          icon: '❌',
          backgroundColor: COLORS.SECONDARY,
          borderColor: COLORS.OUTLINE,
          textColor: '#B71C1C',
          defaultMessage: 'Allergic conflict',
        };
      default:
        return {
          icon: '❓',
          backgroundColor: COLORS.SURFACE,
          borderColor: COLORS.BORDER,
          textColor: COLORS.TEXT,
          defaultMessage: 'Unknown status',
        };
    }
  };

  // getSizeConfig: Return padding and font sizes based on badge size
  const getSizeConfig = () => {
    switch (size) {
      case 'small':
        return {
          padding: 6,
          fontSize: 12,
          iconSize: 14,
        };
      case 'large':
        return {
          padding: 16,
          fontSize: 18,
          iconSize: 24,
        };
      default: // medium
        return {
          padding: 12,
          fontSize: 14,
          iconSize: 18,
        };
    }
  };

  const statusConfig = getStatusConfig();
  const sizeConfig = getSizeConfig();

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

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    margin: 4,
  },
  icon: {
    marginRight: 6,
  },
  text: {
    fontWeight: '600',
    flex: 1,
  },
});

export default AlertBadge; 