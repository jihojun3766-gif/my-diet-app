export type Gender = 'male' | 'female';

export type LifestyleKey = 'sedentary' | 'light' | 'active' | 'very_active';
export type FrequencyKey =
  | 'freq_0'
  | 'freq_1'
  | 'freq_2'
  | 'freq_3'
  | 'freq_4'
  | 'freq_5'
  | 'freq_6_7';
export type ExperienceKey =
  | 'exp_under_3m'
  | 'exp_3_6m'
  | 'exp_6_12m'
  | 'exp_1_2y'
  | 'exp_2_3y'
  | 'exp_3_5y'
  | 'exp_5y_plus';
export type FitnessLevelKey =
  | 'fit_low'
  | 'fit_walk'
  | 'fit_jog'
  | 'fit_run_3_5'
  | 'fit_run_10';
export type GoalKey = 'cut' | 'maintain' | 'bulk';

export interface UserMetricsInput {
  gender: Gender;
  age: number | string;
  heightCm: number | string;
  weightKg: number | string;
  lifestyle: LifestyleKey;
  frequency: FrequencyKey;
  experience: ExperienceKey;
  fitnessLevel: FitnessLevelKey;
  goal: GoalKey;
  goalDeltaOverride?: number;
}

export interface ValidationErrors {
  age?: string;
  heightCm?: string;
  weightKg?: string;
}

export interface MacroDetail {
  grams: number;
  calories: number;
  ratioPercent: number;
}

export interface FoodConversion {
  riceBowls: number; // 햇반 1개 210g 기준, 탄수화물 65g
  riceTotalGrams: number;
  chickenPacks: number; // 닭가슴살 1팩 100g 기준, 단백질 22.9g
  chickenTotalGrams: number;
  oliveOilTablespoons: number; // 올리브오일 1큰술 약 14g, 지방 13.5g
  oliveOilTotalGrams: number;
}

export interface NutritionCalculationResult {
  bmr: number;
  lifestyleMetabolism: number; // 생활 반영 대사량
  tdee: number; // 유지 칼로리
  targetCalories: number;
  goalDelta: number;
  multipliers: {
    lifestyle: number;
    frequency: number;
    experience: number;
    fitnessLevel: number;
    total: number;
  };
  macros: {
    carbs: MacroDetail;
    protein: MacroDetail;
    fat: MacroDetail;
  };
  foods: FoodConversion;
  isBelowBmr: boolean;
}

export const LIFESTYLE_OPTIONS: ReadonlyArray<{
  value: LifestyleKey;
  label: string;
  weight: number;
}> = [
  {
    value: 'sedentary',
    label: '하루 대부분 앉아서 생활 (사무직 · 학생 · 재택)',
    weight: 1.15,
  },
  {
    value: 'light',
    label: '앉아있는 편이나 출퇴근 · 집안일로 조금 움직임',
    weight: 1.22,
  },
  {
    value: 'active',
    label: '서서 일하거나 하루 종일 자주 걷는 편',
    weight: 1.32,
  },
  {
    value: 'very_active',
    label: '몸을 계속 쓰는 현장직 · 육체노동 위주',
    weight: 1.45,
  },
];

export const FREQUENCY_OPTIONS: ReadonlyArray<{
  value: FrequencyKey;
  label: string;
  bonus: number;
}> = [
  { value: 'freq_0', label: '안 함 (주 0회)', bonus: 0 },
  { value: 'freq_1', label: '주 1회', bonus: 0.04 },
  { value: 'freq_2', label: '주 2회', bonus: 0.08 },
  { value: 'freq_3', label: '주 3회', bonus: 0.12 },
  { value: 'freq_4', label: '주 4회', bonus: 0.16 },
  { value: 'freq_5', label: '주 5회', bonus: 0.2 },
  { value: 'freq_6_7', label: '주 6~7회 (매일)', bonus: 0.25 },
];

export const EXPERIENCE_OPTIONS: ReadonlyArray<{
  value: ExperienceKey;
  label: string;
  bonus: number;
}> = [
  { value: 'exp_under_3m', label: '3개월 미만 (입문)', bonus: 0 },
  { value: 'exp_3_6m', label: '3개월 ~ 6개월', bonus: 0.01 },
  { value: 'exp_6_12m', label: '6개월 ~ 1년', bonus: 0.02 },
  { value: 'exp_1_2y', label: '1년 ~ 2년', bonus: 0.03 },
  { value: 'exp_2_3y', label: '2년 ~ 3년', bonus: 0.04 },
  { value: 'exp_3_5y', label: '3년 ~ 5년', bonus: 0.05 },
  { value: 'exp_5y_plus', label: '5년 이상', bonus: 0.07 },
];

export const FITNESS_LEVEL_OPTIONS: ReadonlyArray<{
  value: FitnessLevelKey;
  label: string;
  bonus: number;
}> = [
  {
    value: 'fit_low',
    label: '조금만 걸어도 숨이 차고 쉽게 피곤함',
    bonus: 0,
  },
  {
    value: 'fit_walk',
    label: '30분 이상 걷기는 거뜬하지만 달리기는 힘듦',
    bonus: 0.01,
  },
  {
    value: 'fit_jog',
    label: '1~2km (10~15분) 정도 가볍게 뛸 수 있음',
    bonus: 0.02,
  },
  {
    value: 'fit_run_3_5',
    label: '3~5km (20~30분)를 멈추지 않고 달릴 수 있음',
    bonus: 0.04,
  },
  {
    value: 'fit_run_10',
    label: '5~10km 이상 꾸준히 달리거나 고강도 운동 가능',
    bonus: 0.06,
  },
];

export const GOAL_OPTIONS: ReadonlyArray<{
  value: GoalKey;
  label: string;
  deltaLabel: string;
  defaultDelta: number;
  presets: ReadonlyArray<number>;
}> = [
  {
    value: 'cut',
    label: '체중 감소',
    deltaLabel: '-500 kcal',
    defaultDelta: -500,
    presets: [-300, -500, -700],
  },
  {
    value: 'maintain',
    label: '체중 유지',
    deltaLabel: '0 kcal',
    defaultDelta: 0,
    presets: [0],
  },
  {
    value: 'bulk',
    label: '벌크업',
    deltaLabel: '+300 kcal',
    defaultDelta: 300,
    presets: [200, 300, 500],
  },
];

export const FOOD_CONSTANTS = {
  RICE_SERVING_GRAMS: 210,
  RICE_CARBS_PER_SERVING: 65,
  CHICKEN_SERVING_GRAMS: 100,
  CHICKEN_PROTEIN_PER_SERVING: 22.9,
  OLIVE_OIL_TBSP_GRAMS: 14,
  OLIVE_OIL_FAT_PER_TBSP: 13.5,
} as const;

export function validateUserMetrics(input: UserMetricsInput): ValidationErrors {
  const errors: ValidationErrors = {};

  const ageNum = typeof input.age === 'number' ? input.age : Number(input.age);
  if (input.age === '' || !Number.isFinite(ageNum) || ageNum < 10 || ageNum > 110) {
    errors.age = '나이는 10~110세 사이로 입력해 주세요.';
  }

  const heightNum = typeof input.heightCm === 'number' ? input.heightCm : Number(input.heightCm);
  if (input.heightCm === '' || !Number.isFinite(heightNum) || heightNum < 100 || heightNum > 240) {
    errors.heightCm = '키는 100~240cm 사이로 입력해 주세요.';
  }

  const weightNum = typeof input.weightKg === 'number' ? input.weightKg : Number(input.weightKg);
  if (input.weightKg === '' || !Number.isFinite(weightNum) || weightNum < 25 || weightNum > 250) {
    errors.weightKg = '체중은 25~250kg 사이로 입력해 주세요.';
  }

  return errors;
}

export function calculateFoodConversion(
  carbGrams: number,
  proteinGrams: number,
  fatGrams: number,
): FoodConversion {
  const riceBowls = Number((carbGrams / FOOD_CONSTANTS.RICE_CARBS_PER_SERVING).toFixed(1));
  const riceTotalGrams = Math.round(
    (carbGrams / FOOD_CONSTANTS.RICE_CARBS_PER_SERVING) * FOOD_CONSTANTS.RICE_SERVING_GRAMS,
  );

  const chickenPacks = Number(
    (proteinGrams / FOOD_CONSTANTS.CHICKEN_PROTEIN_PER_SERVING).toFixed(1),
  );
  const chickenTotalGrams = Math.round(
    (proteinGrams / FOOD_CONSTANTS.CHICKEN_PROTEIN_PER_SERVING) *
      FOOD_CONSTANTS.CHICKEN_SERVING_GRAMS,
  );

  const oliveOilTablespoons = Number(
    (fatGrams / FOOD_CONSTANTS.OLIVE_OIL_FAT_PER_TBSP).toFixed(1),
  );
  const oliveOilTotalGrams = Math.round(
    (fatGrams / FOOD_CONSTANTS.OLIVE_OIL_FAT_PER_TBSP) * FOOD_CONSTANTS.OLIVE_OIL_TBSP_GRAMS,
  );

  return {
    riceBowls,
    riceTotalGrams,
    chickenPacks,
    chickenTotalGrams,
    oliveOilTablespoons,
    oliveOilTotalGrams,
  };
}

export function calculateNutrition(input: UserMetricsInput): NutritionCalculationResult {
  const age = Number(input.age);
  const heightCm = Number(input.heightCm);
  const weightKg = Number(input.weightKg);

  // Step 1: Harris-Benedict Equation
  const rawBmr =
    input.gender === 'male'
      ? 66.47 + 13.75 * weightKg + 5 * heightCm - 6.76 * age
      : 655.1 + 9.56 * weightKg + 1.85 * heightCm - 4.68 * age;
  const bmr = Math.round(rawBmr);

  // Step 2: Lifestyle-adjusted metabolism (생활 반영 대사량)
  const lifestyleWeight =
    LIFESTYLE_OPTIONS.find((item) => item.value === input.lifestyle)?.weight ?? 1.15;
  const lifestyleMetabolism = Math.round(rawBmr * lifestyleWeight);

  // Step 3: Maintenance calories / TDEE (유지 칼로리)
  const frequencyBonus =
    FREQUENCY_OPTIONS.find((item) => item.value === input.frequency)?.bonus ?? 0;
  const experienceBonus =
    EXPERIENCE_OPTIONS.find((item) => item.value === input.experience)?.bonus ?? 0;
  const fitnessLevelBonus =
    FITNESS_LEVEL_OPTIONS.find((item) => item.value === input.fitnessLevel)?.bonus ?? 0;

  const totalMultiplier = Number(
    (lifestyleWeight + frequencyBonus + experienceBonus + fitnessLevelBonus).toFixed(2),
  );
  const tdee = Math.round(rawBmr * totalMultiplier);

  // Step 4: Goal target calories
  const goalOption = GOAL_OPTIONS.find((item) => item.value === input.goal);
  const goalDelta =
    input.goal === 'maintain'
      ? 0
      : (input.goalDeltaOverride ?? goalOption?.defaultDelta ?? 0);
  const targetCalories = Math.max(800, Math.round(tdee + goalDelta));

  // Step 5: 5:3:2 Macro split
  const carbCalories = Math.round(targetCalories * 0.5);
  const proteinCalories = Math.round(targetCalories * 0.3);
  const fatCalories = Math.round(targetCalories * 0.2);

  const carbGrams = Math.round((targetCalories * 0.5) / 4);
  const proteinGrams = Math.round((targetCalories * 0.3) / 4);
  const fatGrams = Math.round((targetCalories * 0.2) / 9);

  // Step 6: Real-food conversions
  const foods = calculateFoodConversion(carbGrams, proteinGrams, fatGrams);

  return {
    bmr,
    lifestyleMetabolism,
    tdee,
    targetCalories,
    goalDelta,
    multipliers: {
      lifestyle: lifestyleWeight,
      frequency: frequencyBonus,
      experience: experienceBonus,
      fitnessLevel: fitnessLevelBonus,
      total: totalMultiplier,
    },
    macros: {
      carbs: { grams: carbGrams, calories: carbCalories, ratioPercent: 50 },
      protein: { grams: proteinGrams, calories: proteinCalories, ratioPercent: 30 },
      fat: { grams: fatGrams, calories: fatCalories, ratioPercent: 20 },
    },
    foods,
    isBelowBmr: targetCalories < bmr,
  };
}
