import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateNutrition,
  EXPERIENCE_OPTIONS,
  FITNESS_LEVEL_OPTIONS,
  FREQUENCY_OPTIONS,
  LIFESTYLE_OPTIONS,
  validateUserMetrics,
  type UserMetricsInput,
} from './nutrition';
import { buildStandaloneHtmlDocument } from './exportSingleHtml';

test('provides granular options for frequency, experience, and walking/running fitness', () => {
  assert.equal(LIFESTYLE_OPTIONS.length, 4);
  assert.equal(FREQUENCY_OPTIONS.length, 7);
  assert.equal(EXPERIENCE_OPTIONS.length, 7);
  assert.equal(FITNESS_LEVEL_OPTIONS.length, 5);
});

test('generates valid standalone single HTML document with Harris-Benedict, granular options, and full meal planner', () => {
  const html = buildStandaloneHtmlDocument();
  assert.ok(html.startsWith('<!DOCTYPE html>'));
  assert.ok(html.includes('66.47'));
  assert.ok(html.includes('655.1'));
  assert.ok(html.includes('22.9'));
  assert.ok(html.includes('3~5km'));
  assert.ok(html.includes('view-planner-select'));
  assert.ok(html.includes('view-planner-result'));
  assert.ok(html.includes('선택한 사항으로 식단 짜러 가기'));
  assert.ok(html.includes('1끼 (아침)'));
  assert.ok(!html.includes('프로틴 쉐이크'));
  assert.ok(html.includes('view-roadmap'));
  assert.ok(html.includes('목표 체중 계획'));
  assert.ok(!html.includes('id="goal-preset-row"'));
  assert.ok(!html.includes('id="res-wp-target"'));
  assert.ok(html.includes('id="go-to-weight-plan-btn"'));
  assert.ok(html.includes('목표 설정하러 가기'));
  assert.ok(html.indexOf('id="nav-roadmap-btn"') < html.indexOf('id="nav-planner-btn"'));
});

test('calculates Harris-Benedict BMR, lifestyle metabolism, TDEE, 5:3:2 macros and foods for male baseline', () => {
  const input: UserMetricsInput = {
    gender: 'male',
    age: 28,
    heightCm: 175,
    weightKg: 72,
    lifestyle: 'sedentary', // 1.15
    frequency: 'freq_3', // +0.12
    experience: 'exp_1_2y', // +0.03
    fitnessLevel: 'fit_jog', // +0.02
    goal: 'maintain',
  };

  const result = calculateNutrition(input);

  // Male HB BMR = 66.47 + (13.75 * 72) + (5 * 175) - (6.76 * 28) = 1742.19 -> 1742
  assert.equal(result.bmr, 1742);
  // Lifestyle = 1742.19 * 1.15 = 2003.5185 -> 2004
  assert.equal(result.lifestyleMetabolism, 2004);
  // Multiplier = 1.15 + 0.12 + 0.03 + 0.02 = 1.32
  assert.equal(result.multipliers.total, 1.32);
  // TDEE = 1742.19 * 1.32 = 2299.69 -> 2300
  assert.equal(result.tdee, 2300);
  assert.equal(result.targetCalories, 2300);

  // Macros (5:3:2)
  assert.equal(result.macros.carbs.grams, 288);
  assert.equal(result.macros.protein.grams, 173);
  assert.equal(result.macros.fat.grams, 51);

  // Food conversions (65g rice carbs, 22.9g chicken protein, 13.5g olive oil fat)
  assert.equal(result.foods.riceBowls, 4.4);
  assert.equal(result.foods.chickenPacks, 7.6);
  assert.equal(result.foods.oliveOilTablespoons, 3.8);
});

test('calculates female Harris-Benedict BMR and custom cut / bulk targets accurately', () => {
  const baseFemale: UserMetricsInput = {
    gender: 'female',
    age: 30,
    heightCm: 163,
    weightKg: 58,
    lifestyle: 'light', // 1.22
    frequency: 'freq_2', // +0.08
    experience: 'exp_under_3m', // +0.00
    fitnessLevel: 'fit_walk', // +0.01
    goal: 'cut',
  };

  const cutResult = calculateNutrition(baseFemale);
  // Female HB BMR = 655.1 + (9.56 * 58) + (1.85 * 163) - (4.68 * 30) = 1370.73 -> 1371
  assert.equal(cutResult.bmr, 1371);
  assert.equal(cutResult.lifestyleMetabolism, 1672);
  assert.equal(cutResult.multipliers.total, 1.31);
  // TDEE = 1370.73 * 1.31 = 1795.6563 -> 1796
  assert.equal(cutResult.tdee, 1796);
  assert.equal(cutResult.targetCalories, 1296);
  assert.equal(cutResult.isBelowBmr, true);

  const customCutResult = calculateNutrition({ ...baseFemale, goalDeltaOverride: -300 });
  assert.equal(customCutResult.targetCalories, 1496);
  assert.equal(customCutResult.isBelowBmr, false);

  const bulkResult = calculateNutrition({ ...baseFemale, goal: 'bulk' });
  assert.equal(bulkResult.targetCalories, 2096);
  assert.equal(bulkResult.goalDelta, 300);
});

test('validates age, height, and weight boundaries strictly', () => {
  const invalidErrors = validateUserMetrics({
    gender: 'male',
    age: '',
    heightCm: 90,
    weightKg: 300,
    lifestyle: 'sedentary',
    frequency: 'freq_0',
    experience: 'exp_under_3m',
    fitnessLevel: 'fit_low',
    goal: 'maintain',
  });

  assert.ok(invalidErrors.age);
  assert.ok(invalidErrors.heightCm);
  assert.ok(invalidErrors.weightKg);
});
