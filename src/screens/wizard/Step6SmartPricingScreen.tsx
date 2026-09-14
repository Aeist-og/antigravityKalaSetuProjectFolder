import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Colors, Typography, Spacing } from '../../constants/colors';
import { Header } from '../../components/common/Header';
import { ProgressBar } from '../../components/common/ProgressBar';
import { Button } from '../../components/common/Button';
import { PricingBreakdownCard } from '../../components/artisan/PricingBreakdownCard';
import { useLanguage } from '../../context/LanguageContext';
import { useProductDraft } from '../../context/ProductDraftContext';

interface Step6SmartPricingScreenProps {
  onBack: () => void;
  onNext: () => void;
}

export const Step6SmartPricingScreen: React.FC<Step6SmartPricingScreenProps> = ({
  onBack,
  onNext,
}) => {
  const { t } = useLanguage();
  const { draft, updatePricing } = useProductDraft();

  return (
    <View style={styles.screen}>
      <Header
        title={t('step6.title')}
        subtitle={t('step6.subtitle')}
        onBack={onBack}
        showLanguageToggle={true}
      />
      <ProgressBar step={6} totalSteps={7} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.guidanceBox}>
          <Text style={styles.guidanceTitle}>⚖️ {t('step6.title').toUpperCase()}</Text>
          <Text style={styles.guidanceText}>{t('step6.pricingNote')}</Text>
        </View>

        <PricingBreakdownCard pricing={draft.pricing} onUpdate={updatePricing} />

        <Button
          title={t('common.next')}
          onPress={onNext}
          size="lg"
          style={styles.continueBtn}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  guidanceBox: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 16,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  guidanceTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primaryDark,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  guidanceText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  continueBtn: {
    marginTop: Spacing.sm,
  },
});
