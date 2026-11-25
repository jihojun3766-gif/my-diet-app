import { calculateNutrition, type GoalKey, type UserMetricsInput } from './nutrition';

export type PlanGoalType = 'diet' | 'maintain' | 'bulk';
export type RealismStatus = 'good' | 'fast' | 'too_fast';

export interface DurationPreset {
  weeks: number;
  label: string;
  paceText: string;
  tag: string;
  isRecommended: boolean;
  isRealistic: boolean;
}

export interface WeightPlanMilestone {
  label: string;
  week: number;
  weightKg: number;
}

export interface SimpleWeightPlanResult {
  currentWeightKg: number;
  targetWeightKg: number;
  diffKg: number;
  planType: PlanGoalType;
  planBadge: string;
  planHeadline: string;
  calculatorGoal: GoalKey;
  durationWeeks: number;
  durationLabel: string;
  weeklyChangeKg: number;
  currentBmr: number;
  maintenanceCalories: number;
  dailyCalories: number;
  actualDailyDelta: number;
  macros: {
    carbs: number;
    protein: number;
    fat: number;
  };
  realismStatus: RealismStatus;
  realismMessage: string;
  minRecommendedWeeks: number;
  actionGuides: string[];
  milestones: WeightPlanMilestone[];
}

const KCAL_PER_KG = 7700;

function round1(val: number): number {
  return Number(val.toFixed(1));
}

function calcMacros532(calories: number) {
  return {
    carbs: Math.round((calories * 0.5) / 4),
    protein: Math.round((calories * 0.3) / 4),
    fat: Math.round((calories * 0.2) / 9),
  };
}

export function formatWeeksLabel(weeks: number): string {
  const safeWeeks = Math.max(1, Math.round(weeks));
  if (safeWeeks === 2) return '2주';
  if (safeWeeks === 4) return '4주 (약 1개월)';
  if (safeWeeks === 6) return '6주 (약 1개월 반)';
  if (safeWeeks === 8) return '8주 (약 2개월)';
  if (safeWeeks === 12) return '12주 (약 3개월)';
  if (safeWeeks % 4 === 0) return `${safeWeeks}주 (약 ${safeWeeks / 4}개월)`;
  const months = round1(safeWeeks / 4.3);
  return months >= 1 ? `${safeWeeks}주 (약 ${months}개월)` : `${safeWeeks}주`;
}

export function getDefaultTargetWeight(currentWeightKg: number, goal: GoalKey): number {
  const safeCurrent = Number.isFinite(currentWeightKg) && currentWeightKg >= 25 ? currentWeightKg : 72;
  if (goal === 'cut') {
    return Math.max(35, round1(safeCurrent - 4));
  }
  if (goal === 'bulk') {
    return Math.min(200, round1(safeCurrent + 4));
  }
  return round1(safeCurrent);
}

export function detectPlanGoal(currentWeightKg: number, targetWeightKg: number): PlanGoalType {
  const diff = round1(targetWeightKg - currentWeightKg);
  if (diff <= -0.3) return 'diet';
  if (diff >= 0.3) return 'bulk';
  return 'maintain';
}

export function getRealisticDurationPresets(
  currentWeightKg: number,
  targetWeightKg: number,
): DurationPreset[] {
  const planType = detectPlanGoal(currentWeightKg, targetWeightKg);
  const absDiff = Math.abs(round1(targetWeightKg - currentWeightKg));

  if (planType === 'maintain') {
    return [4, 8, 12].map((weeks) => ({
      weeks,
      label: formatWeeksLabel(weeks),
      paceText: '현재 체중 그대로 유지',
      tag: weeks === 8 ? '추천' : '유지 기간',
      isRecommended: weeks === 8,
      isRealistic: true,
    }));
  }

  const targetRates =
    planType === 'diet'
      ? [0.7, 0.5, 0.35, 0.25]
      : [0.4, 0.28, 0.2, 0.15];

  const weekSet = new Set<number>();
  targetRates.forEach((rate) => {
    const rawWeeks = Math.max(2, Math.round(absDiff / rate));
    weekSet.add(Math.min(104, rawWeeks));
  });

  // Ensure 4 distinct choices when diffKg is small
  const fallbackSteps = [2, 4, 6, 8, 12, 16];
  for (const w of fallbackSteps) {
    if (weekSet.size >= 4) break;
    weekSet.add(w);
  }

  const sortedWeeks = Array.from(weekSet)
    .sort((a, b) => a - b)
    .slice(0, 4);

  const idealRate = planType === 'diet' ? 0.5 : 0.28;
  let bestIdx = 0;
  let bestDist = Infinity;
  sortedWeeks.forEach((w, idx) => {
    const dist = Math.abs(absDiff / w - idealRate);
    if (dist < bestDist) {
      bestDist = dist;
      bestIdx = idx;
    }
  });

  return sortedWeeks.map((weeks, idx) => {
    const weekly = Number((absDiff / weeks).toFixed(2));
    const isRecommended = idx === bestIdx;

    if (planType === 'diet') {
      const isRealistic = weekly <= 0.9;
      let tag = '여유롭게';
      if (!isRealistic) tag = '너무 빠름';
      else if (isRecommended) tag = '추천 · 무리 없음';
      else if (weekly > 0.6) tag = '조금 빠름';
      else if (weekly < 0.32) tag = '천천히 편하게';

      return {
        weeks,
        label: formatWeeksLabel(weeks),
        paceText: `주당 약 ${weekly}kg 감량`,
        tag,
        isRecommended,
        isRealistic,
      };
    }

    const isRealistic = weekly <= 0.55;
    let tag = '깔끔한 증량';
    if (!isRealistic) tag = '체지방 주의';
    else if (isRecommended) tag = '추천 · 무리 없음';
    else if (weekly > 0.34) tag = '적극 벌크업';

    return {
      weeks,
      label: formatWeeksLabel(weeks),
      paceText: `주당 약 ${weekly}kg 증량`,
      tag,
      isRecommended,
      isRealistic,
    };
  });
}

export function getRecommendedDurationWeeks(
  currentWeightKg: number,
  targetWeightKg: number,
): number {
  const presets = getRealisticDurationPresets(currentWeightKg, targetWeightKg);
  return presets.find((p) => p.isRecommended)?.weeks ?? presets[0]?.weeks ?? 8;
}

export function calculateSimpleWeightPlan(
  metrics: UserMetricsInput,
  rawTargetWeightKg: number,
  rawDurationWeeks: number,
): SimpleWeightPlanResult {
  const currentWeightKg = round1(
    Number.isFinite(Number(metrics.weightKg)) && Number(metrics.weightKg) >= 25
      ? Number(metrics.weightKg)
      : 72,
  );
  const targetWeightKg = round1(
    Math.max(30, Math.min(220, Number.isFinite(rawTargetWeightKg) ? rawTargetWeightKg : currentWeightKg)),
  );
  const diffKg = round1(targetWeightKg - currentWeightKg);
  const absDiff = Math.abs(diffKg);
  const planType = detectPlanGoal(currentWeightKg, targetWeightKg);
  const durationWeeks = Math.max(1, Math.min(104, Math.round(rawDurationWeeks || 8)));

  const calculatorGoal: GoalKey =
    planType === 'diet' ? 'cut' : planType === 'bulk' ? 'bulk' : 'maintain';

  const baseNutrition = calculateNutrition({
    ...metrics,
    weightKg: currentWeightKg,
    goal: 'maintain',
  });

  const currentBmr = baseNutrition.bmr;
  const maintenanceCalories = baseNutrition.tdee;
  const weeklyChangeKg =
    planType === 'maintain' ? 0 : Number((diffKg / durationWeeks).toFixed(2));

  const rawDailyDelta =
    planType === 'maintain' ? 0 : Math.round((diffKg * KCAL_PER_KG) / (durationWeeks * 7));

  const safeMinCalories = Math.max(1100, Math.round(currentBmr * 0.9));
  const uncappedDaily = maintenanceCalories + rawDailyDelta;
  const dailyCalories =
    planType === 'maintain'
      ? maintenanceCalories
      : Math.max(safeMinCalories, Math.min(5000, uncappedDaily));

  const actualDailyDelta = dailyCalories - maintenanceCalories;
  const macros = calcMacros532(dailyCalories);

  const minRecommendedWeeks =
    planType === 'maintain'
      ? 4
      : Math.max(2, Math.ceil(absDiff / (planType === 'diet' ? 0.6 : 0.35)));

  let realismStatus: RealismStatus = 'good';
  let realismMessage = '무리 없이 건강하게 실천할 수 있는 좋은 기간이에요.';

  if (planType === 'diet') {
    const absWeekly = Math.abs(weeklyChangeKg);
    if (absWeekly > 0.9 || uncappedDaily < safeMinCalories) {
      realismStatus = 'too_fast';
      realismMessage = `기간이 너무 짧아서 근손실이나 요요가 오기 쉬워요. 최소 ${minRecommendedWeeks}주 이상으로 잡는 걸 추천해요.`;
    } else if (absWeekly > 0.65) {
      realismStatus = 'fast';
      realismMessage = '조금 빠른 속도예요. 배고픔이나 피로감이 크다면 기간을 2~4주 늘려 보세요.';
    }
  } else if (planType === 'bulk') {
    if (weeklyChangeKg > 0.55) {
      realismStatus = 'too_fast';
      realismMessage = `증량 속도가 너무 빨라 체지방이 많이 늘 수 있어요. ${minRecommendedWeeks}주 이상 천천히 올리는 걸 추천해요.`;
    } else if (weeklyChangeKg > 0.38) {
      realismStatus = 'fast';
      realismMessage = '꽤 적극적인 벌크업 속도예요. 근력 운동 강도를 충분히 함께 높여 주세요.';
    }
  } else {
    realismMessage = '현재 체중을 안정적으로 유지하기 좋은 계획이에요.';
  }

  const planBadge =
    planType === 'diet' ? '다이어트' : planType === 'bulk' ? '벌크업' : '체중 유지';

  const planHeadline =
    planType === 'diet'
      ? `총 ${absDiff}kg 감량 다이어트가 필요해요`
      : planType === 'bulk'
        ? `총 ${absDiff}kg 증량 벌크업이 필요해요`
        : '현재 체중을 그대로 유지하면 돼요';

  const actionGuides: string[] =
    planType === 'diet'
      ? [
          `유지 칼로리(${maintenanceCalories.toLocaleString()}kcal)보다 하루 약 ${Math.abs(actualDailyDelta).toLocaleString()}kcal 적게 드세요.`,
          `근손실 예방을 위해 하루 단백질 ${macros.protein}g(닭가슴살 약 ${(macros.protein / 22.9).toFixed(1)}덩이)을 우선 채워 주세요.`,
          `주 1~2회 아침 공복에 체중을 확인하며 ${formatWeeksLabel(durationWeeks)} 동안 꾸준히 이어가세요.`,
        ]
      : planType === 'bulk'
        ? [
            `유지 칼로리(${maintenanceCalories.toLocaleString()}kcal)보다 하루 약 ${actualDailyDelta.toLocaleString()}kcal 더 드세요.`,
            `근육량 위주로 늘리려면 주 3회 이상 근력 운동과 하루 단백질 ${macros.protein}g 섭취가 중요해요.`,
            `식사량을 한 번에 늘리기 어렵다면 탄수화물(${macros.carbs}g)을 여러 끼니로 나눠 드세요.`,
          ]
        : [
            `하루 유지 칼로리 ${maintenanceCalories.toLocaleString()}kcal에 맞춰 식사하면 체중이 안정적으로 유지돼요.`,
            `단백질 ${macros.protein}g을 챙기면서 현재 운동 습관을 꾸준히 이어가세요.`,
            `체중이 1kg 이상 움직일 때만 식사량을 가볍게 조절해 주세요.`,
          ];

  const milestones: WeightPlanMilestone[] = [];
  if (planType === 'maintain') {
    milestones.push(
      { label: '지금', week: 0, weightKg: currentWeightKg },
      { label: `${Math.round(durationWeeks / 2)}주 뒤`, week: Math.round(durationWeeks / 2), weightKg: currentWeightKg },
      { label: `${durationWeeks}주 뒤`, week: durationWeeks, weightKg: targetWeightKg },
    );
  } else {
    const stepCount = Math.min(4, Math.max(2, durationWeeks >= 8 ? 4 : 2));
    for (let i = 0; i <= stepCount; i++) {
      const wk = Math.round((durationWeeks * i) / stepCount);
      const w = i === stepCount ? targetWeightKg : round1(currentWeightKg + (diffKg * i) / stepCount);
      milestones.push({
        label: i === 0 ? '지금' : i === stepCount ? `${wk}주 목표` : `${wk}주 뒤`,
        week: wk,
        weightKg: w,
      });
    }
  }

  return {
    currentWeightKg,
    targetWeightKg,
    diffKg,
    planType,
    planBadge,
    planHeadline,
    calculatorGoal,
    durationWeeks,
    durationLabel: formatWeeksLabel(durationWeeks),
    weeklyChangeKg,
    currentBmr,
    maintenanceCalories,
    dailyCalories,
    actualDailyDelta,
    macros,
    realismStatus,
    realismMessage,
    minRecommendedWeeks,
    actionGuides,
    milestones,
  };
}
