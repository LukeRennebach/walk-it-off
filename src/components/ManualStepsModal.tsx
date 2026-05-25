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
import { stepsToKcal } from '../utils/calories';

type Props = {
  visible: boolean;
  onClose: () => void;
  onAdd: (steps: number) => void;
};

const QUICK_AMOUNTS = [500, 1000, 2000, 5000];

export default function ManualStepsModal({ visible, onClose, onAdd }: Props) {
  const [input, setInput] = useState('');

  const steps = parseInt(input, 10) || 0;
  const kcal = stepsToKcal(steps);

  function handleAdd() {
    if (steps > 0) {
      onAdd(steps);
      setInput('');
    }
  }

  function handleClose() {
    setInput('');
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
          <Text style={styles.title}>Schritte hinzufügen</Text>
          <Text style={styles.subtitle}>
            Schritte, die dein Handy nicht gezählt hat
          </Text>

          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            keyboardType="number-pad"
            placeholder="Anzahl Schritte"
            placeholderTextColor="#9CA3AF"
            maxLength={6}
            autoFocus
          />

          {steps > 0 && (
            <Text style={styles.preview}>≈ {kcal} kcal</Text>
          )}

          <View style={styles.quickRow}>
            {QUICK_AMOUNTS.map((amount) => (
              <TouchableOpacity
                key={amount}
                style={styles.quickBtn}
                onPress={() => setInput(String(amount))}
                activeOpacity={0.7}
              >
                <Text style={styles.quickBtnText}>
                  +{amount.toLocaleString('de-DE')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={handleClose}>
              <Text style={styles.cancelText}>Abbrechen</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.addBtn, steps === 0 && styles.addBtnDisabled]}
              onPress={handleAdd}
              disabled={steps === 0}
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
    marginBottom: 8,
  },
  preview: {
    textAlign: 'center',
    fontSize: 14,
    color: '#3D9970',
    fontWeight: '600',
    marginBottom: 16,
  },
  quickRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  quickBtn: {
    flex: 1,
    backgroundColor: '#F0F9F4',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  quickBtnText: {
    fontSize: 13,
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
