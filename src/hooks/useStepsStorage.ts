import { useEffect, useState, useCallback } from 'react';
import { getDatabase } from '../utils/database';
import { stepsToKcal, treadmillKcal, treadmillToSteps } from '../utils/calories';

export type StepEntry = {
  id: number;
  date: string;
  source: 'manual_steps' | 'treadmill';
  steps: number;
  kcal: number;
  notes: string;
  created_at: string;
};

function todayDate(): string {
  return new Date().toISOString().split('T')[0]; // YYYY-MM-DD
}

export function useStepsStorage() {
  const [todayEntries, setTodayEntries] = useState<StepEntry[]>([]);
  const [isReady, setIsReady] = useState(false);

  const loadTodayEntries = useCallback(async () => {
    const db = await getDatabase();
    const entries = await db.getAllAsync<StepEntry>(
      'SELECT * FROM step_entries WHERE date = ? ORDER BY created_at ASC',
      [todayDate()]
    );
    setTodayEntries(entries);
  }, []);

  useEffect(() => {
    getDatabase().then(() => {
      setIsReady(true);
      loadTodayEntries();
    });
  }, [loadTodayEntries]);

  const addManualSteps = useCallback(
    async (steps: number) => {
      const db = await getDatabase();
      await db.runAsync(
        'INSERT INTO step_entries (date, source, steps, kcal, notes, created_at) VALUES (?, ?, ?, ?, ?, ?)',
        [todayDate(), 'manual_steps', steps, stepsToKcal(steps), '', new Date().toISOString()]
      );
      await loadTodayEntries();
    },
    [loadTodayEntries]
  );

  const addTreadmill = useCallback(
    async (durationMin: number, speedKmh: number) => {
      const db = await getDatabase();
      const steps = treadmillToSteps(durationMin, speedKmh);
      const kcal = treadmillKcal(durationMin, speedKmh);
      const notes = `${durationMin} Min bei ${speedKmh} km/h`;
      await db.runAsync(
        'INSERT INTO step_entries (date, source, steps, kcal, notes, created_at) VALUES (?, ?, ?, ?, ?, ?)',
        [todayDate(), 'treadmill', steps, kcal, notes, new Date().toISOString()]
      );
      await loadTodayEntries();
    },
    [loadTodayEntries]
  );

  const manualSteps = todayEntries.reduce((sum, e) => sum + e.steps, 0);
  const manualKcal = todayEntries.reduce((sum, e) => sum + e.kcal, 0);

  return { todayEntries, manualSteps, manualKcal, addManualSteps, addTreadmill, isReady };
}
