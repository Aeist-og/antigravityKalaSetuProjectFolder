import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator } from 'react-native';
import { Colors, Typography, Spacing, Shadows } from '../../constants/colors';
import { Header } from '../../components/common/Header';
import { ProgressBar } from '../../components/common/ProgressBar';
import { Button } from '../../components/common/Button';
import { ImageCompareModal } from '../../components/artisan/ImageCompareModal';
import { useLanguage } from '../../context/LanguageContext';
import { useProductDraft } from '../../context/ProductDraftContext';
import { imageService } from '../../services/image/imageService';

interface Step2ImageStudioScreenProps {
  onBack: () => void;
  onNext: () => void;
}

export const Step2ImageStudioScreen: React.FC<Step2ImageStudioScreenProps> = ({ onBack, onNext }) => {
  const { t } = useLanguage();
  const { draft, setEnhancedImage } = useProductDraft();
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [serviceMessage, setServiceMessage] = useState<string | null>(null);

  useEffect(() => {
    if (draft.localImageUri && !draft.isEnhanced && imageService.isConfigured()) {
      runRealEnhancement();
    } else if (!imageService.isConfigured()) {
      setServiceMessage(t('step2.enhancementUnavailable'));
    }
  }, [draft.localImageUri]);

  const runRealEnhancement = async () => {
    if (!draft.localImageUri) return;
    setIsProcessing(true);
    setServiceMessage(null);

    try {
      const res = await imageService.enhanceImage(draft.localImageUri);
      if (res.success && res.enhancedUri) {
        setEnhancedImage(res.enhancedUri);
      } else {
        setServiceMessage(res.errorMessage || t('step2.enhancementUnavailable'));
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.screen}>
      <Header
        title={t('step2.title')}
        subtitle={t('step2.subtitle')}
        onBack={onBack}
        showLanguageToggle={true}
      />
      <ProgressBar step={2} totalSteps={7} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {isProcessing ? (
          <View style={[styles.processingCard, Shadows.soft]}>
            <ActivityIndicator size="large" color={Colors.primary} style={{ marginBottom: 16 }} />
            <Text style={styles.processingTitle}>{t('step2.processingTitle')}</Text>
            <Text style={styles.processingSub}>Connecting to image enhancement service...</Text>
          </View>
        ) : (
          <>
            {/* If enhanced image is available, show compare tool, else show original */}
            {draft.isEnhanced && draft.enhancedImageUri ? (
              <ImageCompareModal
                originalUri={draft.localImageUri || ''}
                enhancedUri={draft.enhancedImageUri}
                onRetake={onBack}
              />
            ) : (
              <View style={[styles.photoWrap, Shadows.soft]}>
                {draft.localImageUri ? (
                  <Image source={{ uri: draft.localImageUri }} style={styles.mainPhoto} />
                ) : null}
              </View>
            )}

            {/* Clear, honest service status note */}
            {serviceMessage && (
              <View style={styles.serviceNoteBox}>
                <Text style={styles.serviceNoteTitle}>ℹ️ AI Studio Status</Text>
                <Text style={styles.serviceNoteText}>{serviceMessage}</Text>
              </View>
            )}
          </>
        )}

        <View style={styles.btnRow}>
          <Button
            title={t('step2.retake')}
            onPress={onBack}
            variant="outline"
            style={styles.retakeBtn}
          />
          <Button
            title={t('common.next')}
            onPress={onNext}
            style={styles.continueBtn}
            disabled={isProcessing}
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
  processingCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: Spacing.xl,
    alignItems: 'center',
    marginVertical: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  processingTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: '800',
    color: Colors.text,
  },
  processingSub: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  photoWrap: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  mainPhoto: {
    width: '100%',
    height: 280,
    resizeMode: 'cover',
  },
  serviceNoteBox: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 14,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  serviceNoteTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.secondary,
    marginBottom: 4,
  },
  serviceNoteText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  btnRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  retakeBtn: {
    flex: 1,
  },
  continueBtn: {
    flex: 2,
  },
});
