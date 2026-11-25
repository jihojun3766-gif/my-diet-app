import test from 'node:test';
import assert from 'node:assert/strict';
import type { UserMetricsInput } from './nutrition';
import {
  calculateSimpleWeightPlan,
  detectPlanGoal,
  getDefaultTargetWeight,
  getRealisticDurationPresets,
} from './roadmap';

const SAMPLE_METRICS: UserMetricsInput = {
  gender: 'male',
  age: 28,
  heightCm: 175,
  weightKg: 72,
  lifestyle: 'sedentary',
  frequency: 'freq_3',
  experience: 'exp_1_2y',
  fitnessLevel: 'fit_jog',
  goal: 'maintain',
};

test('automatically detects diet, maintain, or bulk from target weight vs current weight', () => {
  assert.equal(detectPlanGoal(72, 68), 'diet');
  assert.equal(detectPlanGoal(72, 72), 'maintain');
  assert.equal(detectPlanGoal(72, 72.2), 'maintain');
  assert.equal(detectPlanGoal(72, 77), 'bulk');

  assert.equal(getDefaultTargetWeight(72, 'cut'), 68);
  assert.equal(getDefaultTargetWeight(72, 'bulk'), 76);
  assert.equal(getDefaultTargetWeight(72, 'maintain'), 72);
});

test('generates realistic duration presets with a clear recommended option', () => {
  const dietPresets = getRealisticDurationPresets(72, 68);
  assert.ok(dietPresets.length >= 3);
  assert.ok(dietPresets.some((p) => p.isRecommended && p.weeks === 8));
  assert.ok(dietPresets.every((p) => p.paceText.includes('감량')));

  const bulkPresets = getRealisticDurationPresets(72, 77);
  assert.ok(bulkPresets.some((p) => p.isRecommended));
  assert.ok(bulkPresets.every((p) => p.paceText.includes('증량')));
});

test('calculates diet, maintain, and bulk daily calories and flags unrealistic short durations', () => {
  const dietPlan = calculateSimpleWeightPlan(SAMPLE_METRICS, 68, 8);
  assert.equal(dietPlan.planType, 'diet');
  assert.equal(dietPlan.planBadge, '다이어트');
  assert.equal(dietPlan.weeklyChangeKg, -0.5);
  assert.equal(dietPlan.realismStatus, 'good');
  assert.equal(dietPlan.dailyCalories, 1750);
  assert.equal(dietPlan.actualDailyDelta, -550);

  const tooFastDiet = calculateSimpleWeightPlan(SAMPLE_METRICS, 62, 4);
  assert.equal(tooFastDiet.realismStatus, 'too_fast');
  assert.ok(tooFastDiet.minRecommendedWeeks >= 10);

  const bulkPlan = calculateSimpleWeightPlan(SAMPLE_METRICS, 76, 16);
  assert.equal(bulkPlan.planType, 'bulk');
  assert.equal(bulkPlan.planBadge, '벌크업');
  assert.ok(bulkPlan.dailyCalories > bulkPlan.maintenanceCalories);
  assert.equal(bulkPlan.realismStatus, 'good');

  const maintainPlan = calculateSimpleWeightPlan(SAMPLE_METRICS, 72, 8);
  assert.equal(maintainPlan.planType, 'maintain');
  assert.equal(maintainPlan.dailyCalories, maintainPlan.maintenanceCalories);
});
