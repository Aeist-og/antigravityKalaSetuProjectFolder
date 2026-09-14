import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { Colors, Typography, Spacing, Shadows } from '../../constants/colors';
import { Header } from '../../components/common/Header';
import { ProgressBar } from '../../components/common/ProgressBar';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { useLanguage } from '../../context/LanguageContext';
import { useProductDraft } from '../../context/ProductDraftContext';

interface Step7ReviewPublishScreenProps {
  onBack: () => void;
  onJumpToStep: (step: number) => void;
  onFinish: () => void;
}

export const Step7ReviewPublishScreen: React.FC<Step7ReviewPublishScreenProps> = ({
  onBack,
  onJumpToStep,
  onFinish,
}) => {
  const { t } = useLanguage();
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
        setFeedback(t('step7.draftSavedSuccess'));
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
        setFeedback(t('step7.publishedSuccess'));
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

  return (
    <View style={styles.screen}>
      <Header
        title={t('step7.title')}
        subtitle={t('step7.subtitle')}
        onBack={onBack}
        showLanguageToggle={true}
      />
      <ProgressBar step={7} totalSteps={7} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {feedback && (
          <View style={styles.feedbackBanner}>
            <Text style={styles.feedbackText}>✓ {feedback}</Text>
          </View>
        )}

        {/* Product Card Preview */}
        <View style={[styles.previewCard, Shadows.soft]}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.productImage} />
          ) : (
            <View style={styles.noImageBox}>
              <Text style={{ fontSize: 32 }}>📷</Text>
            </View>
          )}

          <View style={styles.cardBody}>
            <View style={styles.tagRow}>
              <Badge label={draft.info.craftType || 'Craft'} variant="primary" />
              <Badge label={draft.info.category || 'Handicrafts'} variant="outline" />
            </View>

            <Text style={styles.productTitle}>
              {draft.info.titleHi || draft.info.titleEn || 'Handcrafted Product'}
            </Text>

            {draft.info.titleEn && draft.info.titleHi ? (
              <Text style={styles.subTitleEn}>{draft.info.titleEn}</Text>
            ) : null}

            <Text style={styles.productPrice}>₹{draft.pricing.finalListingPrice}</Text>

            <View style={styles.divider} />

            <View style={styles.specGrid}>
              <View style={styles.specItem}>
                <Text style={styles.specLabel}>{t('step4.material')}</Text>
                <Text style={styles.specVal}>{draft.info.material || '—'}</Text>
              </View>
              <View style={styles.specItem}>
                <Text style={styles.specLabel}>{t('step4.origin')}</Text>
                <Text style={styles.specVal}>{draft.info.originState || 'India'}</Text>
              </View>
              <View style={styles.specItem}>
                <Text style={styles.specLabel}>{t('step4.productionTime')}</Text>
                <Text style={styles.specVal}>{draft.info.productionTimeDays} Days</Text>
              </View>
              <View style={styles.specItem}>
                <Text style={styles.specLabel}>{t('step5.dimensionsLabel')}</Text>
                <Text style={styles.specVal}>{draft.info.dimensions || '—'}</Text>
              </View>
            </View>

            {draft.info.descriptionHi || draft.info.descriptionEn ? (
              <View style={styles.descBox}>
                <Text style={styles.descTitle}>Description</Text>
                <Text style={styles.descText}>
                  {draft.info.descriptionHi || draft.info.descriptionEn}
                </Text>
              </View>
            ) : null}

            <TouchableOpacity onPress={() => onJumpToStep(4)} style={styles.editLink}>
              <Text style={styles.editLinkText}>✎ Edit Details</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionBtnRow}>
          <Button
            title={t('step7.saveDraft')}
            onPress={handleSaveDraft}
            variant="outline"
            size="lg"
            loading={loading}
            style={styles.actionBtn}
          />

          <Button
            title={t('step7.publish')}
            onPress={handlePublish}
            size="lg"
            loading={loading}
            style={styles.actionBtn}
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
  previewCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
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
  cardBody: {
    padding: Spacing.md,
  },
  tagRow: {
    flexDirection: 'row',
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
  productPrice: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '800',
    color: Colors.primaryDark,
    marginTop: 6,
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
    color: Colors.textSecondary,
  },
  specVal: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text,
    fontWeight: '600',
    marginTop: 2,
  },
  descBox: {
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceAlt,
  },
  descTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  descText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text,
    lineHeight: 18,
  },
  editLink: {
    marginTop: Spacing.md,
    alignSelf: 'flex-start',
  },
  editLinkText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '700',
    color: Colors.primary,
  },
  actionBtnRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionBtn: {
    flex: 1,
  },
});
