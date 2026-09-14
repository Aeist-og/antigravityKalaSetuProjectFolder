import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Colors, Typography, Spacing, Shadows } from '../../constants/colors';
import { Header } from '../../components/common/Header';
import { ProgressBar } from '../../components/common/ProgressBar';
import { Button } from '../../components/common/Button';
import { useLanguage } from '../../context/LanguageContext';
import { useProductDraft } from '../../context/ProductDraftContext';

interface Step5MissingInfoScreenProps {
  onBack: () => void;
  onNext: () => void;
}

export const Step5MissingInfoScreen: React.FC<Step5MissingInfoScreenProps> = ({
  onBack,
  onNext,
}) => {
  const { t } = useLanguage();
  const { draft, updateProductInfo } = useProductDraft();

  const [dimensions, setDimensions] = useState<string>(draft.info.dimensions || '');
  const [quantity, setQuantity] = useState<number>(draft.info.quantityAvailable || 1);
  const [customMade, setCustomMade] = useState<boolean>(draft.info.customizationAvailable || false);
  const [careInstructions, setCareInstructions] = useState<string>(draft.info.careInstructions || '');

  const handleContinue = () => {
    updateProductInfo({
      dimensions,
      quantityAvailable: quantity,
      customizationAvailable: customMade,
      careInstructions,
    });
    onNext();
  };

  return (
    <View style={styles.screen}>
      <Header
        title={t('step5.title')}
        subtitle={t('step5.subtitle')}
        onBack={onBack}
        showLanguageToggle={true}
      />
      <ProgressBar step={5} totalSteps={7} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Dimensions */}
        <View style={[styles.fieldCard, Shadows.soft]}>
          <Text style={styles.label}>{t('step5.dimensionsLabel')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('step5.dimensionsPlaceholder')}
            placeholderTextColor={Colors.textMuted}
            value={dimensions}
            onChangeText={setDimensions}
          />
        </View>

        {/* Stock Quantity */}
        <View style={[styles.fieldCard, Shadows.soft]}>
          <Text style={styles.label}>{t('step5.quantityLabel')}</Text>
          <View style={styles.stepperRow}>
            <TouchableOpacity
              onPress={() => setQuantity(prev => Math.max(1, prev - 1))}
              style={styles.stepperBtn}
            >
              <Text style={styles.stepperBtnText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.stepperVal}>{quantity}</Text>
            <TouchableOpacity
              onPress={() => setQuantity(prev => prev + 1)}
              style={styles.stepperBtn}
            >
              <Text style={styles.stepperBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Made to order / customization */}
        <View style={[styles.fieldCard, Shadows.soft]}>
          <Text style={styles.label}>{t('step5.customMadeLabel')}</Text>
          <View style={styles.choiceRow}>
            <TouchableOpacity
              onPress={() => setCustomMade(true)}
              style={[styles.choiceBtn, customMade && styles.choiceBtnActive]}
            >
              <Text style={[styles.choiceBtnText, customMade && styles.choiceBtnTextActive]}>
                {t('step5.yesCustom')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setCustomMade(false)}
              style={[styles.choiceBtn, !customMade && styles.choiceBtnActive]}
            >
              <Text style={[styles.choiceBtnText, !customMade && styles.choiceBtnTextActive]}>
                {t('step5.noCustom')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Care Instructions */}
        <View style={[styles.fieldCard, Shadows.soft]}>
          <Text style={styles.label}>{t('step5.careLabel')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('step5.carePlaceholder')}
            placeholderTextColor={Colors.textMuted}
            value={careInstructions}
            onChangeText={setCareInstructions}
          />
        </View>

        <Button
          title={t('common.next')}
          onPress={handleContinue}
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
  fieldCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  label: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: Typography.fontSize.sm,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  stepperBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  stepperBtnText: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.primary,
  },
  stepperVal: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '800',
    color: Colors.text,
    minWidth: 40,
    textAlign: 'center',
  },
  choiceRow: {
    flexDirection: 'row',
    gap: 10,
  },
  choiceBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  choiceBtnActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  choiceBtnText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  choiceBtnTextActive: {
    color: Colors.primary,
  },
  continueBtn: {
    marginTop: Spacing.sm,
  },
});
