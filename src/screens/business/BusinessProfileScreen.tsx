import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Colors, Typography, Spacing, Shadows } from '../../constants/colors';
import { Header } from '../../components/common/Header';
import { Button } from '../../components/common/Button';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { DatabaseService } from '../../services/database/databaseService';
import { BusinessProfile } from '../../models/business';

export const BusinessProfileScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { t, language, setLanguage } = useLanguage();
  const { user, logout, setRole } = useAuth();

  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [businessName, setBusinessName] = useState<string>('');
  const [contactPerson, setContactPerson] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [businessType, setBusinessType] = useState<string>('Retailer');
  const [industry, setIndustry] = useState<string>('Handicrafts & Home Decor');
  const [state, setState] = useState<string>('Delhi');
  const [gstin, setGstin] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (user?.id) {
      DatabaseService.getBusinessProfile(user.id)
        .then(res => {
          if (res.data) {
            setProfile(res.data);
            setBusinessName(res.data.businessName || '');
            setContactPerson(res.data.contactPerson || '');
            setEmail(res.data.email || '');
            setPhone(res.data.phone || '');
            setBusinessType(res.data.businessType || 'Retailer');
            setIndustry(res.data.industry || 'Handicrafts & Home Decor');
            setState(res.data.state || 'Delhi');
            setGstin(res.data.gstin || '');
          } else {
            setBusinessName(user.fullName || 'FabIndia Sourcing');
            setContactPerson('Procurement Head');
            setPhone(user.phone || '');
          }
        })
        .finally(() => setLoading(false));
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const res = await DatabaseService.upsertBusinessProfile(user.id, {
        businessName: businessName.trim() || 'My Business',
        contactPerson: contactPerson.trim(),
        email: email.trim(),
        phone: phone.trim(),
        businessType: businessType.trim(),
        industry: industry.trim(),
        state: state.trim(),
        gstin: gstin.trim(),
      });
      if (res.data) {
        Alert.alert('Profile Saved ✅', 'Your business details have been updated.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Log Out', 'Are you sure you want to log out of KalaSetu?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  return (
    <View style={styles.screen}>
      <Header
        title="Business Profile"
        subtitle="Manage your enterprise sourcing account"
        showLanguageToggle
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
        ) : (
          <>
            {/* Identity Card */}
            <View style={[styles.card, Shadows.soft]}>
              <Text style={styles.sectionTitle}>Enterprise Identity</Text>

              <Text style={styles.fieldLabel}>Business / Brand Name *</Text>
              <TextInput
                style={styles.input}
                value={businessName}
                onChangeText={setBusinessName}
                placeholder="e.g. FabIndia Sourcing"
                placeholderTextColor={Colors.textMuted}
              />

              <Text style={styles.fieldLabel}>Contact Person *</Text>
              <TextInput
                style={styles.input}
                value={contactPerson}
                onChangeText={setContactPerson}
                placeholder="e.g. Rahul Sharma"
                placeholderTextColor={Colors.textMuted}
              />

              <View style={styles.twoCol}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>Phone Number</Text>
                  <TextInput
                    style={styles.input}
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="Mobile"
                    placeholderTextColor={Colors.textMuted}
                    keyboardType="phone-pad"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>Email Address</Text>
                  <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="email@company.com"
                    placeholderTextColor={Colors.textMuted}
                    keyboardType="email-address"
                  />
                </View>
              </View>

              <Text style={styles.fieldLabel}>Business Type</Text>
              <TextInput
                style={styles.input}
                value={businessType}
                onChangeText={setBusinessType}
                placeholder="e.g. Retailer, Wholesaler, Exporter"
                placeholderTextColor={Colors.textMuted}
              />

              <Text style={styles.fieldLabel}>State / Headquarters</Text>
              <TextInput
                style={styles.input}
                value={state}
                onChangeText={setState}
                placeholder="e.g. Delhi, Maharashtra"
                placeholderTextColor={Colors.textMuted}
              />

              <Text style={styles.fieldLabel}>GSTIN (Optional)</Text>
              <TextInput
                style={styles.input}
                value={gstin}
                onChangeText={setGstin}
                placeholder="22AAAAA0000A1Z5"
                placeholderTextColor={Colors.textMuted}
                autoCapitalize="characters"
              />

              <Button
                title="Save Business Profile"
                onPress={handleSave}
                loading={saving}
                size="md"
                style={{ marginTop: Spacing.md }}
              />
            </View>

            {/* App Preferences Card */}
            <View style={[styles.card, Shadows.soft]}>
              <Text style={styles.sectionTitle}>App Preferences</Text>

              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Language / भाषा</Text>
                <TouchableOpacity
                  style={styles.langBtn}
                  onPress={() => setLanguage(language === 'en' ? 'hi' : 'en')}
                >
                  <Text style={styles.langBtnText}>
                    {language === 'en' ? '🌐 English' : '🇮🇳 हिंदी'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Active Role</Text>
                <Text style={styles.roleValue}>Business / Bulk Buyer</Text>
              </View>

              <Button
                title="Log Out of KalaSetu"
                onPress={handleLogout}
                variant="outline"
                size="sm"
                style={{ marginTop: Spacing.md }}
              />
            </View>
          </>
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
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  fieldLabel: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '700',
    color: Colors.text,
    marginTop: Spacing.xs,
    marginBottom: 4,
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
  },
  twoCol: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  settingLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '600',
    color: Colors.text,
  },
  roleValue: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '700',
    color: Colors.primary,
  },
  langBtn: {
    backgroundColor: Colors.surfaceAlt,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  langBtnText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '700',
    color: Colors.text,
  },
});
