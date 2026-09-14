import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '../../constants/colors';
import { useLanguage } from '../../context/LanguageContext';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  showLanguageToggle?: boolean;
  rightAction?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  onBack,
  showLanguageToggle = true,
  rightAction,
}) => {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'hi' : 'en');
  };

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        {onBack ? (
          <TouchableOpacity onPress={onBack} style={styles.backBtn} accessibilityLabel="Back">
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.logoBadge}>
            <Text style={styles.logoText}>क</Text>
          </View>
        )}

        <View style={styles.actionsRight}>
          {showLanguageToggle && (
            <TouchableOpacity onPress={toggleLanguage} style={styles.langPill}>
              <Text style={styles.langPillText}>
                {language === 'en' ? '🇮🇳 हिंदी' : '🌐 English'}
              </Text>
            </TouchableOpacity>
          )}
          {rightAction}
        </View>
      </View>

      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    backgroundColor: Colors.background,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  backIcon: {
    fontSize: 20,
    color: Colors.secondary,
    fontWeight: 'bold',
  },
  logoBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 18,
  },
  actionsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  langPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  langPillText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text,
    fontWeight: '600',
  },
  title: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '700',
    color: Colors.text,
    marginTop: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
