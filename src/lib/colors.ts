// MedMate Minimal Brand Colors
export const COLORS = {
  BACKGROUND: '#FFFFFF',           // App background (light)
  SURFACE: '#F7F8FA',              // Card/modal surface (off-white, iOS grouped)
  PRIMARY: '#004CBA',              // Main accent (deep blue)
  SECONDARY: '#FFCC2B',            // Secondary accent (yellow)
  OUTLINE: '#004CBA',              // For outlined buttons
  TEXT: '#222222',                 // Main text
  TEXT_ON_PRIMARY: '#FFFFFF',      // Text on blue
  TEXT_ON_SECONDARY: '#000000',    // Text on yellow (changed for better contrast)
  DISABLED: '#E0E0E0',             // Disabled button/input
  BORDER: '#E5E7EB',               // Subtle border for inputs/cards
};

export const DARK_COLORS = {
  BACKGROUND: '#181A20',           // App background (dark)
  SURFACE: '#23272F',              // Card/modal surface
  PRIMARY: '#3ED8F7',              // Main accent (light blue)
  SECONDARY: '#FFCC2B',            // Secondary accent (yellow)
  OUTLINE: '#3ED8F7',              // For outlined buttons
  TEXT: '#FFFFFF',                 // Main text
  TEXT_ON_PRIMARY: '#181A20',      // Text on blue
  TEXT_ON_SECONDARY: '#181A20',    // Text on yellow
  DISABLED: '#23272F',             // Disabled button/input
  BORDER: '#23272F',               // Subtle border for inputs/cards
};

export const SPACING = {
  XS: 4,
  SM: 8,
  MD: 16,
  LG: 24,
  XL: 32,
  XXL: 40,
};

export const TYPOGRAPHY = {
  FONT_FAMILY: 'System',
  FONT_SIZE_XS: 12,
  FONT_SIZE_SM: 14,
  FONT_SIZE_MD: 16,
  FONT_SIZE_LG: 20,
  FONT_SIZE_XL: 24,
  FONT_WEIGHT_REGULAR: '400',
  FONT_WEIGHT_BOLD: '700',
  LINE_HEIGHT: 1.5,
};

import { Appearance } from 'react-native';

export function getColors(scheme?: 'light' | 'dark') {
  const colorScheme = scheme || Appearance.getColorScheme();
  return colorScheme === 'dark' ? DARK_COLORS : COLORS;
}

export function getTheme(scheme?: 'light' | 'dark') {
  return {
    colors: getColors(scheme),
    spacing: SPACING,
    typography: TYPOGRAPHY,
  };
} 