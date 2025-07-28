import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, ViewStyle, TextStyle, GestureResponderEvent } from 'react-native';
import { getTheme } from '../lib/colors';

/**
 * @interface ButtonProps
 * Props for the Button component.
 */
interface ButtonProps {
  /**
   * The content to be rendered inside the button. This can be text, icons, or any React node.
   */
  children: React.ReactNode;
  /**
   * Callback function to be executed when the button is pressed.
   */
  onPress?: (event: GestureResponderEvent) => void;
  /**
   * If true, a loading indicator will be shown and the button will be disabled.
   * @default false
   */
  loading?: boolean;
  /**
   * If true, the button will be disabled and non-interactive.
   * @default false
   */
  disabled?: boolean;
  /**
   * Defines the visual style of the button.
   * 'primary' for the main action button, 'secondary' for alternative actions.
   * @default 'primary'
   */
  variant?: 'primary' | 'secondary';
  /**
   * Custom style to apply to the button's container View.
   */
  style?: ViewStyle;
  /**
   * Custom style to apply to the button's text.
   */
  textStyle?: TextStyle;
  /**
   * An accessibility label for screen readers, describing the purpose of the button.
   */
  accessibilityLabel?: string;
}

/**
 * Reusable Button component with customizable styles, loading state, and accessibility features.
 * It supports primary and secondary variants and integrates with the app's theming system.
 *
 * @param {ButtonProps} props - The props for the Button component.
 * @returns {React.FC<ButtonProps>} A React functional component for a customizable button.
 */
const Button: React.FC<ButtonProps> = ({
  children,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  style,
  textStyle,
  accessibilityLabel,
}) => {
  const { colors, spacing, typography } = getTheme();
  const isPrimary = variant === 'primary';
  const buttonStyles = [
    styles.button,
    {
      backgroundColor: isPrimary ? colors.PRIMARY : colors.SECONDARY,
      opacity: disabled ? 0.6 : 1,
    },
    style,
  ];
  const textStyles = [
    styles.text,
    {
      color: isPrimary ? colors.TEXT_ON_PRIMARY : colors.TEXT_ON_SECONDARY,
    },
    textStyle,
  ];
  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator testID="activity-indicator" color={isPrimary ? colors.TEXT_ON_PRIMARY : colors.TEXT_ON_SECONDARY} />
      ) : (
        <Text style={textStyles} allowFontScaling>{children}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 4,
    marginHorizontal: 0,
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: getTheme().typography.FONT_FAMILY,
  },
});

export default React.memo(Button); 