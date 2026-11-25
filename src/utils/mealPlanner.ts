export type FoodCategory = 'protein' | 'carb' | 'fat';
export type FoodRole = 'staple' | 'moderate' | 'snack';

export interface NutritionPer100g {
  carbs: number;
  protein: number;
  fat: number;
  calories: number;
}

export interface FoodItem {
  id: string;
  name: string;
  category: FoodCategory;
  per100g: NutritionPer100g;
  stepG: number;
  role: FoodRole;
  roleWeight: number;
  softCapG: number;
  idealDailyG: number;
  isCustom?: boolean;
}

export interface MacroTargets {
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
}

export interface MealFoodAllocation {
  food: FoodItem;
  grams: number;
  carbs: number;
  protein: number;
  fat: number;
  calories: number;
}

export interface PlannedMeal {
  mealIndex: number;
  label: string;
  items: MealFoodAllocation[];
  totals: MacroTargets;
}

export interface MealPlanResult {
  meals: PlannedMeal[];
  totals: MacroTargets;
  targets: MacroTargets;
  dailyFoodSummary: MealFoodAllocation[];
  diffCalories: number;
}

function calcCalories(carbs: number, protein: number, fat: number): number {
  return Math.round(carbs * 4 + protein * 4 + fat * 9);
}

interface FoodSpec {
  id: string;
  name: string;
  category: FoodCategory;
  carbs: number;
  protein: number;
  fat: number;
  stepG?: number;
  role?: FoodRole;
  roleWeight?: number;
  softCapG?: number;
  idealDailyG?: number;
}

function food(spec: FoodSpec): FoodItem {
  const defaultRole: FoodRole = spec.role ?? 'moderate';
  return {
    id: spec.id,
    name: spec.name,
    category: spec.category,
    per100g: {
      carbs: spec.carbs,
      protein: spec.protein,
      fat: spec.fat,
      calories: calcCalories(spec.carbs, spec.protein, spec.fat),
    },
    stepG: spec.stepG ?? 10,
    role: defaultRole,
    roleWeight: spec.roleWeight ?? (defaultRole === 'staple' ? 3.0 : defaultRole === 'moderate' ? 1.4 : 0.5),
    softCapG: spec.softCapG ?? (defaultRole === 'staple' ? 950 : defaultRole === 'moderate' ? 280 : 180),
    idealDailyG: spec.idealDailyG ?? (defaultRole === 'staple' ? 350 : defaultRole === 'moderate' ? 150 : 100),
  };
}

export const PRESET_FOODS: ReadonlyArray<FoodItem> = [
  // 단백질 (기본 7종 + 인기 식품 4종)
  food({ id: 'p_chicken_breast', name: '닭가슴살', category: 'protein', carbs: 0, protein: 23, fat: 1.2, role: 'staple', roleWeight: 3.2, softCapG: 650, idealDailyG: 260 }),
  food({ id: 'p_egg', name: '계란', category: 'protein', carbs: 1.1, protein: 12.6, fat: 9.5, role: 'snack', roleWeight: 0.9, softCapG: 240, idealDailyG: 120 }),
  food({ id: 'p_mackerel', name: '고등어', category: 'protein', carbs: 0, protein: 19.3, fat: 13.9, role: 'moderate', roleWeight: 1.4, softCapG: 240, idealDailyG: 130 }),
  food({ id: 'p_chicken_tender', name: '닭안심', category: 'protein', carbs: 0, protein: 22.5, fat: 1.0, role: 'staple', roleWeight: 3.0, softCapG: 600, idealDailyG: 240 }),
  food({ id: 'p_beef_round', name: '우둔살', category: 'protein', carbs: 0, protein: 21.8, fat: 3.6, role: 'staple', roleWeight: 2.8, softCapG: 500, idealDailyG: 220 }),
  food({ id: 'p_pork_tenderloin', name: '돼지안심', category: 'protein', carbs: 0, protein: 21.2, fat: 3.5, role: 'staple', roleWeight: 2.6, softCapG: 500, idealDailyG: 220 }),
  food({ id: 'p_pork_hind', name: '돼지뒷다리살', category: 'protein', carbs: 0, protein: 20.5, fat: 4.5, role: 'staple', roleWeight: 2.5, softCapG: 500, idealDailyG: 220 }),
  food({ id: 'p_salmon', name: '연어', category: 'protein', carbs: 0, protein: 20.4, fat: 13.4, role: 'moderate', roleWeight: 1.3, softCapG: 220, idealDailyG: 120 }),
  food({ id: 'p_greek_yogurt', name: '그릭요거트', category: 'protein', carbs: 4.0, protein: 10.0, fat: 0.4, role: 'snack', roleWeight: 0.7, softCapG: 250, idealDailyG: 140 }),
  food({ id: 'p_tofu', name: '두부', category: 'protein', carbs: 2.0, protein: 9.3, fat: 4.8, role: 'moderate', roleWeight: 0.9, softCapG: 300, idealDailyG: 150 }),
  food({ id: 'p_tuna', name: '참치캔(살코기)', category: 'protein', carbs: 0, protein: 24.0, fat: 1.0, role: 'moderate', roleWeight: 1.3, softCapG: 220, idealDailyG: 120 }),

  // 탄수화물 (기본 8종 + 인기 식품 4종)
  food({ id: 'c_white_rice', name: '흰밥', category: 'carb', carbs: 31.0, protein: 2.7, fat: 0.3, role: 'staple', roleWeight: 3.6, softCapG: 950, idealDailyG: 420 }),
  food({ id: 'c_sweet_potato', name: '고구마', category: 'carb', carbs: 24.0, protein: 1.6, fat: 0.2, role: 'staple', roleWeight: 2.4, softCapG: 600, idealDailyG: 240 }),
  food({ id: 'c_potato', name: '감자', category: 'carb', carbs: 17.5, protein: 2.0, fat: 0.1, role: 'staple', roleWeight: 2.0, softCapG: 600, idealDailyG: 240 }),
  food({ id: 'c_corn', name: '옥수수', category: 'carb', carbs: 21.0, protein: 3.4, fat: 1.5, role: 'snack', roleWeight: 0.65, softCapG: 220, idealDailyG: 140 }),
  food({ id: 'c_brown_rice', name: '현미밥', category: 'carb', carbs: 32.5, protein: 3.0, fat: 1.0, role: 'staple', roleWeight: 3.5, softCapG: 950, idealDailyG: 400 }),
  food({ id: 'c_apple', name: '사과', category: 'carb', carbs: 14.0, protein: 0.3, fat: 0.2, role: 'snack', roleWeight: 0.45, softCapG: 240, idealDailyG: 150 }),
  food({ id: 'c_bagel', name: '베이글', category: 'carb', carbs: 52.0, protein: 10.0, fat: 1.5, role: 'moderate', roleWeight: 1.4, softCapG: 220, idealDailyG: 110 }),
  food({ id: 'c_banana', name: '바나나', category: 'carb', carbs: 23.0, protein: 1.1, fat: 0.3, role: 'snack', roleWeight: 0.45, softCapG: 180, idealDailyG: 110 }),
  food({ id: 'c_oatmeal', name: '오트밀', category: 'carb', carbs: 66.0, protein: 13.5, fat: 7.0, stepG: 5, role: 'moderate', roleWeight: 1.6, softCapG: 160, idealDailyG: 70 }),
  food({ id: 'c_kabocha', name: '단호박', category: 'carb', carbs: 12.0, protein: 1.3, fat: 0.2, role: 'moderate', roleWeight: 1.0, softCapG: 350, idealDailyG: 180 }),
  food({ id: 'c_bread', name: '식빵', category: 'carb', carbs: 49.0, protein: 9.0, fat: 3.2, role: 'moderate', roleWeight: 1.3, softCapG: 200, idealDailyG: 100 }),
  food({ id: 'c_pasta', name: '파스타면(삶은것)', category: 'carb', carbs: 30.5, protein: 5.5, fat: 0.9, role: 'staple', roleWeight: 3.3, softCapG: 850, idealDailyG: 350 }),

  // 지방 (기본 4종 + 인기 식품 4종)
  food({ id: 'f_avocado', name: '아보카도', category: 'fat', carbs: 8.5, protein: 2.0, fat: 14.7, stepG: 5, role: 'moderate', roleWeight: 1.2, softCapG: 150, idealDailyG: 80 }),
  food({ id: 'f_almond', name: '아몬드', category: 'fat', carbs: 21.5, protein: 21.2, fat: 49.9, stepG: 5, role: 'snack', roleWeight: 0.9, softCapG: 40, idealDailyG: 20 }),
  food({ id: 'f_peanut_butter', name: '땅콩버터', category: 'fat', carbs: 20.0, protein: 25.0, fat: 50.0, stepG: 5, role: 'snack', roleWeight: 0.9, softCapG: 40, idealDailyG: 20 }),
  food({ id: 'f_olive_oil', name: '올리브유', category: 'fat', carbs: 0, protein: 0, fat: 100.0, stepG: 1, role: 'staple', roleWeight: 1.6, softCapG: 30, idealDailyG: 14 }),
  food({ id: 'f_walnut', name: '호두', category: 'fat', carbs: 13.7, protein: 15.2, fat: 65.2, stepG: 5, role: 'snack', roleWeight: 0.8, softCapG: 35, idealDailyG: 20 }),
  food({ id: 'f_chia_seed', name: '치아씨드', category: 'fat', carbs: 42.0, protein: 16.5, fat: 30.7, stepG: 5, role: 'snack', roleWeight: 0.6, softCapG: 25, idealDailyG: 15 }),
  food({ id: 'f_cheese', name: '치즈(체다)', category: 'fat', carbs: 1.3, protein: 24.9, fat: 33.1, stepG: 5, role: 'snack', roleWeight: 0.7, softCapG: 45, idealDailyG: 20 }),
  food({ id: 'f_sesame_oil', name: '참기름', category: 'fat', carbs: 0, protein: 0, fat: 100.0, stepG: 1, role: 'staple', roleWeight: 1.3, softCapG: 20, idealDailyG: 10 }),
];

export const CUSTOM_FOOD_DICTIONARY: ReadonlyArray<{
  keywords: ReadonlyArray<string>;
  category: FoodCategory;
  carbs: number;
  protein: number;
  fat: number;
  stepG: number;
  role?: FoodRole;
}> = [
  { keywords: ['훈제오리', '오리고기'], category: 'protein', carbs: 1, protein: 18, fat: 22, stepG: 10, role: 'moderate' },
  { keywords: ['부채살', '소고기', '살치살', '등심', '안심스테이크', '차돌박이', '불고기', '소불고기'], category: 'protein', carbs: 2, protein: 20, fat: 10, stepG: 10, role: 'staple' },
  { keywords: ['삼겹살', '목살', '제육', '제육볶음', '보쌈', '족발', '수육'], category: 'protein', carbs: 3, protein: 17, fat: 22, stepG: 10, role: 'moderate' },
  { keywords: ['새우', '오징어', '흰살생선', '틸라피아', '광어', '생선구이', '회'], category: 'protein', carbs: 1, protein: 20, fat: 2, stepG: 10, role: 'staple' },
  { keywords: ['닭다리살', '닭봉', '닭갈비', '치킨'], category: 'protein', carbs: 4, protein: 19, fat: 9, stepG: 10, role: 'moderate' },
  { keywords: ['코티지치즈', '리코타치즈'], category: 'protein', carbs: 3.5, protein: 11, fat: 4.5, stepG: 10, role: 'snack' },
  { keywords: ['단백질바', '프로틴바'], category: 'protein', carbs: 35, protein: 32, fat: 12, stepG: 5, role: 'snack' },
  { keywords: ['우유', '두유', '요거트'], category: 'protein', carbs: 5, protein: 3.5, fat: 3.2, stepG: 10, role: 'snack' },
  { keywords: ['블루베리', '딸기', '키위', '토마토', '방울토마토', '오렌지', '귤', '포도', '수박', '복숭아', '망고', '파인애플', '참외', '자두'], category: 'carb', carbs: 11, protein: 0.9, fat: 0.3, stepG: 10, role: 'snack' },
  { keywords: ['통밀빵', '호밀빵', '모닝빵', '바게트', '소금빵', '크루아상', '샌드위치', '토스트'], category: 'carb', carbs: 46, protein: 9.5, fat: 4.5, stepG: 10, role: 'moderate' },
  { keywords: ['잡곡밥', '보리밥', '흑미밥', '밥'], category: 'carb', carbs: 32, protein: 3, fat: 0.8, stepG: 10, role: 'staple' },
  { keywords: ['김밥', '유부초밥', '초밥'], category: 'carb', carbs: 28, protein: 7, fat: 4, stepG: 10, role: 'moderate' },
  { keywords: ['떡', '가래떡', '백설기', '인절미', '현미떡'], category: 'carb', carbs: 50, protein: 4.5, fat: 0.8, stepG: 10, role: 'moderate' },
  { keywords: ['쌀국수', '우동면', '소바', '국수', '라면', '파스타'], category: 'carb', carbs: 28, protein: 4, fat: 1, stepG: 10, role: 'staple' },
  { keywords: ['고구마말랭이', '건포도'], category: 'carb', carbs: 72, protein: 3.5, fat: 0.6, stepG: 5, role: 'snack' },
  { keywords: ['그래놀라', '시리얼', '콘푸라이트'], category: 'carb', carbs: 72, protein: 8.5, fat: 8.0, stepG: 5, role: 'snack' },
  { keywords: ['캐슈넛', '마카다미아', '피스타치오', '견과류'], category: 'fat', carbs: 22, protein: 16, fat: 48, stepG: 5, role: 'snack' },
  { keywords: ['들기름', '아보카도오일', '코코넛오일', 'mct오일'], category: 'fat', carbs: 0, protein: 0, fat: 100, stepG: 1, role: 'staple' },
  { keywords: ['버터', '기버터'], category: 'fat', carbs: 0.1, protein: 0.9, fat: 81, stepG: 1, role: 'moderate' },
  { keywords: ['마요네즈', '크림치즈'], category: 'fat', carbs: 2, protein: 3, fat: 60, stepG: 5, role: 'snack' },
  { keywords: ['다크초콜릿', '카카오닙스'], category: 'fat', carbs: 40, protein: 8, fat: 42, stepG: 5, role: 'snack' },
];

export const CATEGORY_DEFAULT_MACROS: Record<FoodCategory, NutritionPer100g> = {
  protein: { carbs: 1, protein: 21, fat: 4, calories: calcCalories(1, 21, 4) },
  carb: { carbs: 28, protein: 3, fat: 1, calories: calcCalories(28, 3, 1) },
  fat: { carbs: 10, protein: 12, fat: 48, calories: calcCalories(10, 12, 48) },
};

export const NEUTRAL_CUSTOM_DEFAULT_MACROS: NutritionPer100g = {
  carbs: 18,
  protein: 14,
  fat: 5,
  calories: calcCalories(18, 14, 5),
};

export function inferFoodCategory(
  carbsPer100g: number,
  proteinPer100g: number,
  fatPer100g: number,
): FoodCategory {
  const cKcal = Math.max(0, carbsPer100g) * 4;
  const pKcal = Math.max(0, proteinPer100g) * 4;
  const fKcal = Math.max(0, fatPer100g) * 9;
  if (pKcal >= cKcal && pKcal >= fKcal) return 'protein';
  if (fKcal > cKcal && fKcal > pKcal) return 'fat';
  return 'carb';
}

export function lookupCustomFoodNutrition(
  rawName: string,
  fallbackCategory?: FoodCategory,
): { category: FoodCategory; per100g: NutritionPer100g; matched: boolean; stepG: number } {
  const normalized = rawName.replace(/\s+/g, '').toLowerCase();
  if (normalized) {
    const presetMatch = PRESET_FOODS.find(
      (f) => f.name.replace(/\s+/g, '').toLowerCase() === normalized,
    );
    if (presetMatch) {
      return {
        category: presetMatch.category,
        per100g: { ...presetMatch.per100g },
        matched: true,
        stepG: presetMatch.stepG,
      };
    }
    const dictMatch = CUSTOM_FOOD_DICTIONARY.find((entry) =>
      entry.keywords.some((kw) => normalized.includes(kw.toLowerCase())),
    );
    if (dictMatch) {
      return {
        category: dictMatch.category,
        per100g: {
          carbs: dictMatch.carbs,
          protein: dictMatch.protein,
          fat: dictMatch.fat,
          calories: calcCalories(dictMatch.carbs, dictMatch.protein, dictMatch.fat),
        },
        matched: true,
        stepG: dictMatch.stepG,
      };
    }
  }
  if (fallbackCategory) {
    const def = CATEGORY_DEFAULT_MACROS[fallbackCategory];
    return {
      category: fallbackCategory,
      per100g: { ...def },
      matched: false,
      stepG: fallbackCategory === 'fat' ? 5 : 10,
    };
  }
  return {
    category: inferFoodCategory(
      NEUTRAL_CUSTOM_DEFAULT_MACROS.carbs,
      NEUTRAL_CUSTOM_DEFAULT_MACROS.protein,
      NEUTRAL_CUSTOM_DEFAULT_MACROS.fat,
    ),
    per100g: { ...NEUTRAL_CUSTOM_DEFAULT_MACROS },
    matched: false,
    stepG: 10,
  };
}

export function createCustomFoodItem(
  name: string,
  categoryOrNull: FoodCategory | null,
  carbsPer100g: number,
  proteinPer100g: number,
  fatPer100g: number,
  idSuffix?: string,
): FoodItem {
  const safeC = Math.max(0, Number(carbsPer100g) || 0);
  const safeP = Math.max(0, Number(proteinPer100g) || 0);
  const safeF = Math.max(0, Number(fatPer100g) || 0);

  const normalized = name.replace(/\s+/g, '').toLowerCase();
  const dictMatch = CUSTOM_FOOD_DICTIONARY.find((entry) =>
    entry.keywords.some((kw) => normalized.includes(kw.toLowerCase())),
  );

  const resolvedCategory: FoodCategory =
    categoryOrNull ?? dictMatch?.category ?? inferFoodCategory(safeC, safeP, safeF);

  const stepG =
    safeF >= 70 && safeC < 5 && safeP < 5 ? 1 : resolvedCategory === 'fat' ? 5 : 10;

  const role: FoodRole = dictMatch?.role ?? 'moderate';

  return {
    id: `custom_${idSuffix ?? `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`}`,
    name: name.trim(),
    category: resolvedCategory,
    per100g: {
      carbs: Number(safeC.toFixed(1)),
      protein: Number(safeP.toFixed(1)),
      fat: Number(safeF.toFixed(1)),
      calories: calcCalories(safeC, safeP, safeF),
    },
    stepG,
    role,
    roleWeight: role === 'staple' ? 2.5 : role === 'moderate' ? 1.4 : 0.7,
    softCapG: resolvedCategory === 'fat' ? (stepG === 1 ? 30 : 80) : role === 'snack' ? 200 : 400,
    idealDailyG:
      resolvedCategory === 'fat' ? (stepG === 1 ? 15 : 30) : role === 'snack' ? 120 : 180,
    isCustom: true,
  };
}

export const MEAL_COUNT_OPTIONS = [2, 3, 4, 5, 6] as const;

function getMealLabels(mealCount: number): string[] {
  if (mealCount === 2) return ['1끼 (아침)', '2끼 (저녁)'];
  if (mealCount === 3) return ['아침', '점심', '저녁'];
  return Array.from({ length: mealCount }, (_, idx) =>
    idx === 0 ? '1끼 (아침)' : `${idx + 1}끼`,
  );
}

function getAllMealIndices(mealCount: number): number[] {
  return Array.from({ length: mealCount }, (_, i) => i);
}

function roundToStep(value: number, step: number): number {
  if (value <= 0) return 0;
  return Math.max(step, Math.round(value / step) * step);
}

function computeAllocation(foodItem: FoodItem, grams: number): MealFoodAllocation {
  const factor = grams / 100;
  const carbs = Number((foodItem.per100g.carbs * factor).toFixed(1));
  const protein = Number((foodItem.per100g.protein * factor).toFixed(1));
  const fat = Number((foodItem.per100g.fat * factor).toFixed(1));
  const calories = Math.round(carbs * 4 + protein * 4 + fat * 9);
  return { food: foodItem, grams, carbs, protein, fat, calories };
}

/**
 * Solves realistic daily gram totals per selected food:
 * - Staple foods (흰밥, 현미밥, 파스타면, 닭가슴살, 우둔살 등) carry higher share.
 * - Fruits & snack foods (바나나, 사과, 옥수수, 그릭요거트, 견과류 등) stay within sensible daily portions
 *   when paired with staples, while remaining flexible if chosen alone.
 * - Foods can naturally mix across 2~6 meals without restricting each meal to 1 food per category.
 */
export function generateMealPlan(
  targets: MacroTargets,
  selectedFoods: ReadonlyArray<FoodItem>,
  mealCount = 3,
): MealPlanResult {
  const safeMeals = Math.min(6, Math.max(2, Math.round(mealCount)));
  const mealLabels = getMealLabels(safeMeals);

  const byCategory: Record<FoodCategory, FoodItem[]> = {
    carb: selectedFoods.filter((f) => f.category === 'carb'),
    protein: selectedFoods.filter((f) => f.category === 'protein'),
    fat: selectedFoods.filter((f) => f.category === 'fat'),
  };

  const activeCategories = (['carb', 'protein', 'fat'] as const).filter(
    (cat) => byCategory[cat].length > 0,
  );

  if (activeCategories.length === 0) {
    return {
      meals: mealLabels.map((label, idx) => ({
        mealIndex: idx,
        label,
        items: [],
        totals: { calories: 0, carbs: 0, protein: 0, fat: 0 },
      })),
      totals: { calories: 0, carbs: 0, protein: 0, fat: 0 },
      targets,
      dailyFoodSummary: [],
      diffCalories: -targets.calories,
    };
  }

  const RICE_IDS = new Set(['c_white_rice', 'c_brown_rice']);
  const hasRice = byCategory.carb.some((f) => RICE_IDS.has(f.id));

  const getEffectiveWeight = (item: FoodItem): number => {
    if (item.category === 'carb' && hasRice) {
      if (RICE_IDS.has(item.id)) return 8.5;
      if (item.id === 'c_pasta') return 1.1;
      if (item.role === 'snack') return 0.25;
      return 0.45;
    }
    return item.roleWeight;
  };

  const getEffectiveSoftCap = (item: FoodItem): number => {
    if (item.category === 'carb' && hasRice) {
      if (RICE_IDS.has(item.id)) return 1400;
      if (item.id === 'c_sweet_potato') return 130;
      if (item.id === 'c_potato' || item.id === 'c_kabocha') return 150;
      if (item.id === 'c_bagel') return 100;
      if (item.id === 'c_bread') return 80;
      if (item.id === 'c_oatmeal') return 50;
      if (item.id === 'c_banana') return 110;
      if (item.id === 'c_apple') return 140;
      if (item.id === 'c_corn') return 120;
      if (item.id === 'c_pasta') return 220;
      return Math.min(item.softCapG, 130);
    }
    return item.softCapG;
  };

  const dailyGramsMap = new Map<string, number>();

  // Step 1: Role-weighted proportional seed
  for (const cat of activeCategories) {
    const list = byCategory[cat];
    const totalWeight = list.reduce((s, item) => s + getEffectiveWeight(item), 0);
    const primaryKey = cat === 'carb' ? 'carbs' : cat === 'protein' ? 'protein' : 'fat';
    const targetMacro =
      cat === 'carb' ? targets.carbs : cat === 'protein' ? targets.protein : targets.fat * 0.55;

    for (const item of list) {
      const w = getEffectiveWeight(item);
      const cap = getEffectiveSoftCap(item);
      const shareRatio = w / Math.max(0.1, totalWeight);
      const itemMacroTarget = targetMacro * shareRatio;
      const density = Math.max(1, item.per100g[primaryKey]);
      const estGrams = (itemMacroTarget / density) * 100;
      const cappedSeed = list.length > 1 ? Math.min(cap, estGrams) : estGrams;
      dailyGramsMap.set(item.id, Math.max(item.stepG, roundToStep(cappedSeed, item.stepG)));
    }
  }

  const minGramsFor = (item: FoodItem) => {
    if (item.category === 'fat') return item.stepG === 1 ? 3 : item.stepG;
    if (item.category === 'carb' && hasRice && !RICE_IDS.has(item.id)) {
      return Math.max(item.stepG, 40);
    }
    if (item.role === 'snack') return Math.max(item.stepG, 50);
    return Math.max(item.stepG, 30);
  };

  for (const item of selectedFoods) {
    const minG = minGramsFor(item);
    if ((dailyGramsMap.get(item.id) ?? 0) < minG) {
      dailyGramsMap.set(item.id, minG);
    }
  }

  // Step 2: Role-aware constrained coordinate descent
  const evalState = () => {
    let c = 0;
    let p = 0;
    let f = 0;
    const catTotals: Record<FoodCategory, number> = { carb: 0, protein: 0, fat: 0 };

    for (const item of selectedFoods) {
      const g = dailyGramsMap.get(item.id) ?? 0;
      c += (item.per100g.carbs * g) / 100;
      p += (item.per100g.protein * g) / 100;
      f += (item.per100g.fat * g) / 100;
      catTotals[item.category] += g;
    }

    let rolePenalty = 0;
    for (const cat of activeCategories) {
      const list = byCategory[cat];
      const totalWeight = list.reduce((s, x) => s + getEffectiveWeight(x), 0);
      const hasHigherRole = list.some((x) => x.role !== 'snack' || RICE_IDS.has(x.id));

      for (const item of list) {
        const g = dailyGramsMap.get(item.id) ?? 0;
        const cap = getEffectiveSoftCap(item);
        const w = getEffectiveWeight(item);

        if (g > cap) {
          const excess = g - cap;
          const capStrength =
            (item.category === 'carb' && hasRice && !RICE_IDS.has(item.id)) ||
            (item.role === 'snack' && hasHigherRole)
              ? 2.4
              : 0.35;
          rolePenalty += capStrength * excess * excess;
        }

        if (list.length > 1) {
          const desiredShareG = (catTotals[cat] * w) / Math.max(0.1, totalWeight);
          const diff = g - desiredShareG;
          const weightStrength =
            item.category === 'carb' && hasRice && !RICE_IDS.has(item.id)
              ? 0.25
              : item.role === 'snack'
                ? 0.14
                : 0.05;
          rolePenalty += weightStrength * diff * diff;
        }
      }
    }

    const macroError =
      Math.pow((c - targets.carbs) * 4, 2) +
      Math.pow((p - targets.protein) * 4, 2) +
      Math.pow((f - targets.fat) * 9, 2);
    return macroError + rolePenalty;
  };

  for (let pass = 0; pass < 90; pass++) {
    let improved = false;
    for (const item of selectedFoods) {
      const curG = dailyGramsMap.get(item.id) ?? item.stepG;
      const minG = minGramsFor(item);
      let bestG = curG;
      let bestScore = evalState();

      for (const mult of [8, 3, 1]) {
        const step = item.stepG * mult;
        for (const dir of [-1, 1]) {
          const candG = curG + dir * step;
          if (candG < minG) continue;
          dailyGramsMap.set(item.id, candG);
          const candScore = evalState();
          if (candScore < bestScore - 0.5) {
            bestScore = candScore;
            bestG = candG;
            improved = true;
          }
        }
      }
      dailyGramsMap.set(item.id, bestG);
    }
    if (!improved) break;
  }

  // Step 3: Full-meal distribution across all 2~6 meals (no snack-only slots)
  // When white/brown rice is present alongside non-rice carbs (sweet potato, potato, bagel, banana, etc.),
  // non-rice carbs go predominantly into Meal 1 (아침, meal 0), while rice anchors every remaining meal (2끼~N끼).
  const mealBuckets: Array<Map<string, number>> = Array.from(
    { length: safeMeals },
    () => new Map<string, number>(),
  );
  const mealCalorieLoad = new Array(safeMeals).fill(0);
  const allMealIndices = getAllMealIndices(safeMeals);

  const addPortion = (mealIdx: number, item: FoodItem, grams: number) => {
    if (grams <= 0) return;
    mealBuckets[mealIdx].set(item.id, (mealBuckets[mealIdx].get(item.id) ?? 0) + grams);
    mealCalorieLoad[mealIdx] += (item.per100g.calories * grams) / 100;
  };

  const splitAcrossMeals = (item: FoodItem, totalG: number, targetMealIndices: number[]) => {
    const count = targetMealIndices.length;
    if (count === 0 || totalG <= 0) return;
    if (count === 1) {
      addPortion(targetMealIndices[0], item, totalG);
      return;
    }

    const orderedMeals = [...targetMealIndices].sort(
      (a, b) => mealCalorieLoad[a] - mealCalorieLoad[b],
    );

    let remaining = totalG;
    for (let i = 0; i < count; i++) {
      const mIdx = orderedMeals[i];
      const share =
        i === count - 1
          ? remaining
          : roundToStep(remaining / (count - i), item.stepG);
      const clamped = Math.max(0, Math.min(remaining, share));
      if (clamped > 0) {
        addPortion(mIdx, item, clamped);
        remaining -= clamped;
      }
    }
    if (remaining > 0) {
      addPortion(orderedMeals[0], item, remaining);
    }
  };

  const nonRiceCarbs = byCategory.carb.filter((f) => !RICE_IDS.has(f.id));
  const breakfastHasNonRiceCarbs = hasRice && nonRiceCarbs.length > 0;

  // Place carbohydrates first so breakfast non-rice carbs & remaining-meal rice establish balanced meal structure
  if (hasRice) {
    // Non-rice carbs go into Meal 1 (아침), except pasta which goes to another meal
    nonRiceCarbs.forEach((item) => {
      const g = dailyGramsMap.get(item.id) ?? 0;
      if (g <= 0) return;
      if (item.id === 'c_pasta' && allMealIndices.length >= 2) {
        const nonBreakfastMeals = allMealIndices.filter((m) => m !== 0);
        const lightest = [...nonBreakfastMeals].sort(
          (a, b) => mealCalorieLoad[a] - mealCalorieLoad[b],
        )[0];
        addPortion(lightest, item, g);
      } else {
        addPortion(0, item, g); // 1끼 (아침)
      }
    });

    // Split white/brown rice across non-breakfast meals (2끼..N끼), NEVER mixing 흰밥 and 현미밥 in the same meal
    const riceItems = byCategory.carb.filter((f) => RICE_IDS.has(f.id));
    const candidateRiceTargets = breakfastHasNonRiceCarbs
      ? allMealIndices.filter((m) => m !== 0)
      : allMealIndices;
    const effectiveRiceTargets =
      candidateRiceTargets.length >= riceItems.length ? candidateRiceTargets : allMealIndices;

    if (riceItems.length === 1) {
      const item = riceItems[0];
      const g = dailyGramsMap.get(item.id) ?? 0;
      if (g > 0) splitAcrossMeals(item, g, effectiveRiceTargets);
    } else if (riceItems.length > 1) {
      // Assign each target meal to exactly one rice item so 흰밥 and 현미밥 stay separated
      const riceBuckets = new Map<string, number[]>(riceItems.map((r) => [r.id, []]));
      const activeRice = riceItems.filter((r) => (dailyGramsMap.get(r.id) ?? 0) > 0);
      const targetsForAssign =
        breakfastHasNonRiceCarbs && effectiveRiceTargets.length === allMealIndices.length
          ? [...effectiveRiceTargets.filter((m) => m !== 0), 0]
          : effectiveRiceTargets;

      targetsForAssign.forEach((mealIdx) => {
        if (activeRice.length === 0) return;
        // Prefer assigning to the rice item with the fewest meals yet (and highest grams/meal)
        const chosen = [...activeRice].sort((a, b) => {
          const cntA = riceBuckets.get(a.id)!.length;
          const cntB = riceBuckets.get(b.id)!.length;
          if (cntA === 0 && cntB > 0) return -1;
          if (cntB === 0 && cntA > 0) return 1;
          const perMealA = (dailyGramsMap.get(a.id) ?? 0) / Math.max(1, cntA);
          const perMealB = (dailyGramsMap.get(b.id) ?? 0) / Math.max(1, cntB);
          return perMealB - perMealA;
        })[0];
        riceBuckets.get(chosen.id)!.push(mealIdx);
      });

      activeRice.forEach((item) => {
        const g = dailyGramsMap.get(item.id) ?? 0;
        const assignedMeals = riceBuckets.get(item.id) ?? [];
        if (g > 0 && assignedMeals.length > 0) {
          splitAcrossMeals(item, g, assignedMeals);
        }
      });
    }
  }

  // Place remaining foods (all carbs when no rice selected, plus all protein & fat foods) evenly across ALL meals
  const remainingFoods = selectedFoods
    .filter((f) => !(hasRice && f.category === 'carb'))
    .sort((a, b) => {
      const rank = { staple: 0, moderate: 1, snack: 2 };
      if (rank[a.role] !== rank[b.role]) return rank[a.role] - rank[b.role];
      return (dailyGramsMap.get(b.id) ?? 0) - (dailyGramsMap.get(a.id) ?? 0);
    });

  for (const item of remainingFoods) {
    const totalG = dailyGramsMap.get(item.id) ?? 0;
    if (totalG <= 0) continue;

    if (item.role === 'staple') {
      const minPerMeal = item.category === 'fat' ? item.stepG * 3 : Math.max(40, item.stepG * 4);
      const maxAffordableSplits = Math.max(1, Math.floor(totalG / minPerMeal));
      const splitCount = Math.min(allMealIndices.length, maxAffordableSplits);
      const chosenMeals = [...allMealIndices]
        .sort((a, b) => mealCalorieLoad[a] - mealCalorieLoad[b])
        .slice(0, splitCount);
      splitAcrossMeals(item, totalG, chosenMeals);
    } else if (item.role === 'moderate') {
      const minPerMeal = item.category === 'fat' ? item.stepG * 4 : 80;
      const maxAffordableSplits = Math.max(1, Math.floor(totalG / minPerMeal));
      const splitCount = Math.min(allMealIndices.length, maxAffordableSplits);
      const chosenMeals = [...allMealIndices]
        .sort((a, b) => mealCalorieLoad[a] - mealCalorieLoad[b])
        .slice(0, splitCount);
      splitAcrossMeals(item, totalG, chosenMeals);
    } else {
      const minPerMeal = item.category === 'fat' ? item.stepG * 3 : 80;
      const maxAffordableSplits = Math.max(1, Math.floor(totalG / minPerMeal));
      const splitCount = Math.min(2, allMealIndices.length, maxAffordableSplits);
      const chosenMeals = [...allMealIndices]
        .sort((a, b) => mealCalorieLoad[a] - mealCalorieLoad[b])
        .slice(0, splitCount);
      splitAcrossMeals(item, totalG, chosenMeals);
    }
  }

  const orderedCategories: FoodCategory[] = ['carb', 'protein', 'fat'];
  const meals: PlannedMeal[] = mealBuckets.map((bucket, mIdx) => {
    const items: MealFoodAllocation[] = [];
    for (const cat of orderedCategories) {
      for (const foodItem of byCategory[cat]) {
        const g = bucket.get(foodItem.id) ?? 0;
        if (g > 0) {
          items.push(computeAllocation(foodItem, g));
        }
      }
    }
    const c = Number(items.reduce((s, x) => s + x.carbs, 0).toFixed(1));
    const p = Number(items.reduce((s, x) => s + x.protein, 0).toFixed(1));
    const f = Number(items.reduce((s, x) => s + x.fat, 0).toFixed(1));
    const kcal = Math.round(c * 4 + p * 4 + f * 9);
    return {
      mealIndex: mIdx,
      label: mealLabels[mIdx],
      items,
      totals: {
        calories: kcal,
        carbs: Math.round(c),
        protein: Math.round(p),
        fat: Math.round(f),
      },
    };
  });

  const dailyFoodSummary: MealFoodAllocation[] = selectedFoods
    .map((fItem) => computeAllocation(fItem, dailyGramsMap.get(fItem.id) ?? 0))
    .filter((alloc) => alloc.grams > 0);

  const totalCarbs = Math.round(dailyFoodSummary.reduce((s, x) => s + x.carbs, 0));
  const totalProtein = Math.round(dailyFoodSummary.reduce((s, x) => s + x.protein, 0));
  const totalFat = Math.round(dailyFoodSummary.reduce((s, x) => s + x.fat, 0));
  const totalCalories = Math.round(totalCarbs * 4 + totalProtein * 4 + totalFat * 9);

  return {
    meals,
    totals: {
      calories: totalCalories,
      carbs: totalCarbs,
      protein: totalProtein,
      fat: totalFat,
    },
    targets,
    dailyFoodSummary,
    diffCalories: totalCalories - targets.calories,
  };
}
