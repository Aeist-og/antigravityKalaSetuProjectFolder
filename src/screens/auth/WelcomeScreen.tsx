import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Colors, Typography, Spacing, Shadows } from '../../constants/colors';
import { Button } from '../../components/common/Button';
import { useLanguage } from '../../context/LanguageContext';
import { AuthStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Welcome'>;

export const WelcomeScreen: React.FC<Props> = ({ navigation }) => {
  const { t, language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'hi' : 'en');
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
      {/* Top Bar with Language Selector */}
      <View style={styles.topRow}>
        <View style={styles.badgeWrap}>
          <Text style={styles.badgeText}>MADE FOR BHARAT 🇮🇳</Text>
        </View>
        <TouchableOpacity onPress={toggleLanguage} style={styles.langButton}>
          <Text style={styles.langButtonText}>
            {language === 'en' ? '🇮🇳 हिंदी' : '🌐 English'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Brand Hero with Deep Plum Accent */}
      <View style={styles.heroSection}>
        <View style={[styles.logoCircle, Shadows.medium]}>
          <Text style={styles.logoChar}>क</Text>
        </View>
        <Text style={styles.appName}>KalaSetu</Text>
        <Text style={styles.appTagline}>India's Craft. Connected to Opportunity.</Text>
      </View>

      {/* Craft Identity Pillars */}
      <View style={[styles.heroCard, Shadows.medium]}>
        <View style={styles.heroCardInner}>
          <View style={styles.pillarsRow}>
            <View style={styles.pillarItem}>
              <Text style={styles.pillarEmoji}>🎨</Text>
              <Text style={styles.pillarText}>CRAFT</Text>
            </View>
            <Text style={styles.pillarDot}>•</Text>
            <View style={styles.pillarItem}>
              <Text style={styles.pillarEmoji}>💼</Text>
              <Text style={styles.pillarText}>COMMERCE</Text>
            </View>
            <Text style={styles.pillarDot}>•</Text>
            <View style={styles.pillarItem}>
              <Text style={styles.pillarEmoji}>🤝</Text>
              <Text style={styles.pillarText}>CONNECTION</Text>
            </View>
          </View>

          <Text style={styles.overlayTitle}>From Maker to Marketplace</Text>
          <Text style={styles.overlaySubtitle}>
            Bridging India's generational artisans, global enterprise buyers, and conscious consumers in one verified digital ecosystem.
          </Text>
        </View>
      </View>

      {/* Primary Action Card: Strict Entrance through Workspace Selection */}
      <View style={[styles.actionCard, Shadows.soft]}>
        <Button
          title="Choose Your Workspace →"
          onPress={() => navigation.navigate('RoleSelect')}
          size="lg"
          style={styles.primaryBtn}
        />

        <Text style={styles.secureAuthNote}>
          🔒 Secure authentication required for all workspaces
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
    backgroundColor: Colors.background,
    minHeight: '100%',
    justifyContent: 'center',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  badgeWrap: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(91, 26, 66, 0.15)',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  langButton: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  langButtonText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '700',
    color: Colors.primary,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  logoChar: {
    color: '#FFF',
    fontSize: 36,
    fontWeight: '800',
  },
  appName: {
    fontSize: 28,
    fontWeight: '900',
    color: Colors.text,
    letterSpacing: -0.5,
  },
  appTagline: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
    fontWeight: '600',
  },
  heroCard: {
    backgroundColor: Colors.primaryDark,
    borderRadius: 24,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  heroCardInner: {
    alignItems: 'center',
  },
  pillarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: Spacing.md,
  },
  pillarItem: {
    alignItems: 'center',
  },
  pillarEmoji: {
    fontSize: 20,
    marginBottom: 2,
  },
  pillarText: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.accentGold,
    letterSpacing: 1,
  },
  pillarDot: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 14,
  },
  overlayTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 6,
  },
  overlaySubtitle: {
    fontSize: Typography.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    lineHeight: 18,
  },
  actionCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  primaryBtn: {
    marginBottom: Spacing.sm,
  },
  secureAuthNote: {
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
});
