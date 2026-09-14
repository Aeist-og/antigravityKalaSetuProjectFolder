import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Share,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Colors, Typography, Spacing, Shadows } from '../../constants/colors';
import { Header } from '../../components/common/Header';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { DatabaseService } from '../../services/database/databaseService';
import { ActivityService } from '../../services/activity/activityService';
import { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'ExhibitionQr'>;

export const ExhibitionQrScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useLanguage();
  const { user } = useAuth();

  const [exhibitionName, setExhibitionName] = useState<string>('Surajkund Crafts Mela 2026');
  const [stallNumber, setStallNumber] = useState<string>('Stall #42, Craft Pavilion');
  const [promoMessage, setPromoMessage] = useState<string>(
    'Scan to explore our complete authentic handcrafted collection and direct artisan orders!'
  );
  const [isPosterMode, setIsPosterMode] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [savedExhibitionId, setSavedExhibitionId] = useState<string | null>(null);

  // Dynamic shareable showcase URL
  const showcaseUrl = `https://kalasetu.in/showcase/${user?.id || 'artisan'}`;

  const handleSaveExhibition = async () => {
    if (!user?.id) return;
    setSaving(true);
    try {
      const res = await DatabaseService.createExhibition({
        artisanId: user.id,
        name: exhibitionName.trim() || 'Physical Craft Mela',
        location: stallNumber.trim(),
        description: promoMessage.trim(),
        qrCodePayload: showcaseUrl,
        bannerConfig: {
          showArtisanStory: true,
          theme: 'heritage_terracotta',
        },
      });

      if (res.data) {
        setSavedExhibitionId(res.data.id);
        await ActivityService.log(
          user.id,
          'EXHIBITION_QR_GENERATED',
          `Generated Exhibition QR for ${exhibitionName}`,
          `${exhibitionName} के लिए प्रदर्शनी क्यूआर बनाया`,
          `Stall URL: ${showcaseUrl}`,
          `स्टॉल यूआरएल: ${showcaseUrl}`
        );
        Alert.alert('Exhibition Stall Saved! 🖨️', 'Your digital showcase QR code is generated and ready for your physical stall banner.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        title: `${user?.fullName || 'Artisan'} - Digital Craft Showcase`,
        message: `Namaste! Explore our authentic handcrafted collection directly at ${exhibitionName} (${stallNumber}):\n${showcaseUrl}`,
      });
    } catch (e) {
      console.warn('Share error:', e);
    }
  };

  return (
    <View style={styles.screen}>
      <Header
        title="📱 Exhibition Stall QR"
        subtitle="Physical Mela → Digital Showcase"
        onBack={() => navigation.goBack()}
        showLanguageToggle={true}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Toggle Mode: Stall Configuration vs Printable Banner Poster */}
        <View style={styles.modeToggleRow}>
          <TouchableOpacity
            style={[styles.toggleBtn, !isPosterMode && styles.toggleBtnActive]}
            onPress={() => setIsPosterMode(false)}
            activeOpacity={0.8}
          >
            <Text style={[styles.toggleBtnText, !isPosterMode && styles.toggleBtnTextActive]}>
              ⚙️ Stall Setup
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toggleBtn, isPosterMode && styles.toggleBtnActive]}
            onPress={() => setIsPosterMode(true)}
            activeOpacity={0.8}
          >
            <Text style={[styles.toggleBtnText, isPosterMode && styles.toggleBtnTextActive]}>
              🖨️ Stall Banner Poster
            </Text>
          </TouchableOpacity>
        </View>

        {!isPosterMode ? (
          <>
            {/* Setup Form */}
            <View style={[styles.card, Shadows.soft]}>
              <Text style={styles.cardSectionTitle}>📍 Physical Exhibition Information</Text>

              <Text style={styles.fieldLabel}>Exhibition / Mela Name</Text>
              <TextInput
                style={styles.input}
                value={exhibitionName}
                onChangeText={setExhibitionName}
                placeholder="e.g. Dilli Haat, Surajkund Mela, SARAS Mela"
                placeholderTextColor={Colors.textMuted}
              />

              <Text style={styles.fieldLabel}>Stall / Pavilion Location</Text>
              <TextInput
                style={styles.input}
                value={stallNumber}
                onChangeText={setStallNumber}
                placeholder="e.g. Stall #14, North Zone Handloom Hall"
                placeholderTextColor={Colors.textMuted}
              />

              <Text style={styles.fieldLabel}>Visitor Greeting Message</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                multiline
                numberOfLines={3}
                value={promoMessage}
                onChangeText={setPromoMessage}
                placeholder="Message shown to visitors who scan your QR at the stall..."
                placeholderTextColor={Colors.textMuted}
              />

              <Button
                title={saving ? 'Saving...' : '💾 Save Exhibition Setup'}
                onPress={handleSaveExhibition}
                loading={saving}
                size="md"
                style={styles.actionBtn}
              />
            </View>

            {/* Live QR Preview Card */}
            <View style={[styles.card, styles.qrCard, Shadows.soft]}>
              <Text style={styles.qrTitle}>Live Vector QR Code</Text>
              <Text style={styles.qrSubtitle}>Encodes your direct digital showcase</Text>

              <View style={styles.qrWrapper}>
                <QRCode
                  value={showcaseUrl}
                  size={190}
                  color={Colors.primaryDark}
                  backgroundColor="#FFFFFF"
                />
              </View>

              <Text style={styles.urlText} numberOfLines={1}>
                {showcaseUrl}
              </Text>

              <View style={styles.btnRow}>
                <Button
                  title="👁️ Preview Showcase"
                  onPress={() =>
                    navigation.navigate('DigitalShowcase', {
                      exhibitionId: savedExhibitionId || undefined,
                      artisanId: user?.id,
                    })
                  }
                  variant="outline"
                  size="sm"
                  style={{ flex: 1 }}
                />
                <Button
                  title="📤 Share Link"
                  onPress={handleShare}
                  size="sm"
                  style={{ flex: 1 }}
                />
              </View>
            </View>
          </>
        ) : (
          /* Printable Exhibition Banner Poster Preview */
          <View style={[styles.posterCard, Shadows.prominent]}>
            {/* Poster Header Arch */}
            <View style={styles.posterHeader}>
              <View style={styles.posterTagRow}>
                <Badge label="KALASETU VERIFIED ARTISAN" variant="accent" />
                <Badge label="GENUINE HANDMADE" variant="success" />
              </View>
              <Text style={styles.posterMelaName}>{exhibitionName}</Text>
              <Text style={styles.posterStallLocation}>{stallNumber}</Text>
            </View>

            {/* Poster Body */}
            <View style={styles.posterBody}>
              <Text style={styles.posterArtisanName}>{user?.fullName || 'Master Artisan'}</Text>
              <Text style={styles.posterCraftSubtitle}>
                Traditional Heritage Craftsmanship • Made in India
              </Text>

              {/* Large Vector QR Code on Poster */}
              <View style={styles.posterQrBox}>
                <QRCode
                  value={showcaseUrl}
                  size={200}
                  color={Colors.primaryDark}
                  backgroundColor="#FFFFFF"
                />
              </View>

              <View style={styles.scanInstructionPill}>
                <Text style={styles.scanInstructionEmoji}>📷</Text>
                <Text style={styles.scanInstructionText}>
                  Scan with any Smartphone Camera or UPI App
                </Text>
              </View>

              <Text style={styles.posterDescText}>{promoMessage}</Text>

              <View style={styles.posterFooter}>
                <Text style={styles.posterFooterText}>
                  Direct Artisan Sales • Fair Wages • Zero Intermediary Markups
                </Text>
              </View>
            </View>

            <Button
              title="📤 Share & Print Stall Placard"
              onPress={handleShare}
              size="lg"
              style={{ marginTop: Spacing.md }}
            />
          </View>
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
    paddingBottom: Spacing.xxl,
  },
  modeToggleRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
    gap: 6,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  toggleBtnActive: {
    backgroundColor: Colors.primary,
  },
  toggleBtnText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  toggleBtnTextActive: {
    color: '#FFF',
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  cardSectionTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: Spacing.sm,
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
    paddingVertical: 11,
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
  actionBtn: {
    marginTop: Spacing.sm,
  },
  qrCard: {
    alignItems: 'center',
  },
  qrTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: '800',
    color: Colors.text,
  },
  qrSubtitle: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
    marginBottom: Spacing.md,
  },
  qrWrapper: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 2,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  urlText: {
    fontSize: 11,
    color: Colors.primaryDark,
    fontFamily: 'monospace',
    marginBottom: Spacing.md,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  posterCard: {
    backgroundColor: '#FAF7F2',
    borderRadius: 22,
    borderWidth: 2,
    borderColor: Colors.primary,
    overflow: 'hidden',
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  posterHeader: {
    backgroundColor: Colors.primaryDark,
    borderRadius: 16,
    padding: Spacing.md,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  posterTagRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8,
  },
  posterMelaName: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '900',
    color: '#FFF',
    textAlign: 'center',
  },
  posterStallLocation: {
    fontSize: Typography.fontSize.xs,
    color: '#FBECE6',
    marginTop: 2,
    fontWeight: '700',
  },
  posterBody: {
    alignItems: 'center',
  },
  posterArtisanName: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '900',
    color: Colors.primaryDark,
    textAlign: 'center',
  },
  posterCraftSubtitle: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 2,
    marginBottom: Spacing.md,
  },
  posterQrBox: {
    padding: 14,
    backgroundColor: '#FFF',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.primary,
    marginBottom: Spacing.md,
  },
  scanInstructionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accentLight,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.accent,
    marginBottom: Spacing.md,
    gap: 6,
  },
  scanInstructionEmoji: {
    fontSize: 16,
  },
  scanInstructionText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '800',
    color: Colors.accentGold,
  },
  posterDescText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
  posterFooter: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.sm,
    marginTop: Spacing.xs,
  },
  posterFooterText: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '700',
    textAlign: 'center',
  },
});
