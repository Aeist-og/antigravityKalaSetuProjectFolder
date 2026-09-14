import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { Colors, Typography, Spacing } from '../../constants/colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: string;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
}) => {
  const getContainerStyle = () => {
    switch (variant) {
      case 'secondary':
        return styles.secondary;
      case 'outline':
        return styles.outline;
      case 'ghost':
        return styles.ghost;
      default:
        return styles.primary;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'secondary':
        return styles.secondaryText;
      case 'outline':
        return styles.outlineText;
      case 'ghost':
        return styles.ghostText;
      default:
        return styles.primaryText;
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.base,
        getContainerStyle(),
        size === 'sm' && styles.sizeSm,
        size === 'lg' && styles.sizeLg,
        disabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#FFF' : Colors.primary} />
      ) : (
        <Text style={[styles.baseText, getTextStyle(), textStyle]}>
          {icon ? icon + '  ' : ''}{title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  sizeSm: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  sizeLg: {
    paddingVertical: 18,
    paddingHorizontal: Spacing.lg,
    borderRadius: 16,
  },
  primary: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  secondary: {
    backgroundColor: Colors.secondary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.5,
  },
  baseText: {
    fontWeight: '700',
    fontSize: Typography.fontSize.md,
  },
  primaryText: {
    color: '#FFFFFF',
  },
  secondaryText: {
    color: '#FFFFFF',
  },
  outlineText: {
    color: Colors.text,
  },
  ghostText: {
    color: Colors.primary,
  },
});
