import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  type DimensionValue,
} from 'react-native';
import { usePedometer } from '../hooks/usePedometer';
import { useStepsStorage } from '../hooks/useStepsStorage';
import { stepsToKcal } from '../utils/calories';
import ManualStepsModal from '../components/ManualStepsModal';
import TreadmillModal from '../components/TreadmillModal';

const STEP_GOAL = 10_000;

function formatDate(): string {
  return new Date().toLocaleDateString('de-DE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function StepScreen() {
  const { isAvailable, stepCount } = usePedometer();
  const { todayEntries, manualSteps, manualKcal, addManualSteps, addTreadmill } =
    useStepsStorage();
  const [showManualModal, setShowManualModal] = useState(false);
  const [showTreadmillModal, setShowTreadmillModal] = useState(false);

  const autoSteps = isAvailable ? stepCount : 0;
  const totalSteps = autoSteps + manualSteps;
  const autoKcal = stepsToKcal(autoSteps);
  const totalKcal = autoKcal + manualKcal;

  const progress = Math.min(totalSteps / STEP_GOAL, 1);
  const progressPercent = Math.round(progress * 100);
  const progressWidth: DimensionValue = `${progressPercent}%`;

  const goalReached = totalSteps >= STEP_GOAL;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Schritte</Text>
          <Text style={styles.date}>{formatDate()}</Text>
        </View>

        {/* Main card */}
        <View style={styles.card}>
          {isAvailable === null ? (
            <ActivityIndicator size="large" color="#3D9970" style={styles.loader} />
          ) : (
            <>
              <Text style={[styles.stepCount, goalReached && styles.stepCountGoal]}>
                {totalSteps.toLocaleString('de-DE')}
              </Text>
              <Text style={styles.stepLabel}>
                {goalReached ? 'Tagesziel erreicht!' : 'Schritte heute'}
              </Text>

              {/* Progress bar */}
              <View style={styles.progressContainer}>
                <View style={styles.progressBg}>
                  <View style={[styles.progressFill, { width: progressWidth }]} />
                </View>
                <Text style={styles.progressText}>
                  {progressPercent}% von {STEP_GOAL.toLocaleString('de-DE')} Schritten
                </Text>
              </View>

              {/* Stats */}
              <View style={styles.statsRow}>
                <View style={styles.stat}>
                  <Text style={styles.statValue}>{totalKcal}</Text>
                  <Text style={styles.statLabel}>kcal verbrannt</Text>
                </View>
                {manualSteps > 0 && (
                  <View style={styles.stat}>
                    <Text style={styles.statValue}>
                      +{manualSteps.toLocaleString('de-DE')}
                    </Text>
                    <Text style={styles.statLabel}>manuell</Text>
                  </View>
                )}
                {isAvailable && autoSteps > 0 && (
                  <View style={styles.stat}>
                    <Text style={styles.statValue}>
                      {autoSteps.toLocaleString('de-DE')}
                    </Text>
                    <Text style={styles.statLabel}>automatisch</Text>
                  </View>
                )}
              </View>

              {/* Pedometer unavailable notice */}
              {isAvailable === false && (
                <View style={styles.notice}>
                  <Text style={styles.noticeText}>
                    Automatisches Schritt-Tracking nicht verfügbar auf diesem Gerat.
                    Nutze die manuelle Eingabe.
                  </Text>
                </View>
              )}
            </>
          )}
        </View>

        {/* Action buttons */}
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => setShowManualModal(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryBtnText}>+ Schritte hinzufügen</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => setShowTreadmillModal(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.secondaryBtnText}>+ Laufband</Text>
        </TouchableOpacity>

        {/* Manual entries list */}
        {todayEntries.length > 0 && (
          <View style={styles.entriesSection}>
            <Text style={styles.entriesTitle}>Heute hinzugefügt</Text>
            {todayEntries.map((entry) => (
              <View key={entry.id} style={styles.entryRow}>
                <View style={styles.entryIcon}>
                  <Text style={styles.entryIconText}>
                    {entry.source === 'treadmill' ? 'LB' : 'M'}
                  </Text>
                </View>
                <View style={styles.entryInfo}>
                  <Text style={styles.entryMain}>
                    +{entry.steps.toLocaleString('de-DE')} Schritte
                    {' '}
                    <Text style={styles.entryKcal}>({entry.kcal} kcal)</Text>
                  </Text>
                  <Text style={styles.entrySub}>
                    {entry.source === 'treadmill' ? entry.notes : 'Manuell hinzugefügt'}
                    {' · '}
                    {formatTime(entry.created_at)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <ManualStepsModal
        visible={showManualModal}
        onClose={() => setShowManualModal(false)}
        onAdd={(steps) => {
          addManualSteps(steps);
          setShowManualModal(false);
        }}
      />

      <TreadmillModal
        visible={showTreadmillModal}
        onClose={() => setShowTreadmillModal(false)}
        onAdd={(durationMin, speedKmh) => {
          addTreadmill(durationMin, speedKmh);
          setShowTreadmillModal(false);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F9F7',
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1A2332',
    letterSpacing: -0.5,
  },
  date: {
    fontSize: 15,
    color: '#6B7280',
    marginTop: 2,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    minHeight: 100,
  },
  loader: {
    marginVertical: 20,
  },
  stepCount: {
    fontSize: 64,
    fontWeight: '800',
    color: '#1A2332',
    letterSpacing: -2,
    lineHeight: 72,
  },
  stepCountGoal: {
    color: '#3D9970',
  },
  stepLabel: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
    marginBottom: 20,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressBg: {
    height: 8,
    backgroundColor: '#E8F2ED',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3D9970',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 13,
    color: '#6B7280',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  stat: {
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A2332',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  notice: {
    marginTop: 16,
    backgroundColor: '#FEF3C7',
    borderRadius: 10,
    padding: 12,
  },
  noticeText: {
    fontSize: 13,
    color: '#92400E',
    lineHeight: 18,
  },
  primaryBtn: {
    backgroundColor: '#3D9970',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#3D9970',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryBtnText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  secondaryBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#3D9970',
    marginBottom: 24,
  },
  secondaryBtnText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#3D9970',
  },
  entriesSection: {
    gap: 2,
  },
  entriesTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  entryIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F0F9F4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  entryIconText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#3D9970',
  },
  entryInfo: {
    flex: 1,
  },
  entryMain: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A2332',
  },
  entryKcal: {
    fontWeight: '400',
    color: '#6B7280',
  },
  entrySub: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 2,
  },
});
