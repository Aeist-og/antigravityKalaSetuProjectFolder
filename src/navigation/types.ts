import { NavigatorScreenParams } from '@react-navigation/native';
import { UserRole } from '../models/auth';

export type AuthStackParamList = {
  Welcome: undefined;
  LanguageSelect: undefined;
  RoleSelect: undefined;
  Login: { role?: UserRole } | undefined;
  SignUp: { role?: UserRole } | undefined;
  LoginPhone: { role?: UserRole } | undefined;
  VerifyOtp: { phone: string; role?: UserRole };
};

export type ArtisanTabParamList = {
  Home: undefined;
  Catalogues: undefined;
  KalaChannel: undefined;
  Activity: undefined;
  Profile: undefined;
};

export type BusinessTabParamList = {
  Home: undefined;
  Discover: undefined;
  Requirements: undefined;
  Proposals: undefined;
  Activity: undefined;
  Profile: undefined;
};

export type CustomerTabParamList = {
  Home: undefined;
  Discover: undefined;
  Favourites: undefined;
  Cart: undefined;
  Orders: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  ArtisanApp: NavigatorScreenParams<ArtisanTabParamList> | undefined;
  BusinessApp: NavigatorScreenParams<BusinessTabParamList> | undefined;
  CustomerApp: NavigatorScreenParams<CustomerTabParamList> | undefined;
  ProductWizard: { initialStep?: number } | undefined;
  ProductDetails: { productId: string };
  ArtisanPublicProfile: { artisanId: string };
  BusinessWorkspace: undefined;
  CustomerWorkspace: undefined;
  PlatformHub: undefined;
  LanguageModal: undefined;
  Opportunities: undefined;
  ExhibitionQr: undefined;
  DigitalShowcase: { exhibitionId?: string; artisanId?: string };
  OndcReadiness: { productId?: string } | undefined;
  KalaChannel: undefined;
  Cart: undefined;
};
