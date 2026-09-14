import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps, useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Colors, Typography, Spacing, Shadows } from '../../constants/colors';
import { Header } from '../../components/common/Header';
import { Badge } from '../../components/common/Badge';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useProductDraft } from '../../context/ProductDraftContext';
import { DatabaseService } from '../../services/database/databaseService';
import { Product } from '../../models/product';
import { ArtisanTabParamList, RootStackParamList } from '../../navigation/types';

type Props = CompositeScreenProps<
  BottomTabScreenProps<ArtisanTabParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList>
>;

export const ArtisanHomeScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { draft, resetDraft, setCurrentStep } = useProductDraft();
  const [publishedProducts, setPublishedProducts] = useState<Product[]>([]);
  const [oppsCount, setOppsCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  const loadData = useCallback(() => {
    if (user?.id) {
      setLoading(true);
      Promise.all([
        DatabaseService.getArtisanProducts(user.id, 'published'),
        DatabaseService.getOpportunities('open'),
      ])
        .then(([prodsRes, oppsRes]) => {
          if (prodsRes.data) setPublishedProducts(prodsRes.data);
          if (oppsRes.data) setOppsCount(oppsRes.data.length);
        })
        .finally(() => setLoading(false));
    }
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleStartNewProduct = async () => {
    await resetDraft();
    navigation.navigate('ProductWizard', { initialStep: 1 });
  };

  const handleResumeDraft = (step: number) => {
    setCurrentStep(step);
    navigation.navigate('ProductWizard', { initialStep: step });
  };

  const hasActiveDraft = Boolean(draft?.localImageUri || draft?.voiceTranscript || draft?.info?.titleEn || draft?.info?.titleHi);

  return (
    <View style={styles.screen}>
      <Header
        title={`${t('home.greeting')}, ${user?.fullName || 'Artisan'} 👋`}
        subtitle={t('home.artisanBadge')}
        showLanguageToggle={true}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Priority 1: Create New Product CTA */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handleStartNewProduct}
          style={[styles.createCard, Shadows.prominent]}
        >
          <View style={styles.createCardInner}>
            <View style={styles.iconCircle}>
              <Text style={styles.iconText}>📸</Text>
            </View>
            <View style={styles.createCardTextCol}>
              <Text style={styles.createTitle}>{t('home.createNewBtn')}</Text>
              <Text style={styles.createSubtitle}>{t('home.createNewDesc')}</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Priority 2: Continue Active Draft (Real state from DraftContext) */}
        {hasActiveDraft && (
          <View style={[styles.draftCard, Shadows.soft]}>
            <View style={styles.draftHeaderRow}>
              <Text style={styles.draftSectionTitle}>⚡ {t('home.continueDraftTitle')}</Text>
              <Badge label={`Step ${draft?.currentStep || 1} of 8`} variant="accent" />
            </View>

            <View style={styles.draftContentRow}>
              {draft?.localImageUri ? (
                <Image source={{ uri: draft.localImageUri }} style={styles.draftThumb} />
              ) : (
                <View style={[styles.draftThumb, styles.emptyThumb]}>
                  <Text style={{ fontSize: 24 }}>📷</Text>
                </View>
              )}
              <View style={styles.draftInfoCol}>
                <Text style={styles.draftItemTitle} numberOfLines={1}>
                  {draft?.info?.titleHi || draft?.info?.titleEn || 'Untitled Craft Draft'}
                </Text>
                <Text style={styles.draftItemSub}>
                  {draft?.info?.craftType || 'Traditional Craft'}
                </Text>
                <TouchableOpacity
                  onPress={() => handleResumeDraft(draft.currentStep || 1)}
                  style={styles.resumeBtn}
                >
                  <Text style={styles.resumeBtnText}>
                    ▶ {t('home.resumeDraft')} ({draft.currentStep || 1}/8)
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Priority 3: Quick Studio Tools */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>{t('home.quickToolsTitle')}</Text>
        </View>

        <View style={styles.toolsRow}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('ProductWizard', { initialStep: 1 })}
            style={[styles.toolCard, Shadows.soft]}
          >
            <Text style={styles.toolIcon}>✨</Text>
            <Text style={styles.toolTitle}>{t('home.toolPhotoStudio')}</Text>
            <Text style={styles.toolDesc}>{t('home.toolPhotoStudioDesc')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('ProductWizard', { initialStep: 3 })}
            style={[styles.toolCard, Shadows.soft]}
          >
            <Text style={styles.toolIcon}>🎙️</Text>
            <Text style={styles.toolTitle}>{t('home.toolVoiceCatalog')}</Text>
            <Text style={styles.toolDesc}>{t('home.toolVoiceCatalogDesc')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('ProductWizard', { initialStep: 6 })}
            style={[styles.toolCard, Shadows.soft]}
          >
            <Text style={styles.toolIcon}>⚖️</Text>
            <Text style={styles.toolTitle}>{t('home.toolSmartPricing')}</Text>
            <Text style={styles.toolDesc}>{t('home.toolSmartPricingDesc')}</Text>
          </TouchableOpacity>
        </View>

        {/* Priority 4: Business Summary (Real metrics) */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>{t('home.businessSummaryTitle')}</Text>
        </View>

        <View style={styles.metricsRow}>
          <View style={[styles.metricCard, Shadows.soft]}>
            <Text style={styles.metricVal}>{publishedProducts.length}</Text>
            <Text style={styles.metricLabel}>{t('home.publishedCount')}</Text>
          </View>
          <View style={[styles.metricCard, Shadows.soft]}>
            <Text style={styles.metricVal}>{hasActiveDraft ? 1 : 0}</Text>
            <Text style={styles.metricLabel}>{t('home.draftsCount')}</Text>
          </View>
          <View style={[styles.metricCard, Shadows.soft]}>
            <Text style={styles.metricVal}>{oppsCount}</Text>
            <Text style={styles.metricLabel}>{t('home.inquiriesCount')}</Text>
          </View>
        </View>

        {/* Priority 5: Grow Your Reach (Marketplace, Exhibition QR, Opportunities) */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>🚀 {t('home.growReachTitle') || 'Grow Your Reach'}</Text>
        </View>

        <View style={styles.reachRow}>
          <TouchableOpacity
            style={[styles.reachCard, Shadows.soft]}
            onPress={() => navigation.navigate('Opportunities')}
            activeOpacity={0.8}
          >
            <Text style={styles.reachIcon}>🏢</Text>
            <Text style={styles.reachTitle}>{t('home.opportunitiesTitle')}</Text>
            <Text style={styles.reachDesc}>{t('home.opportunitiesDesc')}</Text>
            <Badge label={`${oppsCount} Live RFQs`} variant="accent" style={{ marginTop: 6 }} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.reachCard, Shadows.soft]}
            onPress={() => navigation.navigate('ExhibitionQr')}
            activeOpacity={0.8}
          >
            <Text style={styles.reachIcon}>📱</Text>
            <Text style={styles.reachTitle}>{t('home.exhibitionQrTitle')}</Text>
            <Text style={styles.reachDesc}>{t('home.exhibitionQrDesc')}</Text>
            <Badge label="Printable QR" variant="success" style={{ marginTop: 6 }} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.reachCard, Shadows.soft]}
            onPress={() => navigation.navigate('OndcReadiness')}
            activeOpacity={0.8}
          >
            <Text style={styles.reachIcon}>🌐</Text>
            <Text style={styles.reachTitle}>{t('home.ondcReadinessTitle')}</Text>
            <Text style={styles.reachDesc}>{t('home.ondcReadinessDesc')}</Text>
            <Badge label="Beckn v1.2" variant="primary" style={{ marginTop: 6 }} />
          </TouchableOpacity>
        </View>

        {/* Priority 6: Published Catalogues Preview */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>{t('nav.catalogues')}</Text>
          <TouchableOpacity onPress={() => navigation.navigate('ArtisanApp', { screen: 'Catalogues' })}>
            <Text style={styles.viewAllText}>View All →</Text>
          </TouchableOpacity>
        </View>

        {publishedProducts.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyText}>{t('home.emptyCatalogues')}</Text>
          </View>
        ) : (
          publishedProducts.map(item => (
            <View key={item.id} style={[styles.productCard, Shadows.soft]}>
              {item.images[0]?.originalUrl ? (
                <Image source={{ uri: item.images[0].originalUrl }} style={styles.productThumb} />
              ) : (
                <View style={[styles.productThumb, styles.emptyThumb]}>
                  <Text style={{ fontSize: 20 }}>🏺</Text>
                </View>
              )}
              <View style={styles.productInfoCol}>
                <View style={styles.tagRow}>
                  <Badge label={item.info.craftType || 'Craft'} variant="primary" />
                  <Badge label="Published" variant="success" />
                </View>
                <Text style={styles.productTitle} numberOfLines={1}>
                  {item.info.titleHi || item.info.titleEn || 'Handcrafted Item'}
                </Text>
                <Text style={styles.productMeta}>
                  {item.info.originState} • {item.info.productionTimeDays} Days
                </Text>
                <Text style={styles.productPrice}>₹{item.pricing?.finalListingPrice || 0}</Text>
              </View>
            </View>
          ))
        )}
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
  createCard: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  createCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 26,
  },
  createCardTextCol: {
    flex: 1,
  },
  createTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  createSubtitle: {
    fontSize: Typography.fontSize.xs,
    color: '#FBECE6',
    marginTop: 4,
    lineHeight: 16,
  },
  draftCard: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  draftHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  draftSectionTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '700',
    color: Colors.accentGold,
  },
  draftContentRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    alignItems: 'center',
  },
  draftThumb: {
    width: 68,
    height: 68,
    borderRadius: 12,
  },
  emptyThumb: {
    backgroundColor: Colors.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  draftInfoCol: {
    flex: 1,
  },
  draftItemTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '700',
    color: Colors.text,
  },
  draftItemSub: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  resumeBtn: {
    marginTop: 6,
    alignSelf: 'flex-start',
    backgroundColor: Colors.accentLight,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  resumeBtnText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '700',
    color: Colors.accentGold,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: '800',
    color: Colors.text,
  },
  viewAllText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '700',
    color: Colors.primary,
  },
  toolsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: Spacing.md,
  },
  toolCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  toolIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  toolTitle: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
  },
  toolDesc: {
    fontSize: 10,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 3,
    lineHeight: 13,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: Spacing.md,
  },
  metricCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  metricVal: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '800',
    color: Colors.primary,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  emptyCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  productThumb: {
    width: 76,
    height: 76,
    borderRadius: 12,
  },
  productInfoCol: {
    flex: 1,
    justifyContent: 'center',
  },
  tagRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 4,
  },
  productTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '700',
    color: Colors.text,
  },
  productMeta: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  productPrice: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '800',
    color: Colors.primaryDark,
    marginTop: 3,
  },
  reachRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: Spacing.md,
  },
  reachCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reachIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  reachTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
  },
  reachDesc: {
    fontSize: 9,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 2,
    lineHeight: 12,
  },
});
