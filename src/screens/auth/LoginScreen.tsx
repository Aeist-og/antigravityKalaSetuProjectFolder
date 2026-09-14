import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Colors, Typography, Spacing, Shadows } from '../../constants/colors';
import { Header } from '../../components/common/Header';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { DEMO_ACCOUNTS, DemoAccount } from '../../services/auth/authService';
import { UserRole } from '../../models/auth';
import { AuthStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export const LoginScreen: React.FC<Props> = ({ navigation, route }) => {
  const role: UserRole = route.params?.role || 'artisan';
  const { signInWithEmail, loginDemoAccount, isBackendConfigured } = useAuth();

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const roleTitles: Record<UserRole, string> = {
    artisan: 'Artisan / Maker Portal',
    business: 'Business / Sourcing Hub',
    customer: 'Customer Marketplace',
  };

  const handleEmailLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both your email address and password');
      return;
    }

    setErrorMsg(null);
    setLoading(true);
    try {
      const res = await signInWithEmail(email.trim(), password.trim(), role);
      if (!res.success) {
        setErrorMsg(res.error || 'Invalid credentials');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demo: DemoAccount) => {
    setLoading(true);
    try {
      await loginDemoAccount(demo);
    } catch {
      setErrorMsg('Failed to load demo account');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    if (!isBackendConfigured) {
      Alert.alert(
        'Google Auth Notice',
        'Supabase OAuth credentials (EXPO_PUBLIC_SUPABASE_URL & EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY) must be active to trigger live Google Sign-In.'
      );
      return;
    }
    Alert.alert('Google Sign-In', 'Redirecting to Supabase Google OAuth...');
  };

  // Filter demo accounts relevant to chosen role
  const relevantDemos = DEMO_ACCOUNTS.filter(d => d.role === role);

  return (
    <View style={styles.screen}>
      <Header
        title={roleTitles[role]}
        subtitle="Sign in to access your dedicated workspace"
        onBack={() => navigation.goBack()}
        showLanguageToggle
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.authCard, Shadows.soft]}>
          <Text style={styles.sectionHeader}>Account Credentials</Text>

          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={t => {
              setEmail(t);
              if (errorMsg) setErrorMsg(null);
            }}
            placeholder="e.g. yourname@example.com"
            placeholderTextColor={Colors.textMuted}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={t => {
              setPassword(t);
              if (errorMsg) setErrorMsg(null);
            }}
            placeholder="••••••••••••"
            placeholderTextColor={Colors.textMuted}
            secureTextEntry
          />

          {errorMsg && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠️ {errorMsg}</Text>
            </View>
          )}

          <Button
            title="Log In"
            onPress={handleEmailLogin}
            loading={loading}
            size="lg"
            style={{ marginTop: Spacing.sm }}
          />

          {/* Alternative Auth Methods */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR SIGN IN WITH</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.authRow}>
            <TouchableOpacity
              style={[styles.altAuthBtn, Shadows.soft]}
              onPress={() => navigation.navigate('LoginPhone', { role })}
            >
              <Text style={styles.altAuthIcon}>📱</Text>
              <Text style={styles.altAuthText}>Mobile OTP</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.altAuthBtn, Shadows.soft]}
              onPress={handleGoogleLogin}
            >
              <Text style={styles.altAuthIcon}>🌐</Text>
              <Text style={styles.altAuthText}>Google</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.switchAuthLink}
            onPress={() => navigation.navigate('SignUp', { role })}
          >
            <Text style={styles.switchAuthText}>
              New to KalaSetu? <Text style={styles.switchAuthBold}>Create an Account →</Text>
            </Text>
          </TouchableOpacity>
        </View>

        {/* Demo Accounts Showcase */}
        <View style={styles.demoSection}>
          <Text style={styles.demoHeader}>⚡ Quick Demonstration Accounts</Text>
          <Text style={styles.demoSub}>
            Tap any verified {role} identity below to test real marketplace workflows with isolated data:
          </Text>

          {relevantDemos.map(demo => (
            <TouchableOpacity
              key={demo.id}
              style={[styles.demoCard, Shadows.soft]}
              onPress={() => handleDemoLogin(demo)}
              disabled={loading}
            >
              <View style={styles.demoAvatar}>
                <Text style={{ fontSize: 24 }}>{demo.avatarEmoji}</Text>
              </View>
              <View style={styles.demoInfo}>
                <View style={styles.demoNameRow}>
                  <Text style={styles.demoName}>{demo.name}</Text>
                  <Text style={styles.demoBadge}>DEMO</Text>
                </View>
                <Text style={styles.demoDomain}>{demo.craftOrDomain}</Text>
                <Text style={styles.demoLoc}>📍 {demo.location} • {demo.email}</Text>
              </View>
              <Text style={styles.demoArrow}>→</Text>
            </TouchableOpacity>
          ))}
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
    paddingBottom: Spacing.xxl,
  },
  authCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
    marginTop: 6,
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
    marginBottom: Spacing.xs,
  },
  errorBox: {
    backgroundColor: Colors.errorLight,
    padding: Spacing.sm,
    borderRadius: 10,
    marginTop: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  errorText: {
    color: Colors.error,
    fontSize: Typography.fontSize.xs,
    fontWeight: '600',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    marginHorizontal: 10,
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 0.5,
  },
  authRow: {
    flexDirection: 'row',
    gap: 12,
  },
  altAuthBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceAlt,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  altAuthIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  altAuthText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '700',
    color: Colors.text,
  },
  switchAuthLink: {
    alignItems: 'center',
    marginTop: Spacing.lg,
    paddingVertical: 4,
  },
  switchAuthText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
  },
  switchAuthBold: {
    fontWeight: '800',
    color: Colors.primary,
  },
  demoSection: {
    marginBottom: Spacing.xl,
  },
  demoHeader: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 2,
  },
  demoSub: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
    lineHeight: 18,
  },
  demoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: 16,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  demoAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  demoInfo: {
    flex: 1,
  },
  demoNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  demoName: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '800',
    color: Colors.text,
  },
  demoBadge: {
    fontSize: 8,
    fontWeight: '800',
    backgroundColor: Colors.accentGold,
    color: '#FFF',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  demoDomain: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.primary,
    marginTop: 1,
  },
  demoLoc: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 2,
  },
  demoArrow: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '800',
    marginLeft: 6,
  },
});
