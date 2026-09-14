import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Colors, Typography } from '../../constants/colors';

interface BadgeProps {
  label: string;
  variant?: 'primary' | 'accent' | 'secondary' | 'success' | 'outline' | 'danger';
  style?: StyleProp<ViewStyle>;
}

export const Badge: React.FC<BadgeProps> = ({ label, variant = 'primary', style }) => {
  const getColors = () => {
    switch (variant) {
      case 'accent':
        return { bg: Colors.accentLight, text: Colors.accentGold, border: 'transparent' };
      case 'secondary':
        return { bg: Colors.secondaryLight, text: Colors.secondary, border: 'transparent' };
      case 'success':
        return { bg: Colors.successLight, text: Colors.success, border: 'transparent' };
      case 'danger':
        return { bg: '#FFEAEA', text: Colors.error, border: 'transparent' };
      case 'outline':
        return { bg: Colors.surface, text: Colors.textSecondary, border: Colors.border };
      default:
        return { bg: Colors.primaryLight, text: Colors.primary, border: 'transparent' };
    }
  };

  const c = getColors();

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: c.bg, borderColor: c.border, borderWidth: variant === 'outline' ? 1 : 0 },
        style,
      ]}
    >
      <Text style={[styles.text, { color: c.text }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '700',
  },
});
