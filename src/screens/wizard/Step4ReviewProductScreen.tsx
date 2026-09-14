import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Colors, Typography, Spacing, Shadows } from '../../constants/colors';
import { Header } from '../../components/common/Header';
import { ProgressBar } from '../../components/common/ProgressBar';
import { Button } from '../../components/common/Button';
import { useLanguage } from '../../context/LanguageContext';
import { useProductDraft } from '../../context/ProductDraftContext';
import { ProductInformation } from '../../models/product';

interface Step4ReviewProductScreenProps {
  onBack: () => void;
  onNext: () => void;
}

export const Step4ReviewProductScreen: React.FC<Step4ReviewProductScreenProps> = ({
  onBack,
  onNext,
}) => {
  const { t } = useLanguage();
  const { draft, updateProductInfo } = useProductDraft();
  const [formData, setFormData] = useState<ProductInformation>(draft.info);
  const [editingField, setEditingField] = useState<string | null>(null);

  const handleFieldChange = (key: keyof ProductInformation, val: string | number) => {
    setFormData(prev => ({ ...prev, [key]: val }));
  };

  const handleSaveAndContinue = () => {
    updateProductInfo(formData);
    onNext();
  };

  const renderField = (
    key: keyof ProductInformation,
    label: string,
    multiline: boolean = false
  ) => {
    const isEditing = editingField === key;
    const value = String(formData[key] || '');

    return (
      <View key={key} style={[styles.fieldCard, isEditing && styles.fieldCardActive]}>
        <View style={styles.fieldHeader}>
          <Text style={styles.fieldLabel}>{label}</Text>
          <TouchableOpacity
            onPress={() => setEditingField(isEditing ? null : key)}
            style={styles.editPill}
          >
            <Text style={styles.editPillText}>
              {isEditing ? `✓ ${t('step4.saveField')}` : `✎ ${t('step4.editField')}`}
            </Text>
          </TouchableOpacity>
        </View>

        {isEditing ? (
          <TextInput
            value={value}
            onChangeText={val => handleFieldChange(key, key === 'productionTimeDays' ? parseInt(val) || 1 : val)}
            multiline={multiline}
            numberOfLines={multiline ? 4 : 1}
            style={[styles.input, multiline && styles.textArea]}
            autoFocus
          />
        ) : (
          <Text style={styles.fieldValue}>
            {value.trim() ? value : <Text style={styles.emptyValText}>Tap to add {label.toLowerCase()}</Text>}
          </Text>
        )}
      </View>
    );
  };

  return (
    <View style={styles.screen}>
      <Header
        title={t('step4.title')}
        subtitle={t('step4.subtitle')}
        onBack={onBack}
        showLanguageToggle={true}
      />
      <ProgressBar step={4} totalSteps={7} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.guidanceBox}>
          <Text style={styles.guidanceText}>💡 {t('step4.reviewNote')}</Text>
        </View>

        {renderField('titleHi', `${t('step4.productName')} (Hindi)`)}
        {renderField('titleEn', `${t('step4.productName')} (English)`)}
        {renderField('craftType', t('step4.craftType'))}
        {renderField('category', t('step4.category'))}
        {renderField('material', t('step4.material'))}
        {renderField('originState', t('step4.origin'))}
        {renderField('productionTimeDays', `${t('step4.productionTime')} (Days)`)}
        {renderField('descriptionHi', t('step4.descriptionHi'), true)}
        {renderField('descriptionEn', t('step4.descriptionEn'), true)}

        <Button
          title={t('common.next')}
          onPress={handleSaveAndContinue}
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
    borderRadius: 14,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  guidanceText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  fieldCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: Spacing.md,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  fieldCardActive: {
    borderColor: Colors.primary,
  },
  fieldHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  fieldLabel: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  editPill: {
    backgroundColor: Colors.surfaceAlt,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  editPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  fieldValue: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text,
    lineHeight: 20,
    fontWeight: '600',
  },
  emptyValText: {
    color: Colors.textMuted,
    fontStyle: 'italic',
    fontWeight: '400',
  },
  input: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: Typography.fontSize.sm,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  continueBtn: {
    marginTop: Spacing.sm,
  },
});
