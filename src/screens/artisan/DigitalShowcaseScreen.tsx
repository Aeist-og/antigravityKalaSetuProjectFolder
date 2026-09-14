import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Colors, Typography, Spacing, Shadows } from '../../constants/colors';
import { Header } from '../../components/common/Header';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { DatabaseService } from '../../services/database/databaseService';
import { Product } from '../../models/product';
import { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'DigitalShowcase'>;

export const DigitalShowcaseScreen: React.FC<Props> = ({ route, navigation }) => {
  const { artisanId, exhibitionId } = route.params || {};

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [artisanProfile, setArtisanProfile] = useState<{
    name: string;
    craft: string;
    state: string;
    bio: string;
  }>({
    name: 'Master Craftsman',
    craft: 'Traditional Heritage Craft',
    state: 'India',
    bio: 'Preserving authentic artisanal techniques passed down through generations. Every piece is handcrafted with natural materials and traditional tools.',
  });

  useEffect(() => {
    const fetchShowcase = async () => {
      setLoading(true);
      try {
        if (artisanId) {
          const [prodsRes, profRes] = await Promise.all([
            DatabaseService.getArtisanProducts(artisanId, 'published'),
            DatabaseService.getArtisanProfile(artisanId),
          ]);

          if (prodsRes.data) setProducts(prodsRes.data);
          if (profRes.data) {
            setArtisanProfile({
              name: profRes.data.fullName || 'Master Craftsman',
              craft: profRes.data.craftType || 'Traditional Craft',
              state: profRes.data.state || 'India',
              bio: profRes.data.bio || 'Authentic handmade craftsmanship.',
            });
          }
        }
      } catch (e) {
        console.warn('Error loading showcase:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchShowcase();
  }, [artisanId]);

  return (
    <View style={styles.screen}>
      <Header
        title="🏺 Digital Artisan Showcase"
        subtitle="Direct Craft Discovery & Ordering"
        onBack={() => navigation.goBack()}
        showLanguageToggle={true}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Artisan Hero Banner */}
        <View style={[styles.heroCard, Shadows.soft]}>
          <View style={styles.badgeRow}>
            <Badge label="VERIFIED MASTER ARTISAN" variant="accent" />
            <Badge label="DIRECT FROM MAKER" variant="success" />
          </View>
          <Text style={styles.artisanName}>{artisanProfile.name}</Text>
          <Text style={styles.craftSubtitle}>
            {artisanProfile.craft} • {artisanProfile.state}
          </Text>
          <Text style={styles.artisanBio}>{artisanProfile.bio}</Text>
        </View>

        {/* Section: Published Craft Collection */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>
            Handcrafted Collection ({products.length})
          </Text>
        </View>

        {loading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : products.length === 0 ? (
          <View style={[styles.emptyCard, Shadows.soft]}>
            <Text style={styles.emptyIcon}>🏺</Text>
            <Text style={styles.emptyTitle}>Catalogue In Preparation</Text>
            <Text style={styles.emptyDesc}>
              The artisan is curating new items for this exhibition showcase. Please check back shortly!
            </Text>
          </View>
        ) : (
          products.map(prod => (
            <View key={prod.id} style={[styles.productCard, Shadows.soft]}>
              {prod.images[0]?.originalUrl ? (
                <Image
                  source={{ uri: prod.images[0].originalUrl }}
                  style={styles.productImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.productImage, styles.emptyImage]}>
                  <Text style={{ fontSize: 36 }}>🏺</Text>
                </View>
              )}

              <View style={styles.productDetails}>
                <View style={styles.tagRow}>
                  <Badge label={prod.info.craftType || 'Handmade'} variant="primary" />
                  <Badge label={`${prod.info.productionTimeDays || 3} Days Crafting`} variant="accent" />
                </View>

                <Text style={styles.productTitle}>
                  {prod.info.titleHi || prod.info.titleEn || 'Handcrafted Art Piece'}
                </Text>

                <Text style={styles.productDesc} numberOfLines={2}>
                  {prod.info.descriptionEn || prod.info.descriptionHi || 'Pure handcrafted artisan creation.'}
                </Text>

                <View style={styles.metaGrid}>
                  <Text style={styles.metaText}>
                    🧵 Material: <Text style={styles.metaBold}>{prod.info.primaryMaterial || prod.info.material || 'Natural'}</Text>
                  </Text>
                  <Text style={styles.metaText}>
                    📍 Origin: <Text style={styles.metaBold}>{prod.info.originState || 'India'}</Text>
                  </Text>
                </View>

                <View style={styles.priceRow}>
                  <View>
                    <Text style={styles.priceLabel}>Direct Artisan Price</Text>
                    <Text style={styles.priceVal}>
                      ₹{prod.pricing?.finalListingPrice?.toLocaleString('en-IN') || 0}
                    </Text>
                  </View>

                  <Button
                    title="💬 Inquire / Buy"
                    onPress={() =>
                      Alert.alert(
                        'Direct Artisan Connection 🤝',
                        `Interested in purchasing "${prod.info.titleEn || prod.info.titleHi}" directly from ${artisanProfile.name}?\n\nContact the artisan directly or place an inquiry.`
                      )
                    }
                    size="sm"
                    style={styles.buyBtn}
                  />
                </View>
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
  heroCard: {
    backgroundColor: Colors.primaryDark,
    borderRadius: 20,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  artisanName: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '900',
    color: '#FFF',
  },
  craftSubtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.accent,
    fontWeight: '700',
    marginTop: 2,
    marginBottom: 8,
  },
  artisanBio: {
    fontSize: Typography.fontSize.xs,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 18,
  },
  sectionHeaderRow: {
    marginTop: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: '800',
    color: Colors.text,
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
  productCard: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: 200,
  },
  emptyImage: {
    backgroundColor: Colors.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productDetails: {
    padding: Spacing.md,
  },
  tagRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 6,
  },
  productTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 4,
  },
  productDesc: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    lineHeight: 17,
    marginBottom: Spacing.sm,
  },
  metaGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.surfaceAlt,
    padding: 8,
    borderRadius: 10,
    marginBottom: Spacing.sm,
  },
  metaText: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  metaBold: {
    fontWeight: '700',
    color: Colors.text,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  priceLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  priceVal: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '900',
    color: Colors.primaryDark,
  },
  buyBtn: {
    paddingHorizontal: 16,
  },
});
