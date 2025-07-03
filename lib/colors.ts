// MedMate Minimal Brand Colors
export const COLORS = {
  BACKGROUND: '#FFFFFF',           // App background (light)
  SURFACE: '#F7F8FA',              // Card/modal surface (off-white, iOS grouped)
  PRIMARY: '#004CBA',              // Main accent (deep blue)
  SECONDARY: '#FFCC2B',            // Secondary accent (yellow)
  OUTLINE: '#004CBA',              // For outlined buttons
  TEXT: '#222222',                 // Main text
  TEXT_ON_PRIMARY: '#FFFFFF',      // Text on blue
  TEXT_ON_SECONDARY: '#004CBA',    // Text on yellow
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

import { Appearance } from 'react-native';

export function getColors(scheme?: 'light' | 'dark') {
  const colorScheme = scheme || Appearance.getColorScheme();
  return colorScheme === 'dark' ? DARK_COLORS : COLORS;
} 