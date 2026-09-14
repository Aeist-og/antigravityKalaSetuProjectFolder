import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Colors, Typography, Spacing } from '../../constants/colors';
import { Header } from '../../components/common/Header';
import { ProgressBar } from '../../components/common/ProgressBar';
import { Button } from '../../components/common/Button';
import { useLanguage } from '../../context/LanguageContext';
import { useProductDraft } from '../../context/ProductDraftContext';
import {
  TemplatePreviewCard,
  CATALOGUE_TEMPLATES,
  CatalogueTemplateOption,
} from '../../components/artisan/TemplatePreviewCard';

interface Step7TemplateSelectScreenProps {
  onBack: () => void;
  onNext: () => void;
}

export const Step7TemplateSelectScreen: React.FC<Step7TemplateSelectScreenProps> = ({
  onBack,
  onNext,
}) => {
  const { t, language } = useLanguage();
  const { draft, setTemplate } = useProductDraft();
  const [selectedTemplate, setSelectedTemplate] = useState<'heritage' | 'modern' | 'storyteller'>(
    (draft.selectedTemplate as 'heritage' | 'modern' | 'storyteller') || 'heritage'
  );

  const handleSelect = (id: 'heritage' | 'modern' | 'storyteller') => {
    setSelectedTemplate(id);
    setTemplate(id);
  };

  const handleContinue = () => {
    setTemplate(selectedTemplate);
    onNext();
  };

  return (
    <View style={styles.screen}>
      <Header
        title={language === 'hi' ? 'कैटलॉग टेम्पलेट चुनें' : 'Choose Catalogue Template'}
        subtitle={
          language === 'hi'
            ? 'अपनी कला और खरीदार के अनुसार दृश्य लेआउट चुनें'
            : 'Select visual layout tailored for your craft and buyers'
        }
        onBack={onBack}
        showLanguageToggle={true}
      />
      <ProgressBar step={7} totalSteps={8} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.introBox}>
          <Text style={styles.introTitle}>
            {language === 'hi' ? '🎨 अपनी प्रस्तुति शैली चुनें' : '🎨 Select Your Presentation Style'}
          </Text>
          <Text style={styles.introDesc}>
            {language === 'hi'
              ? 'प्रत्येक टेम्पलेट आपके हस्तशिल्प की प्रामाणिकता और मूल्य को सबसे प्रभावशाली ढंग से प्रदर्शित करता है।'
              : 'Each template optimizes typography, photo framing, and artisan story highlights for digital buyers.'}
          </Text>
        </View>

        {CATALOGUE_TEMPLATES.map(tmpl => (
          <TemplatePreviewCard
            key={tmpl.id}
            template={tmpl}
            isSelected={selectedTemplate === tmpl.id}
            onSelect={handleSelect}
            lang={language as 'en' | 'hi'}
          />
        ))}

        <View style={styles.footerRow}>
          <Button
            title={language === 'hi' ? '← मूल्य निर्धारण' : '← Smart Pricing'}
            onPress={onBack}
            variant="outline"
            size="lg"
            style={styles.backBtn}
          />
          <Button
            title={language === 'hi' ? 'पूर्वावलोकन →' : 'Preview Catalogue →'}
            onPress={handleContinue}
            size="lg"
            style={styles.nextBtn}
          />
        </View>
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
  introBox: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  introTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 4,
  },
  introDesc: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  footerRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  backBtn: {
    flex: 1,
  },
  nextBtn: {
    flex: 1.5,
  },
});
