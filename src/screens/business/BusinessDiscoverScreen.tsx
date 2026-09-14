import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Colors, Typography, Spacing, Shadows } from '../../constants/colors';
import { Header } from '../../components/common/Header';
import { Badge } from '../../components/common/Badge';
import { useLanguage } from '../../context/LanguageContext';
import { DatabaseService } from '../../services/database/databaseService';
import { ArtisanProfile } from '../../models/artisan';

export const BusinessDiscoverScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { t } = useLanguage();
  const [artisans, setArtisans] = useState<(ArtisanProfile & { fullName: string })[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCraft, setSelectedCraft] = useState<string>('All');

  const crafts = ['All', 'Pottery', 'Textiles', 'Woodcraft', 'Metalcraft', 'Jewellery', 'Paintings'];

  const loadArtisans = async () => {
    try {
      const res = await DatabaseService.getAllArtisans();
      if (res.data) {
        setArtisans(res.data);
      }
    } catch (e) {
      console.warn('Error fetching artisans:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadArtisans();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadArtisans();
  };

  const filtered = artisans.filter(a => {
    const matchesSearch =
      a.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.craftType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.state.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCraft = selectedCraft === 'All' || a.craftType.toLowerCase().includes(selectedCraft.toLowerCase());
    return matchesSearch && matchesCraft;
  });

  return (
    <View style={styles.screen}>
      <Header
        title="Discover Artisans"
        subtitle="Connect with certified craft creators across India"
        showLanguageToggle
      />

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by artisan, craft, or state..."
          placeholderTextColor={Colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Craft Filters */}
      <View style={styles.filterScrollWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.craftChips}>
          {crafts.map(c => (
            <TouchableOpacity
              key={c}
              style={[styles.chip, selectedCraft === c && styles.chipActive]}
              onPress={() => setSelectedCraft(c)}
            >
              <Text style={[styles.chipText, selectedCraft === c && styles.chipTextActive]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {loading ? (
          <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
        ) : filtered.length === 0 ? (
          <View style={[styles.emptyCard, Shadows.soft]}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={styles.emptyTitle}>No artisans found</Text>
            <Text style={styles.emptyDesc}>Try adjusting your search query or craft filter.</Text>
          </View>
        ) : (
          filtered.map(artisan => (
            <TouchableOpacity
              key={artisan.id}
              style={[styles.artisanCard, Shadows.soft]}
              onPress={() => navigation.navigate('DigitalShowcase', { artisanId: artisan.artisanId })}
            >
              <View style={styles.cardHeader}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{artisan.fullName.charAt(0)}</Text>
                </View>
                <View style={styles.headerInfo}>
                  <View style={styles.nameRow}>
                    <Text style={styles.artisanName}>{artisan.fullName}</Text>
                    {artisan.verificationStatus === 'verified' && (
                      <Badge label="Verified" variant="success" />
                    )}
                  </View>
                  <Text style={styles.artisanLocation}>
                    📍 {artisan.district ? `${artisan.district}, ` : ''}{artisan.state}
                  </Text>
                </View>
              </View>

              <View style={styles.tagsRow}>
                <Badge label={artisan.craftType} variant="primary" />
                <Badge label={`${artisan.experienceYears} yrs exp`} variant="outline" />
                <Badge label={artisan.productionCapacity} variant="outline" />
              </View>

              {artisan.bio ? (
                <Text style={styles.bioText} numberOfLines={2}>
                  {artisan.bio}
                </Text>
              ) : null}

              <View style={styles.cardFooter}>
                <Text style={styles.actionPrompt}>View Digital Showcase & Products →</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  searchContainer: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.xs,
  },
  searchInput: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: Typography.fontSize.sm,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterScrollWrap: {
    marginBottom: Spacing.xs,
  },
  craftChips: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  chipTextActive: {
    color: '#FFF',
  },
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl * 2,
  },
  artisanCard: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  avatarText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '800',
    color: Colors.primary,
  },
  headerInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  artisanName: {
    fontSize: Typography.fontSize.md,
    fontWeight: '800',
    color: Colors.text,
  },
  artisanLocation: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  bioText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: Spacing.sm,
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.xs,
    marginTop: Spacing.xs,
  },
  actionPrompt: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '700',
    color: Colors.primary,
    textAlign: 'right',
  },
  emptyCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.xl,
    alignItems: 'center',
    marginTop: 30,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '700',
    color: Colors.text,
  },
  emptyDesc: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
});
