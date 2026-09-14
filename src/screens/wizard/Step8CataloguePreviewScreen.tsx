import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { Colors, Typography, Spacing, Shadows } from '../../constants/colors';
import { Header } from '../../components/common/Header';
import { ProgressBar } from '../../components/common/ProgressBar';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { useLanguage } from '../../context/LanguageContext';
import { useProductDraft } from '../../context/ProductDraftContext';

interface Step8CataloguePreviewScreenProps {
  onBack: () => void;
  onJumpToStep: (step: number) => void;
  onFinish: () => void;
}

export const Step8CataloguePreviewScreen: React.FC<Step8CataloguePreviewScreenProps> = ({
  onBack,
  onJumpToStep,
  onFinish,
}) => {
  const { t, language } = useLanguage();
  const { draft, saveDraftToDatabase, publishProduct } = useProductDraft();
  const [loading, setLoading] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const photoUri = draft.isEnhanced && draft.enhancedImageUri
    ? draft.enhancedImageUri
    : draft.localImageUri;

  const handleSaveDraft = async () => {
    setLoading(true);
    try {
      const res = await saveDraftToDatabase();
      if (res.success) {
        setFeedback(language === 'hi' ? 'प्रारूप सुरक्षित सहेजा गया ✓' : 'Draft Saved Safely ✓');
        setTimeout(() => {
          onFinish();
        }, 1000);
      } else {
        Alert.alert('Save Draft', res.error || 'Failed to save draft');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    setLoading(true);
    try {
      const res = await publishProduct();
      if (res.success) {
        setFeedback(language === 'hi' ? 'कैटलॉग सफलतापूर्वक प्रकाशित किया गया! 🎉' : 'Catalogue Published Successfully! 🎉');
        setTimeout(() => {
          onFinish();
        }, 1200);
      } else {
        Alert.alert('Publish', res.error || 'Failed to publish product');
      }
    } finally {
      setLoading(false);
    }
  };

  const templateTheme = draft.selectedTemplate || 'heritage';
  const themeBorderColor =
    templateTheme === 'modern'
      ? Colors.secondary
      : templateTheme === 'storyteller'
      ? Colors.accentGold
      : Colors.primary;

  return (
    <View style={styles.screen}>
      <Header
        title={language === 'hi' ? 'कैटलॉग पूर्वावलोकन' : 'Catalogue Preview'}
        subtitle={
          language === 'hi'
            ? 'प्रकाशन से पहले अपने डिजिटल कैटलॉग की समीक्षा करें'
            : 'Review your complete digital catalogue before publishing'
        }
        onBack={onBack}
        showLanguageToggle={true}
      />
      <ProgressBar step={8} totalSteps={8} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {feedback && (
          <View style={styles.feedbackBanner}>
            <Text style={styles.feedbackText}>{feedback}</Text>
          </View>
        )}

        {/* Template Badge Indicator */}
        <View style={styles.templateBadgeRow}>
          <Text style={styles.templateStyleLabel}>
            {language === 'hi' ? 'चयनित टेम्पलेट:' : 'Active Layout:'}
          </Text>
          <Badge
            label={
              templateTheme === 'modern'
                ? 'Modern Minimalist'
                : templateTheme === 'storyteller'
                ? 'Storyteller Narrative'
                : 'Heritage Classic'
            }
            variant={templateTheme === 'modern' ? 'secondary' : 'primary'}
          />
        </View>

        {/* Product Card Preview Styled per Template */}
        <View style={[styles.previewCard, Shadows.medium, { borderColor: themeBorderColor }]}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.productImage} />
          ) : (
            <View style={styles.noImageBox}>
              <Text style={{ fontSize: 32 }}>🏺</Text>
            </View>
          )}

          {draft.isEnhanced && (
            <View style={styles.enhancedTag}>
              <Text style={styles.enhancedTagText}>✨ AI Studio Enhanced</Text>
            </View>
          )}

          <View style={styles.cardBody}>
            <View style={styles.tagRow}>
              <Badge label={draft.info.craftType || 'Traditional Craft'} variant="primary" />
              <Badge label={draft.info.category || 'Handicrafts'} variant="outline" />
              <Badge label={`${draft.info.originState || 'India'}`} variant="accent" />
            </View>

            <Text style={styles.productTitle}>
              {draft.info.titleHi || draft.info.titleEn || 'Handcrafted Masterpiece'}
            </Text>

            {draft.info.titleEn && draft.info.titleHi ? (
              <Text style={styles.subTitleEn}>{draft.info.titleEn}</Text>
            ) : null}

            <View style={styles.priceRow}>
              <Text style={styles.productPrice}>₹{draft.pricing.finalListingPrice}</Text>
              <Text style={styles.fairWageAssurance}>⚖️ Smart Pricing Verified</Text>
            </View>

            <View style={styles.divider} />

            {/* Craft Specs Grid */}
            <View style={styles.specGrid}>
              <View style={styles.specItem}>
                <Text style={styles.specLabel}>{t('step4.material') || 'Material'}</Text>
                <Text style={styles.specVal}>{draft.info.material || 'Natural / Handloom'}</Text>
              </View>
              <View style={styles.specItem}>
                <Text style={styles.specLabel}>{t('step4.origin') || 'Origin'}</Text>
                <Text style={styles.specVal}>{draft.info.originState || 'India'}</Text>
              </View>
              <View style={styles.specItem}>
                <Text style={styles.specLabel}>{t('step4.productionTime') || 'Making Time'}</Text>
                <Text style={styles.specVal}>{draft.info.productionTimeDays} Days</Text>
              </View>
              <View style={styles.specItem}>
                <Text style={styles.specLabel}>{t('step5.dimensionsLabel') || 'Dimensions'}</Text>
                <Text style={styles.specVal}>{draft.info.dimensions || 'Standard'}</Text>
              </View>
            </View>

            {/* Description & Story */}
            {draft.info.descriptionHi || draft.info.descriptionEn || draft.voiceTranscript ? (
              <View style={styles.descBox}>
                <Text style={styles.descTitle}>
                  {templateTheme === 'storyteller' ? '📖 Artisan Craft Story' : 'Description'}
                </Text>
                <Text style={styles.descText}>
                  {draft.info.descriptionHi || draft.info.descriptionEn || draft.voiceTranscript}
                </Text>
              </View>
            ) : null}

            <TouchableOpacity onPress={() => onJumpToStep(4)} style={styles.editLink}>
              <Text style={styles.editLinkText}>✎ {language === 'hi' ? 'विवरण संपादित करें' : 'Edit Details'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Action Controls */}
        <View style={styles.actionsContainer}>
          <View style={styles.actionBtnRow}>
            <Button
              title={language === 'hi' ? '💾 ड्राफ्ट सहेजें' : '💾 Save Draft'}
              onPress={handleSaveDraft}
              variant="outline"
              size="lg"
              loading={loading}
              style={styles.actionBtn}
            />

            <Button
              title={language === 'hi' ? '🚀 प्रकाशित करें' : '🚀 Publish Catalogue'}
              onPress={handlePublish}
              size="lg"
              loading={loading}
              style={styles.actionBtn}
            />
          </View>

          <Button
            title={language === 'hi' ? '← होम पर वापस जाएं' : '← Return Home'}
            onPress={onFinish}
            variant="ghost"
            size="md"
            style={styles.returnHomeBtn}
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
  feedbackBanner: {
    backgroundColor: Colors.successLight,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.success,
  },
  feedbackText: {
    color: Colors.success,
    fontSize: Typography.fontSize.sm,
    fontWeight: '700',
    textAlign: 'center',
  },
  templateBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: Spacing.sm,
  },
  templateStyleLabel: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  previewCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    marginBottom: Spacing.lg,
  },
  productImage: {
    width: '100%',
    height: 260,
    resizeMode: 'cover',
  },
  noImageBox: {
    width: '100%',
    height: 180,
    backgroundColor: Colors.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
  },
  enhancedTag: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  enhancedTagText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
  cardBody: {
    padding: Spacing.md,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  productTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '800',
    color: Colors.text,
  },
  subTitleEn: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  productPrice: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '800',
    color: Colors.primaryDark,
  },
  fairWageAssurance: {
    fontSize: 11,
    color: Colors.success,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.md,
  },
  specGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  specItem: {
    width: '46%',
  },
  specLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
    textTransform: 'uppercase',
  },
  specVal: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 2,
  },
  descBox: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 12,
    padding: Spacing.md,
    marginTop: Spacing.md,
  },
  descTitle: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '700',
    color: Colors.textMuted,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  descText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text,
    lineHeight: 20,
  },
  editLink: {
    marginTop: Spacing.md,
    alignSelf: 'flex-start',
  },
  editLinkText: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: Typography.fontSize.sm,
  },
  actionsContainer: {
    gap: Spacing.sm,
  },
  actionBtnRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  actionBtn: {
    flex: 1,
  },
  returnHomeBtn: {
    marginTop: Spacing.xs,
  },
});
