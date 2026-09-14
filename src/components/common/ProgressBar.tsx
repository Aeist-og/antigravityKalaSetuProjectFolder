import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '../../constants/colors';
import { useLanguage } from '../../context/LanguageContext';

interface ProgressBarProps {
  step: number;
  totalSteps?: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ step, totalSteps = 7 }) => {
  const { t } = useLanguage();
  const progressPercent = Math.min(Math.max((step / totalSteps) * 100, 5), 100);

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.stepLabel}>
          {t('wizard.step')} {step} / {totalSteps}
        </Text>
        <Text style={styles.percentLabel}>{Math.round(progressPercent)}%</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${progressPercent}%` }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    backgroundColor: Colors.background,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  stepLabel: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '700',
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  percentLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  track: {
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.border,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
});
