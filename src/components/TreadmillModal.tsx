import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { treadmillKcal, treadmillToSteps } from '../utils/calories';

type Props = {
  visible: boolean;
  onClose: () => void;
  onAdd: (durationMin: number, speedKmh: number) => void;
};

const SPEED_PRESETS = [3, 4, 5, 6] as const;

export default function TreadmillModal({ visible, onClose, onAdd }: Props) {
  const [duration, setDuration] = useState('');
  const [speed, setSpeed] = useState<number>(5);

  const durationMin = parseInt(duration, 10) || 0;
  const steps = durationMin > 0 ? treadmillToSteps(durationMin, speed) : 0;
  const kcal = durationMin > 0 ? treadmillKcal(durationMin, speed) : 0;

  function handleAdd() {
    if (durationMin > 0) {
      onAdd(durationMin, speed);
      setDuration('');
      setSpeed(5);
    }
  }

  function handleClose() {
    setDuration('');
    setSpeed(5);
    onClose();
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Pressable style={styles.backdrop} onPress={handleClose} />
        <View style={styles.card}>
          <Text style={styles.title}>Laufband</Text>
          <Text style={styles.subtitle}>
            Dauer und Geschwindigkeit eingeben
          </Text>

          <Text style={styles.label}>Dauer (Minuten)</Text>
          <TextInput
            style={styles.input}
            value={duration}
            onChangeText={setDuration}
            keyboardType="number-pad"
            placeholder="z.B. 30"
            placeholderTextColor="#9CA3AF"
            maxLength={3}
            autoFocus
          />

          <Text style={styles.label}>Geschwindigkeit</Text>
          <View style={styles.speedRow}>
            {SPEED_PRESETS.map((preset) => (
              <TouchableOpacity
                key={preset}
                style={[styles.speedBtn, speed === preset && styles.speedBtnActive]}
                onPress={() => setSpeed(preset)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.speedBtnText,
                    speed === preset && styles.speedBtnTextActive,
                  ]}
                >
                  {preset} km/h
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {durationMin > 0 && (
            <View style={styles.preview}>
              <Text style={styles.previewText}>
                ≈ {steps.toLocaleString('de-DE')} Schritte · ≈ {kcal} kcal
              </Text>
            </View>
          )}

          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={handleClose}>
              <Text style={styles.cancelText}>Abbrechen</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.addBtn, durationMin === 0 && styles.addBtnDisabled]}
              onPress={handleAdd}
              disabled={durationMin === 0}
              activeOpacity={0.8}
            >
              <Text style={styles.addText}>Hinzufügen</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A2332',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 24,
    color: '#1A2332',
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 20,
  },
  speedRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  speedBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  speedBtnActive: {
    borderColor: '#3D9970',
    backgroundColor: '#F0F9F4',
  },
  speedBtnText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
  },
  speedBtnTextActive: {
    color: '#3D9970',
  },
  preview: {
    backgroundColor: '#F0F9F4',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  previewText: {
    fontSize: 15,
    color: '#3D9970',
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
  },
  addBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#3D9970',
    alignItems: 'center',
  },
  addBtnDisabled: {
    backgroundColor: '#A7D4BF',
  },
  addText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
