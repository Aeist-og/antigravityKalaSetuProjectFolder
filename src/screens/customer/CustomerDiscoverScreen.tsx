import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { Colors, Typography, Spacing, Shadows } from '../../constants/colors';
import { Header } from '../../components/common/Header';
import { Badge } from '../../components/common/Badge';
import { DatabaseService } from '../../services/database/databaseService';
import { Product } from '../../models/product';

const { width } = Dimensions.get('window');

export const CustomerDiscoverScreen: React.FC<{ navigation: any; route?: any }> = ({
  navigation,
  route,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>(
    route?.params?.initialCategory || 'All'
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const categories = ['All', 'Textiles', 'Pottery', 'Jewellery', 'Home Décor', 'Paintings', 'Woodcraft'];

  const loadProducts = async () => {
    try {
      const res = await DatabaseService.getAllPublishedProducts();
      if (res.data) setProducts(res.data);
    } catch (e) {
      console.warn('Error loading products:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadProducts();
    if (route?.params?.initialCategory) {
      setSelectedCategory(route.params.initialCategory);
    }
  }, [route?.params?.initialCategory]);

  const onRefresh = () => {
    setRefreshing(true);
    loadProducts();
  };

  const filtered = products.filter(p => {
    const title = (p.info.titleEn || p.info.titleHi || '').toLowerCase();
    const craft = (p.info.craftType || '').toLowerCase();
    const mat = (p.info.material || '').toLowerCase();
    const state = (p.info.originState || '').toLowerCase();
    const q = searchQuery.toLowerCase();

    const matchesSearch = title.includes(q) || craft.includes(q) || mat.includes(q) || state.includes(q);
    const matchesCat =
      selectedCategory === 'All' ||
      (p.info.category || '').toLowerCase().includes(selectedCategory.toLowerCase()) ||
      craft.includes(selectedCategory.toLowerCase());

    return matchesSearch && matchesCat;
  });

  return (
    <View style={styles.screen}>
      <Header
        title="Discover Authentic Crafts"
        subtitle="Search handmade products by craft, material & region"
        showLanguageToggle
      />

      <View style={styles.searchBox}>
        <TextInput
          style={styles.input}
          placeholder="Search silk stoles, terracotta vases, brass lamps..."
          placeholderTextColor={Colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.catWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catChips}>
          {categories.map(c => (
            <TouchableOpacity
              key={c}
              style={[styles.chip, selectedCategory === c && styles.chipActive]}
              onPress={() => setSelectedCategory(c)}
            >
              <Text style={[styles.chipText, selectedCategory === c && styles.chipTextActive]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {loading ? (
          <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
        ) : filtered.length === 0 ? (
          <View style={[styles.emptyCard, Shadows.soft]}>
            <Text style={styles.emptyEmoji}>🔎</Text>
            <Text style={styles.emptyTitle}>No matching crafts found</Text>
            <Text style={styles.emptyDesc}>Try adjusting your keywords or category selection.</Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {filtered.map(product => {
              const primaryImg = product.images.find(i => i.isPrimary) || product.images[0];
              const imgUri = primaryImg?.processedUrl || primaryImg?.originalUrl;
              const price = product.pricing?.finalListingPrice || product.pricing?.suggestedRetailPrice || 0;

              return (
                <TouchableOpacity
                  key={product.id}
                  style={[styles.card, Shadows.soft]}
                  onPress={() => navigation.navigate('ProductDetails', { productId: product.id })}
                >
                  <View style={styles.imgWrap}>
                    {imgUri ? (
                      <Image source={{ uri: imgUri }} style={styles.img} />
                    ) : (
                      <View style={styles.imgPlaceholder}>
                        <Text style={{ fontSize: 32 }}>🏺</Text>
                      </View>
                    )}
                    <View style={styles.badgeWrap}>
                      <Badge label={product.info.craftType} variant="primary" />
                    </View>
                  </View>

                  <View style={styles.info}>
                    <Text style={styles.title} numberOfLines={1}>
                      {product.info.titleEn || product.info.titleHi}
                    </Text>
                    <Text style={styles.origin} numberOfLines={1}>
                      📍 {product.info.originDistrict ? `${product.info.originDistrict}, ` : ''}{product.info.originState}
                    </Text>
                    <View style={styles.priceRow}>
                      <Text style={styles.price}>₹{price.toLocaleString()}</Text>
                      <Text style={styles.tag}>Free Delivery</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
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
  searchBox: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.xs,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: Typography.fontSize.sm,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  catWrap: {
    marginBottom: Spacing.xs,
  },
  catChips: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  chipTextActive: {
    color: '#FFF',
  },
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl * 2,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  card: {
    width: (width - Spacing.md * 2 - Spacing.sm) / 2,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  imgWrap: {
    width: '100%',
    height: 140,
    backgroundColor: Colors.surfaceAlt,
    position: 'relative',
  },
  img: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imgPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeWrap: {
    position: 'absolute',
    top: 6,
    left: 6,
  },
  info: {
    padding: Spacing.sm,
  },
  title: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  origin: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '800',
    color: Colors.secondary,
  },
  tag: {
    fontSize: 9,
    fontWeight: '600',
    color: Colors.success,
  },
  emptyCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.xl,
    alignItems: 'center',
    marginTop: 30,
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
});
