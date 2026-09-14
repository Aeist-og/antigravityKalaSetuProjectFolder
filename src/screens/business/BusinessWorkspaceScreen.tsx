import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
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
import { ActivityService } from '../../services/activity/activityService';
import { Opportunity, OpportunityResponse } from '../../models/opportunity';
import { supabase } from '../../services/supabase/client';

interface Props {
  navigation: any;
}

export const BusinessWorkspaceScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useLanguage();
  const { user, setRole } = useAuth();

  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [responsesMap, setResponsesMap] = useState<Record<string, OpportunityResponse[]>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Create RFQ modal
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [rfqTitle, setRfqTitle] = useState<string>('');
  const [rfqCraft, setRfqCraft] = useState<string>('');
  const [rfqQty, setRfqQty] = useState<string>('');
  const [rfqBudget, setRfqBudget] = useState<string>('');
  const [rfqLocation, setRfqLocation] = useState<string>('Delhi NCR');
  const [rfqDesc, setRfqDesc] = useState<string>('');
  const [creating, setCreating] = useState<boolean>(false);

  // Selected RFQ to inspect responses
  const [selectedRfqId, setSelectedRfqId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const oppsRes = await DatabaseService.getOpportunities();
      if (oppsRes.data) {
        setOpportunities(oppsRes.data);

        // Fetch responses for each opportunity
        const respMap: Record<string, OpportunityResponse[]> = {};
        await Promise.all(
          oppsRes.data.map(async opp => {
            const respRes = await DatabaseService.getOpportunityResponses(opp.id);
            if (respRes.data) {
              respMap[opp.id] = respRes.data;
            }
          })
        );
        setResponsesMap(respMap);
      }
    } catch (e) {
      console.warn('Error loading business workspace data:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();

    // Supabase Realtime channel for live incoming artisan proposals
    const channel = supabase
      .channel('public:opportunities_business')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'opportunities' },
        () => {
          loadData();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'opportunity_responses' },
        () => {
          loadData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleCreateRfq = async () => {
    if (!rfqTitle.trim()) {
      Alert.alert('Title Required', 'Please enter a requirement title.');
      return;
    }
    if (!rfqQty.trim() || isNaN(Number(rfqQty))) {
      Alert.alert('Quantity Required', 'Please enter required quantity.');
      return;
    }

    setCreating(true);
    try {
      const res = await DatabaseService.createOpportunity({
        businessId: user?.id || 'business-1',
        businessName: user?.fullName || 'FabIndia Sourcing Hub',
        title: rfqTitle.trim(),
        craftType: rfqCraft.trim() || 'Traditional Craft',
        description: rfqDesc.trim() || 'Looking for authentic handcrafted volume procurement with direct artisan cluster linkage.',
        quantity: Number(rfqQty),
        budget: rfqBudget ? Number(rfqBudget) : undefined,
        deadline: new Date(Date.now() + 30 * 86400000).toISOString(),
        location: rfqLocation.trim(),
      });

      if (res.data) {
        setOpportunities(prev => [res.data!, ...prev]);
        setModalVisible(false);
        setRfqTitle('');
        setRfqCraft('');
        setRfqQty('');
        setRfqBudget('');
        setRfqDesc('');
        Alert.alert('RFQ Published! 📢', 'Your bulk procurement requirement is now live. Artisans can view and submit quotations.');
      }
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateStatus = async (
    responseId: string,
    oppId: string,
    newStatus: 'accepted' | 'rejected',
    artisanId: string,
    artisanName: string
  ) => {
    const res = await DatabaseService.updateOpportunityResponseStatus(responseId, newStatus);
    if (res.data) {
      // Update local state
      setResponsesMap(prev => ({
        ...prev,
        [oppId]: (prev[oppId] || []).map(r => (r.id === responseId ? { ...r, status: newStatus } : r)),
      }));

      // Log activity event for the artisan
      if (artisanId) {
        await ActivityService.log(
          artisanId,
          newStatus === 'accepted' ? 'PROPOSAL_ACCEPTED' : 'PROPOSAL_REVIEWED',
          newStatus === 'accepted' ? `Proposal Accepted by ${user?.fullName || 'Buyer'}` : `Proposal Reviewed`,
          newStatus === 'accepted' ? `आपका प्रस्ताव स्वीकार कर लिया गया` : `प्रस्ताव की समीक्षा की गई`,
          `Your B2B proposal for RFQ was ${newStatus}.`,
          `आपका प्रस्ताव ${newStatus === 'accepted' ? 'स्वीकार' : 'अस्वीकार'} किया गया।`
        );
      }

      Alert.alert(
        newStatus === 'accepted' ? 'Proposal Accepted! 🎉' : 'Proposal Declined',
        `The artisan (${artisanName}) has been notified via their real-time activity feed.`
      );
    }
  };

  const handleSwitchToArtisan = async () => {
    await setRole('artisan');
    navigation.navigate('ArtisanApp');
  };

  return (
    <View style={styles.screen}>
      <Header
        title="🏢 B2B Business Procurement"
        subtitle="Wholesale Sourcing & Artisan RFQ Hub"
        showLanguageToggle={true}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Top Action Card */}
        <View style={[styles.heroCard, Shadows.soft]}>
          <Text style={styles.heroTitle}>Direct Craft Cluster Sourcing</Text>
          <Text style={styles.heroDesc}>
            Source directly from master weavers, pottery cooperatives, and handicraft artisans with verifiable GI credentials.
          </Text>
          <Button
            title="➕ Post New Bulk RFQ / Requirement"
            onPress={() => setModalVisible(true)}
            size="md"
            style={styles.postBtn}
          />
        </View>

        {/* List of Active RFQs */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Active Procurement Requests ({opportunities.length})</Text>
        </View>

        {loading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : opportunities.length === 0 ? (
          <View style={[styles.emptyCard, Shadows.soft]}>
            <Text style={styles.emptyEmoji}>📦</Text>
            <Text style={styles.emptyTitle}>No Active RFQs</Text>
            <Text style={styles.emptyDesc}>
              Tap "Post New Bulk RFQ" to broadcast volume craft requirements to artisan clusters.
            </Text>
          </View>
        ) : (
          opportunities.map(opp => {
            const responses = responsesMap[opp.id] || [];
            const isExpanded = selectedRfqId === opp.id;

            return (
              <View key={opp.id} style={[styles.oppCard, Shadows.soft]}>
                <View style={styles.oppTopRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.oppTitle}>{opp.title}</Text>
                    <Text style={styles.oppMeta}>
                      {opp.craftType} • {opp.quantity} Units • Target: ₹{opp.budget?.toLocaleString('en-IN') || 'Negotiable'}
                    </Text>
                  </View>
                  <Badge label={`${responses.length} Proposals`} variant={responses.length > 0 ? 'success' : 'accent'} />
                </View>

                <Text style={styles.oppDesc} numberOfLines={2}>
                  {opp.description}
                </Text>

                <TouchableOpacity
                  style={styles.toggleProposalsBtn}
                  onPress={() => setSelectedRfqId(isExpanded ? null : opp.id)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.toggleProposalsText}>
                    {isExpanded ? '▲ Hide Artisan Proposals' : `▼ Review Artisan Proposals (${responses.length})`}
                  </Text>
                </TouchableOpacity>

                {/* Expanded Incoming Artisan Proposals */}
                {isExpanded && (
                  <View style={styles.proposalsContainer}>
                    {responses.length === 0 ? (
                      <Text style={styles.noProposalsText}>
                        No proposals received yet. Artisans browsing the Opportunities feed will submit quotations here.
                      </Text>
                    ) : (
                      responses.map(resp => (
                        <View key={resp.id} style={styles.proposalItem}>
                          <View style={styles.proposalHeader}>
                            <View>
                              <Text style={styles.artisanName}>{resp.artisanName}</Text>
                              <Text style={styles.quotedPrice}>Quoted: ₹{(resp.quotedPrice || 0).toLocaleString('en-IN')}</Text>
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

                          <Text style={styles.proposalMessage}>"{resp.message}"</Text>

                          {resp.attachedProductTitle && (
                            <Text style={styles.attachedSample}>
                              🏷️ Sample: <Text style={{ fontWeight: '700' }}>{resp.attachedProductTitle}</Text>
                            </Text>
                          )}

                          {resp.status === 'pending' && (
                            <View style={styles.actionRow}>
                              <Button
                                title="✓ Accept"
                                onPress={() =>
                                  handleUpdateStatus(resp.id, opp.id, 'accepted', resp.artisanId, resp.artisanName || 'Artisan')
                                }
                                size="sm"
                                style={{ flex: 1 }}
                              />
                              <Button
                                title="✕ Decline"
                                onPress={() =>
                                  handleUpdateStatus(resp.id, opp.id, 'rejected', resp.artisanId, resp.artisanName || 'Artisan')
                                }
                                variant="outline"
                                size="sm"
                                style={{ flex: 1 }}
                              />
                            </View>
                          )}
                        </View>
                      ))
                    )}
                  </View>
                )}
              </View>
            );
          })
        )}

        {/* Switch back CTA */}
        <View style={styles.switchBox}>
          <Text style={styles.switchNote}>
            Switch back to the Artisan workspace anytime:
          </Text>
          <Button
            title="🏺 Return to Artisan Workspace"
            onPress={handleSwitchToArtisan}
            variant="outline"
            size="md"
            style={styles.switchBtn}
          />
        </View>
      </ScrollView>

      {/* Post RFQ Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>📢 Post Bulk Sourcing RFQ</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.fieldLabel}>Requirement Title *</Text>
              <TextInput
                style={styles.input}
                value={rfqTitle}
                onChangeText={setRfqTitle}
                placeholder="e.g. 100 Hand-loomed Pashmina stoles for festive gifting"
                placeholderTextColor={Colors.textMuted}
              />

              <Text style={styles.fieldLabel}>Target Craft / Technique</Text>
              <TextInput
                style={styles.input}
                value={rfqCraft}
                onChangeText={setRfqCraft}
                placeholder="e.g. Pashmina Weaving, Blue Pottery, Madhubani"
                placeholderTextColor={Colors.textMuted}
              />

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>Quantity (Pieces) *</Text>
                  <TextInput
                    style={styles.input}
                    value={rfqQty}
                    onChangeText={setRfqQty}
                    keyboardType="numeric"
                    placeholder="e.g. 100"
                    placeholderTextColor={Colors.textMuted}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>Total Budget (₹)</Text>
                  <TextInput
                    style={styles.input}
                    value={rfqBudget}
                    onChangeText={setRfqBudget}
                    keyboardType="numeric"
                    placeholder="e.g. 150000"
                    placeholderTextColor={Colors.textMuted}
                  />
                </View>
              </View>

              <Text style={styles.fieldLabel}>Delivery City / Location</Text>
              <TextInput
                style={styles.input}
                value={rfqLocation}
                onChangeText={setRfqLocation}
                placeholder="e.g. Mumbai / Delhi NCR"
                placeholderTextColor={Colors.textMuted}
              />

              <Text style={styles.fieldLabel}>Detailed Requirements & Specifications</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                multiline
                numberOfLines={3}
                value={rfqDesc}
                onChangeText={setRfqDesc}
                placeholder="Specify dimensions, packaging standards, quality checks, and delivery timeline..."
                placeholderTextColor={Colors.textMuted}
              />

              <Button
                title={creating ? 'Posting...' : '🚀 Broadcast RFQ to Artisans'}
                onPress={handleCreateRfq}
                loading={creating}
                size="lg"
                style={{ marginTop: Spacing.md, marginBottom: Spacing.xl }}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  heroCard: {
    backgroundColor: Colors.secondary,
    borderRadius: 20,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  heroTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: '800',
    color: '#FFF',
  },
  heroDesc: {
    fontSize: Typography.fontSize.xs,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 18,
    marginTop: 4,
    marginBottom: Spacing.md,
  },
  postBtn: {
    backgroundColor: Colors.primary,
  },
  sectionHeaderRow: {
    marginTop: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: '800',
    color: Colors.text,
  },
  centerBox: {
    padding: Spacing.xxl,
    alignItems: 'center',
  },
  emptyCard: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyEmoji: {
    fontSize: 36,
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
    lineHeight: 16,
  },
  oppCard: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  oppTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  oppTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '800',
    color: Colors.text,
  },
  oppMeta: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  oppDesc: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    marginTop: 6,
    lineHeight: 16,
  },
  toggleProposalsBtn: {
    backgroundColor: Colors.surfaceAlt,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginTop: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  toggleProposalsText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '700',
    color: Colors.primary,
  },
  proposalsContainer: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 10,
  },
  noProposalsText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 10,
  },
  proposalItem: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  proposalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  artisanName: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '800',
    color: Colors.text,
  },
  quotedPrice: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  proposalMessage: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text,
    marginVertical: 4,
    fontStyle: 'italic',
  },
  attachedSample: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  switchBox: {
    marginTop: Spacing.md,
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  switchNote: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  switchBtn: {
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.lg,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  modalTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: '800',
    color: Colors.text,
  },
  modalClose: {
    fontSize: 20,
    color: Colors.textMuted,
    fontWeight: '700',
  },
  fieldLabel: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
    marginTop: Spacing.xs,
  },
  input: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: Typography.fontSize.sm,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.xs,
  },
  textArea: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
});
