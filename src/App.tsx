import React, { useMemo, useRef, useState } from 'react';
import { DietRoadmapPage } from './components/DietRoadmapPage';
import { Header, type AppPage } from './components/Header';
import { InputPanel } from './components/InputPanel';
import { MealPlannerPage, type MealPlannerStep } from './components/MealPlannerPage';
import { ResultsPanel } from './components/ResultsPanel';
import { type FoodItem, MEAL_COUNT_OPTIONS } from './utils/mealPlanner';
import {
  calculateNutrition,
  validateUserMetrics,
  type UserMetricsInput,
  type ValidationErrors,
} from './utils/nutrition';
import { calculateSimpleWeightPlan, getRecommendedDurationWeeks } from './utils/roadmap';

const DEFAULT_INPUT: UserMetricsInput = {
  gender: 'male',
  age: 28,
  heightCm: 175,
  weightKg: 72,
  lifestyle: 'sedentary',
  frequency: 'freq_3',
  experience: 'exp_1_2y',
  fitnessLevel: 'fit_jog',
  goal: 'maintain',
  goalDeltaOverride: 0,
};

const DEFAULT_SELECTED_FOOD_IDS = [
  'p_chicken_breast',
  'p_egg',
  'c_white_rice',
  'c_sweet_potato',
  'f_avocado',
  'f_olive_oil',
];

export default function App() {
  const [activePage, setActivePage] = useState<AppPage>('calculator');
  const [plannerStep, setPlannerStep] = useState<MealPlannerStep>('select');
  const [input, setInput] = useState<UserMetricsInput>(DEFAULT_INPUT);
  const [hasCalculated, setHasCalculated] = useState(false);
  const [revealKey, setRevealKey] = useState(0);
  const [submittedOnce, setSubmittedOnce] = useState(false);

  // Shared weight plan state between ResultsPanel, DietRoadmapPage, and MealPlannerPage
  const lastValidWeightRef = useRef<number>(Number(DEFAULT_INPUT.weightKg));
  const [targetWeightKg, setTargetWeightKg] = useState<number>(Number(DEFAULT_INPUT.weightKg));
  const [durationWeeks, setDurationWeeks] = useState<number>(8);

  // Shared meal planner choices so editing weight plan never discards food selections
  const [selectedFoodIds, setSelectedFoodIds] = useState<string[]>(DEFAULT_SELECTED_FOOD_IDS);
  const [customFoods, setCustomFoods] = useState<FoodItem[]>([]);
  const [mealCount, setMealCount] = useState<number>(MEAL_COUNT_OPTIONS[1]); // 3 meals default

  const errors: ValidationErrors = useMemo(() => {
    if (!submittedOnce) return {};
    return validateUserMetrics(input);
  }, [input, submittedOnce]);

  const liveErrors: ValidationErrors = useMemo(() => validateUserMetrics(input), [input]);
  const hasAnyError = Object.keys(liveErrors).length > 0;

  const result = useMemo(() => {
    if (!hasCalculated || hasAnyError) return null;
    return calculateNutrition({ ...input, goal: 'maintain', goalDeltaOverride: 0 });
  }, [hasCalculated, hasAnyError, input]);

  const safeInput = hasAnyError ? DEFAULT_INPUT : input;

  const activeWeightPlan = useMemo(
    () => calculateSimpleWeightPlan(safeInput, targetWeightKg, durationWeeks),
    [safeInput, targetWeightKg, durationWeeks],
  );

  const plannerTargets = useMemo(
    () => ({
      calories: activeWeightPlan.dailyCalories,
      carbs: activeWeightPlan.macros.carbs,
      protein: activeWeightPlan.macros.protein,
      fat: activeWeightPlan.macros.fat,
    }),
    [activeWeightPlan],
  );

  function handleChange<K extends keyof UserMetricsInput>(field: K, value: UserMetricsInput[K]) {
    if (field === 'weightKg') {
      const nextW = Number(value);
      if (Number.isFinite(nextW) && nextW >= 25 && nextW <= 250) {
        const prevValidW = lastValidWeightRef.current;
        const delta = targetWeightKg - prevValidW;
        const nextTarget = Number(Math.max(30, Math.min(220, nextW + delta)).toFixed(1));
        lastValidWeightRef.current = nextW;
        setTargetWeightKg(nextTarget);
        setDurationWeeks(getRecommendedDurationWeeks(nextW, nextTarget));
      }
    }
    setInput((prev) => ({ ...prev, [field]: value }));
  }

  function handleChangeTargetWeight(nextTargetKg: number, nextDurationWeeks?: number) {
    setTargetWeightKg(nextTargetKg);
    if (typeof nextDurationWeeks === 'number') {
      setDurationWeeks(nextDurationWeeks);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmittedOnce(true);
    const currentErrors = validateUserMetrics(input);
    if (Object.keys(currentErrors).length > 0) {
      return;
    }

    setHasCalculated(true);
    setRevealKey((k) => k + 1);

    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      requestAnimationFrame(() => {
        document.getElementById('results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }

  function handleReset() {
    lastValidWeightRef.current = Number(DEFAULT_INPUT.weightKg);
    setInput(DEFAULT_INPUT);
    setTargetWeightKg(Number(DEFAULT_INPUT.weightKg));
    setDurationWeeks(8);
    setHasCalculated(false);
    setSubmittedOnce(false);
  }

  function handleNavigate(page: AppPage) {
    setActivePage(page);
    if (page === 'planner') {
      setPlannerStep('select');
    }
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  return (
    <div id="top" className="min-h-screen flex flex-col bg-[#F6F7F9] text-slate-900">
      <Header activePage={activePage} onNavigate={handleNavigate} />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 py-5 sm:py-6">
        {activePage === 'calculator' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-7">
              <InputPanel
                input={input}
                errors={errors}
                hasCalculated={hasCalculated}
                onChange={handleChange}
                onSubmit={handleSubmit}
                onReset={handleReset}
              />
            </div>

            <div className="lg:col-span-5 lg:sticky lg:top-20">
              <ResultsPanel
                hasCalculated={hasCalculated}
                revealKey={revealKey}
                result={result}
                currentWeightKg={safeInput.weightKg}
                hasErrors={submittedOnce && hasAnyError}
                onGoToWeightPlan={() => handleNavigate('roadmap')}
              />
            </div>
          </div>
        ) : activePage === 'planner' ? (
          <MealPlannerPage
            targets={plannerTargets}
            weightPlan={activeWeightPlan}
            step={plannerStep}
            selectedIds={selectedFoodIds}
            customFoods={customFoods}
            mealCount={mealCount}
            onSelectedIdsChange={setSelectedFoodIds}
            onCustomFoodsChange={setCustomFoods}
            onMealCountChange={setMealCount}
            onStepChange={setPlannerStep}
            onBackToCalculator={() => handleNavigate('calculator')}
            onEditWeightPlan={() => handleNavigate('roadmap')}
          />
        ) : (
          <DietRoadmapPage
            metrics={safeInput}
            targetWeightKg={targetWeightKg}
            durationWeeks={durationWeeks}
            onChangeTargetWeight={handleChangeTargetWeight}
            onChangeDurationWeeks={setDurationWeeks}
            onUseRoadmapCalories={() => handleNavigate('planner')}
          />
        )}
      </main>
    </div>
  );
}
