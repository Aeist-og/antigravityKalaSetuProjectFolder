import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { useLanguage } from '../context/LanguageContext';
import { ArtisanTabParamList } from './types';
import { ArtisanHomeScreen } from '../screens/artisan/ArtisanHomeScreen';
import { CatalogueScreen } from '../screens/artisan/CatalogueScreen';
import { KalaChannelScreen } from '../screens/artisan/KalaChannelScreen';
import { ActivityScreen } from '../screens/artisan/ActivityScreen';
import { ArtisanProfileScreen } from '../screens/artisan/ArtisanProfileScreen';

const Tab = createBottomTabNavigator<ArtisanTabParamList>();

export const ArtisanNavigator: React.FC = () => {
  const { t } = useLanguage();

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={ArtisanHomeScreen}
        options={{
          tabBarLabel: t('nav.home'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Catalogues"
        component={CatalogueScreen}
        options={{
          tabBarLabel: t('nav.catalogues'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="KalaChannel"
        component={KalaChannelScreen}
        options={{
          tabBarLabel: t('nav.kalaChannel'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="color-palette-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Activity"
        component={ActivityScreen}
        options={{
          tabBarLabel: t('nav.activity'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ArtisanProfileScreen}
        options={{
          tabBarLabel: t('nav.profile'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};
