import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Colors } from '../constants/colors';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList } from './types';
import { AuthNavigator } from './AuthNavigator';
import { ArtisanNavigator } from './ArtisanNavigator';
import { WizardNavigator } from './WizardNavigator';
import { LanguageSelectScreen } from '../screens/LanguageSelectScreen';
import { BusinessWorkspaceScreen } from '../screens/business/BusinessWorkspaceScreen';
import { CustomerWorkspaceScreen } from '../screens/customer/CustomerWorkspaceScreen';
import { PlatformHubScreen } from '../screens/platform/PlatformHubScreen';
import { OpportunitiesScreen } from '../screens/artisan/OpportunitiesScreen';
import { ExhibitionQrScreen } from '../screens/artisan/ExhibitionQrScreen';
import { DigitalShowcaseScreen } from '../screens/artisan/DigitalShowcaseScreen';
import { OndcReadinessScreen } from '../screens/artisan/OndcReadinessScreen';

import { BusinessNavigator } from './BusinessNavigator';
import { CustomerNavigator } from './CustomerNavigator';
import { ProductDetailsScreen } from '../screens/customer/ProductDetailsScreen';
import { KalaChannelScreen } from '../screens/artisan/KalaChannelScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const initialRoute = !user
    ? 'Auth'
    : user.role === 'business'
    ? 'BusinessApp'
    : user.role === 'customer'
    ? 'CustomerApp'
    : 'ArtisanApp';

  return (
    <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
      {!user ? (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : user.role === 'business' ? (
        <>
          <Stack.Screen name="BusinessApp" component={BusinessNavigator} />
          <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} />
          <Stack.Screen name="DigitalShowcase" component={DigitalShowcaseScreen} />
          <Stack.Screen name="KalaChannel" component={KalaChannelScreen} />
        </>
      ) : user.role === 'customer' ? (
        <>
          <Stack.Screen name="CustomerApp" component={CustomerNavigator} />
          <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} />
          <Stack.Screen name="DigitalShowcase" component={DigitalShowcaseScreen} />
          <Stack.Screen name="KalaChannel" component={KalaChannelScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="ArtisanApp" component={ArtisanNavigator} />
          <Stack.Screen
            name="ProductWizard"
            component={WizardNavigator}
            options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }}
          />
          <Stack.Screen name="Opportunities" component={OpportunitiesScreen} />
          <Stack.Screen name="ExhibitionQr" component={ExhibitionQrScreen} />
          <Stack.Screen name="DigitalShowcase" component={DigitalShowcaseScreen} />
          <Stack.Screen name="OndcReadiness" component={OndcReadinessScreen} />
          <Stack.Screen name="PlatformHub" component={PlatformHubScreen} />
        </>
      )}
      <Stack.Screen
        name="LanguageModal"
        component={LanguageSelectScreen}
        options={{ presentation: 'modal' }}
      />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
});
