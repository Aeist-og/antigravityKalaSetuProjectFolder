import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { Colors, Shadows, Spacing } from '../../constants/colors';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  selected?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, style, onPress, selected }) => {
  const containerStyle = [
    styles.card,
    Shadows.soft,
    selected && styles.selected,
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={containerStyle}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={containerStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginVertical: Spacing.xs,
  },
  selected: {
    borderColor: Colors.primary,
    borderWidth: 2,
    backgroundColor: Colors.primaryLight,
  },
});
