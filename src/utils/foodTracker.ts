import {
  PRESET_FOODS,
  type FoodCategory,
  type FoodItem,
  type MacroTargets,
  type MealFoodAllocation,
  type MealPlanResult,
} from './mealPlanner';

export type MealSlot = 'breakfast' | 'lunch' | 'dinner' | 'extra';

export const MEAL_SLOT_OPTIONS: ReadonlyArray<{ value: MealSlot; label: string }> = [
  { value: 'breakfast', label: '아침' },
  { value: 'lunch', label: '점심' },
  { value: 'dinner', label: '저녁' },
  { value: 'extra', label: '추가 식사' },
];

export interface FoodLogEntry {
  id: string;
  mealSlot: MealSlot;
  foodName: string;
  grams: number;
  carbs: number;
  protein: number;
  fat: number;
  calories: number;
  category: FoodCategory;
}

export interface RemainingMacrosResult {
  consumed: MacroTargets;
  remaining: MacroTargets; // positive = still needed, negative = exceeded
  deficit: MacroTargets; // clamped >= 0
  progressPct: {
    calories: number;
    carbs: number;
    protein: number;
    fat: number;
  };
}

export interface RemainingRecommendationResult {
  isGoalAlreadyMet: boolean;
  items: MealFoodAllocation[];
  totals: MacroTargets;
  projectedRemaining: MacroTargets;
}

export function createFoodLogEntry(
  mealSlot: MealSlot,
  foodName: string,
  grams: number,
  per100g: { carbs: number; protein: number; fat: number },
  category: FoodCategory,
  idSuffix?: string,
): FoodLogEntry {
  const safeGrams = Math.max(1, Math.round(grams));
  const factor = safeGrams / 100;
  const carbs = Number((Math.max(0, per100g.carbs) * factor).toFixed(1));
  const protein = Number((Math.max(0, per100g.protein) * factor).toFixed(1));
  const fat = Number((Math.max(0, per100g.fat) * factor).toFixed(1));
  const calories = Math.round(carbs * 4 + protein * 4 + fat * 9);
  return {
    id: `log_${idSuffix ?? `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`}`,
    mealSlot,
    foodName: foodName.trim(),
    grams: safeGrams,
    carbs,
    protein,
    fat,
    calories,
    category,
  };
}

export function calculateTrackerTotals(entries: ReadonlyArray<FoodLogEntry>): MacroTargets {
  const rawC = entries.reduce((sum, item) => sum + item.carbs, 0);
  const rawP = entries.reduce((sum, item) => sum + item.protein, 0);
  const rawF = entries.reduce((sum, item) => sum + item.fat, 0);
  const carbs = Math.round(rawC);
  const protein = Math.round(rawP);
  const fat = Math.round(rawF);
  const calories = Math.round(rawC * 4 + rawP * 4 + rawF * 9);
  return { calories, carbs, protein, fat };
}

export function calculateRemainingMacros(
  targets: MacroTargets,
  consumed: MacroTargets,
): RemainingMacrosResult {
  const remaining: MacroTargets = {
    calories: targets.calories - consumed.calories,
    carbs: targets.carbs - consumed.carbs,
    protein: targets.protein - consumed.protein,
    fat: targets.fat - consumed.fat,
  };

  const deficit: MacroTargets = {
    calories: Math.max(0, remaining.calories),
    carbs: Math.max(0, remaining.carbs),
    protein: Math.max(0, remaining.protein),
    fat: Math.max(0, remaining.fat),
  };

  const pct = (got: number, goal: number) =>
    goal <= 0 ? 100 : Math.min(100, Math.max(0, Math.round((got / goal) * 100)));

  return {
    consumed,
    remaining,
    deficit,
    progressPct: {
      calories: pct(consumed.calories, targets.calories),
      carbs: pct(consumed.carbs, targets.carbs),
      protein: pct(consumed.protein, targets.protein),
      fat: pct(consumed.fat, targets.fat),
    },
  };
}

export function mapMealPlanToLogEntries(plan: MealPlanResult): FoodLogEntry[] {
  const totalMeals = plan.meals.length;
  const entries: FoodLogEntry[] = [];

  plan.meals.forEach((meal, idx) => {
    let slot: MealSlot = 'extra';
    if (totalMeals === 2) {
      slot = idx === 0 ? 'breakfast' : 'dinner';
    } else if (totalMeals === 3) {
      slot = idx === 0 ? 'breakfast' : idx === 1 ? 'lunch' : 'dinner';
    } else {
      slot = idx === 0 ? 'breakfast' : idx === 1 ? 'lunch' : idx === 2 ? 'dinner' : 'extra';
    }

    meal.items.forEach((alloc, itemIdx) => {
      if (alloc.grams <= 0) return;
      entries.push(
        createFoodLogEntry(
          slot,
          alloc.food.name,
          alloc.grams,
          alloc.food.per100g,
          alloc.food.category,
          `plan_${idx}_${itemIdx}_${alloc.food.id}`,
        ),
      );
    });
  });

  return entries;
}

/**
 * Recommends a practical combination of staple foods (e.g., 흰밥, 닭가슴살, 올리브유 / 아몬드)
 * sized to accurately fill remaining carb, protein, and fat deficits.
 */
export function recommendFoodsForRemaining(
  remaining: MacroTargets,
  preferredPool?: ReadonlyArray<FoodItem>,
): RemainingRecommendationResult {
  const remC = Math.max(0, remaining.carbs);
  const remP = Math.max(0, remaining.protein);
  const remF = Math.max(0, remaining.fat);
  const remKcal = Math.max(0, remaining.calories);

  if (remKcal < 35 || (remC < 5 && remP < 4 && remF < 2)) {
    return {
      isGoalAlreadyMet: true,
      items: [],
      totals: { calories: 0, carbs: 0, protein: 0, fat: 0 },
      projectedRemaining: { ...remaining },
    };
  }

  const byId = new Map(PRESET_FOODS.map((f) => [f.id, f]));
  const pool = preferredPool && preferredPool.length > 0 ? preferredPool : PRESET_FOODS;

  const pickBestForCategory = (cat: FoodCategory, fallbackId: string): FoodItem => {
    const inPool = pool.filter((f) => f.category === cat);
    if (inPool.length > 0) {
      const sorted = [...inPool].sort((a, b) => b.roleWeight - a.roleWeight);
      return sorted[0];
    }
    return byId.get(fallbackId)!;
  };

  const candidates: FoodItem[] = [];
  if (remC >= 5) {
    // Prefer white rice / sweet potato / staple carb
    const rice = pool.find((f) => f.id === 'c_white_rice' || f.id === 'c_brown_rice');
    candidates.push(rice ?? pickBestForCategory('carb', 'c_white_rice'));
  }
  if (remP >= 4) {
    const chicken = pool.find((f) => f.id === 'p_chicken_breast' || f.id === 'p_chicken_tender');
    candidates.push(chicken ?? pickBestForCategory('protein', 'p_chicken_breast'));
  }
  if (remF >= 2) {
    // Use olive oil for pure fat fill without adding unwanted carbs/protein, or almond if preferred
    const pureOil = pool.find((f) => f.id === 'f_olive_oil') ?? byId.get('f_olive_oil')!;
    const preferredFat = pool.find((f) => f.category === 'fat');
    candidates.push(
      preferredFat && (remC >= 8 || remP >= 8 || preferredFat.per100g.carbs < 5)
        ? preferredFat
        : pureOil,
    );
  }

  // Deduplicate candidates by id
  const uniqueCandidates = candidates.filter(
    (item, index, self) => self.findIndex((x) => x.id === item.id) === index,
  );

  const gramsMap = new Map<string, number>();
  for (const item of uniqueCandidates) {
    gramsMap.set(item.id, 0);
  }

  // Initial seed proportional to primary macro
  if (remC >= 5 && uniqueCandidates.some((c) => c.category === 'carb')) {
    const cFood = uniqueCandidates.find((c) => c.category === 'carb')!;
    const seed = Math.round(((remC / Math.max(1, cFood.per100g.carbs)) * 100) / cFood.stepG) * cFood.stepG;
    gramsMap.set(cFood.id, Math.max(0, seed));
  }
  if (remP >= 4 && uniqueCandidates.some((c) => c.category === 'protein')) {
    const pFood = uniqueCandidates.find((c) => c.category === 'protein')!;
    const seed = Math.round(((remP / Math.max(1, pFood.per100g.protein)) * 100) / pFood.stepG) * pFood.stepG;
    gramsMap.set(pFood.id, Math.max(0, seed));
  }
  if (remF >= 2 && uniqueCandidates.some((c) => c.category === 'fat')) {
    const fFood = uniqueCandidates.find((c) => c.category === 'fat')!;
    const seed = Math.round(((remF / Math.max(1, fFood.per100g.fat)) * 100) / fFood.stepG) * fFood.stepG;
    gramsMap.set(fFood.id, Math.max(0, seed));
  }

  const evalError = () => {
    let c = 0;
    let p = 0;
    let f = 0;
    for (const item of uniqueCandidates) {
      const g = gramsMap.get(item.id) ?? 0;
      c += (item.per100g.carbs * g) / 100;
      p += (item.per100g.protein * g) / 100;
      f += (item.per100g.fat * g) / 100;
    }
    return (
      Math.pow((c - remC) * 4, 2) +
      Math.pow((p - remP) * 4, 2) +
      Math.pow((f - remF) * 9, 2)
    );
  };

  for (let pass = 0; pass < 60; pass++) {
    let improved = false;
    for (const item of uniqueCandidates) {
      const curG = gramsMap.get(item.id) ?? 0;
      let bestG = curG;
      let bestErr = evalError();

      for (const mult of [5, 2, 1]) {
        const delta = item.stepG * mult;
        for (const dir of [-1, 1]) {
          const candG = Math.max(0, curG + dir * delta);
          if (candG === curG) continue;
          gramsMap.set(item.id, candG);
          const err = evalError();
          if (err < bestErr - 0.5) {
            bestErr = err;
            bestG = candG;
            improved = true;
          }
        }
      }
      gramsMap.set(item.id, bestG);
    }
    if (!improved) break;
  }

  const items: MealFoodAllocation[] = [];
  for (const item of uniqueCandidates) {
    const g = gramsMap.get(item.id) ?? 0;
    if (g <= 0) continue;
    const factor = g / 100;
    const carbs = Number((item.per100g.carbs * factor).toFixed(1));
    const protein = Number((item.per100g.protein * factor).toFixed(1));
    const fat = Number((item.per100g.fat * factor).toFixed(1));
    items.push({
      food: item,
      grams: g,
      carbs,
      protein,
      fat,
      calories: Math.round(carbs * 4 + protein * 4 + fat * 9),
    });
  }

  if (items.length === 0) {
    return {
      isGoalAlreadyMet: true,
      items: [],
      totals: { calories: 0, carbs: 0, protein: 0, fat: 0 },
      projectedRemaining: { ...remaining },
    };
  }

  const rawC = items.reduce((s, x) => s + x.carbs, 0);
  const rawP = items.reduce((s, x) => s + x.protein, 0);
  const rawF = items.reduce((s, x) => s + x.fat, 0);
  const totals: MacroTargets = {
    calories: Math.round(rawC * 4 + rawP * 4 + rawF * 9),
    carbs: Math.round(rawC),
    protein: Math.round(rawP),
    fat: Math.round(rawF),
  };

  return {
    isGoalAlreadyMet: false,
    items,
    totals,
    projectedRemaining: {
      calories: remaining.calories - totals.calories,
      carbs: remaining.carbs - totals.carbs,
      protein: remaining.protein - totals.protein,
      fat: remaining.fat - totals.fat,
    },
  };
}
