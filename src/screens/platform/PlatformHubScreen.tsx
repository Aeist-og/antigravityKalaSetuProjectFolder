import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Colors, Typography, Spacing, Shadows } from '../../constants/colors';
import { Header } from '../../components/common/Header';
import { Button } from '../../components/common/Button';
import { useLanguage } from '../../context/LanguageContext';
import { DatabaseService } from '../../services/database/databaseService';
import { useAuth } from '../../context/AuthContext';

interface Props {
  navigation: any;
}

export const PlatformHubScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [exporting, setExporting] = useState<boolean>(false);
  const [exportedJson, setExportedJson] = useState<string | null>(null);

  const handleExportOndc = async () => {
    setExporting(true);
    try {
      const prodsRes = await DatabaseService.getArtisanProducts(user?.id || '', 'published');
      const products = prodsRes.data || [];

      const ondcCatalog = {
        context: {
          domain: 'nic2004:52110', // Retail / Crafts
          action: 'on_search',
          bpp_id: 'kalasetu.ondc.in',
          timestamp: new Date().toISOString(),
        },
        message: {
          catalog: {
            'bpp/fulfillments': [{ id: '1', type: 'Delivery' }],
            'bpp/providers': [
              {
                id: user?.id || 'artisan-provider-1',
                descriptor: {
                  name: user?.fullName || 'Traditional Artisan',
                  short_desc: 'Authentic Indian Handcrafted Products',
                },
                items: products.map(p => ({
                  id: p.id,
                  descriptor: {
                    name: p.info.titleEn || p.info.titleHi,
                    symbol: p.images[0]?.originalUrl || '',
                    short_desc: p.info.descriptionEn || p.info.descriptionHi,
                  },
                  price: {
                    currency: 'INR',
                    value: String(p.pricing?.finalListingPrice || 0),
                  },
                  category_id: p.info.craftType || 'Handicraft',
                  matched: true,
                })),
              },
            ],
          },
        },
      };

      setExportedJson(JSON.stringify(ondcCatalog, null, 2));
      Alert.alert(
        'ONDC Catalog Generated',
        `Successfully generated open e-commerce schema for ${products.length} published products!`
      );
    } finally {
      setExporting(false);
    }
  };

  return (
    <View style={styles.screen}>
      <Header
        title="🌐 Platform & Marketplaces"
        subtitle="ONDC, GeM & Exhibition Integrations"
        onBack={() => navigation.goBack()}
        showLanguageToggle={true}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Banner */}
        <View style={[styles.phaseBanner, Shadows.soft]}>
          <Text style={styles.bannerTitle}>National Market Linkage</Text>
          <Text style={styles.bannerDesc}>
            Connect your local catalogue directly to national digital commerce networks (ONDC) and government procurement portals (GeM) to unlock institutional sales.
          </Text>
        </View>

        {/* Integration Card 1: ONDC Export */}
        <View style={[styles.card, Shadows.soft]}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardEmoji}>🇮🇳</Text>
            <View style={styles.cardTitleCol}>
              <Text style={styles.cardTitle}>ONDC Protocol Export</Text>
              <Text style={styles.cardSubtitle}>Open Network for Digital Commerce Schema</Text>
            </View>
          </View>
          <Text style={styles.cardDesc}>
            Export your products into standardized ONDC Beckn protocol JSON, making your catalogue discoverable on buyer apps like Paytm, Mystore, and Pincode.
          </Text>

          <Button
            title={exporting ? 'Generating Schema...' : '⚡ Generate ONDC Catalog JSON'}
            onPress={handleExportOndc}
            loading={exporting}
            size="md"
            style={styles.cardBtn}
          />

          {exportedJson && (
            <View style={styles.jsonBox}>
              <Text style={styles.jsonHeader}>Generated ONDC Schema Payload:</Text>
              <Text style={styles.jsonCode} numberOfLines={12}>
                {exportedJson}
              </Text>
            </View>
          )}
        </View>

        {/* Integration Card 2: QR Exhibition Generator */}
        <View style={[styles.card, Shadows.soft]}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardEmoji}>📱</Text>
            <View style={styles.cardTitleCol}>
              <Text style={styles.cardTitle}>Physical Exhibition QR Link</Text>
              <Text style={styles.cardSubtitle}>Craft Mela → Digital Catalogue Bridge</Text>
            </View>
          </View>
          <Text style={styles.cardDesc}>
            Generate high-resolution printable QR codes for your physical exhibition stall (e.g. Surajkund Mela, Dilli Haat) so visitors can instantly scan, view your complete story, and reorder online.
          </Text>

          <Button
            title="🖨️ View Stall Exhibition QR"
            onPress={() =>
              Alert.alert(
                'Stall QR Ready',
                `Artisan Stall URL: https://kalasetu.in/artisan/${user?.id || 'demo'}\n\nPrintable QR banner is ready for your exhibition stall!`
              )
            }
            variant="outline"
            size="md"
            style={styles.cardBtn}
          />
        </View>

        {/* Integration Card 3: GeM Government e-Marketplace */}
        <View style={[styles.card, Shadows.soft]}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardEmoji}>🏛️</Text>
            <View style={styles.cardTitleCol}>
              <Text style={styles.cardTitle}>GeM Portal Onboarding</Text>
              <Text style={styles.cardSubtitle}>Government e-Marketplace Public Procurement</Text>
            </View>
          </View>
          <Text style={styles.cardDesc}>
            Automated compliance packaging for government department gifting, institutional tenders, and handicrafts quota procurement.
          </Text>
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
  phaseBanner: {
    backgroundColor: Colors.primaryDark,
    borderRadius: 20,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  phaseBadge: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  phaseBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  statusNote: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
  },
  bannerTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 6,
  },
  bannerDesc: {
    fontSize: Typography.fontSize.xs,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 18,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  cardEmoji: {
    fontSize: 30,
  },
  cardTitleCol: {
    flex: 1,
  },
  cardTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '800',
    color: Colors.text,
  },
  cardSubtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  cardDesc: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: Spacing.sm,
  },
  cardBtn: {
    marginTop: 4,
  },
  jsonBox: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 12,
    padding: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  jsonHeader: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primaryDark,
    marginBottom: 4,
  },
  jsonCode: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: Colors.text,
  },
});
