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
  Dimensions,
} from 'react-native';
import { Colors, Typography, Spacing, Shadows } from '../../constants/colors';
import { Header } from '../../components/common/Header';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { useAuth } from '../../context/AuthContext';
import { DatabaseService } from '../../services/database/databaseService';
import { Product } from '../../models/product';
import { ArtisanProfile } from '../../models/artisan';

const { width } = Dimensions.get('window');

export const ProductDetailsScreen: React.FC<{ navigation: any; route: any }> = ({
  navigation,
  route,
}) => {
  const { productId } = route.params;
  const { user } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [artisan, setArtisan] = useState<ArtisanProfile | null>(null);
  const [isFavourite, setIsFavourite] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [addingToCart, setAddingToCart] = useState<boolean>(false);

  useEffect(() => {
    const loadDetails = async () => {
      try {
        const prodRes = await DatabaseService.getProductById(productId);
        if (prodRes.data) {
          setProduct(prodRes.data);
          const artRes = await DatabaseService.getArtisanProfile(prodRes.data.artisanId);
          if (artRes.data) setArtisan(artRes.data);
        }

        if (user?.id) {
          const favs = await DatabaseService.getFavourites(user.id);
          if (favs.data) {
            setIsFavourite(favs.data.some(f => f.productId === productId));
          }
        }
      } catch (e) {
        console.warn('Error loading product details:', e);
      } finally {
        setLoading(false);
      }
    };

    loadDetails();
  }, [productId, user?.id]);

  const handleToggleFavourite = async () => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to save favourites.');
      return;
    }
    const res = await DatabaseService.toggleFavourite(user.id, productId, product?.artisanId);
    if (res.data) {
      setIsFavourite(res.data.isFavourite);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;

    setAddingToCart(true);
    try {
      const targetUserId = user?.id || 'guest_patron';
      const price = product.pricing?.finalListingPrice || product.pricing?.suggestedRetailPrice || 2499;
      await DatabaseService.addToCart(targetUserId, product.id, 1, price);
      
      Alert.alert(
        'Added to Shopping Bag! 🛒',
        `"${product.info.titleEn || product.info.titleHi || 'Handmade Craft'}" has been added to your shopping bag.`,
        [
          { text: 'Keep Exploring', style: 'cancel' },
          { text: 'View Bag 🛍️', onPress: () => navigation.navigate('Cart') },
        ]
      );
    } catch (e) {
      console.warn('Error adding to cart:', e);
      Alert.alert('Notice', 'Unable to add to cart. Please try again.');
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.loadingScreen}>
        <Text style={styles.notFoundText}>Product not found</Text>
        <Button title="Go Back" onPress={() => navigation.goBack()} size="sm" />
      </View>
    );
  }

  const primaryImg = product.images.find(i => i.isPrimary) || product.images[0];
  const imgUri = primaryImg?.processedUrl || primaryImg?.originalUrl;
  const price = product.pricing?.finalListingPrice || product.pricing?.suggestedRetailPrice || 0;

  return (
    <View style={styles.screen}>
      <Header
        title={product.info.craftType}
        onBack={() => navigation.goBack()}
        showLanguageToggle
        rightAction={
          <TouchableOpacity
            onPress={() => navigation.navigate('Cart')}
            style={styles.cartHeaderBtn}
            accessibilityLabel="View Bag"
          >
            <Text style={{ fontSize: 18 }}>🛒</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Main Hero Photo */}
        <View style={styles.imageGallery}>
          {imgUri ? (
            <Image source={{ uri: imgUri }} style={styles.heroImage} />
          ) : (
            <View style={styles.placeholderImg}>
              <Text style={{ fontSize: 48 }}>🏺</Text>
            </View>
          )}

          <TouchableOpacity style={styles.favBtn} onPress={handleToggleFavourite}>
            <Text style={{ fontSize: 20 }}>{isFavourite ? '❤️' : '🤍'}</Text>
          </TouchableOpacity>
        </View>

        {/* Title & Price Card */}
        <View style={[styles.mainCard, Shadows.soft]}>
          <View style={styles.badgeRow}>
            <Badge label={product.info.craftType} variant="primary" />
            <Badge label={product.info.category || 'Handicrafts'} variant="outline" />
            {product.info.originState ? (
              <Badge label={`📍 ${product.info.originState}`} variant="outline" />
            ) : null}
          </View>

          <Text style={styles.productTitle}>
            {product.info.titleEn || product.info.titleHi}
          </Text>

          <View style={styles.priceContainer}>
            <Text style={styles.priceText}>₹{price.toLocaleString()}</Text>
            <Text style={styles.taxNote}>Inclusive of all taxes • Direct to Artisan</Text>
          </View>
        </View>

        {/* Vacation Mode Notice */}
        {artisan?.vacationMode && (
          <View style={[styles.vacationNotice, Shadows.soft]}>
            <Text style={styles.vacationTitle}>🌴 Artisan Notice</Text>
            <Text style={styles.vacationText}>
              {artisan.vacationMessage || 'This artisan is currently taking a short break from the loom/wheel.'}
              {artisan.vacationReturnDate ? ` Expected return: ${artisan.vacationReturnDate}.` : ''}
              Orders placed now will be prioritized upon their return.
            </Text>
          </View>
        )}

        {/* Craft Story & Specifications */}
        <View style={[styles.detailsCard, Shadows.soft]}>
          <Text style={styles.sectionHeader}>Craft Story & Technique</Text>
          <Text style={styles.descriptionText}>
            {product.info.descriptionEn || product.info.descriptionHi || 'Handcrafted using indigenous techniques.'}
          </Text>

          <View style={styles.specTable}>
            {product.info.material ? (
              <View style={styles.specRow}>
                <Text style={styles.specLabel}>Material</Text>
                <Text style={styles.specVal}>{product.info.material}</Text>
              </View>
            ) : null}
            {product.info.technique ? (
              <View style={styles.specRow}>
                <Text style={styles.specLabel}>Technique</Text>
                <Text style={styles.specVal}>{product.info.technique}</Text>
              </View>
            ) : null}
            {product.info.dimensions ? (
              <View style={styles.specRow}>
                <Text style={styles.specLabel}>Dimensions</Text>
                <Text style={styles.specVal}>{product.info.dimensions}</Text>
              </View>
            ) : null}
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Production Time</Text>
              <Text style={styles.specVal}>{product.info.productionTimeDays} days handcrafting</Text>
            </View>
          </View>
        </View>

        {/* Maker Profile Card */}
        <TouchableOpacity
          style={[styles.artisanCard, Shadows.soft]}
          onPress={() => navigation.navigate('DigitalShowcase', { artisanId: product.artisanId })}
        >
          <View style={styles.artisanHeader}>
            <View style={styles.artisanAvatar}>
              <Text style={styles.avatarChar}>
                {(artisan?.fullName || 'Artisan').charAt(0)}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.artisanName}>
                  {artisan?.fullName || 'Master Artisan'}
                </Text>
                <Badge label="Maker" variant="success" />
              </View>
              <Text style={styles.artisanCraft}>
                {product.info.craftType} • {artisan?.experienceYears || '10+'} years experience
              </Text>
            </View>
          </View>
          {artisan?.bio ? (
            <Text style={styles.artisanBio} numberOfLines={2}>
              "{artisan.bio}"
            </Text>
          ) : null}
          <Text style={styles.viewMakerLink}>View Artisan Profile & Digital Stall →</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Sticky Action Bar */}
      <View style={[styles.bottomBar, Shadows.medium]}>
        <View style={styles.barPriceCol}>
          <Text style={styles.barPriceLabel}>Listing Price</Text>
          <Text style={styles.barPriceVal}>₹{price.toLocaleString()}</Text>
        </View>

        <View style={styles.barBtnsRow}>
          <Button
            title={addingToCart ? 'Adding...' : '🛒 Add to Bag'}
            onPress={handleAddToCart}
            loading={addingToCart}
            size="md"
            style={styles.addToCartBtn}
          />
          <TouchableOpacity
            style={styles.viewBagSmallBtn}
            onPress={() => navigation.navigate('Cart')}
          >
            <Text style={styles.viewBagSmallText}>Bag 🛍️</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  notFoundText: {
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  content: {
    paddingBottom: 100,
  },
  imageGallery: {
    width: '100%',
    height: 320,
    backgroundColor: Colors.surfaceAlt,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImg: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  favBtn: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    backgroundColor: 'rgba(255,255,255,0.9)',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  mainCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: Spacing.xs,
  },
  productTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 6,
  },
  priceContainer: {
    marginTop: 4,
  },
  priceText: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '800',
    color: Colors.secondary,
  },
  taxNote: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  vacationNotice: {
    backgroundColor: Colors.warningLight,
    margin: Spacing.md,
    padding: Spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(217, 119, 6, 0.3)',
  },
  vacationTitle: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '800',
    color: Colors.warning,
    marginBottom: 4,
  },
  vacationText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  detailsCard: {
    backgroundColor: Colors.surface,
    margin: Spacing.md,
    padding: Spacing.md,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionHeader: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  descriptionText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  specTable: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.sm,
    gap: 8,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  specLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textMuted,
  },
  specVal: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '700',
    color: Colors.text,
  },
  artisanCard: {
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    padding: Spacing.md,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  artisanHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  artisanAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  avatarChar: {
    fontSize: Typography.fontSize.md,
    fontWeight: '800',
    color: Colors.primary,
  },
  artisanName: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '800',
    color: Colors.text,
  },
  artisanCraft: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  artisanBio: {
    fontSize: Typography.fontSize.xs,
    fontStyle: 'italic',
    color: Colors.textSecondary,
    marginVertical: Spacing.xs,
  },
  viewMakerLink: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '700',
    color: Colors.primary,
    marginTop: 4,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  barPriceCol: {
    flex: 1,
  },
  barPriceLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  barPriceVal: {
    fontSize: Typography.fontSize.md,
    fontWeight: '800',
    color: Colors.primary,
  },
  barBtnsRow: {
    flex: 1.8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addToCartBtn: {
    flex: 1,
  },
  viewBagSmallBtn: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: Colors.primaryLight,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewBagSmallText: {
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
