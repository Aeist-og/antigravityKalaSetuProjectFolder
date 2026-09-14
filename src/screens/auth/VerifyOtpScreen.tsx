import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Colors, Typography, Spacing, Shadows } from '../../constants/colors';
import { Header } from '../../components/common/Header';
import { Button } from '../../components/common/Button';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { AuthStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'VerifyOtp'>;

export const VerifyOtpScreen: React.FC<Props> = ({ route, navigation }) => {
  const { phone } = route.params;
  const { t } = useLanguage();
  const { verifyOtp, sendOtp } = useAuth();

  const [otpCode, setOtpCode] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [resending, setResending] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleVerify = async () => {
    if (otpCode.trim().length !== 6) {
      setErrorMsg('Please enter the complete 6-digit verification code');
      return;
    }

    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await verifyOtp(phone, otpCode);
      if (res.success) {
        navigation.navigate('RoleSelect');
      } else {
        setErrorMsg(res.error || 'Invalid verification code. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setErrorMsg(null);
    try {
      const res = await sendOtp(phone);
      if (!res.success) {
        setErrorMsg(res.error || 'Failed to resend code');
      }
    } finally {
      setResending(false);
    }
  };

  return (
    <View style={styles.screen}>
      <Header
        title={t('auth.verifyOtp')}
        subtitle={`${t('auth.enterOtp')} +91 ${phone}`}
        onBack={() => navigation.goBack()}
        showLanguageToggle={true}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.card, Shadows.soft]}>
          <Text style={styles.label}>6-Digit Verification Code</Text>

          <TextInput
            style={styles.otpInput}
            placeholder="• • • • • •"
            placeholderTextColor={Colors.textMuted}
            keyboardType="number-pad"
            maxLength={6}
            value={otpCode}
            onChangeText={val => {
              setOtpCode(val);
              if (errorMsg) setErrorMsg(null);
            }}
            autoFocus
          />

          {errorMsg && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠️ {errorMsg}</Text>
            </View>
          )}

          <Button
            title={t('auth.verifyOtp')}
            onPress={handleVerify}
            size="lg"
            loading={loading}
            disabled={otpCode.trim().length !== 6}
            style={styles.actionBtn}
          />

          <Button
            title={t('auth.resendOtp')}
            onPress={handleResend}
            variant="ghost"
            size="sm"
            loading={resending}
            style={styles.resendBtn}
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
  otpInput: {
    backgroundColor: Colors.surfaceAlt,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    fontSize: 24,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 8,
    marginBottom: Spacing.md,
  },
  errorBox: {
    backgroundColor: 'rgba(237, 108, 2, 0.1)',
    borderRadius: 12,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.warning,
  },
  errorText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.warning,
    fontWeight: '600',
  },
  actionBtn: {
    marginTop: Spacing.xs,
  },
  resendBtn: {
    marginTop: Spacing.sm,
  },
});
