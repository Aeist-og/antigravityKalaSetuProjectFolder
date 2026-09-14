import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  TextInput,
} from 'react-native';
import { Colors, Typography, Spacing, Shadows } from '../../constants/colors';
import { Header } from '../../components/common/Header';
import { Badge } from '../../components/common/Badge';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { DatabaseService } from '../../services/database/databaseService';
import { Product } from '../../models/product';
import { ArtisanProfile } from '../../models/artisan';

const { width } = Dimensions.get('window');

export const CustomerHomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { t } = useLanguage();
  const { user } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [artisans, setArtisans] = useState<(ArtisanProfile & { fullName: string })[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const categories = [
    { name: 'Textiles', icon: '🧣' },
    { name: 'Pottery', icon: '🏺' },
    { name: 'Jewellery', icon: '💍' },
    { name: 'Home Décor', icon: '🪔' },
    { name: 'Paintings', icon: '🎨' },
    { name: 'Woodcraft', icon: '🪵' },
  ];

  const loadData = async () => {
    try {
      const [prodRes, artRes] = await Promise.all([
        DatabaseService.getAllPublishedProducts(),
        DatabaseService.getAllArtisans(),
      ]);
      if (prodRes.data) setProducts(prodRes.data);
      if (artRes.data) setArtisans(artRes.data);
    } catch (e) {
      console.warn('Error loading customer home:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const filteredProducts = searchQuery.trim()
    ? products.filter(p => {
        const q = searchQuery.toLowerCase();
        const title = (p.info.titleEn || p.info.titleHi || '').toLowerCase();
        const craft = (p.info.craftType || '').toLowerCase();
        const cat = (p.info.category || '').toLowerCase();
        const st = (p.info.originState || '').toLowerCase();
        return title.includes(q) || craft.includes(q) || cat.includes(q) || st.includes(q);
      })
    : products;

  const filteredArtisans = searchQuery.trim()
    ? artisans.filter(a => {
        const q = searchQuery.toLowerCase();
        const name = (a.fullName || '').toLowerCase();
        const craft = (a.craftType || '').toLowerCase();
        const st = (a.state || '').toLowerCase();
        return name.includes(q) || craft.includes(q) || st.includes(q);
      })
    : artisans;

  return (
    <View style={styles.screen}>
      <Header
        title="KalaSetu Marketplace"
        subtitle="Authentic handcrafted treasures of Bharat"
        showLanguageToggle
        rightAction={
          <TouchableOpacity
            onPress={() => navigation.navigate('Cart')}
            style={styles.cartHeaderBtn}
            accessibilityLabel="Shopping Bag"
          >
            <Text style={{ fontSize: 18 }}>🛒</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Prominent Search Bar */}
        <View style={[styles.searchBarWrap, Shadows.soft]}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search handmade products, crafts or artisans..."
            placeholderTextColor={Colors.textMuted}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearSearchBtn}>
              <Text style={styles.clearSearchText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Marketplace Hero Banner (Hidden when actively searching) */}
        {!searchQuery.trim() && (
          <View style={[styles.heroCard, Shadows.medium]}>
            <Text style={styles.heroPre}>DIRECT FROM THE ARTISAN 🇮🇳</Text>
            <Text style={styles.heroTitle}>Every Piece Has a Story.</Text>
            <Text style={styles.heroSub}>
              Support indigenous generational craftspeople. Fair livelihood with zero middlemen.
            </Text>
            <TouchableOpacity
              style={styles.heroBtn}
              onPress={() => navigation.navigate('Discover')}
            >
              <Text style={styles.heroBtnText}>Explore Catalogue →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Categories Bar */}
        {!searchQuery.trim() && (
          <>
            <Text style={styles.sectionTitle}>Craft Traditions</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catScroll}>
              {categories.map(c => (
                <TouchableOpacity
                  key={c.name}
                  style={[styles.catCard, Shadows.soft]}
                  onPress={() => navigation.navigate('Discover', { initialCategory: c.name })}
                >
                  <Text style={styles.catIcon}>{c.icon}</Text>
                  <Text style={styles.catName}>{c.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* KalaChannel Craft Stories Banner */}
            <TouchableOpacity
              style={[styles.storiesBanner, Shadows.soft]}
              onPress={() => navigation.navigate('KalaChannel')}
              activeOpacity={0.8}
            >
              <View style={styles.storiesBannerLeft}>
                <Text style={styles.storiesEmoji}>📽️</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.storiesTitle}>Watch Craft Stories on KalaChannel</Text>
                  <Text style={styles.storiesSub}>Behind-the-scenes videos & techniques from master artisans</Text>
                </View>
              </View>
              <Text style={styles.storiesArrow}>Watch →</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Featured / Searched Products */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>
            {searchQuery.trim() ? `Search Results (${filteredProducts.length})` : 'Handcrafted Masterpieces'}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Discover', { initialQuery: searchQuery })}>
            <Text style={styles.seeAllText}>See All ({filteredProducts.length})</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={Colors.primary} style={{ marginVertical: 30 }} />
        ) : filteredProducts.length === 0 ? (
          <View style={[styles.emptyCard, Shadows.soft]}>
            <Text style={styles.emptyEmoji}>🏺</Text>
            <Text style={styles.emptyTitle}>
              {searchQuery.trim() ? `No crafts found for "${searchQuery}"` : 'Catalogues are being published!'}
            </Text>
            <Text style={styles.emptyDesc}>
              {searchQuery.trim()
                ? 'Try searching by craft type (e.g. Pottery, Shawl, Silk, Painting) or state.'
                : 'Artisans are currently crafting and uploading handmade items.'}
            </Text>
          </View>
        ) : (
          <View style={styles.productsGrid}>
            {filteredProducts.slice(0, searchQuery.trim() ? 12 : 6).map(product => {
              const primaryImg = product.images.find(i => i.isPrimary) || product.images[0];
              const imgUri = primaryImg?.processedUrl || primaryImg?.originalUrl;
              const price = product.pricing?.finalListingPrice || product.pricing?.suggestedRetailPrice || 0;

              return (
                <TouchableOpacity
                  key={product.id}
                  style={[styles.productCard, Shadows.soft]}
                  onPress={() => navigation.navigate('ProductDetails', { productId: product.id })}
                >
                  <View style={styles.imageContainer}>
                    {imgUri ? (
                      <Image source={{ uri: imgUri }} style={styles.productImg} />
                    ) : (
                      <View style={styles.placeholderImg}>
                        <Text style={{ fontSize: 32 }}>🏺</Text>
                      </View>
                    )}
                    <View style={styles.craftBadgeWrap}>
                      <Badge label={product.info.craftType} variant="primary" />
                    </View>
                  </View>

                  <View style={styles.productDetails}>
                    <Text style={styles.productTitle} numberOfLines={1}>
                      {product.info.titleEn || product.info.titleHi}
                    </Text>
                    <Text style={styles.artisanSub} numberOfLines={1}>
                      By {product.info.originState} Artisan
                    </Text>
                    <View style={styles.priceRow}>
                      <Text style={styles.priceText}>₹{price.toLocaleString()}</Text>
                      <Text style={styles.freeShip}>Free Shipping</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Meet the Artisans Section */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Meet the Makers</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Discover')}>
            <Text style={styles.seeAllText}>All Makers ({artisans.length})</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.makersScroll}>
          {artisans.map(maker => (
            <TouchableOpacity
              key={maker.id}
              style={[styles.makerCard, Shadows.soft]}
              onPress={() => navigation.navigate('DigitalShowcase', { artisanId: maker.artisanId })}
            >
              <View style={styles.makerAvatar}>
                <Text style={styles.makerAvatarChar}>{maker.fullName.charAt(0)}</Text>
              </View>
              <Text style={styles.makerName} numberOfLines={1}>{maker.fullName}</Text>
              <Text style={styles.makerCraft} numberOfLines={1}>{maker.craftType}</Text>
              <Text style={styles.makerLoc}>📍 {maker.state}</Text>
              {maker.vacationMode && (
                <View style={styles.vacationBadge}>
                  <Text style={styles.vacationBadgeText}>Away</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
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
    paddingBottom: Spacing.xxl * 2,
  },
  searchBarWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.fontSize.xs,
    color: Colors.text,
    paddingVertical: 0,
  },
  clearSearchBtn: {
    padding: 4,
  },
  clearSearchText: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '700',
  },
  heroCard: {
    backgroundColor: Colors.primaryDark,
    borderRadius: 22,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  heroPre: {
    color: Colors.accent,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  heroTitle: {
    color: '#FFF',
    fontSize: Typography.fontSize.lg,
    fontWeight: '800',
    marginBottom: 6,
  },
  heroSub: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: Typography.fontSize.xs,
    lineHeight: 18,
    marginBottom: Spacing.md,
  },
  heroBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    alignSelf: 'flex-start',
  },
  heroBtnText: {
    color: '#FFF',
    fontSize: Typography.fontSize.xs,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  seeAllText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '700',
    color: Colors.primary,
  },
  catScroll: {
    gap: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  catCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    alignItems: 'center',
    minWidth: 84,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  catIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  catName: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.text,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  productCard: {
    width: (width - Spacing.md * 2 - Spacing.sm) / 2,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  imageContainer: {
    width: '100%',
    height: 140,
    backgroundColor: Colors.surfaceAlt,
    position: 'relative',
  },
  productImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImg: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  craftBadgeWrap: {
    position: 'absolute',
    top: 6,
    left: 6,
  },
  productDetails: {
    padding: Spacing.sm,
  },
  productTitle: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  artisanSub: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '800',
    color: Colors.secondary,
  },
  freeShip: {
    fontSize: 9,
    fontWeight: '600',
    color: Colors.success,
  },
  makersScroll: {
    gap: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  makerCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.md,
    alignItems: 'center',
    width: 120,
    borderWidth: 1,
    borderColor: Colors.border,
    position: 'relative',
  },
  makerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  makerAvatarChar: {
    fontSize: Typography.fontSize.md,
    fontWeight: '800',
    color: Colors.primary,
  },
  makerName: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
  },
  makerCraft: {
    fontSize: 10,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 1,
  },
  makerLoc: {
    fontSize: 9,
    color: Colors.textMuted,
    marginTop: 2,
  },
  vacationBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: Colors.warningLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  vacationBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    color: Colors.warning,
  },
  emptyCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyEmoji: {
    fontSize: 32,
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
  },
  storiesBanner: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 16,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
  },
  storiesBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: Spacing.sm,
  },
  storiesEmoji: {
    fontSize: 26,
  },
  storiesTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '700',
    color: Colors.text,
  },
  storiesSub: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  storiesArrow: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '700',
    color: Colors.primary,
  },
  cartHeaderBtn: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
});

