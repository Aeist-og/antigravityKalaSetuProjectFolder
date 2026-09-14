import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Colors, Typography, Spacing, Shadows } from '../../constants/colors';
import { Header } from '../../components/common/Header';
import { ProgressBar } from '../../components/common/ProgressBar';
import { Button } from '../../components/common/Button';
import { useLanguage } from '../../context/LanguageContext';
import { useProductDraft } from '../../context/ProductDraftContext';

interface Step1AddProductScreenProps {
  onBack: () => void;
  onNext: () => void;
}

export const Step1AddProductScreen: React.FC<Step1AddProductScreenProps> = ({ onBack, onNext }) => {
  const { t } = useLanguage();
  const { draft, setOriginalImage } = useProductDraft();
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const handleTakePhoto = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        setPermissionError('Camera permission is required to photograph your craft.');
        return;
      }

      setPermissionError(null);
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.85,
      });

      if (!result.canceled && result.assets[0]?.uri) {
        setOriginalImage(result.assets[0].uri);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to launch camera';
      setPermissionError(msg);
    }
  };

  const handleChooseGallery = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        setPermissionError('Gallery permission is required to choose a photograph.');
        return;
      }

      setPermissionError(null);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.85,
      });

      if (!result.canceled && result.assets[0]?.uri) {
        setOriginalImage(result.assets[0].uri);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to pick image';
      setPermissionError(msg);
    }
  };

  return (
    <View style={styles.screen}>
      <Header
        title={t('step1.title')}
        subtitle={t('step1.subtitle')}
        onBack={onBack}
        showLanguageToggle={true}
      />
      <ProgressBar step={1} totalSteps={7} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Photo Selection Card */}
        <View style={[styles.photoCard, Shadows.soft]}>
          {draft.localImageUri ? (
            <View style={styles.selectedImageWrap}>
              <Image
                source={{ uri: draft.localImageUri }}
                style={styles.previewImage}
                resizeMode="cover"
              />
              <View style={styles.checkBadge}>
                <Text style={styles.checkBadgeText}>✓ {t('step1.photoSelected')}</Text>
              </View>
            </View>
          ) : (
            <View style={styles.emptyPhotoBox}>
              <Text style={styles.cameraIcon}>📸</Text>
              <Text style={styles.emptyTitle}>{t('step1.title')}</Text>
              <Text style={styles.emptySubtitle}>{t('step1.tip1')}</Text>
            </View>
          )}

          {permissionError && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠️ {permissionError}</Text>
            </View>
          )}

          {/* Camera / Gallery Options */}
          <View style={styles.btnRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleTakePhoto}
              style={[styles.pickerBtn, styles.primaryPickerBtn]}
            >
              <Text style={styles.pickerIcon}>📷</Text>
              <Text style={styles.primaryPickerText}>{t('step1.takePhoto')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleChooseGallery}
              style={styles.pickerBtn}
            >
              <Text style={styles.pickerIcon}>🖼️</Text>
              <Text style={styles.secondaryPickerText}>{t('step1.chooseGallery')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tips for Low-Literacy / Craft Photography */}
        <View style={styles.tipBox}>
          <Text style={styles.tipTitle}>💡 {t('step1.photoTipsTitle')}</Text>
          <Text style={styles.tipItem}>• {t('step1.tip1')}</Text>
          <Text style={styles.tipItem}>• {t('step1.tip2')}</Text>
          <Text style={styles.tipItem}>• {t('step1.tip3')}</Text>
        </View>

        <Button
          title={t('wizard.next')}
          onPress={onNext}
          size="lg"
          style={styles.nextBtn}
          disabled={!draft.localImageUri}
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
  photoCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.sm,
  },
  selectedImageWrap: {
    height: 250,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: Spacing.md,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  checkBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: Colors.success,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  checkBadgeText: {
    color: '#FFF',
    fontSize: Typography.fontSize.xs,
    fontWeight: '700',
  },
  emptyPhotoBox: {
    height: 200,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surfaceAlt,
    marginBottom: Spacing.md,
  },
  cameraIcon: {
    fontSize: 44,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: '700',
    color: Colors.text,
  },
  emptySubtitle: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
    paddingHorizontal: Spacing.md,
  },
  errorBox: {
    backgroundColor: 'rgba(237, 108, 2, 0.1)',
    borderRadius: 10,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.warning,
  },
  errorText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.warning,
    fontWeight: '600',
  },
  btnRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  pickerBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    gap: 8,
  },
  primaryPickerBtn: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  pickerIcon: {
    fontSize: 18,
  },
  primaryPickerText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '700',
    color: Colors.primary,
  },
  secondaryPickerText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '700',
    color: Colors.text,
  },
  tipBox: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 14,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  tipTitle: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 6,
  },
  tipItem: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  nextBtn: {
    marginTop: Spacing.xs,
  },
});
