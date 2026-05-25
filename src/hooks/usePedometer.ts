import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { Pedometer } from 'expo-sensors';

export type PedometerState = {
  isAvailable: boolean | null; // null = loading
  stepCount: number;
  error: string | null;
};

function getMidnight(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function usePedometer(): PedometerState {
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [stepCount, setStepCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let subscription: ReturnType<typeof Pedometer.watchStepCount> | null = null;
    let pollInterval: ReturnType<typeof setInterval> | null = null;

    async function fetchTodaySteps() {
      try {
        const result = await Pedometer.getStepCountAsync(getMidnight(), new Date());
        if (!cancelled) setStepCount(result.steps);
      } catch {
        // getStepCountAsync may fail on some Android devices — silent fallback
      }
    }

    async function setup() {
      try {
        const available = await Pedometer.isAvailableAsync();
        if (cancelled) return;
        setIsAvailable(available);
        if (!available) return;

        await fetchTodaySteps();
        if (cancelled) return;

        // iOS: watchStepCount fires quickly — use it to trigger refreshes
        // Android: getStepCountAsync is more reliable than interpreting cumulative boot-counter
        if (Platform.OS === 'ios') {
          subscription = Pedometer.watchStepCount(() => fetchTodaySteps());
        }

        // Poll every 30 s on both platforms as a reliable fallback
        pollInterval = setInterval(fetchTodaySteps, 30_000);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Schrittzähler nicht verfügbar');
          setIsAvailable(false);
        }
      }
    }

    setup();

    return () => {
      cancelled = true;
      subscription?.remove();
      if (pollInterval) clearInterval(pollInterval);
    };
  }, []);

  return { isAvailable, stepCount, error };
}
