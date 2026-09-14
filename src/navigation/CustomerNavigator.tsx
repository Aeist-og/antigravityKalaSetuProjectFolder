import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { CustomerTabParamList } from './types';
import { CustomerHomeScreen } from '../screens/customer/CustomerHomeScreen';
import { CustomerDiscoverScreen } from '../screens/customer/CustomerDiscoverScreen';
import { CustomerFavouritesScreen } from '../screens/customer/CustomerFavouritesScreen';
import { CustomerCartScreen } from '../screens/customer/CustomerCartScreen';
import { CustomerOrdersScreen } from '../screens/customer/CustomerOrdersScreen';
import { CustomerProfileScreen } from '../screens/customer/CustomerProfileScreen';

const Tab = createBottomTabNavigator<CustomerTabParamList>();

export const CustomerNavigator: React.FC = () => {
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
          fontSize: 10,
          fontWeight: '700',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={CustomerHomeScreen}
        options={{
          tabBarLabel: 'Explore',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="sparkles-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Discover"
        component={CustomerDiscoverScreen}
        options={{
          tabBarLabel: 'Search',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Favourites"
        component={CustomerFavouritesScreen}
        options={{
          tabBarLabel: 'Saved',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="heart-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Cart"
        component={CustomerCartScreen}
        options={{
          tabBarLabel: 'Cart',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cart-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Orders"
        component={CustomerOrdersScreen}
        options={{
          tabBarLabel: 'My Orders',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bag-check-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={CustomerProfileScreen}
        options={{
          tabBarLabel: 'Account',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};
