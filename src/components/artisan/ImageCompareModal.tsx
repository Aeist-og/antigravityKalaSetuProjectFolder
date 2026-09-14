import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '../../constants/colors';
import { useLanguage } from '../../context/LanguageContext';

interface ImageCompareModalProps {
  originalUri: string;
  enhancedUri: string;
  onConfirm?: () => void;
  onRetake?: () => void;
}

export const ImageCompareModal: React.FC<ImageCompareModalProps> = ({
  originalUri,
  enhancedUri,
}) => {
  const { t } = useLanguage();
  const [activeView, setActiveView] = useState<'enhanced' | 'original'>('enhanced');

  return (
    <View style={styles.container}>
      <View style={styles.tabSelector}>
        <TouchableOpacity
          onPress={() => setActiveView('original')}
          style={[styles.tabButton, activeView === 'original' && styles.tabButtonActive]}
        >
          <Text style={[styles.tabText, activeView === 'original' && styles.tabTextActive]}>
            {t('step2.before')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveView('enhanced')}
          style={[styles.tabButton, activeView === 'enhanced' && styles.tabButtonActive]}
        >
          <Text style={[styles.tabText, activeView === 'enhanced' && styles.tabTextActive]}>
            ✨ {t('step2.after')}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => setActiveView(prev => (prev === 'enhanced' ? 'original' : 'enhanced'))}
        style={styles.imageWrapper}
      >
        <Image
          source={{ uri: activeView === 'original' ? originalUri : enhancedUri }}
          style={styles.previewImage}
          resizeMode="cover"
        />

        <View style={styles.badgeOverlay}>
          <Text style={styles.badgeText}>
            {activeView === 'original' ? t('step2.before') : `✨ ${t('step2.after')}`}
          </Text>
        </View>

        <View style={styles.hintOverlay}>
          <Text style={styles.hintText}>{t('step2.tapToToggle')}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.sm,
    alignItems: 'center',
    width: '100%',
  },
  tabSelector: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 24,
    padding: 4,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: Spacing.md,
    borderRadius: 20,
  },
  tabButtonActive: {
    backgroundColor: Colors.surface,
    shadowColor: Colors.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  tabTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  imageWrapper: {
    width: '100%',
    height: 300,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  badgeOverlay: {
    position: 'absolute',
    top: 14,
    left: 14,
    backgroundColor: 'rgba(29, 42, 68, 0.75)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  badgeText: {
    color: '#FFF',
    fontSize: Typography.fontSize.xs,
    fontWeight: '700',
  },
  hintOverlay: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  hintText: {
    color: '#FFF',
    fontSize: Typography.fontSize.xs,
    fontWeight: '500',
  },
});
