export type UserRole = 'artisan' | 'business' | 'customer';

export interface UserProfile {
  id: string; // references auth.users id
  fullName: string;
  phone: string;
  role: UserRole;
  languagePreference: 'en' | 'hi';
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthSessionState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserProfile | null;
  error: string | null;
}
