import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { BusinessTabParamList } from './types';
import { BusinessHomeScreen } from '../screens/business/BusinessHomeScreen';
import { BusinessDiscoverScreen } from '../screens/business/BusinessDiscoverScreen';
import { BusinessRequirementsScreen } from '../screens/business/BusinessRequirementsScreen';
import { BusinessProposalsScreen } from '../screens/business/BusinessProposalsScreen';
import { ActivityScreen } from '../screens/artisan/ActivityScreen';
import { BusinessProfileScreen } from '../screens/business/BusinessProfileScreen';

const Tab = createBottomTabNavigator<BusinessTabParamList>();

export const BusinessNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.secondary,
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
          fontSize: 10,
          fontWeight: '700',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={BusinessHomeScreen}
        options={{
          tabBarLabel: 'Sourcing',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="briefcase-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Discover"
        component={BusinessDiscoverScreen}
        options={{
          tabBarLabel: 'Artisans',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Requirements"
        component={BusinessRequirementsScreen}
        options={{
          tabBarLabel: 'RFQs',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="document-text-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Proposals"
        component={BusinessProposalsScreen}
        options={{
          tabBarLabel: 'Quotes',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubbles-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Activity"
        component={ActivityScreen}
        options={{
          tabBarLabel: 'Alerts',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="notifications-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={BusinessProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="business-outline" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};
