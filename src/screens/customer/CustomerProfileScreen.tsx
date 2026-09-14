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
import { CustomerProfile } from '../../models/customer';

export const CustomerProfileScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { t, language, setLanguage } = useLanguage();
  const { user, logout } = useAuth();

  const [fullName, setFullName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [deliveryAddress, setDeliveryAddress] = useState<string>('');
  const [pincode, setPincode] = useState<string>('');
  const [state, setState] = useState<string>('Delhi');
  const [saving, setSaving] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (user?.id) {
      setFullName(user.fullName || 'Conscious Consumer');
      setPhone(user.phone || '');
      DatabaseService.getCustomerProfile(user.id)
        .then(res => {
          if (res.data) {
            setDeliveryAddress(res.data.deliveryAddress || '');
            setPincode(res.data.pincode || '');
            setState(res.data.state || 'Delhi');
          }
        })
        .finally(() => setLoading(false));
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await Promise.all([
        DatabaseService.upsertUserProfile({
          id: user.id,
          fullName: fullName.trim(),
          phone: phone.trim(),
        }),
        DatabaseService.upsertCustomerProfile(user.id, {
          deliveryAddress: deliveryAddress.trim(),
          pincode: pincode.trim(),
          state: state.trim(),
        }),
      ]);
      Alert.alert('Profile Updated ✅', 'Your delivery preferences have been saved.');
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
        title="My Account"
        subtitle="Customer Profile & Delivery Settings"
        showLanguageToggle
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
        ) : (
          <>
            <View style={[styles.card, Shadows.soft]}>
              <Text style={styles.sectionTitle}>Personal Details</Text>

              <Text style={styles.fieldLabel}>Full Name</Text>
              <TextInput
                style={styles.input}
                value={fullName}
                onChangeText={setFullName}
                placeholder="Your Name"
                placeholderTextColor={Colors.textMuted}
              />

              <Text style={styles.fieldLabel}>Phone Number</Text>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="10-digit mobile"
                placeholderTextColor={Colors.textMuted}
                keyboardType="phone-pad"
              />

              <Text style={styles.fieldLabel}>Default Delivery Address</Text>
              <TextInput
                style={[styles.input, { height: 70, textAlignVertical: 'top' }]}
                value={deliveryAddress}
                onChangeText={setDeliveryAddress}
                multiline
                numberOfLines={2}
                placeholder="House / Flat / Street..."
                placeholderTextColor={Colors.textMuted}
              />

              <View style={styles.twoCol}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>Pincode</Text>
                  <TextInput
                    style={styles.input}
                    value={pincode}
                    onChangeText={setPincode}
                    placeholder="e.g. 110001"
                    placeholderTextColor={Colors.textMuted}
                    keyboardType="number-pad"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>State</Text>
                  <TextInput
                    style={styles.input}
                    value={state}
                    onChangeText={setState}
                    placeholder="e.g. Delhi"
                    placeholderTextColor={Colors.textMuted}
                  />
                </View>
              </View>

              <Button
                title="Save Details"
                onPress={handleSave}
                loading={saving}
                size="md"
                style={{ marginTop: Spacing.md }}
              />
            </View>

            <View style={[styles.card, Shadows.soft]}>
              <Text style={styles.sectionTitle}>Preferences</Text>

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
                <Text style={styles.roleValue}>Direct Consumer</Text>
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
