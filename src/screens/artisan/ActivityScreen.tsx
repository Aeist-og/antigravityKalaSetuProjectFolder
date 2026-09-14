import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Colors, Typography, Spacing, Shadows } from '../../constants/colors';
import { Header } from '../../components/common/Header';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { ActivityService } from '../../services/activity/activityService';
import { ActivityEvent } from '../../models/activity';
import { supabase } from '../../services/supabase/client';

type FilterCategory = 'ALL' | 'B2B_RFQS' | 'PRODUCTS' | 'STORIES' | 'PROFILE';

export const ActivityScreen: React.FC = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [filter, setFilter] = useState<FilterCategory>('ALL');

  const loadEvents = async () => {
    try {
      const data = await ActivityService.getEvents(user?.id);
      setEvents(data);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadEvents();

    // Supabase Realtime channel for live activity/notification updates
    const channel = supabase
      .channel('public:artisan_activities')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'activities' },
        () => {
          loadEvents();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const onRefresh = () => {
    setRefreshing(true);
    loadEvents();
  };

  const getFilteredEvents = () => {
    if (filter === 'B2B_RFQS') {
      return events.filter(e =>
        ['BUSINESS_RFQ_SENT', 'PROPOSAL_ACCEPTED', 'PROPOSAL_REVIEWED', 'EXHIBITION_QR_GENERATED'].includes(e.type)
      );
    }
    if (filter === 'PRODUCTS') {
      return events.filter(e =>
        ['PRODUCT_CREATED', 'DRAFT_SAVED', 'PRODUCT_PUBLISHED', 'PRODUCT_ARCHIVED'].includes(e.type)
      );
    }
    if (filter === 'STORIES') {
      return events.filter(e => e.type === 'STORY_POSTED');
    }
    if (filter === 'PROFILE') {
      return events.filter(e => e.type === 'PROFILE_UPDATED');
    }
    return events;
  };

  const filteredEvents = getFilteredEvents();

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'PROPOSAL_ACCEPTED':
        return '🎉';
      case 'BUSINESS_RFQ_SENT':
        return '🏢';
      case 'EXHIBITION_QR_GENERATED':
        return '📱';
      case 'PRODUCT_PUBLISHED':
        return '🚀';
      case 'PRODUCT_CREATED':
      case 'DRAFT_SAVED':
        return '📝';
      case 'STORY_POSTED':
        return '🎨';
      case 'IMAGE_ENHANCED':
        return '✨';
      case 'VOICE_TRANSCRIBED':
        return '🎙️';
      case 'PROFILE_UPDATED':
        return '👤';
      default:
        return '📌';
    }
  };

  return (
    <View style={styles.screen}>
      <Header
        title={t('activity.title')}
        subtitle={t('activity.subtitle') || 'Recent updates & actions'}
        showLanguageToggle={true}
      />

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {(['ALL', 'B2B_RFQS', 'PRODUCTS', 'STORIES', 'PROFILE'] as FilterCategory[]).map(cat => (
          <TouchableOpacity
            key={cat}
            style={[styles.filterChip, filter === cat && styles.filterChipActive]}
            onPress={() => setFilter(cat)}
            activeOpacity={0.8}
          >
            <Text style={[styles.filterText, filter === cat && styles.filterTextActive]}>
              {cat === 'ALL'
                ? 'All'
                : cat === 'B2B_RFQS'
                ? 'B2B RFQs'
                : cat === 'PRODUCTS'
                ? 'Products'
                : cat === 'STORIES'
                ? 'Stories'
                : 'Profile'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {loading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : filteredEvents.length === 0 ? (
          <View style={[styles.emptyCard, Shadows.soft]}>
            <Text style={styles.emptyEmoji}>📜</Text>
            <Text style={styles.emptyTitle}>{t('activity.empty')}</Text>
            <Text style={styles.emptyDesc}>
              When you save drafts, publish products, enhance photos, or share craft stories, your timeline will appear here.
            </Text>
          </View>
        ) : (
          filteredEvents.map((evt, idx) => {
            const isHindi = language === 'hi';
            const title = isHindi ? evt.titleHi || evt.titleEn : evt.titleEn;
            const details = isHindi ? evt.detailsHi || evt.detailsEn : evt.detailsEn;

            return (
              <View key={evt.id} style={[styles.eventCard, Shadows.soft]}>
                <View style={styles.iconCol}>
                  <View style={styles.iconCircle}>
                    <Text style={styles.eventIconText}>{getEventIcon(evt.type)}</Text>
                  </View>
                  {idx < filteredEvents.length - 1 && <View style={styles.timelineLine} />}
                </View>

                <View style={styles.eventContentCol}>
                  <View style={styles.eventTopRow}>
                    <Text style={styles.eventTitle}>{title}</Text>
                    <Text style={styles.eventTime}>
                      {new Date(evt.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>

                  <Text style={styles.eventDetails}>{details}</Text>

                  <View style={styles.eventFooterRow}>
                    <Text style={styles.eventDate}>
                      📅 {new Date(evt.timestamp).toLocaleDateString()}
                    </Text>
                    <View
                      style={[
                        styles.statusBadge,
                        evt.status === 'success' && styles.statusSuccess,
                        evt.status === 'info' && styles.statusInfo,
                        evt.status === 'warning' && styles.statusWarning,
                      ]}
                    >
                      <Text style={styles.statusText}>{evt.status.toUpperCase()}</Text>
                    </View>
                  </View>
                </View>
              </View>
            );
          })
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
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: 8,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  filterTextActive: {
    color: '#FFF',
  },
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  centerBox: {
    padding: Spacing.xxl,
    alignItems: 'center',
  },
  emptyCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: Spacing.md,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: Spacing.sm,
  },
  emptyTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 6,
  },
  emptyDesc: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  eventCard: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: Spacing.md,
    flexDirection: 'row',
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  iconCol: {
    alignItems: 'center',
    marginRight: 12,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  eventIconText: {
    fontSize: 18,
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: Colors.border,
    marginTop: 4,
  },
  eventContentCol: {
    flex: 1,
  },
  eventTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  eventTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '800',
    color: Colors.text,
    flex: 1,
    marginRight: 8,
  },
  eventTime: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  eventDetails: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: 8,
  },
  eventFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventDate: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusSuccess: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
  },
  statusInfo: {
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
  },
  statusWarning: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
  },
  statusText: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.text,
  },
});
