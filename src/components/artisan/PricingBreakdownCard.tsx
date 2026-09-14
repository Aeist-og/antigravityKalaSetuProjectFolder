import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '../../constants/colors';
import { PricingCalculationResult, PricingCalculationInput } from '../../models/pricing';
import { useLanguage } from '../../context/LanguageContext';

interface PricingBreakdownCardProps {
  pricing: PricingCalculationResult;
  onUpdate: (updated: Partial<PricingCalculationInput>) => void;
}

export const PricingBreakdownCard: React.FC<PricingBreakdownCardProps> = ({ pricing, onUpdate }) => {
  const { t } = useLanguage();

  const adjustValue = (key: keyof PricingCalculationInput, delta: number, minVal: number = 0) => {
    const current = (pricing[key as keyof PricingCalculationResult] as number) || 0;
    const next = Math.max(minVal, current + delta);
    onUpdate({ [key]: next });
  };

  return (
    <View style={styles.container}>
      {/* 1. Material Cost */}
      <View style={styles.inputRow}>
        <View style={styles.labelCol}>
          <Text style={styles.rowLabel}>{t('step6.materialCost')}</Text>
          <Text style={styles.rowDesc}>{t('step6.materialCostDesc')}</Text>
        </View>
        <View style={styles.stepperContainer}>
          <TouchableOpacity
            onPress={() => adjustValue('materialCost', -50, 0)}
            style={styles.stepperBtn}
          >
            <Text style={styles.stepperBtnText}>−</Text>
          </TouchableOpacity>
          <Text style={styles.stepperVal}>₹{pricing.materialCost}</Text>
          <TouchableOpacity
            onPress={() => adjustValue('materialCost', 50)}
            style={styles.stepperBtn}
          >
            <Text style={styles.stepperBtnText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. Days of Labor */}
      <View style={styles.inputRow}>
        <View style={styles.labelCol}>
          <Text style={styles.rowLabel}>{t('step6.daysOfLabor')}</Text>
          <Text style={styles.rowDesc}>{t('step6.daysOfLaborDesc')}</Text>
        </View>
        <View style={styles.stepperContainer}>
          <TouchableOpacity
            onPress={() => adjustValue('labourDays', -0.5, 0.5)}
            style={styles.stepperBtn}
          >
            <Text style={styles.stepperBtnText}>−</Text>
          </TouchableOpacity>
          <Text style={styles.stepperVal}>{pricing.labourDays} d</Text>
          <TouchableOpacity
            onPress={() => adjustValue('labourDays', 0.5)}
            style={styles.stepperBtn}
          >
            <Text style={styles.stepperBtnText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 3. Daily Wage */}
      <View style={styles.inputRow}>
        <View style={styles.labelCol}>
          <Text style={styles.rowLabel}>{t('step6.dailyWage')}</Text>
          <Text style={styles.rowDesc}>{t('step6.dailyWageDesc')}</Text>
        </View>
        <View style={styles.stepperContainer}>
          <TouchableOpacity
            onPress={() => adjustValue('labourCostPerDay', -50, 200)}
            style={styles.stepperBtn}
          >
            <Text style={styles.stepperBtnText}>−</Text>
          </TouchableOpacity>
          <Text style={styles.stepperVal}>₹{pricing.labourCostPerDay}</Text>
          <TouchableOpacity
            onPress={() => adjustValue('labourCostPerDay', 50)}
            style={styles.stepperBtn}
          >
            <Text style={styles.stepperBtnText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 4. Packaging */}
      <View style={styles.inputRow}>
        <View style={styles.labelCol}>
          <Text style={styles.rowLabel}>{t('step6.packaging')}</Text>
          <Text style={styles.rowDesc}>{t('step6.packagingDesc')}</Text>
        </View>
        <View style={styles.stepperContainer}>
          <TouchableOpacity
            onPress={() => adjustValue('packagingCost', -20, 0)}
            style={styles.stepperBtn}
          >
            <Text style={styles.stepperBtnText}>−</Text>
          </TouchableOpacity>
          <Text style={styles.stepperVal}>₹{pricing.packagingCost}</Text>
          <TouchableOpacity
            onPress={() => adjustValue('packagingCost', 20)}
            style={styles.stepperBtn}
          >
            <Text style={styles.stepperBtnText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 5. Margin Percent */}
      <View style={styles.inputRow}>
        <View style={styles.labelCol}>
          <Text style={styles.rowLabel}>{t('step6.margin')}</Text>
          <Text style={styles.rowDesc}>{t('step6.marginDesc')}</Text>
        </View>
        <View style={styles.stepperContainer}>
          <TouchableOpacity
            onPress={() => adjustValue('marginPercent', -5, 5)}
            style={styles.stepperBtn}
          >
            <Text style={styles.stepperBtnText}>−</Text>
          </TouchableOpacity>
          <Text style={styles.stepperVal}>{pricing.marginPercent}%</Text>
          <TouchableOpacity
            onPress={() => adjustValue('marginPercent', 5, 5)}
            style={styles.stepperBtn}
          >
            <Text style={styles.stepperBtnText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Summary Highlight Box */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <Text style={styles.summaryBadge}>⚖️ TRANSPARENT COST BREAKDOWN</Text>
          <Text style={styles.formulaText}>
            Cost ₹{pricing.totalCalculatedCost} + {pricing.marginPercent}% Margin
          </Text>
        </View>

        <View style={styles.priceRow}>
          <View>
            <Text style={styles.suggestedLabel}>{t('step6.suggestedTitle')}</Text>
            <Text style={styles.suggestedPrice}>₹{pricing.suggestedRetailPrice}</Text>
          </View>
          <View style={styles.bulkBox}>
            <Text style={styles.bulkLabel}>Bulk / B2B Benchmark</Text>
            <Text style={styles.bulkPrice}>₹{pricing.suggestedBulkPrice}</Text>
          </View>
        </View>

        {/* Final Price Override */}
        <View style={styles.finalInputRow}>
          <Text style={styles.finalPriceLabel}>{t('step6.finalPriceLabel')}</Text>
          <View style={styles.stepperContainer}>
            <TouchableOpacity
              onPress={() => adjustValue('finalPriceOverride', -50, 50)}
              style={styles.stepperBtn}
            >
              <Text style={styles.stepperBtnText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.finalPriceValue}>₹{pricing.finalListingPrice}</Text>
            <TouchableOpacity
              onPress={() => adjustValue('finalPriceOverride', 50)}
              style={styles.stepperBtn}
            >
              <Text style={styles.stepperBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginVertical: Spacing.xs,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceAlt,
  },
  labelCol: {
    flex: 1,
    paddingRight: Spacing.sm,
  },
  rowLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '700',
    color: Colors.text,
  },
  rowDesc: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 20,
    padding: 3,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  stepperBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  stepperBtnText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
    lineHeight: 20,
  },
  stepperVal: {
    paddingHorizontal: 10,
    fontSize: Typography.fontSize.sm,
    fontWeight: '700',
    color: Colors.text,
    minWidth: 70,
    textAlign: 'center',
  },
  summaryCard: {
    marginTop: Spacing.md,
    backgroundColor: Colors.primaryLight,
    borderRadius: 16,
    padding: Spacing.md,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primaryDark,
    letterSpacing: 0.5,
  },
  formulaText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingVertical: 6,
  },
  suggestedLabel: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  suggestedPrice: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: '800',
    color: Colors.primaryDark,
  },
  bulkBox: {
    alignItems: 'flex-end',
  },
  bulkLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
  },
  bulkPrice: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '700',
    color: Colors.secondary,
    marginTop: 2,
  },
  finalInputRow: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(200, 90, 50, 0.2)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  finalPriceLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '700',
    color: Colors.text,
  },
  finalPriceValue: {
    paddingHorizontal: 12,
    fontSize: Typography.fontSize.md,
    fontWeight: '800',
    color: Colors.primaryDark,
    minWidth: 80,
    textAlign: 'center',
  },
});
