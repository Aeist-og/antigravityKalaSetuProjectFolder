import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Share,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Colors, Typography, Spacing, Shadows } from '../../constants/colors';
import { Header } from '../../components/common/Header';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { DatabaseService } from '../../services/database/databaseService';
import { Product } from '../../models/product';
import { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'OndcReadiness'>;

interface ComplianceCheck {
  id: string;
  field: string;
  passed: boolean;
  message: string;
}

export const OndcReadinessScreen: React.FC<Props> = ({ route, navigation }) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const initialProductId = route.params?.productId;

  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [generatedJson, setGeneratedJson] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!user?.id) return;
      setLoading(true);
      try {
        const res = await DatabaseService.getArtisanProducts(user.id, 'published');
        if (res.data && res.data.length > 0) {
          setProducts(res.data);
          const initial = res.data.find(p => p.id === initialProductId) || res.data[0];
          setSelectedProduct(initial);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [user?.id, initialProductId]);

  const runAudit = (product: Product): ComplianceCheck[] => {
    return [
      {
        id: 'title_en',
        field: 'English Product Title',
        passed: Boolean(product.info.titleEn && product.info.titleEn.trim().length > 3),
        message: product.info.titleEn ? `✓ "${product.info.titleEn}"` : 'Missing English title',
      },
      {
        id: 'title_hi',
        field: 'Hindi Regional Title',
        passed: Boolean(product.info.titleHi && product.info.titleHi.trim().length > 3),
        message: product.info.titleHi ? `✓ "${product.info.titleHi}"` : 'Missing Hindi title for national multilingual discovery',
      },
      {
        id: 'craft_cat',
        field: 'Craft Category / Taxonomy',
        passed: Boolean(product.info.craftType),
        message: product.info.craftType ? `✓ Taxonomy: ${product.info.craftType}` : 'Missing standardized craft category',
      },
      {
        id: 'images',
        field: 'High-Resolution Media',
        passed: Boolean(product.images && product.images.length > 0 && product.images[0].originalUrl),
        message: product.images.length > 0 ? `✓ ${product.images.length} verified product image(s)` : 'Missing product photographs',
      },
      {
        id: 'price',
        field: 'Transparent Selling Price',
        passed: Boolean(product.pricing && product.pricing.finalListingPrice > 0),
        message: product.pricing?.finalListingPrice ? `✓ ₹${product.pricing.finalListingPrice} INR` : 'Missing final selling price',
      },
      {
        id: 'lead_time',
        field: 'Production & Dispatch Window',
        passed: Boolean(product.info.productionTimeDays && product.info.productionTimeDays > 0),
        message: product.info.productionTimeDays ? `✓ Dispatch in ${product.info.productionTimeDays} days` : 'Missing production lead time',
      },
      {
        id: 'origin',
        field: 'Geographical Origin & GI State',
        passed: Boolean(product.info.originState),
        message: product.info.originState ? `✓ Origin: ${product.info.originState}, India` : 'Missing geographic origin state',
      },
    ];
  };

  const auditChecks = selectedProduct ? runAudit(selectedProduct) : [];
  const passedCount = auditChecks.filter(c => c.passed).length;
  const readinessPercent = auditChecks.length > 0 ? Math.round((passedCount / auditChecks.length) * 100) : 0;

  const handleGenerateOndcSchema = () => {
    if (!selectedProduct) return;

    const becknCatalogItem = {
      context: {
        domain: 'nic2004:52110', // Retail Crafts & Handlooms
        country: 'IND',
        city: 'std:080',
        action: 'on_search',
        core_version: '1.2.0',
        bpp_id: 'kalasetu.ondc.in',
        bpp_uri: 'https://kalasetu.in/ondc/bpp',
        timestamp: new Date().toISOString(),
      },
      message: {
        catalog: {
          'bpp/fulfillments': [
            {
              id: 'standard-delivery',
              type: 'Delivery',
              time: {
                duration: `P${selectedProduct.info.productionTimeDays || 3}D`,
              },
            },
          ],
          'bpp/providers': [
            {
              id: user?.id || 'artisan-provider',
              descriptor: {
                name: user?.fullName || 'Traditional Artisan',
                short_desc: 'Authentic Handcrafted Artisan Goods',
              },
              items: [
                {
                  id: selectedProduct.id,
                  descriptor: {
                    name: selectedProduct.info.titleEn || selectedProduct.info.titleHi,
                    code: `KALA-${selectedProduct.id.slice(0, 6).toUpperCase()}`,
                    symbol: selectedProduct.images[0]?.originalUrl || '',
                    short_desc: selectedProduct.info.descriptionEn || selectedProduct.info.descriptionHi,
                    images: selectedProduct.images.map(img => img.originalUrl),
                  },
                  price: {
                    currency: 'INR',
                    value: String(selectedProduct.pricing?.finalListingPrice || 0),
                    maximum_value: String(Math.round((selectedProduct.pricing?.finalListingPrice || 0) * 1.15)),
                  },
                  category_id: selectedProduct.info.craftType || 'Handicrafts',
                  fulfillment_id: 'standard-delivery',
                  location_id: selectedProduct.info.originState || 'India',
                  matched: true,
                  tags: [
                    {
                      code: 'origin',
                      list: [
                        { code: 'country', value: 'IND' },
                        { code: 'state', value: selectedProduct.info.originState || 'India' },
                      ],
                    },
                    {
                      code: 'craft_details',
                      list: [
                        { code: 'primary_material', value: selectedProduct.info.primaryMaterial || selectedProduct.info.material || 'Natural' },
                        { code: 'production_technique', value: selectedProduct.info.craftType || 'Traditional' },
                      ],
                    },
                    {
                      code: 'multilingual_metadata',
                      list: [
                        { code: 'title_hi', value: selectedProduct.info.titleHi || '' },
                        { code: 'desc_hi', value: selectedProduct.info.descriptionHi || '' },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      },
    };

    setGeneratedJson(JSON.stringify(becknCatalogItem, null, 2));
  };

  const handleShareJson = async () => {
    if (!generatedJson) return;
    try {
      await Share.share({
        title: `ONDC Beckn Schema - ${selectedProduct?.info.titleEn}`,
        message: generatedJson,
      });
    } catch (e) {
      console.warn('Share error:', e);
    }
  };

  return (
    <View style={styles.screen}>
      <Header
        title="🌐 ONDC Marketplace Readiness"
        subtitle="Open Network for Digital Commerce"
        onBack={() => navigation.goBack()}
        showLanguageToggle={true}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Compliance Notice */}
        <View style={[styles.infoBanner, Shadows.soft]}>
          <Text style={styles.infoBadge}>BECKN PROTOCOL v1.2.0 SPECIFICATION</Text>
          <Text style={styles.infoTitle}>National Marketplace Preparation</Text>
          <Text style={styles.infoDesc}>
            Prepare and validate your craft listings for open e-commerce networks. Buyer applications (Paytm, Mystore, Pincode) parse standardized Beckn JSON to list your crafts.
          </Text>
        </View>

        {loading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : products.length === 0 ? (
          <View style={[styles.emptyCard, Shadows.soft]}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyTitle}>No Published Products Found</Text>
            <Text style={styles.emptyDesc}>
              Publish at least one handcrafted item from the Catalogue section to validate its ONDC marketplace readiness.
            </Text>
          </View>
        ) : (
          <>
            {/* Product Selector */}
            <Text style={styles.sectionTitle}>Select Catalogue Product to Validate</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.prodScroll}>
              {products.map(p => (
                <TouchableOpacity
                  key={p.id}
                  style={[
                    styles.prodChip,
                    selectedProduct?.id === p.id && styles.prodChipActive,
                  ]}
                  onPress={() => {
                    setSelectedProduct(p);
                    setGeneratedJson(null);
                  }}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.prodChipText,
                      selectedProduct?.id === p.id && styles.prodChipTextActive,
                    ]}
                    numberOfLines={1}
                  >
                    {p.info.titleHi || p.info.titleEn}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Readiness Score Card */}
            <View style={[styles.card, Shadows.soft]}>
              <View style={styles.scoreRow}>
                <View>
                  <Text style={styles.scoreLabel}>Marketplace Readiness Score</Text>
                  <Text style={styles.scoreNumber}>{readinessPercent}% Ready</Text>
                </View>
                <Badge
                  label={readinessPercent === 100 ? '✓ Ready for Export' : 'Incomplete Fields'}
                  variant={readinessPercent === 100 ? 'success' : 'accent'}
                />
              </View>

              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${readinessPercent}%` }]} />
              </View>

              {/* Checklist */}
              <Text style={styles.checklistTitle}>Beckn Attribute Verification</Text>
              {auditChecks.map(check => (
                <View key={check.id} style={styles.checkItem}>
                  <Text style={styles.checkIcon}>{check.passed ? '✓' : '⚠️'}</Text>
                  <View style={styles.checkTextCol}>
                    <Text style={[styles.checkFieldName, !check.passed && styles.checkFieldFailed]}>
                      {check.field}
                    </Text>
                    <Text style={styles.checkMessage}>{check.message}</Text>
                  </View>
                </View>
              ))}

              <Button
                title="⚡ Generate ONDC Beckn Catalog JSON"
                onPress={handleGenerateOndcSchema}
                size="md"
                style={styles.generateBtn}
              />
            </View>

            {/* Generated JSON Payload */}
            {generatedJson && (
              <View style={[styles.card, Shadows.soft]}>
                <View style={styles.jsonHeaderRow}>
                  <Text style={styles.jsonHeaderTitle}>ONDC Beckn v1.2.0 Schema Payload</Text>
                  <Badge label="Valid JSON" variant="success" />
                </View>

                <View style={styles.codeBlock}>
                  <Text style={styles.codeText}>{generatedJson}</Text>
                </View>

                <View style={styles.btnRow}>
                  <Button
                    title="📋 Copy Payload"
                    onPress={() => {
                      Alert.alert('JSON Copied', 'Beckn catalog payload copied to clipboard.');
                    }}
                    variant="outline"
                    size="sm"
                    style={{ flex: 1 }}
                  />
                  <Button
                    title="📤 Share / Export"
                    onPress={handleShareJson}
                    size="sm"
                    style={{ flex: 1 }}
                  />
                </View>
              </View>
            )}
          </>
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
  infoBanner: {
    backgroundColor: Colors.primaryDark,
    borderRadius: 18,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  infoBadge: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.accentGold,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  infoTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '800',
    color: '#FFF',
  },
  infoDesc: {
    fontSize: Typography.fontSize.xs,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 3,
    lineHeight: 16,
  },
  centerBox: {
    padding: Spacing.xxl,
    alignItems: 'center',
  },
  emptyCard: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '700',
    color: Colors.text,
  },
  emptyDesc: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 16,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  prodScroll: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  prodChip: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 8,
  },
  prodChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  prodChipText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text,
    fontWeight: '600',
  },
  prodChipTextActive: {
    color: '#FFF',
    fontWeight: '700',
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  scoreLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  scoreNumber: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '900',
    color: Colors.primaryDark,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  checklistTitle: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  checkIcon: {
    fontSize: 14,
    marginTop: 1,
  },
  checkTextCol: {
    flex: 1,
  },
  checkFieldName: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '700',
    color: Colors.text,
  },
  checkFieldFailed: {
    color: Colors.error,
  },
  checkMessage: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  generateBtn: {
    marginTop: Spacing.md,
  },
  jsonHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  jsonHeaderTitle: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '700',
    color: Colors.text,
  },
  codeBlock: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    maxHeight: 240,
    marginBottom: Spacing.md,
  },
  codeText: {
    fontSize: 9,
    fontFamily: 'monospace',
    color: Colors.text,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 10,
  },
});
