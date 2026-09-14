import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Colors, Typography, Spacing, Shadows } from '../../constants/colors';
import { Header } from '../../components/common/Header';
import { ProgressBar } from '../../components/common/ProgressBar';
import { Button } from '../../components/common/Button';
import { AudioWaveVisualizer } from '../../components/artisan/AudioWaveVisualizer';
import { useLanguage } from '../../context/LanguageContext';
import { useProductDraft } from '../../context/ProductDraftContext';
import { AudioRecordingLike, speechService } from '../../services/speech/speechService';
import { catalogAiService } from '../../services/catalog-ai/catalogAiService';

interface Step3DescribeProductScreenProps {
  onBack: () => void;
  onNext: () => void;
}

export const Step3DescribeProductScreen: React.FC<Step3DescribeProductScreenProps> = ({
  onBack,
  onNext,
}) => {
  const { t, language } = useLanguage();
  const { draft, setVoiceTranscript, updateProductInfo } = useProductDraft();

  const [activeTab, setActiveTab] = useState<'voice' | 'text'>('voice');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingObject, setRecordingObject] = useState<AudioRecordingLike | null>(null);
  const [transcript, setTranscript] = useState<string>(draft.voiceTranscript || '');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const toggleRecording = async () => {
    if (isRecording && recordingObject) {
      setIsRecording(false);
      setIsProcessing(true);
      setStatusMessage('Saving audio recording...');

      try {
        const audioUri = await speechService.stopRecording(recordingObject);
        setRecordingObject(null);

        if (audioUri) {
          if (speechService.isConfigured()) {
            setStatusMessage('Transcribing audio in regional language...');
            const res = await speechService.transcribeAudio(audioUri);
            if (res.success && res.transcript) {
              setTranscript(res.transcript);
              setVoiceTranscript(res.transcript);
              setStatusMessage(null);
            } else {
              setStatusMessage(res.errorMessage || t('step3.sttUnavailable'));
            }
          } else {
            setStatusMessage(t('step3.sttUnavailable'));
          }
        }
      } finally {
        setIsProcessing(false);
      }
    } else {
      setStatusMessage(null);
      const recording = await speechService.startRecording();
      if (recording) {
        setRecordingObject(recording);
        setIsRecording(true);
      } else {
        setStatusMessage('Could not access microphone. Please enable permissions or type directly.');
      }
    }
  };

  const handleProcessDescription = async () => {
    const textToAnalyze = transcript.trim();
    if (!textToAnalyze) {
      onNext();
      return;
    }

    setVoiceTranscript(textToAnalyze);

    if (catalogAiService.isConfigured()) {
      setIsProcessing(true);
      setStatusMessage('AI is understanding your craft details and generating bilingual information...');
      try {
        const res = await catalogAiService.extractCatalogInfo(textToAnalyze, language);
        if (res.success && res.info) {
          updateProductInfo(res.info);
          onNext();
          return;
        } else {
          setStatusMessage(res.errorMessage || 'AI service unavailable. You can enter details manually.');
        }
      } finally {
        setIsProcessing(false);
      }
    } else {
      // Direct pass-through without fake AI
      updateProductInfo({
        descriptionHi: textToAnalyze,
        descriptionEn: textToAnalyze,
      });
      onNext();
    }
  };

  return (
    <View style={styles.screen}>
      <Header
        title={t('step3.title')}
        subtitle={t('step3.subtitle')}
        onBack={onBack}
        showLanguageToggle={true}
      />
      <ProgressBar step={3} totalSteps={7} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Mode Selector Tabs */}
        <View style={styles.tabSelector}>
          <TouchableOpacity
            onPress={() => setActiveTab('voice')}
            style={[styles.tabBtn, activeTab === 'voice' && styles.tabBtnActive]}
          >
            <Text style={[styles.tabBtnText, activeTab === 'voice' && styles.tabBtnTextActive]}>
              🎙️ {t('step3.voiceTab')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('text')}
            style={[styles.tabBtn, activeTab === 'text' && styles.tabBtnActive]}
          >
            <Text style={[styles.tabBtnText, activeTab === 'text' && styles.tabBtnTextActive]}>
              ✍️ {t('step3.textTab')}
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'voice' ? (
          <View style={[styles.voiceCard, Shadows.soft]}>
            <AudioWaveVisualizer
              isRecording={isRecording}
              onToggleRecord={toggleRecording}
              title={isRecording ? t('step3.listening') : t('step3.tapToSpeak')}
              subtitle={isRecording ? t('step3.stopSpeaking') : 'Speak naturally in your mother tongue'}
            />

            {transcript ? (
              <View style={styles.transcriptWrap}>
                <Text style={styles.transcriptLabel}>{t('step3.transcribedText')}</Text>
                <TextInput
                  value={transcript}
                  onChangeText={setTranscript}
                  multiline
                  numberOfLines={4}
                  style={styles.transcriptInput}
                />
              </View>
            ) : null}
          </View>
        ) : (
          <View style={[styles.textInputCard, Shadows.soft]}>
            <Text style={styles.textInputLabel}>{t('step3.typePlaceholder')}</Text>
            <TextInput
              value={transcript}
              onChangeText={setTranscript}
              multiline
              numberOfLines={6}
              placeholder={t('step3.typePlaceholder')}
              placeholderTextColor={Colors.textMuted}
              style={styles.bigTextArea}
            />
          </View>
        )}

        {statusMessage && (
          <View style={styles.statusBox}>
            <Text style={styles.statusText}>ℹ️ {statusMessage}</Text>
          </View>
        )}

        <Button
          title={t('step3.continueWithVoice')}
          onPress={handleProcessDescription}
          size="lg"
          loading={isProcessing}
          style={styles.processBtn}
        />
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
  tabSelector: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 22,
    padding: 4,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 18,
  },
  tabBtnActive: {
    backgroundColor: Colors.surface,
    shadowColor: Colors.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  tabBtnText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  tabBtnTextActive: {
    color: Colors.primary,
  },
  voiceCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  transcriptWrap: {
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  transcriptLabel: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 6,
  },
  transcriptInput: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 12,
    padding: Spacing.sm,
    fontSize: Typography.fontSize.sm,
    color: Colors.text,
    lineHeight: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    textAlignVertical: 'top',
  },
  textInputCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  textInputLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  bigTextArea: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 14,
    padding: Spacing.md,
    fontSize: Typography.fontSize.sm,
    color: Colors.text,
    lineHeight: 22,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 140,
    textAlignVertical: 'top',
  },
  statusBox: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 12,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statusText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  processBtn: {
    marginTop: Spacing.xs,
  },
});
