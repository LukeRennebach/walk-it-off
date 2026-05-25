// MET (Metabolic Equivalent of Task) for walking speeds
export function metForSpeed(speedKmh: number): number {
  // Linear approximation based on compendium of physical activities
  // 3 km/h ≈ 2.8 MET, 5 km/h ≈ 4.3 MET, 6 km/h ≈ 5.0 MET
  return Math.max(2.0, 0.73 * speedKmh + 0.54);
}

export function treadmillKcal(durationMin: number, speedKmh: number, weightKg = 70): number {
  const met = metForSpeed(speedKmh);
  return Math.round(met * weightKg * (durationMin / 60));
}

export function treadmillToSteps(durationMin: number, speedKmh: number): number {
  const distanceKm = speedKmh * (durationMin / 60);
  return Math.round(distanceKm * 1250); // ~80 cm stride = 1250 steps/km
}

export function stepsToKcal(steps: number, weightKg = 70): number {
  // ~0.04 kcal per step for 70 kg person; scales with weight
  return Math.round(steps * (weightKg / 70) * 0.04);
}

// Mifflin-St Jeor TDEE — prepared for onboarding screen
export function mifflinStJeor(
  weightKg: number,
  heightCm: number,
  age: number,
  isMale: boolean
): number {
  const bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + (isMale ? 5 : -161);
  return Math.round(bmr * 1.2); // sedentary multiplier
}
