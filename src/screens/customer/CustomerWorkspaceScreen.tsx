import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Colors, Typography, Spacing, Shadows } from '../../constants/colors';
import { Header } from '../../components/common/Header';
import { Button } from '../../components/common/Button';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

interface Props {
  navigation: any;
}

export const CustomerWorkspaceScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useLanguage();
  const { setRole } = useAuth();

  const handleSwitchToArtisan = async () => {
    await setRole('artisan');
    navigation.navigate('ArtisanApp');
  };

  return (
    <View style={styles.screen}>
      <Header
        title="🛍️ Customer Marketplace"
        subtitle="Discover Authentic Indian Craft Heritage"
        showLanguageToggle={true}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Banner */}
        <View style={[styles.phaseBanner, Shadows.soft]}>
          <Text style={styles.bannerTitle}>Buy Directly from the Hands That Make</Text>
          <Text style={styles.bannerDesc}>
            Empowering conscious consumers to discover authentic handcrafted treasures, learn the history of Indian craft traditions, and support artisan families directly.
          </Text>
        </View>

        {/* Feature Highlights */}
        <Text style={styles.sectionHeader}>Customer Experience Features</Text>

        <View style={[styles.card, Shadows.soft]}>
          <Text style={styles.cardEmoji}>🧭</Text>
          <Text style={styles.cardTitle}>Curated Regional Craft Discovery</Text>
          <Text style={styles.cardDesc}>
            Explore craft by geography: Blue Pottery from Jaipur, Madhubani from Bihar, Dokra metalcraft from Chhattisgarh, Pashmina from Kashmir.
          </Text>
        </View>

        <View style={[styles.card, Shadows.soft]}>
          <Text style={styles.cardEmoji}>📜</Text>
          <Text style={styles.cardTitle}>Digital Craft Identity & Story Passport</Text>
          <Text style={styles.cardDesc}>
            Every product carries a verified digital passport showing the artisan's portrait, heritage technique video, materials used, and fair wage breakdown.
          </Text>
        </View>

        <View style={[styles.card, Shadows.soft]}>
          <Text style={styles.cardEmoji}>💳</Text>
          <Text style={styles.cardTitle}>Direct Artisan Payouts & Transparent Pricing</Text>
          <Text style={styles.cardDesc}>
            See exactly how much of your purchase goes directly into the artisan's bank account, ensuring zero middlemen exploitation.
          </Text>
        </View>

        {/* Switch back CTA */}
        <View style={styles.switchBox}>
          <Text style={styles.switchNote}>
            Switch back to the Artisan workspace anytime:
          </Text>
          <Button
            title="🏺 Switch to Artisan Workspace"
            onPress={handleSwitchToArtisan}
            size="lg"
            style={styles.switchBtn}
          />
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
  phaseBanner: {
    backgroundColor: Colors.secondary,
    borderRadius: 20,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  phaseBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  phaseBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  statusNote: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '600',
  },
  bannerTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 6,
  },
  bannerDesc: {
    fontSize: Typography.fontSize.xs,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 18,
  },
  sectionHeader: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: Spacing.sm,
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardEmoji: {
    fontSize: 28,
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  switchBox: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 20,
    padding: Spacing.lg,
    marginTop: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  switchNote: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: Spacing.md,
  },
  switchBtn: {
    width: '100%',
  },
});
