import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Typography, Spacing, Shadows } from '../../constants/colors';
import { Badge } from '../common/Badge';

export interface CatalogueTemplateOption {
  id: 'heritage' | 'modern' | 'storyteller';
  titleEn: string;
  titleHi: string;
  subtitleEn: string;
  subtitleHi: string;
  tag: string;
  tagVariant: 'primary' | 'secondary' | 'accent' | 'success';
  previewBg: string;
  borderColor: string;
  features: string[];
}

export const CATALOGUE_TEMPLATES: CatalogueTemplateOption[] = [
  {
    id: 'heritage',
    titleEn: 'Heritage Classic',
    titleHi: 'पारंपरिक हेरिटेज',
    subtitleEn: 'Rich Indian craft identity with warm tones & artisan legacy',
    subtitleHi: 'पारंपरिक भारतीय पहचान और कारीगर विरासत',
    tag: 'Popular for Textiles',
    tagVariant: 'primary',
    previewBg: '#FDF8F3',
    borderColor: Colors.primary,
    features: ['Earthy borders', 'Bilingual titles', 'GI & Origin badge focus'],
  },
  {
    id: 'modern',
    titleEn: 'Modern Minimalist',
    titleHi: 'आधुनिक मिनिमलिस्ट',
    subtitleEn: 'Clean gallery styling for high-end boutique & urban buyers',
    subtitleHi: 'बुटीक और शहरी खरीदारों के लिए स्वच्छ आधुनिक लेआउट',
    tag: 'Best for Decor & Pottery',
    tagVariant: 'secondary',
    previewBg: '#FAFAFA',
    borderColor: Colors.secondary,
    features: ['Clean white canvas', 'Bold studio photography', 'Direct pricing breakdown'],
  },
  {
    id: 'storyteller',
    titleEn: 'Storyteller Narrative',
    titleHi: 'शिल्प कथा',
    subtitleEn: 'Highlights craft journey, generational secrets & video reel',
    subtitleHi: 'कारीगरी की यात्रा, निर्माण प्रक्रिया और लोक कथा',
    tag: 'Recommended for Tribal Art',
    tagVariant: 'accent',
    previewBg: '#F5F3FF',
    borderColor: Colors.accentGold,
    features: ['Artisan voice quote', 'Making process timeline', 'Eco-friendly tag'],
  },
];

interface TemplatePreviewCardProps {
  template: CatalogueTemplateOption;
  isSelected: boolean;
  onSelect: (id: 'heritage' | 'modern' | 'storyteller') => void;
  lang?: 'en' | 'hi';
}

export const TemplatePreviewCard: React.FC<TemplatePreviewCardProps> = ({
  template,
  isSelected,
  onSelect,
  lang = 'en',
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={() => onSelect(template.id)}
      style={[
        styles.card,
        Shadows.soft,
        isSelected && [styles.cardSelected, { borderColor: template.borderColor }],
      ]}
    >
      <View style={[styles.previewHeader, { backgroundColor: template.previewBg }]}>
        <View style={styles.topBadgeRow}>
          <Badge label={template.tag} variant={template.tagVariant} />
          <View style={[styles.radioOuter, isSelected && { borderColor: template.borderColor }]}>
            {isSelected && <View style={[styles.radioInner, { backgroundColor: template.borderColor }]} />}
          </View>
        </View>

        <Text style={styles.title}>
          {lang === 'hi' ? template.titleHi : template.titleEn}
        </Text>
        <Text style={styles.subTitle}>
          {lang === 'hi' ? template.subtitleHi : template.subtitleEn}
        </Text>
      </View>

      <View style={styles.body}>
        <Text style={styles.featureLabel}>Highlights:</Text>
        <View style={styles.featuresRow}>
          {template.features.map((feat, idx) => (
            <View key={idx} style={styles.featureItem}>
              <Text style={styles.checkMark}>✓</Text>
              <Text style={styles.featureText}>{feat}</Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: Colors.border,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  cardSelected: {
    borderWidth: 2.5,
  },
  previewHeader: {
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  topBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: Typography.fontSize.md,
    fontWeight: '800',
    color: Colors.text,
  },
  subTitle: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    marginTop: 4,
    lineHeight: 16,
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surface,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  body: {
    padding: Spacing.md,
    backgroundColor: Colors.surface,
  },
  featureLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  featuresRow: {
    gap: 4,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  checkMark: {
    fontSize: 12,
    color: Colors.success,
    fontWeight: 'bold',
  },
  featureText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
  },
});
