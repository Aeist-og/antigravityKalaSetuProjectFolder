import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Colors, Typography, Spacing, Shadows } from '../../constants/colors';
import { Header } from '../../components/common/Header';
import { Button } from '../../components/common/Button';
import { UserRole } from '../../models/auth';
import { useAuth } from '../../context/AuthContext';
import { DEMO_ACCOUNTS } from '../../services/auth/authService';
import { AuthStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'RoleSelect'>;

export const RoleSelectScreen: React.FC<Props> = ({ navigation }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('artisan');
  const { loginDemoAccount } = useAuth();

  const handleContinue = () => {
    // Lead directly to authentication for the chosen workspace
    navigation.navigate('Login', { role: selectedRole });
  };

  const roleLabels: Record<UserRole, string> = {
    artisan: 'Artisan / Maker',
    business: 'Business / Bulk Buyer',
    customer: 'Customer Patron',
  };

  return (
    <View style={styles.screen}>
      <Header
        title="Choose Your Workspace"
        subtitle="Select how you will participate in the KalaSetu ecosystem"
        onBack={() => navigation.goBack()}
        showLanguageToggle={true}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Role 1: Artisan / Maker */}
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={() => setSelectedRole('artisan')}
          style={[
            styles.roleCard,
            selectedRole === 'artisan' && styles.roleCardSelected,
            Shadows.soft,
          ]}
        >
          <View style={[styles.iconCircle, { backgroundColor: Colors.primaryLight }]}>
            <Text style={styles.iconText}>🏺</Text>
          </View>
          <View style={styles.roleTextCol}>
            <View style={styles.roleTitleRow}>
              <Text style={styles.roleTitle}>Artisan / Maker</Text>
              <View style={styles.badgePrimary}>
                <Text style={styles.badgePrimaryText}>INDIGENOUS MAKER</Text>
              </View>
            </View>
            <Text style={styles.roleDesc}>
              For master artisans and self-help clusters creating, photographing, and selling authentic handmade crafts directly to buyers.
            </Text>
          </View>
          <View style={[styles.radioOuter, selectedRole === 'artisan' && styles.radioOuterSelected]}>
            {selectedRole === 'artisan' && <View style={styles.radioInner} />}
          </View>
        </TouchableOpacity>

        {/* Role 2: Business / Bulk Buyer */}
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={() => setSelectedRole('business')}
          style={[
            styles.roleCard,
            selectedRole === 'business' && styles.roleCardSelected,
            Shadows.soft,
          ]}
        >
          <View style={[styles.iconCircle, { backgroundColor: Colors.secondaryLight }]}>
            <Text style={styles.iconText}>🏢</Text>
          </View>
          <View style={styles.roleTextCol}>
            <View style={styles.roleTitleRow}>
              <Text style={styles.roleTitle}>Business / Bulk Buyer</Text>
              <View style={styles.badgeSecondary}>
                <Text style={styles.badgeSecondaryText}>B2B & SOURCING</Text>
              </View>
            </View>
            <Text style={styles.roleDesc}>
              For retailers, boutique interior brands, and hospitality enterprises sourcing customized handicrafts directly from verified artisan clusters.
            </Text>
          </View>
          <View style={[styles.radioOuter, selectedRole === 'business' && styles.radioOuterSelected]}>
            {selectedRole === 'business' && <View style={styles.radioInner} />}
          </View>
        </TouchableOpacity>

        {/* Role 3: Customer */}
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={() => setSelectedRole('customer')}
          style={[
            styles.roleCard,
            selectedRole === 'customer' && styles.roleCardSelected,
            Shadows.soft,
          ]}
        >
          <View style={[styles.iconCircle, { backgroundColor: Colors.accentLight }]}>
            <Text style={styles.iconText}>🛍️</Text>
          </View>
          <View style={styles.roleTextCol}>
            <View style={styles.roleTitleRow}>
              <Text style={styles.roleTitle}>Customer Patron</Text>
              <View style={styles.badgeAccent}>
                <Text style={styles.badgeAccentText}>RETAIL MARKET</Text>
              </View>
            </View>
            <Text style={styles.roleDesc}>
              For lovers of handmade heritage discovering pottery, handloom apparel, and indigenous art with 100% fair-trade provenance.
            </Text>
          </View>
          <View style={[styles.radioOuter, selectedRole === 'customer' && styles.radioOuterSelected]}>
            {selectedRole === 'customer' && <View style={styles.radioInner} />}
          </View>
        </TouchableOpacity>

        <View style={styles.bottomCard}>
          <Button
            title={`⚡ Quick Demo: Enter as ${roleLabels[selectedRole]} →`}
            onPress={() => {
              const demo = DEMO_ACCOUNTS.find(d => d.role === selectedRole) || DEMO_ACCOUNTS[0];
              loginDemoAccount(demo);
            }}
            size="lg"
            style={styles.continueBtn}
          />
          <Button
            title={`Sign In / Create Account →`}
            onPress={handleContinue}
            variant="outline"
            size="md"
            style={styles.secondaryBtn}
          />
          <Text style={styles.authNotice}>
            Test immediately with isolated demo data or sign in with your credentials
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  roleCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#FFF',
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  iconText: {
    fontSize: 26,
  },
  roleTextCol: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  roleTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 4,
  },
  roleTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '800',
    color: Colors.text,
  },
  badgePrimary: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgePrimaryText: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.primary,
  },
  badgeSecondary: {
    backgroundColor: Colors.secondaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeSecondaryText: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.secondary,
  },
  badgeAccent: {
    backgroundColor: Colors.accentLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeAccentText: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.accent,
  },
  roleDesc: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterSelected: {
    borderColor: Colors.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },
  bottomCard: {
    marginTop: Spacing.sm,
  },
  continueBtn: {
    marginBottom: Spacing.xs,
  },
  secondaryBtn: {
    marginBottom: Spacing.xs,
  },
  authNotice: {
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: 'center',
  },
});
