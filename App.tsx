import React from 'react';
import { StyleSheet, SafeAreaView, StatusBar, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Colors } from './src/constants/colors';
import { LanguageProvider } from './src/context/LanguageContext';
import { AuthProvider } from './src/context/AuthContext';
import { ProductDraftProvider } from './src/context/ProductDraftContext';
import { RootNavigator } from './src/navigation/RootNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <AuthProvider>
          <ProductDraftProvider>
            <NavigationContainer>
              <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
              <RootNavigator />
            </NavigationContainer>
          </ProductDraftProvider>
        </AuthProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}
