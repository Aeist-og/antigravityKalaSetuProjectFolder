import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Colors, Typography, Spacing, Shadows } from '../../constants/colors';
import { Button } from '../../components/common/Button';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { DEMO_ACCOUNTS } from '../../services/auth/authService';
import { AuthStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Welcome'>;

export const WelcomeScreen: React.FC<Props> = ({ navigation }) => {
  const { language, setLanguage } = useLanguage();
  const { loginDemoAccount } = useAuth();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'hi' : 'en');
  };

  const artisanDemo = DEMO_ACCOUNTS.find(d => d.role === 'artisan') || DEMO_ACCOUNTS[0];
  const customerDemo = DEMO_ACCOUNTS.find(d => d.role === 'customer') || DEMO_ACCOUNTS[5] || DEMO_ACCOUNTS[0];
  const businessDemo = DEMO_ACCOUNTS.find(d => d.role === 'business') || DEMO_ACCOUNTS[3] || DEMO_ACCOUNTS[0];

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
      {/* Top Bar with Language Selector */}
      <View style={styles.topRow}>
        <View style={styles.badgeWrap}>
          <Text style={styles.badgeText}>MADE FOR BHARAT 🇮🇳</Text>
        </View>
        <TouchableOpacity onPress={toggleLanguage} style={styles.langButton} accessibilityLabel="Toggle Language">
          <Text style={styles.langButtonText}>
            {language === 'en' ? '🇮🇳 हिंदी' : '🌐 English'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Brand Hero with Signature Red Rose Accent */}
      <View style={styles.heroSection}>
        <View style={[styles.logoCircle, Shadows.medium]}>
          <Text style={styles.logoChar}>क</Text>
        </View>
        <Text style={styles.appName}>KalaSetu</Text>
        <Text style={styles.appSubName}>कलासेतु</Text>
        <Text style={styles.appTagline}>
          {language === 'hi'
            ? 'भारत का शिल्प। असीम संभावनाओं से जुड़ा हुआ।'
            : "India's Craft. Connected to Opportunity."}
        </Text>
      </View>

      {/* Craft Identity Pillars - Red Rose Velvet Card */}
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

          <Text style={styles.overlayTitle}>
            {language === 'hi' ? 'कारीगर से बाज़ार तक' : 'From Maker to Marketplace'}
          </Text>
          <Text style={styles.overlaySubtitle}>
            {language === 'hi'
              ? 'भारत के पारंपरिक कारीगरों, उद्यम खरीदारों और शिल्प प्रेमियों को जोड़ने वाला विश्वसनीय डिजिटल सेतु।'
              : "Bridging India's generational artisans, global enterprise buyers, and conscious patrons in one verified digital ecosystem."}
          </Text>
        </View>
      </View>

      {/* Choose Your Role Experience */}
      <View style={styles.sectionHeaderWrap}>
        <Text style={styles.sectionHeading}>
          {language === 'hi' ? '✨ अपना कार्यक्षेत्र चुनें' : '✨ Choose Your Workspace'}
        </Text>
        <Text style={styles.sectionSub}>
          {language === 'hi'
            ? 'किसी भी अनुभव में तुरंत प्रवेश करें:'
            : 'Tap any verified identity below to explore live marketplace flows:'}
        </Text>
      </View>

      {/* 1. Customer Patron Portal */}
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={() => loginDemoAccount(customerDemo)}
        style={[styles.portalCard, styles.customerBorder, Shadows.soft]}
      >
        <View style={[styles.portalIconCircle, { backgroundColor: Colors.accentLight }]}>
          <Text style={styles.portalEmoji}>🛍️</Text>
        </View>
        <View style={styles.portalTextCol}>
          <View style={styles.portalBadgeRow}>
            <Text style={styles.portalTitle}>
              {language === 'hi' ? 'ग्राहक बाज़ार (Customer Patron)' : 'Customer Patron'}
            </Text>
            <View style={styles.customerBadge}>
              <Text style={styles.customerBadgeText}>EXPLORE & BUY</Text>
            </View>
          </View>
          <Text style={styles.portalDesc}>
            {language === 'hi'
              ? 'प्रामाणिक हथकरघा, मिट्टी के बर्तन और पारंपरिक कला खोजें, बैग में जोड़ें और खरीदें।'
              : 'Discover authentic handlooms, pottery, and crafts. Add to bag, explore artisans & checkout.'}
          </Text>
          <Text style={styles.portalActionLink}>
            {language === 'hi' ? '🛍️ ग्राहक रूप में प्रवेश करें →' : '🛍️ Enter as Customer Patron (Priya) →'}
          </Text>
        </View>
      </TouchableOpacity>

      {/* 2. Master Artisan Portal */}
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={() => loginDemoAccount(artisanDemo)}
        style={[styles.portalCard, styles.artisanBorder, Shadows.soft]}
      >
        <View style={[styles.portalIconCircle, { backgroundColor: Colors.primaryLight }]}>
          <Text style={styles.portalEmoji}>🏺</Text>
        </View>
        <View style={styles.portalTextCol}>
          <View style={styles.portalBadgeRow}>
            <Text style={styles.portalTitle}>
              {language === 'hi' ? 'कारीगर स्टूडियो (Master Maker)' : 'Artisan Studio'}
            </Text>
            <View style={styles.artisanBadge}>
              <Text style={styles.artisanBadgeText}>AI CATALOGUE</Text>
            </View>
          </View>
          <Text style={styles.portalDesc}>
            {language === 'hi'
              ? 'आवाज और AI से बहुभाषी कैटलॉग बनाएं, डिजिटल स्टॉल प्रदर्शित करें और ONDC से जुड़ें।'
              : 'AI voice cataloguing wizard, fair pricing engine, digital exhibition stall & ONDC.'}
          </Text>
          <Text style={styles.portalActionLink}>
            {language === 'hi' ? '🏺 कारीगर स्टूडियो में प्रवेश करें →' : '🏺 Enter as Master Weaver (Ramesh) →'}
          </Text>
        </View>
      </TouchableOpacity>

      {/* 3. Business / Bulk Sourcing */}
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={() => loginDemoAccount(businessDemo)}
        style={[styles.portalCard, styles.businessBorder, Shadows.soft]}
      >
        <View style={[styles.portalIconCircle, { backgroundColor: Colors.secondaryLight }]}>
          <Text style={styles.portalEmoji}>🏢</Text>
        </View>
        <View style={styles.portalTextCol}>
          <View style={styles.portalBadgeRow}>
            <Text style={styles.portalTitle}>
              {language === 'hi' ? 'थोक खरीद (Business Sourcing)' : 'Business Sourcing'}
            </Text>
            <View style={styles.businessBadge}>
              <Text style={styles.businessBadgeText}>B2B BULK</Text>
            </View>
          </View>
          <Text style={styles.portalDesc}>
            {language === 'hi'
              ? 'सत्यापित कारीगर क्लस्टरों से थोक में हस्तशिल्प और कॉर्पोरेट उपहार ऑर्डर करें।'
              : 'Source verified artisan clusters, create custom tenders & wholesale procurement.'}
          </Text>
          <Text style={styles.portalActionLink}>
            {language === 'hi' ? '🏢 बिज़नेस हब में प्रवेश करें →' : '🏢 Enter as Bulk Buyer (Ananya) →'}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Secondary Actions Card */}
      <View style={[styles.secondaryActionCard, Shadows.soft]}>
        <Button
          title={language === 'hi' ? '🔑 अन्य खाता लॉगिन / पंजीकरण →' : '🔑 Choose Workspace / Sign In →'}
          onPress={() => navigation.navigate('RoleSelect')}
          variant="outline"
          size="md"
          style={styles.actionBtn}
        />

        <Button
          title={language === 'hi' ? '🌐 भाषा चयन (Language Selection)' : '🌐 Language Selection'}
          onPress={() => navigation.navigate('LanguageSelect')}
          variant="ghost"
          size="sm"
          style={styles.langNavBtn}
        />

        <Text style={styles.secureAuthNote}>
          🔒 Vernacular-first digital catalogue ecosystem for Indian artisans
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
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
    marginTop: Spacing.xs,
  },
  badgeWrap: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(225, 29, 72, 0.2)',
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
    marginBottom: Spacing.md,
  },
  logoCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xs,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
  logoChar: {
    color: '#FFF',
    fontSize: 34,
    fontWeight: '900',
  },
  appName: {
    fontSize: 28,
    fontWeight: '900',
    color: Colors.text,
    letterSpacing: -0.5,
  },
  appSubName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: 1,
    marginTop: -2,
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
    borderRadius: 20,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  heroCardInner: {
    alignItems: 'center',
  },
  pillarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: Spacing.sm,
  },
  pillarItem: {
    alignItems: 'center',
  },
  pillarEmoji: {
    fontSize: 18,
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
    marginBottom: 4,
  },
  overlaySubtitle: {
    fontSize: Typography.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 18,
  },
  sectionHeaderWrap: {
    marginBottom: Spacing.sm,
  },
  sectionHeading: {
    fontSize: Typography.fontSize.md,
    fontWeight: '800',
    color: Colors.text,
  },
  sectionSub: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  portalCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1.5,
  },
  customerBorder: {
    borderColor: 'rgba(244, 63, 94, 0.35)',
  },
  artisanBorder: {
    borderColor: 'rgba(225, 29, 72, 0.35)',
  },
  businessBorder: {
    borderColor: 'rgba(37, 99, 235, 0.35)',
  },
  portalIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
    marginTop: 2,
  },
  portalEmoji: {
    fontSize: 22,
  },
  portalTextCol: {
    flex: 1,
  },
  portalBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  portalTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '800',
    color: Colors.text,
  },
  customerBadge: {
    backgroundColor: Colors.accentLight,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  customerBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    color: Colors.accent,
  },
  artisanBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  artisanBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    color: Colors.primary,
  },
  businessBadge: {
    backgroundColor: Colors.secondaryLight,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  businessBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    color: Colors.secondary,
  },
  portalDesc: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    lineHeight: 17,
    marginBottom: 6,
  },
  portalActionLink: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '700',
    color: Colors.primary,
  },
  secondaryActionCard: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: Spacing.md,
    marginTop: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionBtn: {
    marginBottom: Spacing.xs,
  },
  langNavBtn: {
    marginBottom: Spacing.xs,
  },
  secureAuthNote: {
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 2,
  },
});
