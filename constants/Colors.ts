/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

// Primary colors
const primaryBlue = '#456EFD';
const primaryBlack = '#050914';
const primaryWhite = '#FFFFFF';

// Derived colors
const lightBackground = '#F1F2F4';
const darkBackground = '#121520';
const lightBlueVariant = '#6B8AFE';
const darkBlueVariant = '#3A5AD8';

export const Colors = {
  light: {
    text: primaryBlack,
    background: lightBackground,
    tint: primaryBlue,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: primaryBlue,
    cardBackground: primaryWhite,
    primaryBlue: primaryBlue,
    primaryBlack: primaryBlack,
    primaryWhite: primaryWhite,
  },
  dark: {
    text: primaryWhite,
    background: primaryBlack,
    tint: primaryBlue,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: primaryBlue,
    cardBackground: darkBackground,
    primaryBlue: primaryBlue,
    primaryBlack: primaryBlack,
    primaryWhite: primaryWhite,
  },
};
