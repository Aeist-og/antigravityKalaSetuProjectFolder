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
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { DatabaseService } from '../../services/database/databaseService';
import { Opportunity, OpportunityResponse } from '../../models/opportunity';

export const BusinessHomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { t } = useLanguage();
  const { user } = useAuth();

  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [proposalsCount, setProposalsCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const loadData = async () => {
    try {
      const oppsRes = await DatabaseService.getOpportunities();
      if (oppsRes.data) {
        setOpportunities(oppsRes.data);
        let totalProps = 0;
        await Promise.all(
          oppsRes.data.map(async opp => {
            const respRes = await DatabaseService.getOpportunityResponses(opp.id);
            if (respRes.data) totalProps += respRes.data.length;
          })
        );
        setProposalsCount(totalProps);
      }
    } catch (e) {
      console.warn('Error loading business home data:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  return (
    <View style={styles.screen}>
      <Header
        title={t('business.homeTitle')}
        subtitle={user?.fullName || 'Procurement Manager'}
        showLanguageToggle
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Welcome Procurement Banner */}
        <View style={[styles.heroBanner, Shadows.medium]}>
          <View style={styles.heroTextCol}>
            <Text style={styles.heroPre}>DIRECT FROM ARTISAN CLUSTERS 🇮🇳</Text>
            <Text style={styles.heroTitle}>Source Authentic Handicrafts at Scale</Text>
            <Text style={styles.heroSub}>
              Zero middlemen. Verified craft lineages across India.
            </Text>
          </View>
          <Button
            title="📢 Post a Requirement"
            onPress={() => navigation.navigate('Requirements', { openModal: true })}
            size="md"
            style={styles.postCta}
          />
        </View>

        {/* Live Metrics Row */}
        <View style={styles.metricsRow}>
          <View style={[styles.metricCard, Shadows.soft]}>
            <Text style={styles.metricValue}>{opportunities.length}</Text>
            <Text style={styles.metricLabel}>Active RFQs</Text>
          </View>
          <View style={[styles.metricCard, Shadows.soft]}>
            <Text style={[styles.metricValue, { color: Colors.primary }]}>{proposalsCount}</Text>
            <Text style={styles.metricLabel}>Artisan Quotes</Text>
          </View>
          <View style={[styles.metricCard, Shadows.soft]}>
            <Text style={[styles.metricValue, { color: Colors.success }]}>100%</Text>
            <Text style={styles.metricLabel}>Fair Trade</Text>
          </View>
        </View>

        {/* Quick Sourcing Actions */}
        <Text style={styles.sectionTitle}>Sourcing Pathways</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={[styles.actionTile, Shadows.soft]}
            onPress={() => navigation.navigate('Discover')}
          >
            <Text style={styles.tileEmoji}>🔍</Text>
            <Text style={styles.tileTitle}>Discover Artisans</Text>
            <Text style={styles.tileDesc}>Browse verified clusters by craft, state & capacity</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionTile, Shadows.soft]}
            onPress={() => navigation.navigate('Requirements')}
          >
            <Text style={styles.tileEmoji}>📋</Text>
            <Text style={styles.tileTitle}>Manage RFQs</Text>
            <Text style={styles.tileDesc}>Track open bulk requirements and specifications</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionTile, Shadows.soft]}
            onPress={() => navigation.navigate('Proposals')}
          >
            <Text style={styles.tileEmoji}>🤝</Text>
            <Text style={styles.tileTitle}>Artisan Proposals</Text>
            <Text style={styles.tileDesc}>Review quotes, negotiate & accept orders</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionTile, Shadows.soft]}
            onPress={() => navigation.navigate('KalaChannel')}
          >
            <Text style={styles.tileEmoji}>📽️</Text>
            <Text style={styles.tileTitle}>KalaChannel Stories</Text>
            <Text style={styles.tileDesc}>Watch craft process videos and artisan workshops</Text>
          </TouchableOpacity>
        </View>

        {/* Active Requirements Snapshot */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Recent Bulk Requirements</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Requirements')}>
            <Text style={styles.seeAllText}>View All ({opportunities.length})</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="small" color={Colors.primary} style={{ marginVertical: 20 }} />
        ) : opportunities.length === 0 ? (
          <View style={[styles.emptyCard, Shadows.soft]}>
            <Text style={styles.emptyEmoji}>📦</Text>
            <Text style={styles.emptyTitle}>No active requirements yet</Text>
            <Text style={styles.emptyDesc}>Post your first procurement need to get bids from master artisans.</Text>
            <Button
              title="Create First RFQ"
              onPress={() => navigation.navigate('Requirements', { openModal: true })}
              size="sm"
              style={{ marginTop: 12 }}
            />
          </View>
        ) : (
          opportunities.slice(0, 3).map(opp => (
            <TouchableOpacity
              key={opp.id}
              style={[styles.rfqCard, Shadows.soft]}
              onPress={() => navigation.navigate('Proposals', { rfqId: opp.id })}
            >
              <View style={styles.rfqTop}>
                <Badge label={opp.craftType} variant="primary" />
                <Badge label={`Qty: ${opp.quantity}`} variant="outline" />
              </View>
              <Text style={styles.rfqTitle}>{opp.title}</Text>
              <Text style={styles.rfqDesc} numberOfLines={2}>{opp.description}</Text>
              <View style={styles.rfqFooter}>
                <Text style={styles.rfqBudget}>
                  {opp.budget ? `Target: ₹${opp.budget.toLocaleString()}` : 'Budget: Open for Quotes'}
                </Text>
                <Text style={styles.viewQuotesText}>Review Proposals →</Text>
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
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl * 2,
  },
  heroBanner: {
    backgroundColor: Colors.secondary,
    borderRadius: 20,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  heroTextCol: {
    marginBottom: Spacing.md,
  },
  heroPre: {
    color: Colors.accent,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  heroTitle: {
    color: '#FFF',
    fontSize: Typography.fontSize.lg,
    fontWeight: '800',
    marginBottom: 6,
  },
  heroSub: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: Typography.fontSize.xs,
    lineHeight: 18,
  },
  postCta: {
    alignSelf: 'flex-start',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  metricCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  metricValue: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '800',
    color: Colors.text,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  seeAllText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '700',
    color: Colors.primary,
  },
  actionsGrid: {
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  actionTile: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tileEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  tileTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  tileDesc: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  rfqCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  rfqTop: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  rfqTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  rfqDesc: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    lineHeight: 16,
    marginBottom: Spacing.sm,
  },
  rfqFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  rfqBudget: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '700',
    color: Colors.text,
  },
  viewQuotesText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '700',
    color: Colors.primary,
  },
  emptyCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.xl,
    alignItems: 'center',
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
