import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateRemainingMacros,
  calculateTrackerTotals,
  createFoodLogEntry,
  mapMealPlanToLogEntries,
  recommendFoodsForRemaining,
} from './foodTracker';
import { PRESET_FOODS, generateMealPlan } from './mealPlanner';

test('sums logged food entries and calculates remaining calories and macros accurately', () => {
  const targets = { calories: 2300, carbs: 288, protein: 173, fat: 51 };

  const entries = [
    createFoodLogEntry('breakfast', '흰밥', 200, { carbs: 31, protein: 2.7, fat: 0.3 }, 'carb', '1'),
    createFoodLogEntry('breakfast', '닭가슴살', 150, { carbs: 0, protein: 23, fat: 1.2 }, 'protein', '2'),
    createFoodLogEntry('lunch', '올리브유', 10, { carbs: 0, protein: 0, fat: 100 }, 'fat', '3'),
  ];

  const totals = calculateTrackerTotals(entries);
  assert.equal(totals.carbs, 62);
  assert.equal(totals.protein, 40);
  assert.equal(totals.fat, 12);

  const rem = calculateRemainingMacros(targets, totals);
  assert.equal(rem.remaining.carbs, 288 - 62);
  assert.equal(rem.remaining.protein, 173 - 40);
  assert.equal(rem.remaining.fat, 51 - 12);
  assert.ok(rem.progressPct.calories > 0 && rem.progressPct.calories < 100);
});

test('imports generated meal plan into tracker log entries preserving macros', () => {
  const targets = { calories: 2300, carbs: 288, protein: 173, fat: 51 };
  const selected = PRESET_FOODS.filter((f) =>
    ['p_chicken_breast', 'p_egg', 'c_white_rice', 'c_sweet_potato', 'f_olive_oil'].includes(f.id),
  );
  const plan = generateMealPlan(targets, selected, 3);
  const imported = mapMealPlanToLogEntries(plan);

  assert.ok(imported.length >= 5);
  const totals = calculateTrackerTotals(imported);
  assert.ok(Math.abs(totals.calories - plan.totals.calories) <= 5);
  assert.equal(totals.carbs, plan.totals.carbs);
  assert.equal(totals.protein, plan.totals.protein);
  assert.equal(totals.fat, plan.totals.fat);
});

test('recommends accurate staple foods to fill remaining macros and avoids overshooting full macros', () => {
  // Missing C=85g, P=42g, F=14g (~634 kcal)
  const rec = recommendFoodsForRemaining({ calories: 634, carbs: 85, protein: 42, fat: 14 });
  assert.equal(rec.isGoalAlreadyMet, false);
  assert.ok(rec.items.length >= 2);
  assert.ok(Math.abs(rec.totals.carbs - 85) <= 6, `Carb error too high: ${rec.totals.carbs}`);
  assert.ok(Math.abs(rec.totals.protein - 42) <= 5, `Protein error too high: ${rec.totals.protein}`);
  assert.ok(Math.abs(rec.totals.fat - 14) <= 3, `Fat error too high: ${rec.totals.fat}`);

  // Missing only protein (P=30g, C=0, F=0) -> should not recommend white rice
  const proteinOnly = recommendFoodsForRemaining({ calories: 120, carbs: 0, protein: 30, fat: 0 });
  assert.equal(proteinOnly.isGoalAlreadyMet, false);
  assert.ok(!proteinOnly.items.some((x) => x.food.category === 'carb'));
  assert.ok(Math.abs(proteinOnly.totals.protein - 30) <= 4);

  // Already met
  const met = recommendFoodsForRemaining({ calories: 10, carbs: 1, protein: 1, fat: 0 });
  assert.equal(met.isGoalAlreadyMet, true);
  assert.equal(met.items.length, 0);
});
