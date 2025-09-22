/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { glassTheme } from '../constants/theme';
import { useColorScheme } from '../hooks/use-color-scheme';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName?: string
) {
  const theme = useColorScheme() ?? 'light';
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    // Return a default background color from our glass theme
    return theme === 'dark' ? '#1A202C' : '#FFFFFF';
  }
}
