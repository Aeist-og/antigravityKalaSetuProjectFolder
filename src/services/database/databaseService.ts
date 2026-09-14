import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, isSupabaseConfigured } from '../supabase/client';
import { UserProfile, UserRole } from '../../models/auth';
import { ArtisanProfile, ArtisanProfileUpdate } from '../../models/artisan';
import { BusinessProfile, BusinessProfileUpdate } from '../../models/business';
import { CustomerProfile, CustomerProfileUpdate } from '../../models/customer';
import { Cart, CartItem } from '../../models/cart';
import { Order, OrderItem, CreateOrderInput, OrderStatus, PaymentStatus } from '../../models/order';
import { FavouriteItem } from '../../models/favourite';
import { AccountDeletionRequest } from '../../models/accountDeletion';
import { Product, ProductInformation, ProductStatus } from '../../models/product';
import { PricingCalculationResult } from '../../models/pricing';
import { KalaPost, KalaComment, CreateKalaPostInput } from '../../models/kalachannel';
import { ActivityEvent, CreateActivityInput } from '../../models/activity';
import { Opportunity, OpportunityResponse, CreateOpportunityInput, CreateOpportunityResponseInput, ResponseStatus } from '../../models/opportunity';
import { Exhibition, CreateExhibitionInput } from '../../models/exhibition';

export interface DbResult<T> {
  data: T | null;
  error: string | null;
}

const STORAGE_KEYS = {
  PROFILES: '@kalasetu_profiles',
  ARTISAN_PROFILES: '@kalasetu_artisan_profiles',
  BUSINESS_PROFILES: '@kalasetu_business_profiles',
  CUSTOMER_PROFILES: '@kalasetu_customer_profiles',
  PRODUCTS: '@kalasetu_products',
  KALA_POSTS: '@kalasetu_kala_posts',
  KALA_LIKES: '@kalasetu_kala_likes',
  KALA_COMMENTS: '@kalasetu_kala_comments',
  ACTIVITIES: '@kalasetu_activities',
  OPPORTUNITIES: '@kalasetu_opportunities',
  OPPORTUNITY_RESPONSES: '@kalasetu_opportunity_responses',
  EXHIBITIONS: '@kalasetu_exhibitions',
  CARTS: '@kalasetu_carts',
  FAVOURITES: '@kalasetu_favourites',
  ORDERS: '@kalasetu_orders',
  DELETION_REQUESTS: '@kalasetu_deletion_requests',
};

export class DatabaseService {
  private static async getLocalItem<T>(key: string, defaultVal: T): Promise<T> {
    try {
      const raw = await AsyncStorage.getItem(key);
      return raw ? JSON.parse(raw) : defaultVal;
    } catch {
      return defaultVal;
    }
  }

  private static async setLocalItem<T>(key: string, val: T): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(val));
    } catch (e) {
      console.warn('[DatabaseService] Local storage write error:', e);
    }
  }

  // ==========================================
  // USER PROFILES
  // ==========================================

  public static async getUserProfile(userId: string): Promise<DbResult<UserProfile>> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (!error && data) {
          return {
            data: {
              id: data.id,
              fullName: data.full_name,
              phone: data.phone,
              role: data.role as UserRole,
              languagePreference: data.language_preference,
              avatarUrl: data.avatar_url,
              createdAt: data.created_at,
              updatedAt: data.updated_at,
            },
            error: null,
          };
        }
      } catch (err: unknown) {
        console.warn('[DatabaseService] Supabase profile fetch failed, checking local:', err);
      }
    }

    const profiles = await this.getLocalItem<Record<string, UserProfile>>(STORAGE_KEYS.PROFILES, {});
    const local = profiles[userId];
    if (local) return { data: local, error: null };

    const defaultProfile: UserProfile = {
      id: userId,
      fullName: 'Artisan',
      phone: '',
      role: 'artisan',
      languagePreference: 'hi',
      avatarUrl: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return { data: defaultProfile, error: null };
  }

  public static async upsertUserProfile(profile: Partial<UserProfile> & { id: string }): Promise<DbResult<UserProfile>> {
    let savedProfile: UserProfile | null = null;

    if (isSupabaseConfigured) {
      try {
        const payload: Record<string, unknown> = {
          id: profile.id,
          updated_at: new Date().toISOString(),
        };
        if (profile.fullName) payload.full_name = profile.fullName;
        if (profile.phone) payload.phone = profile.phone;
        if (profile.role) payload.role = profile.role;
        if (profile.languagePreference) payload.language_preference = profile.languagePreference;
        if (profile.avatarUrl !== undefined) payload.avatar_url = profile.avatarUrl;

        const { data, error } = await supabase
          .from('profiles')
          .upsert(payload)
          .select()
          .single();

        if (!error && data) {
          savedProfile = {
            id: data.id,
            fullName: data.full_name,
            phone: data.phone,
            role: data.role as UserRole,
            languagePreference: data.language_preference,
            avatarUrl: data.avatar_url,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
          };
        }
      } catch (err: unknown) {
        console.warn('[DatabaseService] Supabase upsert error:', err);
      }
    }

    const profiles = await this.getLocalItem<Record<string, UserProfile>>(STORAGE_KEYS.PROFILES, {});
    const current = profiles[profile.id] || {
      id: profile.id,
      fullName: 'Artisan',
      phone: '',
      role: 'artisan',
      languagePreference: 'hi',
      avatarUrl: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const merged: UserProfile = {
      ...current,
      ...profile,
      updatedAt: new Date().toISOString(),
    };

    profiles[profile.id] = merged;
    await this.setLocalItem(STORAGE_KEYS.PROFILES, profiles);

    return { data: savedProfile || merged, error: null };
  }

  // ==========================================
  // ARTISAN PROFILES
  // ==========================================

  public static async getArtisanProfile(artisanId: string): Promise<DbResult<ArtisanProfile>> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('artisan_profiles')
          .select('*')
          .eq('artisan_id', artisanId)
          .maybeSingle();

        if (!error && data) {
          return {
            data: {
              id: data.id,
              artisanId: data.artisan_id,
              craftType: data.craft_type,
              state: data.state,
              district: data.district,
              experienceYears: data.experience_years,
              productionCapacity: data.production_capacity,
              bio: data.bio,
              verificationStatus: data.verification_status,
              isAvailable: data.is_available ?? true,
              vacationMode: data.vacation_mode ?? false,
              vacationMessage: data.vacation_message,
              vacationReturnDate: data.vacation_return_date,
              msmeNumber: data.msme_number,
              craftCluster: data.craft_cluster,
              gstin: data.gstin,
              createdAt: data.created_at,
              updatedAt: data.updated_at,
            },
            error: null,
          };
        }
      } catch (err: unknown) {
        console.warn('[DatabaseService] Supabase artisan profile fetch failed:', err);
      }
    }

    const artisanMap = await this.getLocalItem<Record<string, ArtisanProfile>>(STORAGE_KEYS.ARTISAN_PROFILES, {});
    return { data: artisanMap[artisanId] || null, error: null };
  }

  public static async upsertArtisanProfile(
    artisanId: string,
    update: ArtisanProfileUpdate
  ): Promise<DbResult<ArtisanProfile>> {
    let saved: ArtisanProfile | null = null;

    if (isSupabaseConfigured) {
      try {
        const payload: Record<string, unknown> = {
          artisan_id: artisanId,
          updated_at: new Date().toISOString(),
        };
        if (update.craftType !== undefined) payload.craft_type = update.craftType;
        if (update.state !== undefined) payload.state = update.state;
        if (update.district !== undefined) payload.district = update.district;
        if (update.experienceYears !== undefined) payload.experience_years = update.experienceYears;
        if (update.productionCapacity !== undefined) payload.production_capacity = update.productionCapacity;
        if (update.bio !== undefined) payload.bio = update.bio;
        if (update.isAvailable !== undefined) payload.is_available = update.isAvailable;
        if (update.vacationMode !== undefined) payload.vacation_mode = update.vacationMode;
        if (update.vacationMessage !== undefined) payload.vacation_message = update.vacationMessage;
        if (update.vacationReturnDate !== undefined) payload.vacation_return_date = update.vacationReturnDate;
        if (update.msmeNumber !== undefined) payload.msme_number = update.msmeNumber;
        if (update.craftCluster !== undefined) payload.craft_cluster = update.craftCluster;
        if (update.gstin !== undefined) payload.gstin = update.gstin;

        const { data, error } = await supabase
          .from('artisan_profiles')
          .upsert(payload, { onConflict: 'artisan_id' })
          .select()
          .single();

        if (!error && data) {
          saved = {
            id: data.id,
            artisanId: data.artisan_id,
            craftType: data.craft_type,
            state: data.state,
            district: data.district,
            experienceYears: data.experience_years,
            productionCapacity: data.production_capacity,
            bio: data.bio,
            verificationStatus: data.verification_status,
            isAvailable: data.is_available ?? true,
            vacationMode: data.vacation_mode ?? false,
            vacationMessage: data.vacation_message,
            vacationReturnDate: data.vacation_return_date,
            msmeNumber: data.msme_number,
            craftCluster: data.craft_cluster,
            gstin: data.gstin,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
          };
        }
      } catch (err: unknown) {
        console.warn('[DatabaseService] Supabase upsert artisan profile error:', err);
      }
    }

    const artisanMap = await this.getLocalItem<Record<string, ArtisanProfile>>(STORAGE_KEYS.ARTISAN_PROFILES, {});
    const existing = artisanMap[artisanId] || {
      id: 'local-artisan-prof-' + Date.now(),
      artisanId,
      craftType: 'Traditional Craft',
      state: 'Uttar Pradesh',
      district: 'Varanasi',
      experienceYears: '5',
      productionCapacity: '10-20 pieces/month',
      bio: '',
      verificationStatus: 'unverified' as const,
      isAvailable: true,
      vacationMode: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const merged: ArtisanProfile = {
      ...existing,
      ...update,
      updatedAt: new Date().toISOString(),
    };
    artisanMap[artisanId] = merged;
    await this.setLocalItem(STORAGE_KEYS.ARTISAN_PROFILES, artisanMap);

    return { data: saved || merged, error: null };
  }

  // ==========================================
  // PRODUCTS & CATALOGUE
  // ==========================================

  public static async getArtisanProducts(
    artisanId: string,
    statusFilter?: ProductStatus
  ): Promise<DbResult<Product[]>> {
    if (isSupabaseConfigured) {
      try {
        let query = supabase
          .from('products')
          .select(`
            *,
            product_images (*),
            product_pricing (*)
          `)
          .eq('artisan_id', artisanId);

        if (statusFilter) {
          query = query.eq('status', statusFilter);
        }

        const { data, error } = await query.order('created_at', { ascending: false });
        if (!error && data) {
          const mapped: Product[] = data.map(p => ({
            id: p.id,
            artisanId: p.artisan_id,
            status: p.status as ProductStatus,
            info: {
              titleEn: p.title_en,
              titleHi: p.title_hi,
              craftType: p.craft_type,
              category: p.category || 'Handicrafts',
              material: p.material,
              technique: p.technique,
              originState: p.origin_state || 'India',
              originDistrict: p.origin_district || undefined,
              productionTimeDays: p.production_time_days || 1,
              descriptionEn: p.description_en,
              descriptionHi: p.description_hi,
              dimensions: p.dimensions,
              quantityAvailable: p.quantity_available,
              customizationAvailable: p.customization_available,
              careInstructions: p.care_instructions,
            },
            images: (p.product_images || []).map((img: any) => ({
              id: img.id,
              productId: img.product_id,
              originalUrl: img.original_url,
              processedUrl: img.processed_url,
              isPrimary: img.is_primary,
              createdAt: img.created_at,
            })),
            pricing: p.product_pricing ? {
              materialCost: p.product_pricing.material_cost,
              labourCostPerDay: p.product_pricing.labour_cost_per_day,
              labourDays: p.product_pricing.labour_days,
              totalLabourCost: p.product_pricing.total_labour_cost,
              packagingCost: p.product_pricing.packaging_cost,
              additionalCost: p.product_pricing.additional_cost,
              marginPercent: p.product_pricing.margin_percent,
              totalCalculatedCost: p.product_pricing.total_calculated_cost,
              suggestedRetailPrice: p.product_pricing.suggested_retail_price,
              suggestedBulkPrice: p.product_pricing.suggested_bulk_price,
              finalListingPrice: p.product_pricing.final_listing_price,
              currency: p.product_pricing.currency || 'INR',
            } : undefined,
            createdAt: p.created_at,
            updatedAt: p.updated_at,
          }));

          return { data: mapped, error: null };
        }
      } catch (err: unknown) {
        console.warn('[DatabaseService] Supabase products fetch failed, using local:', err);
      }
    }

    const allProducts = await this.getLocalItem<Product[]>(STORAGE_KEYS.PRODUCTS, []);
    const filtered = allProducts.filter(p => {
      const matchArtisan = !artisanId || p.artisanId === artisanId;
      const matchStatus = !statusFilter || p.status === statusFilter;
      return matchArtisan && matchStatus;
    });

    return { data: filtered, error: null };
  }

  public static async getProductById(productId: string): Promise<DbResult<Product>> {
    if (isSupabaseConfigured) {
      try {
        const { data: p, error } = await supabase
          .from('products')
          .select(`
            *,
            product_images (*),
            product_pricing (*)
          `)
          .eq('id', productId)
          .single();

        if (!error && p) {
          const product: Product = {
            id: p.id,
            artisanId: p.artisan_id,
            status: p.status as ProductStatus,
            info: {
              titleEn: p.title_en,
              titleHi: p.title_hi,
              craftType: p.craft_type,
              category: p.category || 'Handicrafts',
              material: p.material,
              technique: p.technique,
              originState: p.origin_state || 'India',
              originDistrict: p.origin_district || undefined,
              productionTimeDays: p.production_time_days || 1,
              descriptionEn: p.description_en,
              descriptionHi: p.description_hi,
              dimensions: p.dimensions,
              quantityAvailable: p.quantity_available,
              customizationAvailable: p.customization_available,
              careInstructions: p.care_instructions,
            },
            images: (p.product_images || []).map((img: any) => ({
              id: img.id,
              productId: img.product_id,
              originalUrl: img.original_url,
              processedUrl: img.processed_url,
              isPrimary: img.is_primary,
              createdAt: img.created_at,
            })),
            pricing: p.product_pricing ? {
              materialCost: p.product_pricing.material_cost,
              labourCostPerDay: p.product_pricing.labour_cost_per_day,
              labourDays: p.product_pricing.labour_days,
              totalLabourCost: p.product_pricing.total_labour_cost,
              packagingCost: p.product_pricing.packaging_cost,
              additionalCost: p.product_pricing.additional_cost,
              marginPercent: p.product_pricing.margin_percent,
              totalCalculatedCost: p.product_pricing.total_calculated_cost,
              suggestedRetailPrice: p.product_pricing.suggested_retail_price,
              suggestedBulkPrice: p.product_pricing.suggested_bulk_price,
              finalListingPrice: p.product_pricing.final_listing_price,
              currency: p.product_pricing.currency || 'INR',
            } : undefined,
            createdAt: p.created_at,
            updatedAt: p.updated_at,
          };
          return { data: product, error: null };
        }
      } catch (err: unknown) {
        console.warn('[DatabaseService] Supabase getProductById error:', err);
      }
    }

    const allProducts = await this.getLocalItem<Product[]>(STORAGE_KEYS.PRODUCTS, []);
    const found = allProducts.find(p => p.id === productId);
    return { data: found || null, error: found ? null : 'Product not found' };
  }

  public static async saveProduct({
    artisanId,
    status,
    info,
    pricing,
    imageUrls,
    productId,
  }: {
    artisanId: string;
    status: ProductStatus;
    info: ProductInformation;
    pricing?: PricingCalculationResult;
    imageUrls?: { originalUrl: string; processedUrl?: string };
    productId?: string;
  }): Promise<DbResult<Product>> {
    const finalId = productId || ('prod-' + Date.now());
    const now = new Date().toISOString();

    const newProduct: Product = {
      id: finalId,
      artisanId,
      status,
      info,
      pricing,
      images: imageUrls ? [{
        id: 'img-' + Date.now(),
        productId: finalId,
        originalUrl: imageUrls.originalUrl,
        processedUrl: imageUrls.processedUrl || null,
        isPrimary: true,
        createdAt: now,
      }] : [],
      createdAt: now,
      updatedAt: now,
    };

    if (isSupabaseConfigured) {
      try {
        const productPayload: Record<string, unknown> = {
          artisan_id: artisanId,
          status,
          title_en: info.titleEn,
          title_hi: info.titleHi,
          craft_type: info.craftType,
          category: info.category,
          material: info.material,
          technique: info.technique,
          origin_state: info.originState,
          origin_district: info.originDistrict,
          production_time_days: info.productionTimeDays,
          description_en: info.descriptionEn,
          description_hi: info.descriptionHi,
          dimensions: info.dimensions,
          quantity_available: info.quantityAvailable,
          customization_available: info.customizationAvailable,
          care_instructions: info.careInstructions,
          updated_at: now,
        };
        if (productId && !productId.startsWith('prod-')) {
          productPayload.id = productId;
        }

        const { data: savedProduct, error: pError } = await supabase
          .from('products')
          .upsert(productPayload)
          .select()
          .single();

        if (!pError && savedProduct) {
          newProduct.id = savedProduct.id;

          if (pricing) {
            await supabase.from('product_pricing').upsert({
              product_id: savedProduct.id,
              material_cost: pricing.materialCost,
              labour_cost_per_day: pricing.labourCostPerDay,
              labour_days: pricing.labourDays,
              total_labour_cost: pricing.totalLabourCost,
              packaging_cost: pricing.packagingCost,
              additional_cost: pricing.additionalCost,
              margin_percent: pricing.marginPercent,
              total_calculated_cost: pricing.totalCalculatedCost,
              suggested_retail_price: pricing.suggestedRetailPrice,
              suggested_bulk_price: pricing.suggestedBulkPrice,
              final_listing_price: pricing.finalListingPrice,
              currency: pricing.currency,
              updated_at: now,
            }, { onConflict: 'product_id' });
          }

          if (imageUrls?.originalUrl) {
            await supabase.from('product_images').insert({
              product_id: savedProduct.id,
              original_url: imageUrls.originalUrl,
              processed_url: imageUrls.processedUrl || null,
              is_primary: true,
            });
          }
        }
      } catch (err) {
        console.warn('[DatabaseService] Supabase save product error:', err);
      }
    }

    const allProducts = await this.getLocalItem<Product[]>(STORAGE_KEYS.PRODUCTS, []);
    const idx = allProducts.findIndex(p => p.id === newProduct.id || (productId && p.id === productId));
    if (idx >= 0) {
      allProducts[idx] = {
        ...allProducts[idx],
        ...newProduct,
        images: newProduct.images.length > 0 ? newProduct.images : allProducts[idx].images,
        updatedAt: now,
      };
    } else {
      allProducts.unshift(newProduct);
    }
    await this.setLocalItem(STORAGE_KEYS.PRODUCTS, allProducts);

    return { data: newProduct, error: null };
  }

  public static async updateProductStatus(productId: string, status: ProductStatus): Promise<DbResult<boolean>> {
    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('products')
          .update({ status, updated_at: new Date().toISOString() })
          .eq('id', productId);
      } catch (err) {
        console.warn('[DatabaseService] Supabase update status error:', err);
      }
    }

    const allProducts = await this.getLocalItem<Product[]>(STORAGE_KEYS.PRODUCTS, []);
    const idx = allProducts.findIndex(p => p.id === productId);
    if (idx >= 0) {
      allProducts[idx].status = status;
      allProducts[idx].updatedAt = new Date().toISOString();
      await this.setLocalItem(STORAGE_KEYS.PRODUCTS, allProducts);
      return { data: true, error: null };
    }
    return { data: false, error: 'Product not found' };
  }

  public static async deleteProduct(productId: string): Promise<DbResult<boolean>> {
    if (isSupabaseConfigured) {
      try {
        await supabase.from('products').delete().eq('id', productId);
      } catch (err) {
        console.warn('[DatabaseService] Supabase delete product error:', err);
      }
    }

    const allProducts = await this.getLocalItem<Product[]>(STORAGE_KEYS.PRODUCTS, []);
    const filtered = allProducts.filter(p => p.id !== productId);
    await this.setLocalItem(STORAGE_KEYS.PRODUCTS, filtered);
    return { data: true, error: null };
  }

  // ==========================================
  // KALACHANNEL (Phase 1J - Interactive)
  // ==========================================

  public static readonly DEFAULT_KALA_POSTS: KalaPost[] = [
    // Artisan 1: Ramesh Vankar (demo-artisan-1)
    {
      id: 'post-ramesh-video',
      artisanId: 'demo-artisan-1',
      artisanName: 'Ramesh Vankar',
      artisanLocation: 'Bhujodi, Kutch, Gujarat',
      artisanAvatarEmoji: '🧵',
      craftType: 'Handloom Weaving',
      mediaType: 'video',
      mediaUri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      videoThumbnailUri: 'https://images.unsplash.com/photo-1606744888344-493238955de0?w=800&q=80',
      storyType: 'workshop_live',
      caption: 'Listen to the wooden rhythmic dance of the shuttle across our 4-pedal pit loom. Each centimetre requires 42 warp intersections.',
      linkedProductId: 'prod-1',
      linkedProductTitle: 'Handwoven Kutch Wool Shawl',
      linkedProductPrice: 3450,
      likesCount: 38,
      isLikedByMe: false,
      commentsCount: 5,
      createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    },
    {
      id: 'post-ramesh-story',
      artisanId: 'demo-artisan-1',
      artisanName: 'Ramesh Vankar',
      artisanLocation: 'Bhujodi, Kutch, Gujarat',
      artisanAvatarEmoji: '🧵',
      craftType: 'Handloom Weaving',
      mediaType: 'image',
      mediaUri: 'https://images.unsplash.com/photo-1606744888344-493238955de0?w=800&q=80',
      storyType: 'craft_story',
      caption: 'My grandfather taught me that every motif in Kutchi weaving tells a desert tale — water bodies, migrating cranes, and camel footprints across the Rann.',
      likesCount: 42,
      isLikedByMe: false,
      commentsCount: 7,
      createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    },
    {
      id: 'post-ramesh-product',
      artisanId: 'demo-artisan-1',
      artisanName: 'Ramesh Vankar',
      artisanLocation: 'Bhujodi, Kutch, Gujarat',
      artisanAvatarEmoji: '🧵',
      craftType: 'Handloom Weaving',
      mediaType: 'image',
      mediaUri: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&q=80',
      storyType: 'product_showcase',
      caption: 'Just completed: Desi wool stole hand-dyed with natural madder root and indigo vat fermentation. Naturally thermoregulating.',
      linkedProductId: 'prod-1',
      linkedProductTitle: 'Handwoven Kutch Wool Shawl',
      linkedProductPrice: 3450,
      likesCount: 29,
      isLikedByMe: false,
      commentsCount: 3,
      createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    },

    // Artisan 2: Meera Devi (demo-artisan-2)
    {
      id: 'post-meera-video',
      artisanId: 'demo-artisan-2',
      artisanName: 'Meera Devi',
      artisanLocation: 'Kot Jewar, Jaipur, Rajasthan',
      artisanAvatarEmoji: '🏺',
      craftType: 'Blue Pottery',
      mediaType: 'video',
      mediaUri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
      videoThumbnailUri: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800&q=80',
      storyType: 'behind_the_scenes',
      caption: 'Hand-glazing in progress: Watch how copper oxide pigment turns from pale grey to brilliant turquoise inside the wood-fired kiln.',
      linkedProductId: 'prod-2',
      linkedProductTitle: 'Hand-painted Blue Pottery Vase',
      linkedProductPrice: 1850,
      likesCount: 56,
      isLikedByMe: false,
      commentsCount: 9,
      createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    },
    {
      id: 'post-meera-story',
      artisanId: 'demo-artisan-2',
      artisanName: 'Meera Devi',
      artisanLocation: 'Kot Jewar, Jaipur, Rajasthan',
      artisanAvatarEmoji: '🏺',
      craftType: 'Blue Pottery',
      mediaType: 'image',
      mediaUri: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800&q=80',
      storyType: 'craft_story',
      caption: 'Unlike traditional clay pottery, Jaipur Blue Pottery uses no clay at all! Our dough is crafted from quartz powder, raw glass, Katira Gond gum, and Multani mitti.',
      likesCount: 64,
      isLikedByMe: false,
      commentsCount: 12,
      createdAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
    },
    {
      id: 'post-meera-product',
      artisanId: 'demo-artisan-2',
      artisanName: 'Meera Devi',
      artisanLocation: 'Kot Jewar, Jaipur, Rajasthan',
      artisanAvatarEmoji: '🏺',
      craftType: 'Blue Pottery',
      mediaType: 'image',
      mediaUri: 'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?w=800&q=80',
      storyType: 'product_showcase',
      caption: 'Royal Persian arabesque motif urli bowl. Waterproof, hygienic, and individually freehand-painted with zero stencils.',
      linkedProductId: 'prod-2',
      linkedProductTitle: 'Hand-painted Blue Pottery Vase',
      linkedProductPrice: 1850,
      likesCount: 33,
      isLikedByMe: false,
      commentsCount: 4,
      createdAt: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
    },

    // Artisan 3: Suresh Kumar (demo-artisan-3)
    {
      id: 'post-suresh-video',
      artisanId: 'demo-artisan-3',
      artisanName: 'Suresh Kumar',
      artisanLocation: 'Kondagaon, Bastar, Chhattisgarh',
      artisanAvatarEmoji: '⚒️',
      craftType: 'Dhokra Metalcraft',
      mediaType: 'video',
      mediaUri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      videoThumbnailUri: 'https://images.unsplash.com/photo-1590736969955-71cc94801759?w=800&q=80',
      storyType: 'workshop_live',
      caption: 'Breaking the baked clay mold after red-hot casting! The moment when the glowing bronze sculpture sees the light for the first time.',
      linkedProductId: 'prod-3',
      linkedProductTitle: 'Dhokra Brass Tribal Musician Figurine',
      linkedProductPrice: 2450,
      likesCount: 71,
      isLikedByMe: false,
      commentsCount: 14,
      createdAt: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
    },
    {
      id: 'post-suresh-story',
      artisanId: 'demo-artisan-3',
      artisanName: 'Suresh Kumar',
      artisanLocation: 'Kondagaon, Bastar, Chhattisgarh',
      artisanAvatarEmoji: '⚒️',
      craftType: 'Dhokra Metalcraft',
      mediaType: 'image',
      mediaUri: 'https://images.unsplash.com/photo-1590736969955-71cc94801759?w=800&q=80',
      storyType: 'craft_story',
      caption: 'Dhokra has survived untouched for 4,000 years since the Mohenjo-daro Dancing Girl. Each piece requires hand-rolling pure beeswax strands to sculpt the original form.',
      likesCount: 88,
      isLikedByMe: false,
      commentsCount: 18,
      createdAt: new Date(Date.now() - 40 * 3600 * 1000).toISOString(),
    },
    {
      id: 'post-suresh-product',
      artisanId: 'demo-artisan-3',
      artisanName: 'Suresh Kumar',
      artisanLocation: 'Kondagaon, Bastar, Chhattisgarh',
      artisanAvatarEmoji: '⚒️',
      craftType: 'Dhokra Metalcraft',
      mediaType: 'image',
      mediaUri: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&q=80',
      storyType: 'product_showcase',
      caption: 'Bastar Tribal Piper & Drummer: Solid recycled brass and bell metal alloy. Since the clay mold is destroyed during casting, no two pieces can ever be identical.',
      linkedProductId: 'prod-3',
      linkedProductTitle: 'Dhokra Brass Tribal Musician Figurine',
      linkedProductPrice: 2450,
      likesCount: 47,
      isLikedByMe: false,
      commentsCount: 6,
      createdAt: new Date(Date.now() - 80 * 3600 * 1000).toISOString(),
    },
  ];

  public static async getKalaPosts(currentUserId?: string): Promise<DbResult<KalaPost[]>> {
    if (isSupabaseConfigured) {
      try {
        const { data: posts, error } = await supabase
          .from('posts')
          .select(`
            *,
            profiles:artisan_id (full_name),
            post_likes (user_id),
            post_comments (count)
          `)
          .order('created_at', { ascending: false });

        if (!error && posts && posts.length > 0) {
          const mapped: KalaPost[] = posts.map((p: any) => {
            const likes = p.post_likes || [];
            const isLiked = currentUserId ? likes.some((l: any) => l.user_id === currentUserId) : false;
            const commentsCount = p.post_comments?.[0]?.count || 0;

            return {
              id: p.id,
              artisanId: p.artisan_id,
              artisanName: p.profiles?.full_name || 'Artisan',
              craftType: p.craft_type || 'Traditional Craft',
              mediaType: p.media_type || (p.media_url && p.media_url.endsWith('.mp4') ? 'video' : 'image'),
              mediaUri: p.media_url,
              videoThumbnailUri: p.thumbnail_url,
              storyType: p.story_type || 'craft_story',
              caption: p.caption,
              linkedProductId: p.linked_product_id,
              likesCount: likes.length || p.likes_count || 0,
              isLikedByMe: isLiked,
              commentsCount: Number(commentsCount),
              createdAt: p.created_at,
            };
          });

          return { data: mapped, error: null };
        }
      } catch (err) {
        console.warn('[DatabaseService] Supabase getKalaPosts failed:', err);
      }
    }

    const posts = await this.getLocalItem<KalaPost[]>(STORAGE_KEYS.KALA_POSTS, this.DEFAULT_KALA_POSTS);
    return { data: posts, error: null };
  }

  public static async createKalaPost(input: CreateKalaPostInput): Promise<DbResult<KalaPost>> {
    const now = new Date().toISOString();
    let savedId = 'post-' + Date.now();

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('posts')
          .insert({
            artisan_id: input.artisanId,
            media_url: input.mediaUri,
            media_type: input.mediaType,
            thumbnail_url: input.videoThumbnailUri,
            caption: input.caption,
            craft_type: input.craftType,
            story_type: input.storyType || 'craft_story',
            linked_product_id: input.linkedProductId && !input.linkedProductId.startsWith('prod-') ? input.linkedProductId : null,
          })
          .select()
          .single();

        if (!error && data) {
          savedId = data.id;
        }
      } catch (err) {
        console.warn('[DatabaseService] Supabase createKalaPost error:', err);
      }
    }

    const newPost: KalaPost = {
      id: savedId,
      artisanId: input.artisanId,
      artisanName: input.artisanName,
      artisanLocation: input.artisanLocation,
      artisanAvatarEmoji: input.artisanAvatarEmoji || '🎨',
      craftType: input.craftType,
      mediaType: input.mediaType,
      mediaUri: input.mediaUri,
      videoThumbnailUri: input.videoThumbnailUri,
      storyType: input.storyType || 'craft_story',
      caption: input.caption,
      linkedProductId: input.linkedProductId,
      linkedProductTitle: input.linkedProductTitle,
      linkedProductPrice: input.linkedProductPrice,
      likesCount: 0,
      isLikedByMe: false,
      commentsCount: 0,
      createdAt: now,
    };

    const posts = await this.getLocalItem<KalaPost[]>(STORAGE_KEYS.KALA_POSTS, this.DEFAULT_KALA_POSTS);
    posts.unshift(newPost);
    await this.setLocalItem(STORAGE_KEYS.KALA_POSTS, posts);

    return { data: newPost, error: null };
  }

  public static async togglePostLike(postId: string, userId: string): Promise<DbResult<{ isLiked: boolean; newCount: number }>> {
    if (isSupabaseConfigured) {
      try {
        const { data: existing } = await supabase
          .from('post_likes')
          .select('id')
          .eq('post_id', postId)
          .eq('user_id', userId)
          .maybeSingle();

        if (existing) {
          await supabase.from('post_likes').delete().eq('id', existing.id);
          return { data: { isLiked: false, newCount: 0 }, error: null };
        } else {
          await supabase.from('post_likes').insert({ post_id: postId, user_id: userId });
          return { data: { isLiked: true, newCount: 1 }, error: null };
        }
      } catch (err) {
        console.warn('[DatabaseService] Supabase togglePostLike error:', err);
      }
    }

    const posts = await this.getLocalItem<KalaPost[]>(STORAGE_KEYS.KALA_POSTS, []);
    const idx = posts.findIndex(p => p.id === postId);
    if (idx >= 0) {
      const wasLiked = Boolean(posts[idx].isLikedByMe);
      posts[idx].isLikedByMe = !wasLiked;
      posts[idx].likesCount = Math.max(0, posts[idx].likesCount + (wasLiked ? -1 : 1));
      await this.setLocalItem(STORAGE_KEYS.KALA_POSTS, posts);
      return { data: { isLiked: !wasLiked, newCount: posts[idx].likesCount }, error: null };
    }

    return { data: { isLiked: true, newCount: 1 }, error: null };
  }

  public static async toggleLikePost(postId: string, userId?: string): Promise<DbResult<{ isLiked: boolean; newCount: number }>> {
    return this.togglePostLike(postId, userId || 'user-local');
  }

  public static async getPostComments(postId: string): Promise<DbResult<KalaComment[]>> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('post_comments')
          .select(`
            *,
            profiles:user_id (full_name)
          `)
          .eq('post_id', postId)
          .order('created_at', { ascending: true });

        if (!error && data) {
          const comments: KalaComment[] = data.map((c: any) => ({
            id: c.id,
            postId: c.post_id,
            userId: c.user_id,
            userName: c.profiles?.full_name || 'Artisan Friend',
            commentText: c.comment_text,
            createdAt: c.created_at,
          }));
          return { data: comments, error: null };
        }
      } catch (err) {
        console.warn('[DatabaseService] Supabase getPostComments error:', err);
      }
    }

    const allComments = await this.getLocalItem<Record<string, KalaComment[]>>(STORAGE_KEYS.KALA_COMMENTS, {});
    return { data: allComments[postId] || [], error: null };
  }

  public static async addPostComment(
    postId: string,
    userId: string,
    commentTextOrAuthor: string,
    maybeText?: string
  ): Promise<DbResult<KalaComment>> {
    const commentText = maybeText !== undefined ? maybeText : commentTextOrAuthor;
    const authorName = maybeText !== undefined ? commentTextOrAuthor : 'Artisan Friend';
    const now = new Date().toISOString();
    let savedComment: KalaComment = {
      id: 'comment-' + Date.now(),
      postId,
      userId,
      userName: authorName,
      authorName,
      commentText,
      content: commentText,
      createdAt: now,
    };

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('post_comments')
          .insert({
            post_id: postId,
            user_id: userId,
            comment_text: commentText,
          })
          .select(`
            *,
            profiles:user_id (full_name)
          `)
          .single();

        if (!error && data) {
          savedComment = {
            id: data.id,
            postId: data.post_id,
            userId: data.user_id,
            userName: data.profiles?.full_name || authorName,
            authorName: data.profiles?.full_name || authorName,
            commentText: data.comment_text,
            content: data.comment_text,
            createdAt: data.created_at,
          };
        }
      } catch (err) {
        console.warn('[DatabaseService] Supabase addPostComment error:', err);
      }
    }

    const allComments = await this.getLocalItem<Record<string, KalaComment[]>>(STORAGE_KEYS.KALA_COMMENTS, {});
    if (!allComments[postId]) allComments[postId] = [];
    allComments[postId].push(savedComment);
    await this.setLocalItem(STORAGE_KEYS.KALA_COMMENTS, allComments);

    return { data: savedComment, error: null };
  }

  // ==========================================
  // ACTIVITIES & REALTIME NOTIFICATIONS (Phase 1K)
  // ==========================================

  public static async getActivityEvents(userId?: string): Promise<DbResult<ActivityEvent[]>> {
    if (isSupabaseConfigured && userId) {
      try {
        const { data, error } = await supabase
          .from('activities')
          .select('*')
          .eq('recipient_id', userId)
          .order('created_at', { ascending: false });

        if (!error && data) {
          const events: ActivityEvent[] = data.map((a: any) => ({
            id: a.id,
            userId: a.recipient_id,
            type: a.type,
            titleEn: a.message,
            titleHi: a.message_hi || a.message,
            detailsEn: a.entity_type ? `${a.entity_type}: ${a.entity_id || ''}` : '',
            detailsHi: a.entity_type ? `${a.entity_type}: ${a.entity_id || ''}` : '',
            timestamp: a.created_at,
            status: 'success',
          }));
          return { data: events, error: null };
        }
      } catch (err) {
        console.warn('[DatabaseService] Supabase activities error:', err);
      }
    }

    const events = await this.getLocalItem<ActivityEvent[]>(STORAGE_KEYS.ACTIVITIES, []);
    const filtered = userId ? events.filter(e => e.userId === userId) : events;
    return { data: filtered, error: null };
  }

  public static async logActivity(input: CreateActivityInput): Promise<DbResult<ActivityEvent>> {
    const now = new Date().toISOString();
    let finalId = 'act-' + Date.now();

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('activities')
          .insert({
            recipient_id: input.userId,
            type: input.type,
            message: input.titleEn,
            message_hi: input.titleHi,
            entity_type: input.type,
          })
          .select()
          .single();

        if (!error && data) {
          finalId = data.id;
        }
      } catch (err) {
        console.warn('[DatabaseService] Supabase log activity error:', err);
      }
    }

    const newEvent: ActivityEvent = {
      id: finalId,
      userId: input.userId,
      type: input.type,
      titleEn: input.titleEn,
      titleHi: input.titleHi,
      detailsEn: input.detailsEn,
      detailsHi: input.detailsHi,
      timestamp: now,
      status: input.status || 'success',
    };

    const events = await this.getLocalItem<ActivityEvent[]>(STORAGE_KEYS.ACTIVITIES, []);
    events.unshift(newEvent);
    if (events.length > 100) events.length = 100;
    await this.setLocalItem(STORAGE_KEYS.ACTIVITIES, events);

    return { data: newEvent, error: null };
  }

  // ==========================================
  // B2B OPPORTUNITIES & RESPONSES (Phase 2 & 16)
  // ==========================================

  public static async getOpportunities(status: string = 'open'): Promise<DbResult<Opportunity[]>> {
    if (isSupabaseConfigured) {
      try {
        let query = supabase
          .from('opportunities')
          .select(`
            *,
            opportunity_responses (count)
          `)
          .order('created_at', { ascending: false });

        if (status) {
          query = query.eq('status', status);
        }

        const { data, error } = await query;

        if (!error && data) {
          const mapped: Opportunity[] = data.map((o: any) => ({
            id: o.id,
            businessId: o.business_id,
            businessName: o.business_name,
            title: o.title,
            craftType: o.craft_type,
            description: o.description,
            quantity: o.quantity,
            budget: o.budget ? Number(o.budget) : undefined,
            deadline: o.deadline,
            location: o.location,
            status: o.status,
            createdAt: o.created_at,
            updatedAt: o.updated_at,
            responsesCount: o.opportunity_responses?.[0]?.count || 0,
          }));
          return { data: mapped, error: null };
        }
      } catch (err) {
        console.warn('[DatabaseService] Supabase getOpportunities error:', err);
      }
    }

    const opps = await this.getLocalItem<Opportunity[]>(STORAGE_KEYS.OPPORTUNITIES, [
      {
        id: 'opp-default-1',
        businessId: 'biz-hotel-group',
        businessName: 'Heritage Palace Hotels',
        title: '50 Handcrafted Terracotta Vases for Lobby Renovation',
        craftType: 'Terracotta & Pottery',
        description: 'Need 50 large traditional glazed terracotta decorative vases with tribal motif embossing. Height 18-24 inches.',
        quantity: 50,
        budget: 75000,
        deadline: 'Within 30 Days',
        location: 'Jaipur, Rajasthan',
        status: 'open',
        createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
        updatedAt: new Date().toISOString(),
        responsesCount: 2,
      },
      {
        id: 'opp-default-2',
        businessId: 'biz-corp-gifts',
        businessName: 'Tattva Corporate Gifting',
        title: '150 Handwoven Silk Shawls / Stoles for Annual Summit',
        craftType: 'Handloom & Weaving',
        description: 'Looking for authentic certified handloom silk stoles in natural indigo and madder dye. Premium packaging required.',
        quantity: 150,
        budget: 180000,
        deadline: 'Within 45 Days',
        location: 'Varanasi, UP',
        status: 'open',
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
        updatedAt: new Date().toISOString(),
        responsesCount: 5,
      },
    ]);
    return { data: opps, error: null };
  }

  public static async createOpportunity(input: CreateOpportunityInput): Promise<DbResult<Opportunity>> {
    const now = new Date().toISOString();
    let savedId = 'opp-' + Date.now();

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('opportunities')
          .insert({
            business_id: input.businessId,
            business_name: input.businessName,
            title: input.title,
            craft_type: input.craftType,
            description: input.description,
            quantity: input.quantity,
            budget: input.budget,
            deadline: input.deadline,
            location: input.location,
            status: 'open',
          })
          .select()
          .single();

        if (!error && data) {
          savedId = data.id;
        }
      } catch (err) {
        console.warn('[DatabaseService] Supabase createOpportunity error:', err);
      }
    }

    const newOpp: Opportunity = {
      id: savedId,
      businessId: input.businessId,
      businessName: input.businessName,
      title: input.title,
      craftType: input.craftType,
      description: input.description,
      quantity: input.quantity,
      budget: input.budget,
      deadline: input.deadline,
      location: input.location,
      status: 'open',
      createdAt: now,
      updatedAt: now,
      responsesCount: 0,
    };

    const opps = await this.getLocalItem<Opportunity[]>(STORAGE_KEYS.OPPORTUNITIES, []);
    opps.unshift(newOpp);
    await this.setLocalItem(STORAGE_KEYS.OPPORTUNITIES, opps);

    return { data: newOpp, error: null };
  }

  public static async respondToOpportunity(input: CreateOpportunityResponseInput & { artisanName?: string; craftType?: string }): Promise<DbResult<OpportunityResponse>> {
    const now = new Date().toISOString();
    let savedId = 'resp-' + Date.now();

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('opportunity_responses')
          .insert({
            opportunity_id: input.opportunityId,
            artisan_id: input.artisanId,
            status: 'pending',
            message: input.message,
            quote_amount: input.quoteAmount,
            linked_product_id: input.linkedProductId && !input.linkedProductId.startsWith('prod-') ? input.linkedProductId : null,
          })
          .select()
          .single();

        if (!error && data) {
          savedId = data.id;
        }
      } catch (err) {
        console.warn('[DatabaseService] Supabase respondToOpportunity error:', err);
      }
    }

    const response: OpportunityResponse = {
      id: savedId,
      opportunityId: input.opportunityId,
      artisanId: input.artisanId,
      artisanName: input.artisanName || 'Artisan',
      craftType: input.craftType || 'Handicrafts',
      status: 'pending',
      message: input.message,
      quoteAmount: input.quoteAmount,
      linkedProductId: input.linkedProductId,
      createdAt: now,
      updatedAt: now,
    };

    const allResponses = await this.getLocalItem<OpportunityResponse[]>(STORAGE_KEYS.OPPORTUNITY_RESPONSES, []);
    allResponses.unshift(response);
    await this.setLocalItem(STORAGE_KEYS.OPPORTUNITY_RESPONSES, allResponses);

    return { data: response, error: null };
  }

  public static async getOpportunityResponses(opportunityId?: string): Promise<DbResult<OpportunityResponse[]>> {
    if (isSupabaseConfigured && opportunityId) {
      try {
        const { data, error } = await supabase
          .from('opportunity_responses')
          .select(`
            *,
            profiles:artisan_id (full_name)
          `)
          .eq('opportunity_id', opportunityId)
          .order('created_at', { ascending: false });

        if (!error && data) {
          const mapped: OpportunityResponse[] = data.map((r: any) => ({
            id: r.id,
            opportunityId: r.opportunity_id,
            artisanId: r.artisan_id,
            artisanName: r.profiles?.full_name || 'Artisan Maker',
            status: r.status,
            message: r.message,
            quoteAmount: r.quote_amount ? Number(r.quote_amount) : undefined,
            linkedProductId: r.linked_product_id,
            createdAt: r.created_at,
            updatedAt: r.updated_at,
          }));
          return { data: mapped, error: null };
        }
      } catch (err) {
        console.warn('[DatabaseService] Supabase getOpportunityResponses error:', err);
      }
    }

    const allResponses = await this.getLocalItem<OpportunityResponse[]>(STORAGE_KEYS.OPPORTUNITY_RESPONSES, []);
    const filtered = opportunityId ? allResponses.filter(r => r.opportunityId === opportunityId) : allResponses;
    return { data: filtered, error: null };
  }

  public static async updateResponseStatus(responseId: string, status: ResponseStatus): Promise<DbResult<boolean>> {
    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('opportunity_responses')
          .update({ status, updated_at: new Date().toISOString() })
          .eq('id', responseId);
      } catch (err) {
        console.warn('[DatabaseService] Supabase updateResponseStatus error:', err);
      }
    }

    const allResponses = await this.getLocalItem<OpportunityResponse[]>(STORAGE_KEYS.OPPORTUNITY_RESPONSES, []);
    const idx = allResponses.findIndex(r => r.id === responseId);
    if (idx >= 0) {
      allResponses[idx].status = status;
      allResponses[idx].updatedAt = new Date().toISOString();
      await this.setLocalItem(STORAGE_KEYS.OPPORTUNITY_RESPONSES, allResponses);
      return { data: true, error: null };
    }
    return { data: false, error: 'Response not found' };
  }

  public static async updateOpportunityResponseStatus(responseId: string, status: ResponseStatus): Promise<DbResult<boolean>> {
    return this.updateResponseStatus(responseId, status);
  }

  public static async getArtisanOpportunityResponses(artisanId: string): Promise<DbResult<OpportunityResponse[]>> {
    if (isSupabaseConfigured && artisanId) {
      try {
        const { data, error } = await supabase
          .from('opportunity_responses')
          .select(`
            *,
            opportunities:opportunity_id (title, business_name)
          `)
          .eq('artisan_id', artisanId)
          .order('created_at', { ascending: false });

        if (!error && data) {
          const mapped: OpportunityResponse[] = data.map((r: any) => ({
            id: r.id,
            opportunityId: r.opportunity_id,
            artisanId: r.artisan_id,
            status: r.status,
            message: r.message,
            quoteAmount: r.quote_amount ? Number(r.quote_amount) : undefined,
            quotedPrice: r.quote_amount ? Number(r.quote_amount) : undefined,
            linkedProductId: r.linked_product_id,
            attachedProductId: r.linked_product_id,
            linkedProductTitle: r.opportunities?.title,
            attachedProductTitle: r.opportunities?.title,
            createdAt: r.created_at,
            updatedAt: r.updated_at,
          }));
          return { data: mapped, error: null };
        }
      } catch (err) {
        console.warn('[DatabaseService] Supabase getArtisanOpportunityResponses error:', err);
      }
    }

    const allResponses = await this.getLocalItem<OpportunityResponse[]>(STORAGE_KEYS.OPPORTUNITY_RESPONSES, []);
    const filtered = allResponses.filter(r => r.artisanId === artisanId);
    return { data: filtered, error: null };
  }

  // ==========================================
  // EXHIBITIONS & DIGITAL SHOWCASE (Phase 15)
  // ==========================================

  public static async createExhibition(input: CreateExhibitionInput): Promise<DbResult<Exhibition>> {
    const now = new Date().toISOString();
    const slug = input.shareSlug || `artisan-${Date.now().toString(36)}`;
    let savedId = 'exh-' + Date.now();

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('exhibitions')
          .insert({
            artisan_id: input.artisanId,
            exhibition_name: input.exhibitionName,
            collection_title: input.collectionTitle,
            description: input.description,
            promo_message: input.promoMessage,
            share_slug: slug,
            stall_number: input.stallNumber,
          })
          .select()
          .single();

        if (!error && data) {
          savedId = data.id;
        }
      } catch (err) {
        console.warn('[DatabaseService] Supabase createExhibition error:', err);
      }
    }

    const exhibition: Exhibition = {
      id: savedId,
      artisanId: input.artisanId,
      exhibitionName: input.exhibitionName,
      collectionTitle: input.collectionTitle,
      description: input.description,
      promoMessage: input.promoMessage,
      shareSlug: slug,
      stallNumber: input.stallNumber,
      qrCodeUrl: `https://kalasetu.in/showcase/${slug}`,
      createdAt: now,
      updatedAt: now,
    };

    const exhs = await this.getLocalItem<Exhibition[]>(STORAGE_KEYS.EXHIBITIONS, []);
    exhs.unshift(exhibition);
    await this.setLocalItem(STORAGE_KEYS.EXHIBITIONS, exhs);

    return { data: exhibition, error: null };
  }

  public static async getArtisanExhibitions(artisanId: string): Promise<DbResult<Exhibition[]>> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('exhibitions')
          .select('*')
          .eq('artisan_id', artisanId)
          .order('created_at', { ascending: false });

        if (!error && data) {
          const mapped: Exhibition[] = data.map((e: any) => ({
            id: e.id,
            artisanId: e.artisan_id,
            exhibitionName: e.exhibition_name,
            collectionTitle: e.collection_title,
            description: e.description,
            promoMessage: e.promo_message,
            shareSlug: e.share_slug,
            stallNumber: e.stall_number,
            qrCodeUrl: `https://kalasetu.in/showcase/${e.share_slug}`,
            createdAt: e.created_at,
            updatedAt: e.updated_at,
          }));
          return { data: mapped, error: null };
        }
      } catch (err) {
        console.warn('[DatabaseService] Supabase getArtisanExhibitions error:', err);
      }
    }

    const exhs = await this.getLocalItem<Exhibition[]>(STORAGE_KEYS.EXHIBITIONS, []);
    const filtered = exhs.filter(e => e.artisanId === artisanId);
    return { data: filtered, error: null };
  }

  // ==========================================
  // BUSINESS PROFILES
  // ==========================================

  public static async getBusinessProfile(businessId: string): Promise<DbResult<BusinessProfile>> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('business_profiles')
          .select('*')
          .eq('business_id', businessId)
          .maybeSingle();

        if (!error && data) {
          return {
            data: {
              id: data.id,
              businessId: data.business_id,
              businessName: data.business_name,
              contactPerson: data.contact_person,
              email: data.email,
              phone: data.phone,
              businessType: data.business_type,
              industry: data.industry,
              state: data.state,
              district: data.district,
              address: data.address,
              gstin: data.gstin,
              website: data.website,
              createdAt: data.created_at,
              updatedAt: data.updated_at,
            },
            error: null,
          };
        }
      } catch (err) {
        console.warn('[DatabaseService] Supabase getBusinessProfile error:', err);
      }
    }

    const bMap = await this.getLocalItem<Record<string, BusinessProfile>>(STORAGE_KEYS.BUSINESS_PROFILES, {});
    return { data: bMap[businessId] || null, error: null };
  }

  public static async upsertBusinessProfile(
    businessId: string,
    update: BusinessProfileUpdate
  ): Promise<DbResult<BusinessProfile>> {
    let saved: BusinessProfile | null = null;

    if (isSupabaseConfigured) {
      try {
        const payload: Record<string, unknown> = {
          business_id: businessId,
          updated_at: new Date().toISOString(),
        };
        if (update.businessName !== undefined) payload.business_name = update.businessName;
        if (update.contactPerson !== undefined) payload.contact_person = update.contactPerson;
        if (update.email !== undefined) payload.email = update.email;
        if (update.phone !== undefined) payload.phone = update.phone;
        if (update.businessType !== undefined) payload.business_type = update.businessType;
        if (update.industry !== undefined) payload.industry = update.industry;
        if (update.state !== undefined) payload.state = update.state;
        if (update.district !== undefined) payload.district = update.district;
        if (update.address !== undefined) payload.address = update.address;
        if (update.gstin !== undefined) payload.gstin = update.gstin;
        if (update.website !== undefined) payload.website = update.website;

        const { data, error } = await supabase
          .from('business_profiles')
          .upsert(payload, { onConflict: 'business_id' })
          .select()
          .single();

        if (!error && data) {
          saved = {
            id: data.id,
            businessId: data.business_id,
            businessName: data.business_name,
            contactPerson: data.contact_person,
            email: data.email,
            phone: data.phone,
            businessType: data.business_type,
            industry: data.industry,
            state: data.state,
            district: data.district,
            address: data.address,
            gstin: data.gstin,
            website: data.website,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
          };
        }
      } catch (err) {
        console.warn('[DatabaseService] Supabase upsertBusinessProfile error:', err);
      }
    }

    const bMap = await this.getLocalItem<Record<string, BusinessProfile>>(STORAGE_KEYS.BUSINESS_PROFILES, {});
    const existing = bMap[businessId] || {
      id: 'local-bprof-' + Date.now(),
      businessId,
      businessName: update.businessName || 'Business Buyer',
      contactPerson: update.contactPerson || '',
      email: update.email || '',
      phone: update.phone || '',
      businessType: update.businessType || 'Retailer',
      industry: update.industry || 'Handicrafts & Decor',
      state: update.state || 'Delhi',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const merged: BusinessProfile = {
      ...existing,
      ...update,
      updatedAt: new Date().toISOString(),
    };
    bMap[businessId] = merged;
    await this.setLocalItem(STORAGE_KEYS.BUSINESS_PROFILES, bMap);

    return { data: saved || merged, error: null };
  }

  // ==========================================
  // CUSTOMER PROFILES
  // ==========================================

  public static async getCustomerProfile(customerId: string): Promise<DbResult<CustomerProfile>> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('customer_profiles')
          .select('*')
          .eq('customer_id', customerId)
          .maybeSingle();

        if (!error && data) {
          return {
            data: {
              id: data.id,
              customerId: data.customer_id,
              deliveryAddress: data.delivery_address,
              pincode: data.pincode,
              state: data.state,
              district: data.district,
              createdAt: data.created_at,
              updatedAt: data.updated_at,
            },
            error: null,
          };
        }
      } catch (err) {
        console.warn('[DatabaseService] Supabase getCustomerProfile error:', err);
      }
    }

    const cMap = await this.getLocalItem<Record<string, CustomerProfile>>(STORAGE_KEYS.CUSTOMER_PROFILES, {});
    return { data: cMap[customerId] || null, error: null };
  }

  public static async upsertCustomerProfile(
    customerId: string,
    update: CustomerProfileUpdate
  ): Promise<DbResult<CustomerProfile>> {
    let saved: CustomerProfile | null = null;

    if (isSupabaseConfigured) {
      try {
        const payload: Record<string, unknown> = {
          customer_id: customerId,
          updated_at: new Date().toISOString(),
        };
        if (update.deliveryAddress !== undefined) payload.delivery_address = update.deliveryAddress;
        if (update.pincode !== undefined) payload.pincode = update.pincode;
        if (update.state !== undefined) payload.state = update.state;
        if (update.district !== undefined) payload.district = update.district;

        const { data, error } = await supabase
          .from('customer_profiles')
          .upsert(payload, { onConflict: 'customer_id' })
          .select()
          .single();

        if (!error && data) {
          saved = {
            id: data.id,
            customerId: data.customer_id,
            deliveryAddress: data.delivery_address,
            pincode: data.pincode,
            state: data.state,
            district: data.district,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
          };
        }
      } catch (err) {
        console.warn('[DatabaseService] Supabase upsertCustomerProfile error:', err);
      }
    }

    const cMap = await this.getLocalItem<Record<string, CustomerProfile>>(STORAGE_KEYS.CUSTOMER_PROFILES, {});
    const existing = cMap[customerId] || {
      id: 'local-cprof-' + Date.now(),
      customerId,
      deliveryAddress: '123 Main Street',
      pincode: '110001',
      state: 'Delhi',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const merged: CustomerProfile = {
      ...existing,
      ...update,
      updatedAt: new Date().toISOString(),
    };
    cMap[customerId] = merged;
    await this.setLocalItem(STORAGE_KEYS.CUSTOMER_PROFILES, cMap);

    return { data: saved || merged, error: null };
  }

  // ==========================================
  // MARKETPLACE DISCOVERY: PRODUCTS & ARTISANS
  // ==========================================

  public static async getAllPublishedProducts(): Promise<DbResult<Product[]>> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('products')
          .select(`
            id,
            artisan_id,
            status,
            title_en,
            title_hi,
            craft_type,
            category,
            material,
            technique,
            origin_state,
            origin_district,
            production_time_days,
            description_en,
            description_hi,
            dimensions,
            quantity_available,
            customization_available,
            care_instructions,
            created_at,
            updated_at,
            product_images (id, original_url, processed_url, is_primary),
            product_pricing (final_listing_price, suggested_retail_price, currency),
            profiles:artisan_id (id, full_name)
          `)
          .eq('status', 'published')
          .order('created_at', { ascending: false });

        if (!error && data) {
          const products: Product[] = data.map((row: any) => {
            const pricing = Array.isArray(row.product_pricing)
              ? row.product_pricing[0]
              : row.product_pricing;
            const images = Array.isArray(row.product_images) ? row.product_images : [];
            const primaryImg = images.find((i: any) => i.is_primary) || images[0];

            return {
              id: row.id,
              artisanId: row.artisan_id,
              status: row.status as ProductStatus,
              info: {
                titleEn: row.title_en || '',
                titleHi: row.title_hi || '',
                craftType: row.craft_type || '',
                category: row.category || 'Handicrafts',
                material: row.material || '',
                technique: row.technique || '',
                originState: row.origin_state || '',
                originDistrict: row.origin_district || undefined,
                productionTimeDays: row.production_time_days || 1,
                descriptionEn: row.description_en || '',
                descriptionHi: row.description_hi || '',
                dimensions: row.dimensions || '',
                quantityAvailable: row.quantity_available || 1,
                customizationAvailable: Boolean(row.customization_available),
                careInstructions: row.care_instructions || '',
              },
              images: images.map((img: any) => ({
                id: img.id,
                productId: row.id,
                originalUrl: img.original_url,
                processedUrl: img.processed_url,
                isPrimary: img.is_primary,
                createdAt: img.created_at || new Date().toISOString(),
              })),
              pricing: pricing
                ? {
                    materialCost: Number(pricing.material_cost || 0),
                    labourCostPerDay: 0,
                    labourDays: 1,
                    totalLabourCost: 0,
                    packagingCost: 0,
                    additionalCost: 0,
                    marginPercent: 20,
                    totalCalculatedCost: 0,
                    suggestedRetailPrice: Number(
                      pricing.suggested_retail_price || pricing.final_listing_price || 0
                    ),
                    suggestedBulkPrice: Number(
                      pricing.suggested_retail_price || pricing.final_listing_price || 0
                    ),
                    finalListingPrice: Number(pricing.final_listing_price || 0),
                    currency: 'INR',
                  }
                : undefined,
              createdAt: row.created_at,
              updatedAt: row.updated_at,
            };
          });
          return { data: products, error: null };
        }
      } catch (err) {
        console.warn('[DatabaseService] Supabase getAllPublishedProducts error:', err);
      }
    }

    const localProducts = await this.getLocalItem<Product[]>(STORAGE_KEYS.PRODUCTS, []);
    const published = localProducts.filter(p => p.status === 'published');
    return { data: published, error: null };
  }

  public static async getAllArtisans(): Promise<DbResult<(ArtisanProfile & { fullName: string })[]>> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('artisan_profiles')
          .select(`
            *,
            profiles:artisan_id (id, full_name)
          `)
          .order('created_at', { ascending: false });

        if (!error && data) {
          const list = data.map((row: any) => ({
            id: row.id,
            artisanId: row.artisan_id,
            fullName: row.profiles?.full_name || 'Traditional Artisan',
            craftType: row.craft_type || '',
            state: row.state || '',
            district: row.district || '',
            experienceYears: row.experience_years || '5',
            productionCapacity: row.production_capacity || '10-20 pieces/month',
            bio: row.bio || '',
            verificationStatus: row.verification_status,
            isAvailable: row.is_available ?? true,
            vacationMode: row.vacation_mode ?? false,
            vacationMessage: row.vacation_message,
            vacationReturnDate: row.vacation_return_date,
            msmeNumber: row.msme_number,
            craftCluster: row.craft_cluster,
            gstin: row.gstin,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
          }));
          return { data: list, error: null };
        }
      } catch (err) {
        console.warn('[DatabaseService] Supabase getAllArtisans error:', err);
      }
    }

    const map = await this.getLocalItem<Record<string, ArtisanProfile>>(STORAGE_KEYS.ARTISAN_PROFILES, {});
    const list = Object.values(map).map(a => ({ ...a, fullName: 'Traditional Artisan' }));
    return { data: list, error: null };
  }

  // ==========================================
  // SHOPPING CART
  // ==========================================

  public static async getCart(userId: string): Promise<DbResult<Cart>> {
    if (isSupabaseConfigured) {
      try {
        // Ensure cart exists
        let { data: cart } = await supabase
          .from('carts')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();

        if (!cart) {
          const { data: newCart } = await supabase
            .from('carts')
            .insert({ user_id: userId })
            .select()
            .single();
          cart = newCart;
        }

        if (cart) {
          const { data: items } = await supabase
            .from('cart_items')
            .select(`
              id,
              cart_id,
              product_id,
              quantity,
              unit_price,
              created_at,
              updated_at,
              products:product_id (
                id,
                title_en,
                title_hi,
                craft_type,
                product_images (original_url, processed_url, is_primary)
              )
            `)
            .eq('cart_id', cart.id)
            .order('created_at', { ascending: false });

          const cartItems: CartItem[] = [];
          for (const it of (items || []) as any[]) {
            const p = it.products;
            const images = p?.product_images || [];
            const primaryImg = images.find((i: any) => i.is_primary) || images[0];
            let prodSummary = p
              ? {
                  id: p.id,
                  titleEn: p.title_en,
                  titleHi: p.title_hi,
                  craftType: p.craft_type,
                  primaryImageUrl: primaryImg?.processed_url || primaryImg?.original_url,
                }
              : undefined;

            if (!prodSummary) {
              const fallbackProd = (await this.getProductById(it.product_id)).data;
              if (fallbackProd) {
                const fbImg = fallbackProd.images.find(i => i.isPrimary) || fallbackProd.images[0];
                prodSummary = {
                  id: fallbackProd.id,
                  titleEn: fallbackProd.info.titleEn,
                  titleHi: fallbackProd.info.titleHi,
                  craftType: fallbackProd.info.craftType,
                  primaryImageUrl: fbImg?.processedUrl || fbImg?.originalUrl,
                };
              }
            }

            cartItems.push({
              id: it.id,
              cartId: it.cart_id,
              productId: it.product_id,
              quantity: it.quantity,
              unitPrice: Number(it.unit_price),
              product: prodSummary,
              createdAt: it.created_at,
              updatedAt: it.updated_at,
            });
          }

          const totalAmount = cartItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
          const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);

          const fullCart: Cart = {
            id: cart.id,
            userId: cart.user_id,
            items: cartItems,
            totalAmount,
            totalQuantity,
            createdAt: cart.created_at,
            updatedAt: cart.updated_at,
          };

          // Cache locally as backup
          const cartsMap = await this.getLocalItem<Record<string, Cart>>(STORAGE_KEYS.CARTS, {});
          cartsMap[userId] = fullCart;
          await this.setLocalItem(STORAGE_KEYS.CARTS, cartsMap);

          return { data: fullCart, error: null };
        }
      } catch (err) {
        console.warn('[DatabaseService] Supabase getCart error:', err);
      }
    }

    const cartsMap = await this.getLocalItem<Record<string, Cart>>(STORAGE_KEYS.CARTS, {});
    const localCart = cartsMap[userId] || {
      id: 'cart-' + userId,
      userId,
      items: [],
      totalAmount: 0,
      totalQuantity: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Hydrate any missing product summaries in local cart
    for (const it of localCart.items) {
      if (!it.product) {
        const prod = (await this.getProductById(it.productId)).data;
        if (prod) {
          const pImg = prod.images.find(i => i.isPrimary) || prod.images[0];
          it.product = {
            id: prod.id,
            titleEn: prod.info.titleEn,
            titleHi: prod.info.titleHi,
            craftType: prod.info.craftType,
            primaryImageUrl: pImg?.processedUrl || pImg?.originalUrl,
          };
        }
      }
    }

    localCart.totalAmount = localCart.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
    localCart.totalQuantity = localCart.items.reduce((s, i) => s + i.quantity, 0);
    cartsMap[userId] = localCart;
    await this.setLocalItem(STORAGE_KEYS.CARTS, cartsMap);

    return { data: localCart, error: null };
  }

  public static async addToCart(
    userId: string,
    productId: string,
    quantity: number = 1,
    unitPrice: number = 0
  ): Promise<DbResult<CartItem>> {
    // Pre-fetch product summary for instant hydration
    const prod = (await this.getProductById(productId)).data;
    const pImg = prod?.images?.find(i => i.isPrimary) || prod?.images?.[0];
    const productSummary = prod
      ? {
          id: prod.id,
          titleEn: prod.info.titleEn,
          titleHi: prod.info.titleHi,
          craftType: prod.info.craftType,
          primaryImageUrl: pImg?.processedUrl || pImg?.originalUrl,
        }
      : undefined;

    if (isSupabaseConfigured) {
      try {
        let { data: cart } = await supabase
          .from('carts')
          .select('id')
          .eq('user_id', userId)
          .maybeSingle();

        if (!cart) {
          const { data: newCart } = await supabase
            .from('carts')
            .insert({ user_id: userId })
            .select('id')
            .single();
          cart = newCart;
        }

        if (cart) {
          // Check if item already exists to increment quantity
          const { data: existing } = await supabase
            .from('cart_items')
            .select('id, quantity')
            .eq('cart_id', cart.id)
            .eq('product_id', productId)
            .maybeSingle();

          const finalQuantity = existing ? existing.quantity + quantity : quantity;

          const { data, error } = await supabase
            .from('cart_items')
            .upsert(
              {
                cart_id: cart.id,
                product_id: productId,
                quantity: finalQuantity,
                unit_price: unitPrice,
                updated_at: new Date().toISOString(),
              },
              { onConflict: 'cart_id,product_id' }
            )
            .select()
            .single();

          if (!error && data) {
            const savedItem: CartItem = {
              id: data.id,
              cartId: data.cart_id,
              productId: data.product_id,
              quantity: data.quantity,
              unitPrice: Number(data.unit_price),
              product: productSummary,
              createdAt: data.created_at,
              updatedAt: data.updated_at,
            };

            // Mirror into local storage
            const cartsMap = await this.getLocalItem<Record<string, Cart>>(STORAGE_KEYS.CARTS, {});
            const localCart = cartsMap[userId] || {
              id: cart.id,
              userId,
              items: [],
              totalAmount: 0,
              totalQuantity: 0,
              createdAt: data.created_at,
              updatedAt: data.updated_at,
            };
            const idx = localCart.items.findIndex(i => i.productId === productId);
            if (idx >= 0) {
              localCart.items[idx] = savedItem;
            } else {
              localCart.items.unshift(savedItem);
            }
            localCart.totalAmount = localCart.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
            localCart.totalQuantity = localCart.items.reduce((s, i) => s + i.quantity, 0);
            cartsMap[userId] = localCart;
            await this.setLocalItem(STORAGE_KEYS.CARTS, cartsMap);

            return { data: savedItem, error: null };
          }
        }
      } catch (err) {
        console.warn('[DatabaseService] Supabase addToCart error:', err);
      }
    }

    const cartsMap = await this.getLocalItem<Record<string, Cart>>(STORAGE_KEYS.CARTS, {});
    const cart = cartsMap[userId] || {
      id: 'cart-' + userId,
      userId,
      items: [],
      totalAmount: 0,
      totalQuantity: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const existingIdx = cart.items.findIndex(i => i.productId === productId);
    let item: CartItem;
    if (existingIdx >= 0) {
      cart.items[existingIdx].quantity += quantity;
      cart.items[existingIdx].unitPrice = unitPrice || cart.items[existingIdx].unitPrice;
      cart.items[existingIdx].product = productSummary || cart.items[existingIdx].product;
      cart.items[existingIdx].updatedAt = new Date().toISOString();
      item = cart.items[existingIdx];
    } else {
      item = {
        id: 'citem-' + Date.now(),
        cartId: cart.id,
        productId,
        quantity,
        unitPrice,
        product: productSummary,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      cart.items.unshift(item);
    }
    cart.totalAmount = cart.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
    cart.totalQuantity = cart.items.reduce((s, i) => s + i.quantity, 0);
    cartsMap[userId] = cart;
    await this.setLocalItem(STORAGE_KEYS.CARTS, cartsMap);

    return { data: item, error: null };
  }

  public static async updateCartItemQuantity(
    cartItemId: string,
    quantity: number
  ): Promise<DbResult<boolean>> {
    if (quantity <= 0) {
      return this.removeFromCart(cartItemId);
    }

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity, updated_at: new Date().toISOString() })
          .eq('id', cartItemId);
        if (!error) return { data: true, error: null };
      } catch (err) {
        console.warn('[DatabaseService] Supabase updateCartItemQuantity error:', err);
      }
    }

    const cartsMap = await this.getLocalItem<Record<string, Cart>>(STORAGE_KEYS.CARTS, {});
    for (const uId of Object.keys(cartsMap)) {
      const it = cartsMap[uId].items.find(i => i.id === cartItemId);
      if (it) {
        it.quantity = quantity;
        it.updatedAt = new Date().toISOString();
        cartsMap[uId].totalAmount = cartsMap[uId].items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
        cartsMap[uId].totalQuantity = cartsMap[uId].items.reduce((s, i) => s + i.quantity, 0);
        await this.setLocalItem(STORAGE_KEYS.CARTS, cartsMap);
        return { data: true, error: null };
      }
    }

    return { data: true, error: null };
  }

  public static async removeFromCart(cartItemId: string): Promise<DbResult<boolean>> {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('cart_items').delete().eq('id', cartItemId);
        if (!error) return { data: true, error: null };
      } catch (err) {
        console.warn('[DatabaseService] Supabase removeFromCart error:', err);
      }
    }

    const cartsMap = await this.getLocalItem<Record<string, Cart>>(STORAGE_KEYS.CARTS, {});
    for (const uId of Object.keys(cartsMap)) {
      const filtered = cartsMap[uId].items.filter(i => i.id !== cartItemId);
      if (filtered.length !== cartsMap[uId].items.length) {
        cartsMap[uId].items = filtered;
        cartsMap[uId].totalAmount = filtered.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
        cartsMap[uId].totalQuantity = filtered.reduce((s, i) => s + i.quantity, 0);
        await this.setLocalItem(STORAGE_KEYS.CARTS, cartsMap);
        return { data: true, error: null };
      }
    }

    return { data: true, error: null };
  }

  public static async clearCart(userId: string): Promise<DbResult<boolean>> {
    if (isSupabaseConfigured) {
      try {
        const { data: cart } = await supabase.from('carts').select('id').eq('user_id', userId).maybeSingle();
        if (cart) {
          await supabase.from('cart_items').delete().eq('cart_id', cart.id);
        }
      } catch (err) {
        console.warn('[DatabaseService] Supabase clearCart error:', err);
      }
    }

    const cartsMap = await this.getLocalItem<Record<string, Cart>>(STORAGE_KEYS.CARTS, {});
    if (cartsMap[userId]) {
      cartsMap[userId].items = [];
      cartsMap[userId].totalAmount = 0;
      cartsMap[userId].totalQuantity = 0;
      cartsMap[userId].updatedAt = new Date().toISOString();
      await this.setLocalItem(STORAGE_KEYS.CARTS, cartsMap);
    }
    return { data: true, error: null };
  }

  // ==========================================
  // FAVOURITES
  // ==========================================

  public static async getFavourites(userId: string): Promise<DbResult<FavouriteItem[]>> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('favourites')
          .select(`
            id,
            user_id,
            product_id,
            artisan_id,
            created_at,
            products (
              id,
              title_en,
              title_hi,
              craft_type,
              product_images (original_url, processed_url, is_primary),
              product_pricing (final_listing_price)
            ),
            profiles:artisan_id (full_name)
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (!error && data) {
          const list: FavouriteItem[] = data.map((row: any) => {
            const p = row.products;
            const images = p?.product_images || [];
            const primaryImg = images.find((i: any) => i.is_primary) || images[0];
            const pricing = Array.isArray(p?.product_pricing)
              ? p.product_pricing[0]
              : p?.product_pricing;

            return {
              id: row.id,
              userId: row.user_id,
              productId: row.product_id,
              artisanId: row.artisan_id,
              artisanName: row.profiles?.full_name || 'Traditional Artisan',
              product: p
                ? {
                    id: p.id,
                    titleEn: p.title_en,
                    titleHi: p.title_hi,
                    craftType: p.craft_type,
                    primaryImageUrl: primaryImg?.processed_url || primaryImg?.original_url,
                    finalListingPrice: pricing?.final_listing_price || 0,
                  }
                : undefined,
              createdAt: row.created_at,
            };
          });
          return { data: list, error: null };
        }
      } catch (err) {
        console.warn('[DatabaseService] Supabase getFavourites error:', err);
      }
    }

    const favs = await this.getLocalItem<FavouriteItem[]>(STORAGE_KEYS.FAVOURITES, []);
    const userFavs = favs.filter(f => f.userId === userId);
    return { data: userFavs, error: null };
  }

  public static async toggleFavourite(
    userId: string,
    productId: string,
    artisanId?: string
  ): Promise<DbResult<{ isFavourite: boolean }>> {
    if (isSupabaseConfigured) {
      try {
        const { data: existing } = await supabase
          .from('favourites')
          .select('id')
          .eq('user_id', userId)
          .eq('product_id', productId)
          .maybeSingle();

        if (existing) {
          await supabase.from('favourites').delete().eq('id', existing.id);
          return { data: { isFavourite: false }, error: null };
        } else {
          await supabase.from('favourites').insert({
            user_id: userId,
            product_id: productId,
            artisan_id: artisanId || null,
          });
          return { data: { isFavourite: true }, error: null };
        }
      } catch (err) {
        console.warn('[DatabaseService] Supabase toggleFavourite error:', err);
      }
    }

    const favs = await this.getLocalItem<FavouriteItem[]>(STORAGE_KEYS.FAVOURITES, []);
    const idx = favs.findIndex(f => f.userId === userId && f.productId === productId);
    if (idx >= 0) {
      favs.splice(idx, 1);
      await this.setLocalItem(STORAGE_KEYS.FAVOURITES, favs);
      return { data: { isFavourite: false }, error: null };
    } else {
      favs.unshift({
        id: 'fav-' + Date.now(),
        userId,
        productId,
        artisanId,
        createdAt: new Date().toISOString(),
      });
      await this.setLocalItem(STORAGE_KEYS.FAVOURITES, favs);
      return { data: { isFavourite: true }, error: null };
    }
  }

  // ==========================================
  // ORDERS & CHECKOUT
  // ==========================================

  public static async createOrder(input: CreateOrderInput): Promise<DbResult<Order>> {
    let savedOrder: Order | null = null;
    const now = new Date().toISOString();

    if (isSupabaseConfigured) {
      try {
        const { data: orderData, error: orderErr } = await supabase
          .from('orders')
          .insert({
            customer_id: input.customerId,
            total_amount: input.totalAmount,
            status: 'confirmed',
            shipping_address: input.shippingAddress || 'Customer Address',
            payment_status: 'pending',
            payment_method: input.paymentMethod || 'COD',
          })
          .select()
          .single();

        if (!orderErr && orderData) {
          const itemPayloads = input.items.map(it => ({
            order_id: orderData.id,
            product_id: it.productId,
            artisan_id: it.artisanId,
            quantity: it.quantity,
            unit_price: it.unitPrice,
            total_price: it.quantity * it.unitPrice,
          }));

          const { data: itemsData } = await supabase
            .from('order_items')
            .insert(itemPayloads)
            .select();

          // Also dispatch notification to artisan
          for (const it of input.items) {
            await this.logActivity({
              userId: it.artisanId,
              type: 'ORDER_RECEIVED',
              titleEn: `New order received for ${it.quantity} item(s)!`,
              titleHi: `नया ऑर्डर प्राप्त हुआ: ${it.quantity} वस्तुएं!`,
              detailsEn: `Order #${orderData.id.substring(0, 8)}`,
              detailsHi: `ऑर्डर #${orderData.id.substring(0, 8)}`,
              status: 'success',
            });
          }

          savedOrder = {
            id: orderData.id,
            customerId: orderData.customer_id,
            totalAmount: Number(orderData.total_amount),
            status: orderData.status as OrderStatus,
            shippingAddress: orderData.shipping_address,
            paymentStatus: orderData.payment_status as PaymentStatus,
            paymentMethod: orderData.payment_method,
            items: (itemsData || []).map((i: any) => ({
              id: i.id,
              orderId: i.order_id,
              productId: i.product_id,
              artisanId: i.artisan_id,
              quantity: i.quantity,
              unitPrice: Number(i.unit_price),
              totalPrice: Number(i.total_price),
              createdAt: i.created_at,
            })),
            createdAt: orderData.created_at,
            updatedAt: orderData.updated_at,
          };
        }
      } catch (err) {
        console.warn('[DatabaseService] Supabase createOrder error:', err);
      }
    }

    const localOrders = await this.getLocalItem<Order[]>(STORAGE_KEYS.ORDERS, []);
    const localOrder: Order = savedOrder || {
      id: 'ord-' + Date.now(),
      customerId: input.customerId,
      totalAmount: input.totalAmount,
      status: 'confirmed',
      shippingAddress: input.shippingAddress || 'Customer Address',
      paymentStatus: 'pending',
      paymentMethod: input.paymentMethod || 'COD',
      items: input.items.map(it => ({
        id: 'orditem-' + Math.random().toString(36).substring(2, 8),
        orderId: 'ord-' + Date.now(),
        productId: it.productId,
        artisanId: it.artisanId,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        totalPrice: it.quantity * it.unitPrice,
        createdAt: now,
      })),
      createdAt: now,
      updatedAt: now,
    };

    localOrders.unshift(localOrder);
    await this.setLocalItem(STORAGE_KEYS.ORDERS, localOrders);

    // Auto clear cart
    await this.clearCart(input.customerId);

    return { data: savedOrder || localOrder, error: null };
  }

  public static async getCustomerOrders(customerId: string): Promise<DbResult<Order[]>> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select(`
            *,
            order_items (
              id,
              order_id,
              product_id,
              artisan_id,
              quantity,
              unit_price,
              total_price,
              created_at,
              products:product_id (title_en, title_hi, craft_type)
            )
          `)
          .eq('customer_id', customerId)
          .order('created_at', { ascending: false });

        if (!error && data) {
          const orders: Order[] = data.map((row: any) => ({
            id: row.id,
            customerId: row.customer_id,
            totalAmount: Number(row.total_amount),
            status: row.status as OrderStatus,
            shippingAddress: row.shipping_address,
            paymentStatus: row.payment_status as PaymentStatus,
            paymentMethod: row.payment_method,
            items: (row.order_items || []).map((i: any) => ({
              id: i.id,
              orderId: i.order_id,
              productId: i.product_id,
              artisanId: i.artisan_id,
              quantity: i.quantity,
              unitPrice: Number(i.unit_price),
              totalPrice: Number(i.total_price),
              product: i.products
                ? {
                    titleEn: i.products.title_en,
                    titleHi: i.products.title_hi,
                    craftType: i.products.craft_type,
                  }
                : undefined,
              createdAt: i.created_at,
            })),
            createdAt: row.created_at,
            updatedAt: row.updated_at,
          }));
          return { data: orders, error: null };
        }
      } catch (err) {
        console.warn('[DatabaseService] Supabase getCustomerOrders error:', err);
      }
    }

    const localOrders = await this.getLocalItem<Order[]>(STORAGE_KEYS.ORDERS, []);
    const filtered = localOrders.filter(o => o.customerId === customerId);
    return { data: filtered, error: null };
  }

  // ==========================================
  // ACCOUNT DELETION (15-DAY RECOVERY)
  // ==========================================

  public static async requestAccountDeletion(
    userId: string,
    reason: string = 'User requested deletion'
  ): Promise<DbResult<AccountDeletionRequest>> {
    const scheduledDate = new Date();
    scheduledDate.setDate(scheduledDate.getDate() + 15);
    const now = new Date().toISOString();

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('account_deletion_requests')
          .insert({
            user_id: userId,
            reason,
            scheduled_deletion_date: scheduledDate.toISOString(),
            status: 'pending',
          })
          .select()
          .single();

        if (!error && data) {
          return {
            data: {
              id: data.id,
              userId: data.user_id,
              reason: data.reason,
              scheduledDeletionDate: data.scheduled_deletion_date,
              status: data.status,
              createdAt: data.created_at,
              updatedAt: data.updated_at,
            },
            error: null,
          };
        }
      } catch (err) {
        console.warn('[DatabaseService] Supabase requestAccountDeletion error:', err);
      }
    }

    const delRequests = await this.getLocalItem<Record<string, AccountDeletionRequest>>(
      STORAGE_KEYS.DELETION_REQUESTS,
      {}
    );
    const request: AccountDeletionRequest = {
      id: 'del-req-' + Date.now(),
      userId,
      reason,
      scheduledDeletionDate: scheduledDate.toISOString(),
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    };
    delRequests[userId] = request;
    await this.setLocalItem(STORAGE_KEYS.DELETION_REQUESTS, delRequests);

    return { data: request, error: null };
  }

  public static async getAccountDeletionStatus(
    userId: string
  ): Promise<DbResult<AccountDeletionRequest | null>> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('account_deletion_requests')
          .select('*')
          .eq('user_id', userId)
          .eq('status', 'pending')
          .order('created_at', { ascending: false })
          .maybeSingle();

        if (!error && data) {
          return {
            data: {
              id: data.id,
              userId: data.user_id,
              reason: data.reason,
              scheduledDeletionDate: data.scheduled_deletion_date,
              status: data.status,
              createdAt: data.created_at,
              updatedAt: data.updated_at,
            },
            error: null,
          };
        }
      } catch (err) {
        console.warn('[DatabaseService] Supabase getAccountDeletionStatus error:', err);
      }
    }

    const delRequests = await this.getLocalItem<Record<string, AccountDeletionRequest>>(
      STORAGE_KEYS.DELETION_REQUESTS,
      {}
    );
    return { data: delRequests[userId] || null, error: null };
  }

  public static async cancelAccountDeletion(userId: string): Promise<DbResult<boolean>> {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from('account_deletion_requests')
          .update({ status: 'cancelled', updated_at: new Date().toISOString() })
          .eq('user_id', userId)
          .eq('status', 'pending');

        if (!error) return { data: true, error: null };
      } catch (err) {
        console.warn('[DatabaseService] Supabase cancelAccountDeletion error:', err);
      }
    }

    const delRequests = await this.getLocalItem<Record<string, AccountDeletionRequest>>(
      STORAGE_KEYS.DELETION_REQUESTS,
      {}
    );
    if (delRequests[userId]) {
      delRequests[userId].status = 'cancelled';
      delRequests[userId].updatedAt = new Date().toISOString();
      await this.setLocalItem(STORAGE_KEYS.DELETION_REQUESTS, delRequests);
    }
    return { data: true, error: null };
  }
}
