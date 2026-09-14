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
import { Opportunity } from '../../models/opportunity';

export const BusinessRequirementsScreen: React.FC<{ navigation: any; route?: any }> = ({
  navigation,
  route,
}) => {
  const { t } = useLanguage();
  const { user } = useAuth();

  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Modal
  const [modalVisible, setModalVisible] = useState<boolean>(route?.params?.openModal || false);
  const [title, setTitle] = useState<string>('');
  const [craftType, setCraftType] = useState<string>('Handcrafted Pottery');
  const [quantity, setQuantity] = useState<string>('50');
  const [budget, setBudget] = useState<string>('25000');
  const [location, setLocation] = useState<string>('Delhi NCR');
  const [description, setDescription] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const loadData = async () => {
    try {
      const res = await DatabaseService.getOpportunities();
      if (res.data) setOpportunities(res.data);
    } catch (e) {
      console.warn('Error fetching opportunities:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    if (route?.params?.openModal) setModalVisible(true);
  }, [route?.params?.openModal]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleCreateRfq = async () => {
    if (!title.trim()) {
      Alert.alert('Title Required', 'Please enter a requirement title.');
      return;
    }
    if (!quantity.trim() || isNaN(Number(quantity))) {
      Alert.alert('Quantity Required', 'Please enter valid quantity required.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await DatabaseService.createOpportunity({
        businessId: user?.id || 'business-user',
        businessName: user?.fullName || 'Enterprise Sourcing',
        title: title.trim(),
        craftType: craftType.trim() || 'Traditional Craft',
        description: description.trim() || 'Bulk handcrafted procurement for corporate requirement.',
        quantity: Number(quantity),
        budget: budget ? Number(budget) : undefined,
        deadline: new Date(Date.now() + 30 * 86400000).toISOString(),
        location: location.trim(),
      });

      if (res.data) {
        setOpportunities(prev => [res.data!, ...prev]);
        setModalVisible(false);
        setTitle('');
        setDescription('');
        Alert.alert('RFQ Published! 📢', 'Artisans can now see your opportunity and send direct quotations.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.screen}>
      <Header
        title="Procurement Requirements"
        subtitle="Post and track bulk requirements (RFQs)"
        showLanguageToggle
      />

      <View style={styles.topActionRow}>
        <Button
          title="➕ Post New Requirement"
          onPress={() => setModalVisible(true)}
          size="md"
          style={{ flex: 1 }}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {loading ? (
          <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
        ) : opportunities.length === 0 ? (
          <View style={[styles.emptyCard, Shadows.soft]}>
            <Text style={styles.emptyEmoji}>📋</Text>
            <Text style={styles.emptyTitle}>No requirements posted yet</Text>
            <Text style={styles.emptyDesc}>Tap above to publish an RFQ and receive proposals from artisans.</Text>
          </View>
        ) : (
          opportunities.map(opp => (
            <View key={opp.id} style={[styles.card, Shadows.soft]}>
              <View style={styles.cardHeader}>
                <Badge label={opp.craftType} variant="primary" />
                <Badge
                  label={opp.status.toUpperCase()}
                  variant={opp.status === 'open' ? 'success' : 'outline'}
                />
              </View>

              <Text style={styles.cardTitle}>{opp.title}</Text>
              <Text style={styles.cardDesc}>{opp.description}</Text>

              <View style={styles.detailsGrid}>
                <View style={styles.detailCol}>
                  <Text style={styles.detailLabel}>Quantity</Text>
                  <Text style={styles.detailVal}>{opp.quantity} pcs</Text>
                </View>
                <View style={styles.detailCol}>
                  <Text style={styles.detailLabel}>Target Budget</Text>
                  <Text style={styles.detailVal}>
                    {opp.budget ? `₹${opp.budget.toLocaleString()}` : 'Negotiable'}
                  </Text>
                </View>
                <View style={styles.detailCol}>
                  <Text style={styles.detailLabel}>Delivery</Text>
                  <Text style={styles.detailVal}>{opp.location || 'Pan India'}</Text>
                </View>
              </View>

              <View style={styles.cardActions}>
                <Button
                  title="View Incoming Proposals"
                  onPress={() => navigation.navigate('Proposals', { rfqId: opp.id })}
                  variant="outline"
                  size="sm"
                  style={{ flex: 1 }}
                />
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Create RFQ Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalBox, Shadows.medium]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Post Bulk Requirement (RFQ)</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.fieldLabel}>Requirement Title *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g., 100 Hand-painted Terracotta Planters"
                placeholderTextColor={Colors.textMuted}
                value={title}
                onChangeText={setTitle}
              />

              <Text style={styles.fieldLabel}>Craft Category *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g., Pottery, Woodcraft, Kantha Embroidery"
                placeholderTextColor={Colors.textMuted}
                value={craftType}
                onChangeText={setCraftType}
              />

              <View style={styles.twoCol}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>Quantity (Pieces) *</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. 50"
                    placeholderTextColor={Colors.textMuted}
                    keyboardType="number-pad"
                    value={quantity}
                    onChangeText={setQuantity}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>Target Budget (₹)</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. 25000"
                    placeholderTextColor={Colors.textMuted}
                    keyboardType="number-pad"
                    value={budget}
                    onChangeText={setBudget}
                  />
                </View>
              </View>

              <Text style={styles.fieldLabel}>Delivery Location / City</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g., Mumbai, Delhi NCR, Bangalore"
                placeholderTextColor={Colors.textMuted}
                value={location}
                onChangeText={setLocation}
              />

              <Text style={styles.fieldLabel}>Detailed Specifications / Requirements</Text>
              <TextInput
                style={[styles.textInput, { height: 90, textAlignVertical: 'top' }]}
                placeholder="Mention sizes, packaging requirements, color palette, or customization..."
                placeholderTextColor={Colors.textMuted}
                multiline
                numberOfLines={3}
                value={description}
                onChangeText={setDescription}
              />

              <Button
                title="Publish Requirement"
                onPress={handleCreateRfq}
                loading={submitting}
                size="lg"
                style={{ marginTop: Spacing.md }}
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
  topActionRow: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.xs,
  },
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl * 2,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  cardTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: Spacing.md,
  },
  detailsGrid: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 12,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  detailCol: {
    flex: 1,
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  detailVal: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '800',
    color: Colors.text,
    marginTop: 2,
  },
  cardActions: {
    flexDirection: 'row',
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalBox: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.lg,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  modalTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '800',
    color: Colors.text,
  },
  closeText: {
    fontSize: 20,
    color: Colors.textSecondary,
    padding: 4,
  },
  fieldLabel: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
    marginTop: Spacing.sm,
  },
  textInput: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: Typography.fontSize.sm,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  twoCol: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
});
