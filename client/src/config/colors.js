// Centralized color palette configuration
// All color changes should be made here to update the entire application theme

const colorPalette = {
  // Primary color scheme (Indigo theme)
  primary: {
    50: '#eef2ff',    // Light background
    100: '#e0e7ff',   // Light accent
    300: '#a5b4fc',   // Medium accent
    500: '#6366f1',   // Primary color (main brand color)
    700: '#4f46e5',   // Dark accent
    800: '#4338ca',   // Darker accent
    900: '#312e81',   // Dark background/text
  },
  
  // Semantic colors
  success: {
    50: '#f0fdf4',    // Light success background
    500: '#22c55e',   // Success color
    700: '#15803d',   // Dark success
    800: '#166534',   // Darker success
  },
  
  warning: {
    50: '#fff7ed',    // Light warning background
    500: '#f97316',   // Warning color
    700: '#c2410c',   // Dark warning
    800: '#9a3412',   // Darker warning
  },
  
  error: {
    50: '#fef2f2',    // Light error background
    500: '#ef4444',   // Error color
    700: '#b91c1c',   // Dark error
    800: '#991b1b',   // Darker error
  },
  
  info: {
    50: '#eff6ff',    // Light info background
    500: '#3b82f6',   // Info color
    700: '#1d4ed8',   // Dark info
    800: '#1e40af',   // Darker info
  },
  
  // Grayscale
  gray: {
    100: '#f5f5f5',   // Background
    300: '#d4d4d4',   // Borders
    900: '#171717',   // Text
  }
};

// CSS variables for use in components
const cssVariables = {
  '--primary-color': colorPalette.primary[500],
  '--secondary-color': colorPalette.primary[700],
  '--accent-color': colorPalette.primary[100],
  '--success-color': colorPalette.success[500],
  '--danger-color': colorPalette.error[500],
  '--warning-color': colorPalette.warning[500],
  '--dark-color': colorPalette.primary[900],
  '--light-color': colorPalette.primary[50],
  '--gray-color': colorPalette.primary[300],
};

module.exports = {
  colorPalette,
  cssVariables
};