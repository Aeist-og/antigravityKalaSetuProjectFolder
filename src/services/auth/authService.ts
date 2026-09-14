import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, isSupabaseConfigured } from '../supabase/client';
import { UserProfile, UserRole } from '../../models/auth';
import { DatabaseService } from '../database/databaseService';

const SESSION_STORAGE_KEY = '@kalasetu_current_session_user_id';

export interface AuthActionResult {
  success: boolean;
  user?: UserProfile | null;
  errorMessage?: string;
}

export interface DemoAccount {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  title: string;
  craftOrDomain: string;
  location: string;
  avatarEmoji: string;
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  // Artisans
  {
    id: 'demo-artisan-1',
    name: 'Ramesh Vankar',
    email: 'artisan.weaver@kalasetu.in',
    role: 'artisan',
    title: 'Master Handloom Weaver',
    craftOrDomain: 'Bhujodi Weaving & Kala Cotton Shawls',
    location: 'Kutch, Gujarat',
    avatarEmoji: '🧵',
  },
  {
    id: 'demo-artisan-2',
    name: 'Meera Devi',
    email: 'artisan.potter@kalasetu.in',
    role: 'artisan',
    title: 'Traditional Ceramic Artist',
    craftOrDomain: 'Jaipur Blue Pottery & Floral Urns',
    location: 'Jaipur, Rajasthan',
    avatarEmoji: '🏺',
  },
  {
    id: 'demo-artisan-3',
    name: 'Suresh Kumar',
    email: 'artisan.jeweller@kalasetu.in',
    role: 'artisan',
    title: 'Metalsmith & Tribal Artisan',
    craftOrDomain: 'Dhokra Lost-Wax Bell Metal Craft',
    location: 'Bastar, Chhattisgarh',
    avatarEmoji: '💍',
  },
  // Businesses
  {
    id: 'demo-business-1',
    name: 'Ananya Sharma',
    email: 'procurement.decor@fabcraft.in',
    role: 'business',
    title: 'Head of Sourcing',
    craftOrDomain: 'FabCraft Home & Living Collections',
    location: 'Mumbai, Maharashtra',
    avatarEmoji: '🏢',
  },
  {
    id: 'demo-business-2',
    name: 'Vikramaditya Singh',
    email: 'sourcing.hotels@heritagehospitality.com',
    role: 'business',
    title: 'Procurement Director',
    craftOrDomain: 'Heritage Haveli Boutique Hotels',
    location: 'Udaipur, Rajasthan',
    avatarEmoji: '🏨',
  },
  // Customer
  {
    id: 'demo-customer-1',
    name: 'Priya Deshmukh',
    email: 'priya.patron@gmail.com',
    role: 'customer',
    title: 'Handcraft Enthusiast & Collector',
    craftOrDomain: 'Indigenous Craft Patron',
    location: 'Bengaluru, Karnataka',
    avatarEmoji: '🛍️',
  },
];

export class AuthService {
  /**
   * Email and Password Sign In
   */
  public static async signInWithEmail(
    email: string,
    pass: string,
    expectedRole?: UserRole
  ): Promise<AuthActionResult> {
    const trimmedEmail = email.trim().toLowerCase();

    // Check if matching a designated demonstration account
    const demo = DEMO_ACCOUNTS.find(d => d.email === trimmedEmail);
    if (demo) {
      const user = await this.loginDemoAccount(demo);
      return { success: true, user };
    }

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password: pass,
        });

        if (error) throw error;
        if (!data.user) throw new Error('No user data returned from authentication');

        let profRes = await DatabaseService.getUserProfile(data.user.id);
        if (!profRes.data) {
          profRes = await DatabaseService.upsertUserProfile({
            id: data.user.id,
            fullName: data.user.user_metadata?.full_name || 'KalaSetu Member',
            phone: data.user.phone || '',
            role: expectedRole || (data.user.user_metadata?.role as UserRole) || 'artisan',
            languagePreference: 'hi',
          });
        }

        await AsyncStorage.setItem(SESSION_STORAGE_KEY, data.user.id);
        return { success: true, user: profRes.data };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Invalid credentials';
        return { success: false, errorMessage: message };
      }
    }

    // Local fallback for standalone new user login
    const localId = 'usr-' + trimmedEmail.replace(/[^a-z0-9]/g, '');
    const user = await DatabaseService.upsertUserProfile({
      id: localId,
      fullName: trimmedEmail.split('@')[0].toUpperCase(),
      role: expectedRole || 'artisan',
      languagePreference: 'hi',
    });
    await AsyncStorage.setItem(SESSION_STORAGE_KEY, localId);
    return { success: true, user: user.data };
  }

  /**
   * Email and Password Sign Up
   */
  public static async signUpWithEmail(
    email: string,
    pass: string,
    fullName: string,
    role: UserRole
  ): Promise<AuthActionResult> {
    const trimmedEmail = email.trim().toLowerCase();

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: trimmedEmail,
          password: pass,
          options: {
            data: {
              full_name: fullName,
              role,
            },
          },
        });

        if (error) throw error;
        if (!data.user) throw new Error('Sign up failed. Please try again.');

        const profile = await DatabaseService.upsertUserProfile({
          id: data.user.id,
          fullName,
          phone: '',
          role,
          languagePreference: 'hi',
        });

        // Initialize role-specific profile
        if (role === 'artisan') {
          await DatabaseService.upsertArtisanProfile(data.user.id, {
            craftType: 'Handicrafts',
            bio: `Hello, I am ${fullName}, a dedicated artisan preserving traditional Indian heritage crafts.`,
          });
        } else if (role === 'business') {
          await DatabaseService.upsertBusinessProfile(data.user.id, {
            businessName: fullName + ' Enterprises',
            businessType: 'Retail & Sourcing',
          });
        } else if (role === 'customer') {
          await DatabaseService.upsertCustomerProfile(data.user.id, {
            deliveryAddress: 'Delhi, India',
          });
        }

        await AsyncStorage.setItem(SESSION_STORAGE_KEY, data.user.id);
        return { success: true, user: profile.data };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Sign up failed';
        return { success: false, errorMessage: message };
      }
    }

    // Isolated offline user creation
    const newUserId = 'new-user-' + Date.now();
    const profile = await DatabaseService.upsertUserProfile({
      id: newUserId,
      fullName,
      phone: '',
      role,
      languagePreference: 'hi',
    });

    if (role === 'artisan') {
      await DatabaseService.upsertArtisanProfile(newUserId, {
        craftType: 'Handicrafts',
        bio: `Hello, I am ${fullName}, showcasing authentic handmade crafts on KalaSetu.`,
      });
    } else if (role === 'business') {
      await DatabaseService.upsertBusinessProfile(newUserId, {
        businessName: fullName + ' Sourcing',
        businessType: 'Bulk Procurement',
      });
    } else if (role === 'customer') {
      await DatabaseService.upsertCustomerProfile(newUserId, {
        deliveryAddress: 'New Delhi, India',
      });
    }

    await AsyncStorage.setItem(SESSION_STORAGE_KEY, newUserId);
    return { success: true, user: profile.data };
  }

  /**
   * Log in directly with designated Demonstration Account
   */
  public static async loginDemoAccount(demo: DemoAccount): Promise<UserProfile> {
    const profileRes = await DatabaseService.upsertUserProfile({
      id: demo.id,
      fullName: demo.name,
      phone: '+91 98765 00000',
      role: demo.role,
      languagePreference: 'hi',
    });

    if (demo.role === 'artisan') {
      await DatabaseService.upsertArtisanProfile(demo.id, {
        craftType: demo.craftOrDomain,
        state: demo.location.split(',')[1]?.trim() || 'India',
        district: demo.location.split(',')[0]?.trim() || '',
        bio: `${demo.title} practicing traditional ${demo.craftOrDomain} from ${demo.location}.`,
      });
    } else if (demo.role === 'business') {
      await DatabaseService.upsertBusinessProfile(demo.id, {
        businessName: demo.craftOrDomain,
        businessType: 'B2B Wholesale & Interiors',
        contactPerson: demo.name,
      });
    } else if (demo.role === 'customer') {
      await DatabaseService.upsertCustomerProfile(demo.id, {
        deliveryAddress: '14 Indiranagar, 100ft Road, Bengaluru, Karnataka - 560038',
      });
    }

    await AsyncStorage.setItem(SESSION_STORAGE_KEY, demo.id);
    return (
      profileRes.data || {
        id: demo.id,
        fullName: demo.name,
        phone: '+91 98765 00000',
        role: demo.role,
        languagePreference: 'hi',
        avatarUrl: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    );
  }

  /**
   * Request SMS OTP for mobile authentication
   */
  public static async sendPhoneOtp(phone: string): Promise<AuthActionResult> {
    if (!isSupabaseConfigured) {
      return {
        success: false,
        errorMessage: 'Supabase URL & Publishable Key not configured in .env. Enter valid credentials to send live SMS OTP.',
      };
    }

    try {
      const formattedPhone = phone.startsWith('+') ? phone : `+91${phone.replace(/\D/g, '')}`;
      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
      });

      if (error) {
        if (error.message?.includes('Unsupported phone provider') || (error as { code?: string }).code === 'phone_provider_disabled') {
          return {
            success: false,
            errorMessage: 'Supabase Phone provider is not enabled. Please sign in with Email & Password or use the Demo Accounts.',
          };
        }
        throw error;
      }
      return { success: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to send OTP';
      return { success: false, errorMessage: message };
    }
  }

  /**
   * Verify SMS OTP code
   */
  public static async verifyPhoneOtp(phone: string, token: string, role: UserRole = 'artisan'): Promise<AuthActionResult> {
    if (!isSupabaseConfigured) {
      return {
        success: false,
        errorMessage: 'Authentication service is not configured.',
      };
    }

    try {
      const formattedPhone = phone.startsWith('+') ? phone : `+91${phone.replace(/\D/g, '')}`;
      const { data, error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: token.trim(),
        type: 'sms',
      });

      if (error) throw error;
      if (!data.user) throw new Error('No user session returned');

      let profileResult = await DatabaseService.getUserProfile(data.user.id);
      if (!profileResult.data) {
        profileResult = await DatabaseService.upsertUserProfile({
          id: data.user.id,
          phone: formattedPhone,
          fullName: role === 'business' ? 'Business Partner' : role === 'customer' ? 'Customer Patron' : 'Artisan',
          role,
          languagePreference: 'hi',
        });
      }

      await AsyncStorage.setItem(SESSION_STORAGE_KEY, data.user.id);

      return {
        success: true,
        user: profileResult.data,
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid or expired OTP';
      return { success: false, errorMessage: message };
    }
  }

  /**
   * Restore current session on app startup
   */
  public static async getCurrentUser(): Promise<UserProfile | null> {
    if (isSupabaseConfigured) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const profile = await DatabaseService.getUserProfile(session.user.id);
          return profile.data;
        }
      } catch (err) {
        console.warn('[AuthService] Supabase session restoration error:', err);
      }
    }

    // Check local session storage
    try {
      const localUserId = await AsyncStorage.getItem(SESSION_STORAGE_KEY);
      if (localUserId) {
        const profile = await DatabaseService.getUserProfile(localUserId);
        return profile.data;
      }
    } catch (e) {
      console.warn('[AuthService] Local session restoration error:', e);
    }

    return null;
  }

  /**
   * Update selected role
   */
  public static async updateRole(userId: string, role: UserRole): Promise<boolean> {
    const res = await DatabaseService.upsertUserProfile({ id: userId, role });
    return res.data !== null;
  }

  /**
   * Sign out
   */
  public static async signOut(): Promise<void> {
    try {
      await AsyncStorage.removeItem(SESSION_STORAGE_KEY);
    } catch {}

    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch {}
    }
  }
}

