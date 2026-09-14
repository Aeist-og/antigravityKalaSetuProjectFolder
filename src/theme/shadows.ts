import { Platform, ViewStyle } from 'react-native';

export const Shadows: {
  none: ViewStyle;
  soft: ViewStyle;
  medium: ViewStyle;
  prominent: ViewStyle;
  card: ViewStyle;
} = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  soft: {
    shadowColor: '#1D2A44',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  medium: {
    shadowColor: '#1D2A44',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  prominent: {
    shadowColor: '#C85A32',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 6,
  },
  card: {
    shadowColor: '#1D2A44',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
};
