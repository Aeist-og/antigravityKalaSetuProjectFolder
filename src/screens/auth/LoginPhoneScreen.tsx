import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Colors, Typography, Spacing, Shadows } from '../../constants/colors';
import { Header } from '../../components/common/Header';
import { Button } from '../../components/common/Button';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { AuthStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'LoginPhone'>;

export const LoginPhoneScreen: React.FC<Props> = ({ navigation, route }) => {
  const role = route.params?.role || 'artisan';
  const { t } = useLanguage();
  const { sendOtp, isBackendConfigured } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSendOtp = async () => {
    const cleaned = phoneNumber.replace(/\D/g, '');
    if (cleaned.length !== 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number');
      return;
    }

    setErrorMsg(null);
    setLoading(true);

    try {
      if (isBackendConfigured) {
        const res = await sendOtp(cleaned);
        if (res.success) {
          navigation.navigate('VerifyOtp', { phone: cleaned, role });
        } else {
          setErrorMsg(res.error || 'Failed to send OTP. Please check your backend connection.');
        }
      } else {
        // Navigate to OTP verification screen with phone and role
        navigation.navigate('VerifyOtp', { phone: cleaned, role });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <Header
        title={t('auth.enterPhone')}
        subtitle={t('auth.welcomeSubtitle')}
        onBack={() => navigation.goBack()}
        showLanguageToggle={true}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.card, Shadows.soft]}>
          <Text style={styles.label}>{t('auth.enterPhone')}</Text>

          <View style={styles.inputRow}>
            <View style={styles.countryCodeBox}>
              <Text style={styles.countryCodeText}>+91</Text>
            </View>
            <TextInput
              style={styles.phoneInput}
              value={phoneNumber}
              onChangeText={t => {
                setPhoneNumber(t);
                if (errorMsg) setErrorMsg(null);
              }}
              placeholder="98765 43210"
              placeholderTextColor={Colors.textMuted}
              keyboardType="phone-pad"
              maxLength={10}
            />
          </View>

          {errorMsg && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠️ {errorMsg}</Text>
            </View>
          )}

          <Button
            title={t('auth.sendOtp') || 'Verify via Mobile OTP'}
            onPress={handleSendOtp}
            size="lg"
            loading={loading}
            disabled={phoneNumber.replace(/\D/g, '').length !== 10}
            style={styles.actionBtn}
          />
        </View>
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
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  label: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: 8,
  },
  countryCodeBox: {
    backgroundColor: Colors.surfaceAlt,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  countryCodeText: {
    fontSize: Typography.fontSize.md,
    fontWeight: '700',
    color: Colors.text,
  },
  phoneInput: {
    flex: 1,
    backgroundColor: Colors.surfaceAlt,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    fontSize: Typography.fontSize.md,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  errorBox: {
    backgroundColor: Colors.errorLight,
    padding: Spacing.sm,
    borderRadius: 12,
    marginBottom: Spacing.md,
  },
  errorText: {
    color: Colors.error,
    fontSize: Typography.fontSize.xs,
    fontWeight: '600',
  },
  unconfiguredBox: {
    backgroundColor: Colors.accentLight,
    padding: Spacing.md,
    borderRadius: 14,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(217, 119, 6, 0.2)',
  },
  unconfiguredTitle: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '800',
    color: Colors.primaryDark,
    marginBottom: 4,
  },
  unconfiguredText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  actionBtn: {
    marginTop: Spacing.xs,
  },
  localBtn: {
    marginTop: Spacing.sm,
  },
});
