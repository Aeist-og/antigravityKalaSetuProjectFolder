import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Colors, Typography, Spacing, Shadows } from '../../constants/colors';
import { Header } from '../../components/common/Header';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { useLanguage } from '../../context/LanguageContext';
import { DatabaseService } from '../../services/database/databaseService';
import { Opportunity, OpportunityResponse, ResponseStatus } from '../../models/opportunity';
import { supabase } from '../../services/supabase/client';

export const BusinessProposalsScreen: React.FC<{ navigation: any; route?: any }> = ({
  navigation,
  route,
}) => {
  const { t } = useLanguage();
  const filterRfqId = route?.params?.rfqId;

  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [responses, setResponses] = useState<{ opp: Opportunity; resp: OpportunityResponse }[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const oppsRes = await DatabaseService.getOpportunities();
      if (oppsRes.data) {
        setOpportunities(oppsRes.data);
        const combined: { opp: Opportunity; resp: OpportunityResponse }[] = [];

        await Promise.all(
          oppsRes.data.map(async opp => {
            if (filterRfqId && opp.id !== filterRfqId) return;
            const respsRes = await DatabaseService.getOpportunityResponses(opp.id);
            if (respsRes.data) {
              respsRes.data.forEach(resp => {
                combined.push({ opp, resp });
              });
            }
          })
        );
        setResponses(combined);
      }
    } catch (e) {
      console.warn('Error loading proposals:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();

    // Realtime subscription for incoming responses
    const channel = supabase
      .channel('public:business_proposals')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'opportunity_responses' },
        () => loadData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [filterRfqId]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleUpdateStatus = async (
    responseId: string,
    opp: Opportunity,
    artisanId: string,
    newStatus: ResponseStatus
  ) => {
    setUpdatingId(responseId);
    try {
      const ok = await DatabaseService.updateOpportunityResponseStatus(responseId, newStatus);
      if (ok.data) {
        // Real-time dispatch notification to the artisan's Activity feed
        await DatabaseService.logActivity({
          userId: artisanId,
          type: newStatus === 'accepted' ? 'PROPOSAL_ACCEPTED' : 'PROPOSAL_REVIEWED',
          titleEn:
            newStatus === 'accepted'
              ? `🎉 Your proposal for "${opp.title}" was ACCEPTED!`
              : `Proposal status updated to ${newStatus} for "${opp.title}".`,
          titleHi:
            newStatus === 'accepted'
              ? `🎉 "${opp.title}" के लिए आपका प्रस्ताव स्वीकार कर लिया गया है!`
              : `"${opp.title}" के लिए प्रस्ताव की स्थिति अपडेट की गई: ${newStatus}`,
          detailsEn: `Requirement: ${opp.quantity} pcs of ${opp.craftType}`,
          detailsHi: `मांग: ${opp.quantity} पीस, शिल्प: ${opp.craftType}`,
          status: newStatus === 'accepted' ? 'success' : 'info',
        });

        // Update local state
        setResponses(prev =>
          prev.map(item =>
            item.resp.id === responseId
              ? { ...item, resp: { ...item.resp, status: newStatus } }
              : item
          )
        );

        Alert.alert(
          newStatus === 'accepted' ? 'Proposal Accepted! 🤝' : 'Proposal Rejected',
          newStatus === 'accepted'
            ? 'The artisan has been notified. You can now coordinate production and delivery.'
            : 'The status update has been communicated to the artisan.'
        );
      }
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <View style={styles.screen}>
      <Header
        title="Artisan Proposals & Quotes"
        subtitle="Review, accept or decline bids from craftspeople"
        showLanguageToggle
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {loading ? (
          <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
        ) : responses.length === 0 ? (
          <View style={[styles.emptyCard, Shadows.soft]}>
            <Text style={styles.emptyEmoji}>🤝</Text>
            <Text style={styles.emptyTitle}>No proposals received yet</Text>
            <Text style={styles.emptyDesc}>
              When artisans view your bulk requirements and submit quotes, they will appear here in real time.
            </Text>
          </View>
        ) : (
          responses.map(({ opp, resp }) => (
            <View key={resp.id} style={[styles.proposalCard, Shadows.soft]}>
              <View style={styles.proposalHeader}>
                <View>
                  <Text style={styles.oppTitle}>{opp.title}</Text>
                  <Text style={styles.oppMeta}>
                    {opp.craftType} • Qty: {opp.quantity} pcs
                  </Text>
                </View>
                <Badge
                  label={resp.status.toUpperCase()}
                  variant={
                    resp.status === 'accepted'
                      ? 'success'
                      : resp.status === 'rejected'
                        ? 'danger'
                        : 'primary'
                  }
                />
              </View>

              <View style={styles.artisanBlock}>
                <Text style={styles.artisanName}>
                  Artisan: {resp.artisanName || 'Verified Cluster Artisan'}
                </Text>
                <Text style={styles.quoteMessage}>"{resp.message}"</Text>
              </View>

              <View style={styles.quoteRow}>
                <Text style={styles.quoteLabel}>Quoted Unit Price:</Text>
                <Text style={styles.quoteVal}>
                  {resp.quoteAmount ? `₹${resp.quoteAmount.toLocaleString()}` : 'Negotiable'}
                </Text>
              </View>

              {resp.status === 'pending' && (
                <View style={styles.btnRow}>
                  <Button
                    title="Reject"
                    onPress={() => handleUpdateStatus(resp.id, opp, resp.artisanId, 'rejected')}
                    variant="outline"
                    size="sm"
                    loading={updatingId === resp.id}
                    style={{ flex: 1 }}
                  />
                  <Button
                    title="Accept Proposal 🤝"
                    onPress={() => handleUpdateStatus(resp.id, opp, resp.artisanId, 'accepted')}
                    size="sm"
                    loading={updatingId === resp.id}
                    style={{ flex: 2 }}
                  />
                </View>
              )}
            </View>
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
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl * 2,
  },
  proposalCard: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  proposalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  oppTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '800',
    color: Colors.text,
  },
  oppMeta: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  artisanBlock: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 12,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  artisanName: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 4,
  },
  quoteMessage: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  quoteRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    paddingTop: Spacing.xs,
  },
  quoteLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  quoteVal: {
    fontSize: Typography.fontSize.md,
    fontWeight: '800',
    color: Colors.secondary,
  },
  btnRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
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
