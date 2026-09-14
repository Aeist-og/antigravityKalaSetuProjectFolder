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
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Colors, Typography, Spacing, Shadows } from '../../constants/colors';
import { Header } from '../../components/common/Header';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { DatabaseService } from '../../services/database/databaseService';
import { ActivityService } from '../../services/activity/activityService';
import { Opportunity, OpportunityResponse } from '../../models/opportunity';
import { Product } from '../../models/product';
import { RootStackParamList } from '../../navigation/types';
import { supabase } from '../../services/supabase/client';

type Props = NativeStackScreenProps<RootStackParamList, 'Opportunities'>;

export const OpportunitiesScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useLanguage();
  const { user } = useAuth();

  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [myResponses, setMyResponses] = useState<OpportunityResponse[]>([]);
  const [publishedProducts, setPublishedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Proposal modal state
  const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null);
  const [quotePrice, setQuotePrice] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [selectedProductId, setSelectedProductId] = useState<string | undefined>(undefined);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const loadData = async () => {
    try {
      const [oppsRes, prodsRes, responsesRes] = await Promise.all([
        DatabaseService.getOpportunities('open'),
        user?.id ? DatabaseService.getArtisanProducts(user.id, 'published') : Promise.resolve({ data: [] }),
        user?.id ? DatabaseService.getArtisanOpportunityResponses(user.id) : Promise.resolve({ data: [] }),
      ]);

      if (oppsRes.data) setOpportunities(oppsRes.data);
      if (prodsRes.data) setPublishedProducts(prodsRes.data);
      if (responsesRes.data) setMyResponses(responsesRes.data);
    } catch (e) {
      console.warn('Error loading opportunities:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();

    // Supabase Realtime channel for live opportunity updates
    const channel = supabase
      .channel('public:opportunities_artisan')
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
  }, [user?.id]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleOpenProposal = (opp: Opportunity) => {
    setSelectedOpp(opp);
    setQuotePrice(opp.budget ? String(opp.budget) : '');
    setMessage('');
    setSelectedProductId(publishedProducts[0]?.id);
  };

  const handleSubmitProposal = async () => {
    if (!selectedOpp || !user?.id) return;
    if (!quotePrice.trim() || isNaN(Number(quotePrice))) {
      Alert.alert('Quotation Required', 'Please enter a valid quotation amount in ₹.');
      return;
    }

    setSubmitting(true);
    try {
      const attachedProduct = publishedProducts.find(p => p.id === selectedProductId);
      const res = await DatabaseService.respondToOpportunity({
        opportunityId: selectedOpp.id,
        artisanId: user.id,
        artisanName: user.fullName || 'Artisan',
        quotedPrice: Number(quotePrice),
        message: message.trim() || 'We specialize in this traditional craft technique and can fulfill this bulk order with authentic handcrafted quality.',
        attachedProductId: selectedProductId,
        attachedProductTitle: attachedProduct?.info?.titleHi || attachedProduct?.info?.titleEn,
      });

      if (res.data) {
        setMyResponses(prev => [res.data!, ...prev]);
        await ActivityService.log(
          user.id,
          'BUSINESS_RFQ_SENT',
          `Submitted Quotation for ${selectedOpp.title}`,
          `${selectedOpp.title} के लिए थोक दर प्रस्ताव भेजा`,
          `Quoted ₹${quotePrice} for ${selectedOpp.quantity} units to ${selectedOpp.businessName}`,
          `₹${quotePrice} का प्रस्ताव भेजा (${selectedOpp.quantity} पीस)`
        );

        Alert.alert(
          'Proposal Sent! 🎉',
          `Your quotation of ₹${quotePrice} has been sent directly to ${selectedOpp.businessName}. You will receive a notification when they review it.`
        );
        setSelectedOpp(null);
      } else if (res.error) {
        Alert.alert('Submission Error', res.error);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.screen}>
      <Header
        title="🏢 B2B Bulk Opportunities"
        subtitle="Institutional RFQs & Bulk Orders"
        onBack={() => navigation.goBack()}
        showLanguageToggle={true}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Informational Hero Card */}
        <View style={[styles.heroCard, Shadows.soft]}>
          <View style={styles.heroTopRow}>
            <Text style={styles.heroEmoji}>🤝</Text>
            <View style={styles.heroTextCol}>
              <Text style={styles.heroTitle}>Direct Institutional Procurement</Text>
              <Text style={styles.heroSubtitle}>
                Verified corporate buyers, retail export houses, and government agencies post bulk requirements directly. No middlemen.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Live Buyer Opportunities ({opportunities.length})</Text>
        </View>

        {loading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : opportunities.length === 0 ? (
          <View style={[styles.emptyCard, Shadows.soft]}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyTitle}>No Open RFQs Right Now</Text>
            <Text style={styles.emptyDesc}>
              New B2B bulk buying opportunities posted by businesses will appear here in real-time.
            </Text>
          </View>
        ) : (
          opportunities.map(opp => {
            const existingResponse = myResponses.find(r => r.opportunityId === opp.id);

            return (
              <View key={opp.id} style={[styles.oppCard, Shadows.soft]}>
                {/* Header */}
                <View style={styles.oppHeader}>
                  <View style={styles.businessAvatar}>
                    <Text style={styles.businessAvatarText}>
                      {opp.businessName?.charAt(0) || 'B'}
                    </Text>
                  </View>
                  <View style={styles.businessInfoCol}>
                    <Text style={styles.businessName}>{opp.businessName}</Text>
                    <Text style={styles.oppMeta}>
                      {opp.location || 'India'} • {opp.craftType}
                    </Text>
                  </View>
                  <Badge label="Open RFQ" variant="accent" />
                </View>

                {/* Title & Description */}
                <Text style={styles.oppTitle}>{opp.title}</Text>
                <Text style={styles.oppDesc}>{opp.description}</Text>

                {/* Specs Grid */}
                <View style={styles.specsGrid}>
                  <View style={styles.specItem}>
                    <Text style={styles.specLabel}>Required Quantity</Text>
                    <Text style={styles.specVal}>{opp.quantity} Units</Text>
                  </View>
                  <View style={styles.specItem}>
                    <Text style={styles.specLabel}>Target Budget</Text>
                    <Text style={styles.specVal}>₹{opp.budget?.toLocaleString('en-IN') || 'Negotiable'}</Text>
                  </View>
                  <View style={styles.specItem}>
                    <Text style={styles.specLabel}>Delivery By</Text>
                    <Text style={styles.specVal}>
                      {opp.deadline ? new Date(opp.deadline).toLocaleDateString() : 'Flexible'}
                    </Text>
                  </View>
                </View>

                {/* Footer Action / Response Status */}
                {existingResponse ? (
                  <View style={styles.responseStatusBox}>
                    <View style={styles.responseStatusHeader}>
                      <Text style={styles.responseStatusLabel}>Your Proposal Status:</Text>
                      <Badge
                        label={
                          existingResponse.status === 'accepted'
                            ? '✓ Accepted!'
                            : existingResponse.status === 'rejected'
                            ? 'Declined'
                            : '⏳ Pending Review'
                        }
                        variant={
                          existingResponse.status === 'accepted'
                            ? 'success'
                            : existingResponse.status === 'rejected'
                            ? 'danger'
                            : 'primary'
                        }
                      />
                    </View>
                    <Text style={styles.responseStatusDetail}>
                      Quoted: ₹{existingResponse.quotedPrice} • "{existingResponse.message}"
                    </Text>
                  </View>
                ) : (
                  <Button
                    title="📝 Send Proposal / Quotation"
                    onPress={() => handleOpenProposal(opp)}
                    size="md"
                    style={styles.actionBtn}
                  />
                )}
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Proposal Submission Modal */}
      <Modal visible={Boolean(selectedOpp)} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>📝 Submit B2B Proposal</Text>
              <TouchableOpacity onPress={() => setSelectedOpp(null)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalSummaryBox}>
                <Text style={styles.modalOppTitle}>{selectedOpp?.title}</Text>
                <Text style={styles.modalOppSub}>
                  Buyer: {selectedOpp?.businessName} • Required: {selectedOpp?.quantity} Units
                </Text>
              </View>

              <Text style={styles.inputLabel}>Your Total Quotation Amount (₹) *</Text>
              <TextInput
                style={styles.textInput}
                keyboardType="numeric"
                value={quotePrice}
                onChangeText={setQuotePrice}
                placeholder="e.g. 45000"
                placeholderTextColor={Colors.textMuted}
              />

              <Text style={styles.inputLabel}>Proposal Message / Delivery Timeline</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                multiline
                numberOfLines={3}
                value={message}
                onChangeText={setMessage}
                placeholder="Describe your production capacity, materials used, and estimated dispatch date..."
                placeholderTextColor={Colors.textMuted}
              />

              {publishedProducts.length > 0 && (
                <>
                  <Text style={styles.inputLabel}>Attach Reference Catalogue Sample (Optional)</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.prodPickerScroll}>
                    {publishedProducts.map(p => (
                      <TouchableOpacity
                        key={p.id}
                        style={[
                          styles.sampleChip,
                          selectedProductId === p.id && styles.sampleChipSelected,
                        ]}
                        onPress={() => setSelectedProductId(p.id)}
                      >
                        <Text
                          style={[
                            styles.sampleChipText,
                            selectedProductId === p.id && styles.sampleChipTextSelected,
                          ]}
                          numberOfLines={1}
                        >
                          {p.info.titleHi || p.info.titleEn}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </>
              )}

              <Button
                title={submitting ? 'Submitting...' : '🚀 Submit Quotation to Buyer'}
                onPress={handleSubmitProposal}
                loading={submitting}
                size="lg"
                style={styles.submitBtn}
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
    backgroundColor: Colors.primaryDark,
    borderRadius: 20,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  heroEmoji: {
    fontSize: 32,
  },
  heroTextCol: {
    flex: 1,
  },
  heroTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '800',
    color: '#FFF',
  },
  heroSubtitle: {
    fontSize: Typography.fontSize.xs,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 3,
    lineHeight: 16,
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
  emptyIcon: {
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
  oppHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  businessAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.secondaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  businessAvatarText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '800',
    color: Colors.secondary,
  },
  businessInfoCol: {
    flex: 1,
  },
  businessName: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '700',
    color: Colors.text,
  },
  oppMeta: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  oppTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 4,
  },
  oppDesc: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: Spacing.sm,
  },
  specsGrid: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 12,
    padding: 10,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'space-between',
  },
  specItem: {
    flex: 1,
    alignItems: 'center',
  },
  specLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
  },
  specVal: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '800',
    color: Colors.primaryDark,
    marginTop: 2,
  },
  actionBtn: {
    marginTop: 2,
  },
  responseStatusBox: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  responseStatusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  responseStatusLabel: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '700',
    color: Colors.text,
  },
  responseStatusDetail: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
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
  modalSummaryBox: {
    backgroundColor: Colors.surfaceAlt,
    padding: 10,
    borderRadius: 12,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalOppTitle: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '700',
    color: Colors.text,
  },
  modalOppSub: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  inputLabel: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  textInput: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: Typography.fontSize.sm,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.sm,
  },
  textArea: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  prodPickerScroll: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  sampleChip: {
    backgroundColor: Colors.surfaceAlt,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 8,
  },
  sampleChipSelected: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  sampleChipText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text,
    maxWidth: 140,
  },
  sampleChipTextSelected: {
    color: Colors.primaryDark,
    fontWeight: '700',
  },
  submitBtn: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
  },
});
