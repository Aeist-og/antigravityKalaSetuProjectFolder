import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Switch,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors, Typography, Spacing, Shadows } from '../../constants/colors';
import { Header } from '../../components/common/Header';
import { Button } from '../../components/common/Button';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { DatabaseService } from '../../services/database/databaseService';
import { ActivityService } from '../../services/activity/activityService';
import { ArtisanProfile } from '../../models/artisan';
import { AccountDeletionRequest } from '../../models/accountDeletion';

export const ArtisanProfileScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { t, language, setLanguage } = useLanguage();
  const { user, setUser, logout } = useAuth();

  const [fullName, setFullName] = useState<string>(user?.fullName || '');
  const [craftType, setCraftType] = useState<string>('');
  const [stateName, setStateName] = useState<string>('');
  const [district, setDistrict] = useState<string>('');
  const [experience, setExperience] = useState<string>('');
  const [capacity, setCapacity] = useState<string>('');
  const [bio, setBio] = useState<string>('');

  // Vacation Mode
  const [vacationMode, setVacationMode] = useState<boolean>(false);
  const [vacationMessage, setVacationMessage] = useState<string>('');
  const [vacationReturnDate, setVacationReturnDate] = useState<string>('');

  // Enterprise / Official Identifiers
  const [msmeNumber, setMsmeNumber] = useState<string>('');
  const [craftCluster, setCraftCluster] = useState<string>('');
  const [gstin, setGstin] = useState<string>('');

  // Account Deletion Request
  const [deletionStatus, setDeletionStatus] = useState<AccountDeletionRequest | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [deletionReason, setDeletionReason] = useState<string>('');
  const [deletionLoading, setDeletionLoading] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (user?.id) {
      DatabaseService.getArtisanProfile(user.id).then(res => {
        if (res.data) {
          setCraftType(res.data.craftType || '');
          setStateName(res.data.state || '');
          setDistrict(res.data.district || '');
          setExperience(res.data.experienceYears || '');
          setCapacity(res.data.productionCapacity || '');
          setBio(res.data.bio || '');
          setVacationMode(res.data.vacationMode ?? false);
          setVacationMessage(res.data.vacationMessage || '');
          setVacationReturnDate(res.data.vacationReturnDate || '');
          setMsmeNumber(res.data.msmeNumber || '');
          setCraftCluster(res.data.craftCluster || '');
          setGstin(res.data.gstin || '');
        }
      });

      DatabaseService.getAccountDeletionStatus(user.id).then(res => {
        if (res.data) setDeletionStatus(res.data);
      });
    }
  }, [user?.id]);

  const handleSave = async () => {
    if (!user?.id) return;
    setLoading(true);
    setSavedSuccess(false);

    try {
      // 1. Update basic profile
      await DatabaseService.upsertUserProfile({
        id: user.id,
        fullName,
        languagePreference: language,
      });

      // 2. Update artisan specific profile
      await DatabaseService.upsertArtisanProfile(user.id, {
        craftType,
        state: stateName,
        district,
        experienceYears: experience,
        productionCapacity: capacity,
        bio,
        vacationMode,
        vacationMessage: vacationMode ? vacationMessage : undefined,
        vacationReturnDate: vacationMode ? vacationReturnDate : undefined,
        msmeNumber: msmeNumber || undefined,
        craftCluster: craftCluster || undefined,
        gstin: gstin || undefined,
      });

      setUser({
        ...user,
        fullName,
        languagePreference: language,
      });

      await ActivityService.log(
        user.id,
        'PROFILE_UPDATED',
        'Updated Artisan Profile',
        'कारीगर प्रोफ़ाइल अपडेट की गई',
        `Craft: ${craftType || 'Artisan'}, Vacation: ${vacationMode ? 'Active' : 'Off'}`,
        `शिल्प: ${craftType || 'कारीगर'}, अवकाश मोड: ${vacationMode ? 'चालू' : 'बंद'}`
      );

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestDeletion = async () => {
    if (!user?.id) return;
    setDeletionLoading(true);
    try {
      const res = await DatabaseService.requestAccountDeletion(
        user.id,
        deletionReason.trim() || 'Artisan initiated deletion'
      );
      if (res.data) {
        setDeletionStatus(res.data);
        setShowDeleteModal(false);
        setDeletionReason('');
        Alert.alert(
          'Deletion Scheduled',
          'Your account deletion request has been submitted. A 15-day safety grace period is now active. You can cancel this request anytime from your profile.'
        );
      }
    } catch {
      Alert.alert('Error', 'Failed to submit account deletion request.');
    } finally {
      setDeletionLoading(false);
    }
  };

  const handleCancelDeletion = async () => {
    if (!user?.id) return;
    setDeletionLoading(true);
    try {
      await DatabaseService.cancelAccountDeletion(user.id);
      setDeletionStatus(null);
      Alert.alert('Request Cancelled', 'Your account deletion request has been cancelled.');
    } catch {
      Alert.alert('Error', 'Failed to cancel deletion request.');
    } finally {
      setDeletionLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <Header
        title={t('profile.title')}
        subtitle={t('profile.subtitle')}
        showLanguageToggle={true}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Deletion Warning Banner if Pending */}
        {deletionStatus && deletionStatus.status === 'pending' && (
          <View style={[styles.deletionBanner, Shadows.soft]}>
            <Text style={styles.deletionBannerTitle}>⚠️ Account Deletion Pending</Text>
            <Text style={styles.deletionBannerText}>
              Your account is scheduled for permanent removal on{' '}
              {new Date(deletionStatus.scheduledDeletionDate).toLocaleDateString()}.
              You can cancel this request anytime before then.
            </Text>
            <Button
              title="Cancel Deletion Request"
              onPress={handleCancelDeletion}
              size="sm"
              variant="outline"
              loading={deletionLoading}
              style={{ marginTop: Spacing.sm }}
            />
          </View>
        )}

        <View style={[styles.card, Shadows.soft]}>
          <Text style={styles.sectionHeader}>👤 Personal & Craft Details</Text>

          <Text style={styles.fieldLabel}>{t('profile.fullName')}</Text>
          <TextInput
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
            placeholder="Artisan Full Name"
            placeholderTextColor={Colors.textMuted}
          />

          <Text style={styles.fieldLabel}>{t('profile.craftType')}</Text>
          <TextInput
            style={styles.input}
            value={craftType}
            onChangeText={setCraftType}
            placeholder={t('profile.craftTypePlaceholder')}
            placeholderTextColor={Colors.textMuted}
          />

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>{t('profile.state')}</Text>
              <TextInput
                style={styles.input}
                value={stateName}
                onChangeText={setStateName}
                placeholder="State (e.g. Gujarat)"
                placeholderTextColor={Colors.textMuted}
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>{t('profile.district')}</Text>
              <TextInput
                style={styles.input}
                value={district}
                onChangeText={setDistrict}
                placeholder="District / Village"
                placeholderTextColor={Colors.textMuted}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>{t('profile.experience')}</Text>
              <TextInput
                style={styles.input}
                value={experience}
                onChangeText={setExperience}
                placeholder={t('profile.experiencePlaceholder')}
                placeholderTextColor={Colors.textMuted}
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>{t('profile.productionCapacity')}</Text>
              <TextInput
                style={styles.input}
                value={capacity}
                onChangeText={setCapacity}
                placeholder={t('profile.productionCapacityPlaceholder')}
                placeholderTextColor={Colors.textMuted}
              />
            </View>
          </View>

          <Text style={styles.fieldLabel}>{t('profile.bio')}</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={bio}
            onChangeText={setBio}
            placeholder={t('profile.bioPlaceholder')}
            placeholderTextColor={Colors.textMuted}
            multiline
            numberOfLines={4}
          />

          <View style={styles.divider} />

          {/* Vacation Mode Section */}
          <View style={styles.sectionContainer}>
            <View style={styles.toggleRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.sectionHeader}>🏖️ Vacation / Away Mode</Text>
                <Text style={styles.subtext}>
                  Pause incoming buyer requests and let customers know when you return
                </Text>
              </View>
              <Switch
                value={vacationMode}
                onValueChange={setVacationMode}
                trackColor={{ false: Colors.border, true: Colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>

            {vacationMode && (
              <View style={styles.vacationInputs}>
                <Text style={styles.fieldLabel}>Absence Reason / Message</Text>
                <TextInput
                  style={styles.input}
                  value={vacationMessage}
                  onChangeText={setVacationMessage}
                  placeholder="e.g. Attending National Handloom Expo in Delhi"
                  placeholderTextColor={Colors.textMuted}
                />

                <Text style={styles.fieldLabel}>Expected Return Date</Text>
                <TextInput
                  style={styles.input}
                  value={vacationReturnDate}
                  onChangeText={setVacationReturnDate}
                  placeholder="e.g. 2026-10-05"
                  placeholderTextColor={Colors.textMuted}
                />
              </View>
            )}
          </View>

          <View style={styles.divider} />

          {/* Enterprise & Formal Registrations */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionHeader}>🏛️ Business Registrations & Cluster</Text>
            <Text style={styles.subtext}>
              Helps bulk buyers and institutions verify your artisan enterprise
            </Text>

            <Text style={styles.fieldLabel}>MSME / Udyam Number (Optional)</Text>
            <TextInput
              style={styles.input}
              value={msmeNumber}
              onChangeText={setMsmeNumber}
              placeholder="e.g. UDYAM-GJ-01-0012345"
              placeholderTextColor={Colors.textMuted}
              autoCapitalize="characters"
            />

            <Text style={styles.fieldLabel}>Craft Cluster / Artisan Co-op</Text>
            <TextInput
              style={styles.input}
              value={craftCluster}
              onChangeText={setCraftCluster}
              placeholder="e.g. Bhujodi Handloom Weavers Society"
              placeholderTextColor={Colors.textMuted}
            />

            <Text style={styles.fieldLabel}>GSTIN (Optional)</Text>
            <TextInput
              style={styles.input}
              value={gstin}
              onChangeText={setGstin}
              placeholder="e.g. 24AAAAA0000A1Z5"
              placeholderTextColor={Colors.textMuted}
              autoCapitalize="characters"
            />
          </View>

          {savedSuccess && (
            <View style={styles.successBox}>
              <Text style={styles.successText}>✓ {t('profile.profileSaved')}</Text>
            </View>
          )}

          <Button
            title={t('profile.saveProfile')}
            onPress={handleSave}
            size="lg"
            loading={loading}
            style={styles.saveBtn}
          />

          <View style={styles.divider} />

          <View style={styles.settingsSection}>
            <Text style={styles.sectionHeader}>⚙️ Account & Preferences</Text>
            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => setLanguage(language === 'en' ? 'hi' : 'en')}
            >
              <Text style={styles.settingLabel}>App Language</Text>
              <Text style={styles.settingValue}>
                {language === 'en' ? '🌐 English' : '🇮🇳 हिंदी'}
              </Text>
            </TouchableOpacity>
          </View>

          <Button
            title={`🚪 ${t('auth.logout')}`}
            onPress={() => {
              Alert.alert(
                t('auth.logout'),
                'Are you sure you want to log out of your artisan account?',
                [
                  { text: t('common.cancel'), style: 'cancel' },
                  { text: t('auth.logout'), style: 'destructive', onPress: logout },
                ]
              );
            }}
            variant="outline"
            size="md"
            style={styles.logoutBtn}
          />

          {/* Account Deletion Request Option */}
          <TouchableOpacity
            style={styles.deleteLink}
            onPress={() => setShowDeleteModal(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.deleteLinkText}>🗑️ Request Account Deletion</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Account Deletion Modal */}
      <Modal visible={showDeleteModal} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, Shadows.card]}>
            <Text style={styles.modalTitle}>⚠️ Request Account Deletion</Text>
            <Text style={styles.modalWarning}>
              According to KalaSetu policy, account deletion involves a 15-day safety grace period.
              During this time, your catalogues will be unlisted, and after 15 days, all personal
              data and catalogues will be permanently deleted. You can cancel anytime within 15 days.
            </Text>

            <Text style={styles.fieldLabel}>Reason for deletion (optional):</Text>
            <TextInput
              style={[styles.input, { minHeight: 60 }]}
              value={deletionReason}
              onChangeText={setDeletionReason}
              placeholder="Tell us why you are leaving..."
              placeholderTextColor={Colors.textMuted}
              multiline
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowDeleteModal(false)}
                disabled={deletionLoading}
              >
                <Text style={styles.modalCancelText}>{t('common.cancel')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalDeleteBtn}
                onPress={handleRequestDeletion}
                disabled={deletionLoading}
              >
                {deletionLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalDeleteText}>Confirm Request</Text>
                )}
              </TouchableOpacity>
            </View>
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
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
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
    paddingVertical: 12,
    fontSize: Typography.fontSize.sm,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.sm,
  },
  textArea: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  successBox: {
    backgroundColor: Colors.successLight,
    padding: Spacing.sm,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  successText: {
    color: Colors.success,
    fontSize: Typography.fontSize.xs,
    fontWeight: '700',
  },
  saveBtn: {
    marginTop: Spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.lg,
  },
  settingsSection: {
    marginBottom: Spacing.md,
  },
  sectionHeader: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surfaceAlt,
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  settingLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '600',
    color: Colors.text,
  },
  settingValue: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '700',
    color: Colors.primary,
  },
  platformBtn: {
    marginTop: Spacing.sm,
  },
  logoutBtn: {
    marginTop: Spacing.sm,
  },
  deletionBanner: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 16,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  deletionBannerTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '700',
    color: '#B91C1C',
    marginBottom: 4,
  },
  deletionBannerText: {
    fontSize: Typography.fontSize.xs,
    color: '#7F1D1D',
    lineHeight: 18,
  },
  sectionContainer: {
    marginVertical: Spacing.xs,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  subtext: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  vacationInputs: {
    marginTop: Spacing.xs,
  },
  deleteLink: {
    alignItems: 'center',
    marginTop: Spacing.lg,
    padding: Spacing.xs,
  },
  deleteLinkText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '600',
    color: '#EF4444',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: Spacing.lg,
    width: '100%',
    maxWidth: 420,
  },
  modalTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: '700',
    color: '#B91C1C',
    marginBottom: Spacing.sm,
  },
  modalWarning: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: Spacing.md,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: Spacing.md,
  },
  modalCancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  modalDeleteBtn: {
    backgroundColor: '#EF4444',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 120,
  },
  modalDeleteText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

