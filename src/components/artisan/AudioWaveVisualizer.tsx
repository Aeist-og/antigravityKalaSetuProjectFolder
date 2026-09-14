import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '../../constants/colors';

interface AudioWaveVisualizerProps {
  isRecording: boolean;
  onToggleRecord: () => void;
  title?: string;
  subtitle?: string;
}

export const AudioWaveVisualizer: React.FC<AudioWaveVisualizerProps> = ({
  isRecording,
  onToggleRecord,
  title,
  subtitle,
}) => {
  const [waveHeights, setWaveHeights] = useState<number[]>([12, 24, 38, 20, 42, 30, 16, 35, 22]);

  useEffect(() => {
    let interval: any = null;
    if (isRecording) {
      interval = setInterval(() => {
        setWaveHeights([
          Math.floor(Math.random() * 32) + 12,
          Math.floor(Math.random() * 45) + 15,
          Math.floor(Math.random() * 55) + 20,
          Math.floor(Math.random() * 40) + 14,
          Math.floor(Math.random() * 60) + 25,
          Math.floor(Math.random() * 48) + 18,
          Math.floor(Math.random() * 38) + 12,
          Math.floor(Math.random() * 52) + 16,
          Math.floor(Math.random() * 30) + 10,
        ]);
      }, 120);
    } else {
      setWaveHeights([12, 18, 24, 18, 28, 20, 15, 22, 14]);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  return (
    <View style={styles.container}>
      <View style={styles.micCircleContainer}>
        {isRecording && <View style={styles.pulseRing} />}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onToggleRecord}
          style={[styles.micButton, isRecording && styles.micButtonActive]}
          accessibilityLabel={isRecording ? 'Stop recording' : 'Start voice description'}
        >
          <Text style={styles.micIcon}>{isRecording ? '⏹' : '🎙️'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.waveformContainer}>
        {waveHeights.map((h, idx) => (
          <View
            key={idx}
            style={[
              styles.waveBar,
              {
                height: h,
                backgroundColor: isRecording ? Colors.primary : Colors.border,
              },
            ]}
          />
        ))}
      </View>

      <Text style={styles.titleText}>
        {title || (isRecording ? 'Listening to your voice...' : 'Tap microphone to speak')}
      </Text>
      {subtitle && <Text style={styles.subtitleText}>{subtitle}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  micCircleContainer: {
    width: 96,
    height: 96,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  pulseRing: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.primaryLight,
    borderWidth: 2,
    borderColor: Colors.primary,
    opacity: 0.8,
  },
  micButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
  micButtonActive: {
    backgroundColor: '#D32F2F',
    shadowColor: '#D32F2F',
  },
  micIcon: {
    fontSize: 30,
    color: '#FFFFFF',
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    gap: 6,
    marginBottom: Spacing.sm,
  },
  waveBar: {
    width: 6,
    borderRadius: 3,
  },
  titleText: {
    fontSize: Typography.fontSize.md,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
  },
  subtitleText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 280,
  },
});
