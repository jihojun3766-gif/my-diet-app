import React, { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, CalendarCheck, Check, Copy, Plus, SlidersHorizontal, X } from 'lucide-react';
import {
  MEAL_COUNT_OPTIONS,
  NEUTRAL_CUSTOM_DEFAULT_MACROS,
  PRESET_FOODS,
  createCustomFoodItem,
  generateMealPlan,
  lookupCustomFoodNutrition,
  type FoodCategory,
  type FoodItem,
  type MacroTargets,
  type MealPlanResult,
} from '../utils/mealPlanner';
import type { SimpleWeightPlanResult } from '../utils/roadmap';

export type MealPlannerStep = 'select' | 'result';

interface MealPlannerPageProps {
  targets: MacroTargets;
  weightPlan: SimpleWeightPlanResult;
  step: MealPlannerStep;
  selectedIds: string[];
  customFoods: FoodItem[];
  mealCount: number;
  onSelectedIdsChange: React.Dispatch<React.SetStateAction<string[]>>;
  onCustomFoodsChange: React.Dispatch<React.SetStateAction<FoodItem[]>>;
  onMealCountChange: (count: number) => void;
  onStepChange: (step: MealPlannerStep) => void;
  onBackToCalculator: () => void;
  onEditWeightPlan?: () => void;
  onApplyPlanToTracker?: (plan: MealPlanResult) => void;
}

const CATEGORY_META: Record<
  FoodCategory,
  {
    title: string;
    dotClass: string;
    activeClass: string;
    accentText: string;
  }
> = {
  protein: {
    title: '단백질',
    dotClass: 'bg-emerald-500',
    activeClass: 'bg-emerald-50 border-emerald-600/70 text-emerald-950',
    accentText: 'text-emerald-700',
  },
  carb: {
    title: '탄수화물',
    dotClass: 'bg-amber-500',
    activeClass: 'bg-amber-50 border-amber-600/70 text-amber-950',
    accentText: 'text-amber-700',
  },
  fat: {
    title: '지방',
    dotClass: 'bg-sky-500',
    activeClass: 'bg-sky-50 border-sky-600/70 text-sky-950',
    accentText: 'text-sky-700',
  },
};

export function MealPlannerPage({
  targets,
  weightPlan,
  step,
  selectedIds,
  customFoods,
  mealCount,
  onSelectedIdsChange,
  onCustomFoodsChange,
  onMealCountChange,
  onStepChange,
  onBackToCalculator,
  onEditWeightPlan,
  onApplyPlanToTracker,
}: MealPlannerPageProps) {
  const [copiedPlan, setCopiedPlan] = useState<boolean>(false);

  // Custom food form state (no manual macro-category selection required)
  const [customName, setCustomName] = useState<string>('');
  const [customCarbs, setCustomCarbs] = useState<string>(
    String(NEUTRAL_CUSTOM_DEFAULT_MACROS.carbs),
  );
  const [customProtein, setCustomProtein] = useState<string>(
    String(NEUTRAL_CUSTOM_DEFAULT_MACROS.protein),
  );
  const [customFat, setCustomFat] = useState<string>(String(NEUTRAL_CUSTOM_DEFAULT_MACROS.fat));
  const [customMatchedHint, setCustomMatchedHint] = useState<boolean>(false);
  const [customError, setCustomError] = useState<string>('');

  const allFoods = useMemo(() => [...PRESET_FOODS, ...customFoods], [customFoods]);

  const selectedFoods = useMemo(
    () => allFoods.filter((f) => selectedIds.includes(f.id)),
    [allFoods, selectedIds],
  );

  const mealPlan = useMemo(() => {
    if (step !== 'result' || selectedFoods.length === 0) return null;
    return generateMealPlan(targets, selectedFoods, mealCount);
  }, [mealCount, selectedFoods, step, targets]);

  const weightPlanSummary =
    weightPlan.planType === 'maintain'
      ? `체중 유지 (${weightPlan.currentWeightKg}kg)`
      : `${weightPlan.planBadge} (${weightPlan.currentWeightKg}kg → ${weightPlan.targetWeightKg}kg · ${weightPlan.durationWeeks}주)`;

  function toggleFood(id: string) {
    onSelectedIdsChange((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  }

  function handleCustomNameChange(value: string) {
    setCustomName(value);
    setCustomError('');
    const trimmed = value.trim();
    if (!trimmed) {
      setCustomMatchedHint(false);
      return;
    }
    const lookup = lookupCustomFoodNutrition(trimmed);
    if (lookup.matched) {
      setCustomCarbs(String(lookup.per100g.carbs));
      setCustomProtein(String(lookup.per100g.protein));
      setCustomFat(String(lookup.per100g.fat));
      setCustomMatchedHint(true);
    } else {
      setCustomMatchedHint(false);
    }
  }

  function handleAddCustomFood(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = customName.trim();
    if (!trimmed) {
      setCustomError('음식 이름을 입력해 주세요.');
      return;
    }

    const existing = allFoods.find(
      (f) => f.name.replace(/\s+/g, '') === trimmed.replace(/\s+/g, ''),
    );
    if (existing) {
      if (!selectedIds.includes(existing.id)) {
        onSelectedIdsChange((prev) => [...prev, existing.id]);
      }
      setCustomName('');
      setCustomMatchedHint(false);
      setCustomError('');
      return;
    }

    const cVal = Number(customCarbs);
    const pVal = Number(customProtein);
    const fVal = Number(customFat);
    if (
      !Number.isFinite(cVal) ||
      !Number.isFinite(pVal) ||
      !Number.isFinite(fVal) ||
      cVal < 0 ||
      pVal < 0 ||
      fVal < 0 ||
      (cVal === 0 && pVal === 0 && fVal === 0)
    ) {
      setCustomError('100g 기준 탄수화물·단백질·지방(g) 중 하나 이상 0보다 크게 입력해 주세요.');
      return;
    }

    const newItem = createCustomFoodItem(trimmed, null, cVal, pVal, fVal);
    onCustomFoodsChange((prev) => [...prev, newItem]);
    onSelectedIdsChange((prev) => [...prev, newItem.id]);
    setCustomName('');
    setCustomMatchedHint(false);
    setCustomError('');
    setCustomCarbs(String(NEUTRAL_CUSTOM_DEFAULT_MACROS.carbs));
    setCustomProtein(String(NEUTRAL_CUSTOM_DEFAULT_MACROS.protein));
    setCustomFat(String(NEUTRAL_CUSTOM_DEFAULT_MACROS.fat));
  }

  function handleRemoveCustomFood(id: string) {
    onCustomFoodsChange((prev) => prev.filter((item) => item.id !== id));
    onSelectedIdsChange((prev) => prev.filter((item) => item !== id));
  }

  function handleGoToResultPage() {
    if (selectedFoods.length === 0) return;
    onStepChange('result');
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function handleBackToSelectPage() {
    onStepChange('select');
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function handleCopyMealPlan() {
    if (!mealPlan) return;
    const lines: string[] = [
      `[맞춤 식단 · ${weightPlanSummary}] 총 ${mealPlan.totals.calories.toLocaleString()}kcal (탄 ${mealPlan.totals.carbs}g · 단 ${mealPlan.totals.protein}g · 지 ${mealPlan.totals.fat}g)`,
      '',
    ];
    for (const meal of mealPlan.meals) {
      if (meal.items.length === 0) continue;
      lines.push(`• ${meal.label} (${meal.totals.calories}kcal)`);
      for (const item of meal.items) {
        lines.push(`  - ${item.food.name} ${item.grams}g (${item.calories}kcal)`);
      }
    }
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(lines.join('\n')).catch(() => {});
    }
    setCopiedPlan(true);
    window.setTimeout(() => setCopiedPlan(false), 2000);
  }

  if (step === 'select') {
    return (
      <div className="max-w-4xl mx-auto space-y-5 animate-result-reveal">
        {/* 상단 목표 요약 바 */}
        <div className="bg-white border border-slate-200/90 rounded-3xl px-5 py-4 sm:px-6 flex flex-wrap items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBackToCalculator}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium transition-colors whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
            >
              <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
              <span>칼로리 계산기로</span>
            </button>
            <h2 className="font-display text-base sm:text-lg font-semibold text-slate-900">
              식단 음식 선택
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs sm:text-sm font-mono-num">
            <span
              data-testid="planner-weight-plan-badge"
              className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-sans font-semibold ${
                weightPlan.planType === 'diet'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-600/20'
                  : weightPlan.planType === 'bulk'
                    ? 'bg-sky-50 text-sky-700 border border-sky-600/20'
                    : 'bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              {weightPlanSummary}
            </span>
            <span className="text-slate-900 font-bold">
              목표 {targets.calories.toLocaleString()} kcal
            </span>
            <span className="text-slate-300" aria-hidden="true">
              ·
            </span>
            <span className="text-amber-700 font-medium">탄 {targets.carbs}g</span>
            <span className="text-emerald-700 font-medium">단 {targets.protein}g</span>
            <span className="text-sky-700 font-medium">지 {targets.fat}g</span>
            {onEditWeightPlan && (
              <button
                type="button"
                onClick={onEditWeightPlan}
                className="font-sans text-xs font-medium text-emerald-700 hover:text-emerald-800 underline underline-offset-2 cursor-pointer"
              >
                계획 수정
              </button>
            )}
          </div>
        </div>

        {/* 음식 선택 & 직접 추가 카드 */}
        <section
          aria-labelledby="food-picker-heading"
          className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-7 space-y-6 shadow-xs"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3
              id="food-picker-heading"
              className="font-display text-base sm:text-lg font-semibold text-slate-900"
            >
              식단에 사용할 음식 선택
            </h3>
            <span className="text-xs text-slate-500">
              원하는 음식을 여러 개 선택한 뒤 식단 짜기 버튼을 눌러 주세요
            </span>
          </div>

          {(['protein', 'carb', 'fat'] as const).map((cat) => {
            const meta = CATEGORY_META[cat];
            const items = PRESET_FOODS.filter((f) => f.category === cat);
            const selectedCount = items.filter((f) => selectedIds.includes(f.id)).length;

            return (
              <div
                key={cat}
                className="pt-5 border-t border-slate-100 first:pt-0 first:border-t-0"
              >
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${meta.dotClass}`} aria-hidden="true" />
                    <span className="text-sm font-semibold text-slate-900">{meta.title}</span>
                  </div>
                  <span className="text-xs font-mono-num text-slate-500">
                    {selectedCount}개 선택됨
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {items.map((item) => {
                    const isSelected = selectedIds.includes(item.id);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => toggleFood(item.id)}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[38px] text-xs sm:text-sm font-medium rounded-xl border transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 ${
                          isSelected
                            ? meta.activeClass
                            : 'bg-slate-50 border-slate-200/80 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {isSelected && (
                          <Check
                            className={`w-3.5 h-3.5 shrink-0 ${meta.accentText}`}
                            aria-hidden="true"
                          />
                        )}
                        <span className="whitespace-nowrap">{item.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* 없는 음식 직접 추가 (탄단지 분류 선택 없이 이름·영양성분으로 자동 반영) */}
          <form
            onSubmit={handleAddCustomFood}
            className="pt-5 border-t border-slate-100 space-y-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs sm:text-sm font-semibold text-slate-800">
                목록에 없는 음식 직접 추가
              </span>
              {customMatchedHint ? (
                <span className="text-xs text-emerald-700 font-medium">
                  영양성분 자동 입력됨 (100g 기준)
                </span>
              ) : (
                <span className="text-xs text-slate-400">
                  이름을 입력하면 탄·단·지 비율을 자동으로 분류해 식단에 반영합니다
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
              <div className="sm:col-span-10">
                <label htmlFor="custom-food-name" className="sr-only">
                  추가할 음식 이름
                </label>
                <input
                  id="custom-food-name"
                  type="text"
                  value={customName}
                  onChange={(e) => handleCustomNameChange(e.target.value)}
                  placeholder="예: 훈제오리, 김밥, 블루베리, 통밀빵, 수제메뉴..."
                  className="w-full min-h-[42px] px-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15"
                />
              </div>

              <button
                type="submit"
                className="sm:col-span-2 min-h-[42px] px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold inline-flex items-center justify-center gap-1 transition-colors whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
              >
                <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                <span>추가</span>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label htmlFor="custom-carbs" className="block text-[11px] text-slate-500 mb-1">
                  100g당 탄수화물(g)
                </label>
                <input
                  id="custom-carbs"
                  type="number"
                  min={0}
                  max={100}
                  step="0.1"
                  value={customCarbs}
                  onChange={(e) => setCustomCarbs(e.target.value)}
                  className="w-full min-h-[38px] px-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-mono-num text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>
              <div>
                <label htmlFor="custom-protein" className="block text-[11px] text-slate-500 mb-1">
                  100g당 단백질(g)
                </label>
                <input
                  id="custom-protein"
                  type="number"
                  min={0}
                  max={100}
                  step="0.1"
                  value={customProtein}
                  onChange={(e) => setCustomProtein(e.target.value)}
                  className="w-full min-h-[38px] px-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-mono-num text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>
              <div>
                <label htmlFor="custom-fat" className="block text-[11px] text-slate-500 mb-1">
                  100g당 지방(g)
                </label>
                <input
                  id="custom-fat"
                  type="number"
                  min={0}
                  max={100}
                  step="0.1"
                  value={customFat}
                  onChange={(e) => setCustomFat(e.target.value)}
                  className="w-full min-h-[38px] px-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-mono-num text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            {customFoods.length > 0 && (
              <div className="pt-2 space-y-2">
                <span className="block text-xs font-medium text-slate-600">직접 추가한 음식</span>
                <div className="flex flex-wrap gap-2">
                  {customFoods.map((item) => {
                    const isSelected = selectedIds.includes(item.id);
                    const meta = CATEGORY_META[item.category];
                    return (
                      <div key={item.id} className="inline-flex items-center">
                        <button
                          type="button"
                          aria-pressed={isSelected}
                          onClick={() => toggleFood(item.id)}
                          className={`inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[38px] text-xs sm:text-sm font-medium rounded-l-xl border transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 ${
                            isSelected
                              ? meta.activeClass
                              : 'bg-slate-50 border-slate-200/80 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {isSelected && (
                            <Check
                              className={`w-3.5 h-3.5 shrink-0 ${meta.accentText}`}
                              aria-hidden="true"
                            />
                          )}
                          <span className="whitespace-nowrap">{item.name}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveCustomFood(item.id)}
                          aria-label={`${item.name} 삭제`}
                          className={`px-2 py-2 min-h-[38px] rounded-r-xl border-y border-r text-slate-400 hover:text-rose-600 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 ${
                            isSelected ? meta.activeClass : 'bg-slate-50 border-slate-200/80'
                          }`}
                        >
                          <X className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {customError && (
              <p role="alert" className="text-xs text-rose-600">
                {customError}
              </p>
            )}
          </form>

          {/* 끼니 수 + 식단 결과 페이지 이동 버튼 */}
          <div className="pt-5 border-t border-slate-100 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="block text-sm font-semibold text-slate-800">하루 끼니 수</span>
                <span className="block text-xs text-slate-500 mt-0.5">
                  끼니 수를 늘려도 간식이 아니라 모두 한 끼 식사로 나누어 배분됩니다
                </span>
              </div>
              <div
                role="radiogroup"
                aria-label="하루 끼니 수"
                className="grid grid-cols-5 gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200/70"
              >
                {MEAL_COUNT_OPTIONS.map((count) => (
                  <button
                    key={count}
                    type="button"
                    role="radio"
                    aria-checked={mealCount === count}
                    onClick={() => onMealCountChange(count)}
                    className={`px-3 py-1.5 min-h-[32px] rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                      mealCount === count
                        ? 'bg-white text-emerald-700 shadow-xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {count}끼
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoToResultPage}
              disabled={selectedFoods.length === 0}
              data-testid="generate-meal-plan-btn"
              className="w-full min-h-[48px] px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-sm font-bold inline-flex items-center justify-center gap-2 transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 cursor-pointer disabled:cursor-not-allowed"
            >
              <span>선택한 사항으로 식단 짜러 가기</span>
              <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
            </button>
          </div>
        </section>
      </div>
    );
  }

  // Dedicated Meal Plan Result Page (step === 'result')
  return (
    <div className="max-w-5xl mx-auto space-y-5 animate-result-reveal">
      {/* 상단 내비게이션 바 */}
      <div className="bg-white border border-slate-200/90 rounded-3xl px-5 py-4 sm:px-6 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleBackToSelectPage}
            data-testid="back-to-food-select-btn"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 min-h-[36px] rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            <span>음식 다시 선택하기</span>
          </button>

          <button
            type="button"
            onClick={onBackToCalculator}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 text-xs font-medium transition-colors whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
          >
            <span>칼로리 계산기로</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {mealPlan && onApplyPlanToTracker && (
            <button
              type="button"
              onClick={() => onApplyPlanToTracker(mealPlan)}
              data-testid="apply-plan-to-tracker-btn"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 min-h-[36px] rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
            >
              <CalendarCheck className="w-3.5 h-3.5" aria-hidden="true" />
              <span>오늘 식단으로 반영</span>
            </button>
          )}
          <button
            type="button"
            onClick={handleCopyMealPlan}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 min-h-[36px] rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
          >
            {copiedPlan ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
            ) : (
              <Copy className="w-3.5 h-3.5" aria-hidden="true" />
            )}
            <span>{copiedPlan ? '복사 완료' : '식단 복사'}</span>
          </button>
        </div>
      </div>

      {!mealPlan ? (
        <section className="bg-white border border-slate-200/90 rounded-3xl p-10 text-center space-y-3 shadow-xs">
          <h2 className="font-display text-lg font-semibold text-slate-900">
            선택된 음식이 없습니다
          </h2>
          <p className="text-sm text-slate-500">
            음식 선택 페이지로 돌아가 식재료를 선택해 주세요.
          </p>
        </section>
      ) : (
        <section
          id="meal-plan-output"
          aria-label="짜진 하루 식단 결과"
          className="space-y-5"
        >
          {/* 총 섭취량 요약 카드 */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-7 shadow-xs">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-emerald-700">맞춤 하루 식단</span>
                  <span
                    data-testid="meal-result-weight-plan-badge"
                    className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                      weightPlan.planType === 'diet'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-600/20'
                        : weightPlan.planType === 'bulk'
                          ? 'bg-sky-50 text-sky-700 border border-sky-600/20'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {weightPlanSummary}
                  </span>
                  <span className="text-xs font-mono-num text-slate-500">
                    목표 {targets.calories.toLocaleString()}kcal 대비{' '}
                    {mealPlan.diffCalories >= 0
                      ? `+${mealPlan.diffCalories}`
                      : mealPlan.diffCalories}{' '}
                    kcal
                  </span>
                </div>
                <p
                  data-testid="meal-plan-total-calories"
                  className="font-mono-num text-4xl sm:text-5xl font-bold text-slate-950"
                >
                  {mealPlan.totals.calories.toLocaleString()}
                  <span className="text-lg font-normal text-slate-500 ml-2">kcal</span>
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2.5 w-full sm:w-auto sm:min-w-[360px]">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70">
                  <span className="block text-[11px] text-slate-500">탄수화물</span>
                  <span className="font-mono-num text-base font-bold text-amber-700">
                    {mealPlan.totals.carbs}g
                  </span>
                  <span className="block font-mono-num text-[11px] text-slate-400">
                    목표 {targets.carbs}g
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70">
                  <span className="block text-[11px] text-slate-500">단백질</span>
                  <span className="font-mono-num text-base font-bold text-emerald-700">
                    {mealPlan.totals.protein}g
                  </span>
                  <span className="block font-mono-num text-[11px] text-slate-400">
                    목표 {targets.protein}g
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70">
                  <span className="block text-[11px] text-slate-500">지방</span>
                  <span className="font-mono-num text-base font-bold text-sky-700">
                    {mealPlan.totals.fat}g
                  </span>
                  <span className="block font-mono-num text-[11px] text-slate-400">
                    목표 {targets.fat}g
                  </span>
                </div>
              </div>
            </div>

            {/* 끼니 수 빠른 전환 */}
            <div className="mt-5 pt-5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <SlidersHorizontal className="w-3.5 h-3.5" aria-hidden="true" />
                <span>끼니 수 변경</span>
              </div>
              <div
                role="radiogroup"
                aria-label="결과 페이지 끼니 수 변경"
                className="grid grid-cols-5 gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200/70"
              >
                {MEAL_COUNT_OPTIONS.map((count) => (
                  <button
                    key={count}
                    type="button"
                    role="radio"
                    aria-checked={mealCount === count}
                    onClick={() => onMealCountChange(count)}
                    className={`px-3 py-1 min-h-[30px] rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                      mealCount === count
                        ? 'bg-white text-emerald-700 shadow-xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {count}끼
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 끼니별 카드 그리드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mealPlan.meals.map((meal) => (
              <div
                key={meal.mealIndex}
                className="bg-white border border-slate-200/90 rounded-3xl p-5 flex flex-col justify-between space-y-4 shadow-xs"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <h3 className="font-display text-sm font-semibold text-slate-900">
                      {meal.label}
                    </h3>
                    <span className="text-xs font-mono-num font-semibold text-slate-900">
                      {meal.totals.calories.toLocaleString()} kcal
                    </span>
                  </div>

                  {meal.items.length === 0 ? (
                    <p className="text-xs text-slate-400">배정된 식품 없음</p>
                  ) : (
                    <ul className="space-y-2">
                      {meal.items.map((alloc) => {
                        const dot = CATEGORY_META[alloc.food.category].dotClass;
                        return (
                          <li
                            key={`${meal.mealIndex}-${alloc.food.id}`}
                            className="flex items-baseline justify-between gap-2 text-xs sm:text-sm"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span
                                className={`w-2 h-2 rounded-full shrink-0 ${dot}`}
                                aria-hidden="true"
                              />
                              <span className="font-medium text-slate-800 truncate">
                                {alloc.food.name}
                              </span>
                            </div>
                            <div className="flex items-baseline gap-2 shrink-0 font-mono-num">
                              <span className="font-bold text-slate-950">{alloc.grams}g</span>
                              <span className="text-[11px] text-slate-400">
                                {alloc.calories}kcal
                              </span>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 text-[11px] font-mono-num text-slate-500 flex items-center justify-between">
                  <span>탄 {meal.totals.carbs}g</span>
                  <span>단 {meal.totals.protein}g</span>
                  <span>지 {meal.totals.fat}g</span>
                </div>
              </div>
            ))}
          </div>

          {/* 하루 총 식재료 필요량 */}
          <div className="bg-white border border-slate-200/90 rounded-3xl px-5 py-4 sm:px-6 shadow-xs">
            <h4 className="text-xs font-semibold text-slate-500 mb-2">하루 총 식재료 필요량</h4>
            <div className="flex flex-wrap gap-x-3 gap-y-1.5 text-xs sm:text-sm font-mono-num text-slate-700">
              {mealPlan.dailyFoodSummary.map((item, idx) => (
                <span key={item.food.id}>
                  {item.food.name} <strong className="text-slate-950">{item.grams}g</strong>
                  {idx < mealPlan.dailyFoodSummary.length - 1 && (
                    <span className="text-slate-300 ml-3" aria-hidden="true">
                      ·
                    </span>
                  )}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
