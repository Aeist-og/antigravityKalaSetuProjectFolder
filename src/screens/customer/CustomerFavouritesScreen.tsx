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
  Alert,
} from 'react-native';
import { Colors, Typography, Spacing, Shadows } from '../../constants/colors';
import { Header } from '../../components/common/Header';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { useAuth } from '../../context/AuthContext';
import { DatabaseService } from '../../services/database/databaseService';
import { FavouriteItem } from '../../models/favourite';

export const CustomerFavouritesScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuth();
  const [favourites, setFavourites] = useState<FavouriteItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const loadFavourites = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    try {
      const res = await DatabaseService.getFavourites(user.id);
      if (res.data) setFavourites(res.data);
    } catch (e) {
      console.warn('Error fetching favourites:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadFavourites();
  }, [user?.id]);

  const onRefresh = () => {
    setRefreshing(true);
    loadFavourites();
  };

  const handleRemove = async (productId: string) => {
    if (!user) return;
    await DatabaseService.toggleFavourite(user.id, productId);
    setFavourites(prev => prev.filter(f => f.productId !== productId));
  };

  const handleAddToCart = async (item: FavouriteItem) => {
    if (!item.productId) return;
    const targetUserId = user?.id || 'guest_patron';
    const price = item.product?.finalListingPrice || 500;
    await DatabaseService.addToCart(targetUserId, item.productId, 1, price);
    Alert.alert('Added to Shopping Bag! 🛒', 'Item is now in your shopping bag ready for checkout.');
  };

  return (
    <View style={styles.screen}>
      <Header
        title="Saved Handcrafted Items"
        subtitle="Your wishlist of artisan crafts"
        showLanguageToggle
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {loading ? (
          <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
        ) : favourites.length === 0 ? (
          <View style={[styles.emptyCard, Shadows.soft]}>
            <Text style={styles.emptyEmoji}>❤️</Text>
            <Text style={styles.emptyTitle}>Your wishlist is empty</Text>
            <Text style={styles.emptyDesc}>
              Tap the heart icon on any craft product to save it here for later.
            </Text>
            <Button
              title="Explore Crafts"
              onPress={() => navigation.navigate('Discover')}
              size="sm"
              style={{ marginTop: Spacing.md }}
            />
          </View>
        ) : (
          favourites.map(item => (
            <View key={item.id} style={[styles.card, Shadows.soft]}>
              <TouchableOpacity
                style={styles.cardMain}
                onPress={() => item.productId && navigation.navigate('ProductDetails', { productId: item.productId })}
              >
                {item.product?.primaryImageUrl ? (
                  <Image source={{ uri: item.product.primaryImageUrl }} style={styles.thumb} />
                ) : (
                  <View style={styles.thumbPlaceholder}>
                    <Text style={{ fontSize: 24 }}>🏺</Text>
                  </View>
                )}

                <View style={styles.cardInfo}>
                  <Badge label={item.product?.craftType || 'Handicraft'} variant="primary" />
                  <Text style={styles.title} numberOfLines={1}>
                    {item.product?.titleEn || item.product?.titleHi || 'Artisan Product'}
                  </Text>
                  <Text style={styles.artisan}>By {item.artisanName}</Text>
                  <Text style={styles.price}>
                    ₹{(item.product?.finalListingPrice || 0).toLocaleString()}
                  </Text>
                </View>
              </TouchableOpacity>

              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={styles.removeBtn}
                  onPress={() => item.productId && handleRemove(item.productId)}
                >
                  <Text style={styles.removeText}>Remove</Text>
                </TouchableOpacity>

                <Button
                  title="Move to Cart 🛒"
                  onPress={() => handleAddToCart(item)}
                  size="sm"
                  style={{ flex: 1 }}
                />
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
    paddingBottom: Spacing.xxl * 2,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardMain: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  thumb: {
    width: 80,
    height: 80,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  thumbPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: Colors.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  title: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 2,
  },
  artisan: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    marginVertical: 2,
  },
  price: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '800',
    color: Colors.secondary,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.xs,
  },
  removeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  removeText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.error,
    fontWeight: '600',
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
  },
});
