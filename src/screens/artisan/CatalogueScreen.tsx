import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { Colors, Typography, Spacing, Shadows } from '../../constants/colors';
import { Header } from '../../components/common/Header';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { DatabaseService } from '../../services/database/databaseService';
import { Product, ProductStatus } from '../../models/product';

export const CatalogueScreen: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState<'all' | ProductStatus>('all');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const loadProducts = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const filterArg = activeFilter === 'all' ? undefined : activeFilter;
      const res = await DatabaseService.getArtisanProducts(user.id, filterArg);
      if (res.data) setProducts(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [user?.id, activeFilter]);

  const filteredProducts = activeFilter === 'all'
    ? products
    : products.filter(p => p.status === activeFilter);

  return (
    <View style={styles.screen}>
      <Header
        title={t('catalogue.title')}
        subtitle={`${filteredProducts.length} items`}
        showLanguageToggle={true}
      />

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {(['all', 'published', 'draft', 'archived'] as const).map(tab => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveFilter(tab)}
            style={[styles.filterChip, activeFilter === tab && styles.filterChipActive]}
          >
            <Text style={[styles.filterChipText, activeFilter === tab && styles.filterChipTextActive]}>
              {tab === 'all' ? t('catalogue.filterAll') :
               tab === 'published' ? t('catalogue.filterPublished') :
               tab === 'draft' ? t('catalogue.filterDrafts') : t('catalogue.filterArchived')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {filteredProducts.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyTitle}>{t('catalogue.empty')}</Text>
          </View>
        ) : (
          filteredProducts.map(item => (
            <View key={item.id} style={[styles.card, Shadows.soft]}>
              {item.images[0]?.originalUrl ? (
                <Image source={{ uri: item.images[0].originalUrl }} style={styles.thumb} />
              ) : (
                <View style={[styles.thumb, styles.emptyThumb]}>
                  <Text style={{ fontSize: 24 }}>🏺</Text>
                </View>
              )}

              <View style={styles.infoCol}>
                <View style={styles.badgeRow}>
                  <Badge label={item.info.craftType || 'Craft'} variant="primary" />
                  <Badge
                    label={item.status.toUpperCase()}
                    variant={item.status === 'published' ? 'success' : item.status === 'draft' ? 'accent' : 'outline'}
                  />
                </View>

                <Text style={styles.title} numberOfLines={1}>
                  {item.info.titleHi || item.info.titleEn || 'Handcrafted Product'}
                </Text>
                <Text style={styles.meta}>
                  {item.info.material} • {item.info.originState}
                </Text>
                <Text style={styles.price}>₹{item.pricing?.finalListingPrice || 0}</Text>
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
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    gap: 8,
    marginBottom: Spacing.xs,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  filterChipTextActive: {
    color: '#FFF',
  },
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  emptyWrap: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: Spacing.xl,
    alignItems: 'center',
    marginTop: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  thumb: {
    width: 84,
    height: 84,
    borderRadius: 12,
  },
  emptyThumb: {
    backgroundColor: Colors.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoCol: {
    flex: 1,
    justifyContent: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 4,
  },
  title: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '700',
    color: Colors.text,
  },
  meta: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  price: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '800',
    color: Colors.primaryDark,
    marginTop: 4,
  },
});
