import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Colors, Typography, Spacing, Shadows } from '../constants/colors';
import { Header } from '../components/common/Header';
import { Button } from '../components/common/Button';
import { useLanguage } from '../context/LanguageContext';
import { AppLanguage } from '../i18n';

interface LanguageSelectScreenProps {
  onBack?: () => void;
  onConfirm?: () => void;
}

export const LanguageSelectScreen: React.FC<LanguageSelectScreenProps> = ({ onBack, onConfirm }) => {
  const { language, setLanguage, t } = useLanguage();
  const [selected, setSelected] = useState<AppLanguage>(language);

  const languages: { code: AppLanguage; label: string; script: string }[] = [
    { code: 'hi', label: 'हिंदी', script: 'Hindi (National / Standard Devanagari)' },
    { code: 'en', label: 'English', script: 'English (Indian Commercial / Marketplace)' },
  ];

  const handleConfirm = async () => {
    await setLanguage(selected);
    if (onConfirm) onConfirm();
  };

  return (
    <View style={styles.screen}>
      <Header
        title={t('language.title')}
        subtitle={t('language.subtitle')}
        onBack={onBack}
        showLanguageToggle={false}
      />

      <ScrollView contentContainerStyle={styles.content}>
        {languages.map(item => {
          const isSelected = selected === item.code;
          return (
            <TouchableOpacity
              key={item.code}
              activeOpacity={0.8}
              onPress={() => setSelected(item.code)}
              style={[
                styles.langCard,
                isSelected && styles.langCardSelected,
                Shadows.soft,
              ]}
            >
              <View style={styles.langInfo}>
                <Text style={[styles.langLabel, isSelected && styles.langLabelSelected]}>
                  {item.label}
                </Text>
                <Text style={styles.langScript}>{item.script}</Text>
              </View>

              <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
                {isSelected && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>
          );
        })}

        <Button
          title={t('language.confirm')}
          onPress={handleConfirm}
          size="lg"
          style={styles.confirmBtn}
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
    gap: Spacing.sm,
  },
  langCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  langCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  langInfo: {
    flex: 1,
  },
  langLabel: {
    fontSize: Typography.fontSize.md,
    fontWeight: '700',
    color: Colors.text,
  },
  langLabelSelected: {
    color: Colors.primaryDark,
  },
  langScript: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterSelected: {
    borderColor: Colors.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },
  confirmBtn: {
    marginTop: Spacing.md,
  },
});
