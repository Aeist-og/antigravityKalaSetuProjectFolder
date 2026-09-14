import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Colors, Typography, Spacing, Shadows } from '../../constants/colors';
import { Header } from '../../components/common/Header';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../models/auth';
import { AuthStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'SignUp'>;

export const SignUpScreen: React.FC<Props> = ({ navigation, route }) => {
  const role: UserRole = route.params?.role || 'artisan';
  const { signUpWithEmail, isBackendConfigured } = useAuth();

  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [extraField, setExtraField] = useState<string>(''); // Craft specialization or Organization name
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const roleTitles: Record<UserRole, string> = {
    artisan: 'Create Artisan Account',
    business: 'Create Business Account',
    customer: 'Join as KalaSetu Patron',
  };

  const extraFieldLabels: Record<UserRole, string> = {
    artisan: 'Primary Craft Specialization (e.g. Handloom, Pottery)',
    business: 'Business / Brand / Organization Name',
    customer: 'City / Region of Residence',
  };

  const extraFieldPlaceholders: Record<UserRole, string> = {
    artisan: 'e.g. Kutch Rogan Art, Ajrakh Block Printing',
    business: 'e.g. FabIndia Retail, Heritage Décor Studio',
    customer: 'e.g. Bengaluru, Karnataka',
  };

  const handleSignUp = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setErrorMsg('Please provide your full name, email address, and a secure password.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password should be at least 6 characters long.');
      return;
    }

    setErrorMsg(null);
    setLoading(true);
    try {
      const res = await signUpWithEmail(
        email.trim(),
        password.trim(),
        name.trim(),
        role
      );

      if (!res.success) {
        setErrorMsg(res.error || 'Registration failed. Please try again.');
      } else {
        Alert.alert(
          'Account Created!',
          `Welcome to KalaSetu, ${name.trim()}! You are now authenticated into your ${role} workspace.`,
          [{ text: 'Proceed' }]
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = () => {
    if (!isBackendConfigured) {
      Alert.alert(
        'Google Auth Notice',
        'Supabase OAuth credentials (EXPO_PUBLIC_SUPABASE_URL & EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY) must be active to trigger live Google Sign-In.'
      );
      return;
    }
    Alert.alert('Google Sign-In', 'Redirecting to Supabase Google OAuth...');
  };

  return (
    <View style={styles.screen}>
      <Header
        title={roleTitles[role]}
        subtitle="Direct access to authentic Indian craftsmanship"
        onBack={() => navigation.goBack()}
        showLanguageToggle
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.authCard, Shadows.soft]}>
          <Text style={styles.sectionHeader}>Register New Account</Text>

          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={t => {
              setName(t);
              if (errorMsg) setErrorMsg(null);
            }}
            placeholder="e.g. Ramesh Vankar"
            placeholderTextColor={Colors.textMuted}
          />

          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={t => {
              setEmail(t);
              if (errorMsg) setErrorMsg(null);
            }}
            placeholder="e.g. artisan@kalasetu.in"
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
            placeholder="Minimum 6 characters"
            placeholderTextColor={Colors.textMuted}
            secureTextEntry
          />

          <Text style={styles.label}>Phone Number (Optional)</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="+91 98765 43210"
            placeholderTextColor={Colors.textMuted}
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>{extraFieldLabels[role]}</Text>
          <TextInput
            style={styles.input}
            value={extraField}
            onChangeText={setExtraField}
            placeholder={extraFieldPlaceholders[role]}
            placeholderTextColor={Colors.textMuted}
          />

          {errorMsg && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠️ {errorMsg}</Text>
            </View>
          )}

          <Button
            title="Create Workspace Account"
            onPress={handleSignUp}
            loading={loading}
            size="lg"
            style={{ marginTop: Spacing.sm }}
          />

          {/* Alternative Auth Methods */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR SIGN UP WITH</Text>
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
              onPress={handleGoogleSignUp}
            >
              <Text style={styles.altAuthIcon}>🌐</Text>
              <Text style={styles.altAuthText}>Google</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.switchAuthLink}
            onPress={() => navigation.navigate('Login', { role })}
          >
            <Text style={styles.switchAuthText}>
              Already have an account? <Text style={styles.switchAuthBold}>Log In →</Text>
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.guaranteeBox}>
          <Text style={styles.guaranteeIcon}>🛡️</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.guaranteeTitle}>Strict Data Isolation & Direct Sourcing</Text>
            <Text style={styles.guaranteeDesc}>
              Every account receives its own isolated data workspace. Your listings, catalog stories, cart, and RFQs are never mixed with other users.
            </Text>
          </View>
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
  guaranteeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 16,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  guaranteeIcon: {
    fontSize: 24,
  },
  guaranteeTitle: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 2,
  },
  guaranteeDesc: {
    fontSize: 10,
    color: Colors.textSecondary,
    lineHeight: 15,
  },
});
