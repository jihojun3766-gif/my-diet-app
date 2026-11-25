import React, { useMemo, useState } from 'react';
import { Check, Plus, RotateCcw, Sparkles, Trash2, Utensils } from 'lucide-react';
import {
  MEAL_SLOT_OPTIONS,
  calculateRemainingMacros,
  calculateTrackerTotals,
  createFoodLogEntry,
  recommendFoodsForRemaining,
  type FoodLogEntry,
  type MealSlot,
} from '../utils/foodTracker';
import {
  NEUTRAL_CUSTOM_DEFAULT_MACROS,
  PRESET_FOODS,
  inferFoodCategory,
  lookupCustomFoodNutrition,
  type FoodCategory,
  type MacroTargets,
} from '../utils/mealPlanner';

interface FoodTrackerPageProps {
  targets: MacroTargets;
  entries: FoodLogEntry[];
  onAddEntry: (entry: FoodLogEntry) => void;
  onAddEntries: (newEntries: FoodLogEntry[]) => void;
  onRemoveEntry: (id: string) => void;
  onClearEntries: () => void;
  onGoToMealPlanner: () => void;
}

const QUICK_PICK_IDS = [
  'c_white_rice',
  'c_brown_rice',
  'c_sweet_potato',
  'p_chicken_breast',
  'p_egg',
  'p_mackerel',
  'f_avocado',
  'f_olive_oil',
];

const CATEGORY_DOT: Record<FoodCategory, string> = {
  carb: 'bg-amber-500',
  protein: 'bg-emerald-500',
  fat: 'bg-sky-500',
};

export function FoodTrackerPage({
  targets,
  entries,
  onAddEntry,
  onAddEntries,
  onRemoveEntry,
  onClearEntries,
  onGoToMealPlanner,
}: FoodTrackerPageProps) {
  const [mealSlot, setMealSlot] = useState<MealSlot>('breakfast');
  const [foodName, setFoodName] = useState<string>('닭가슴살');
  const [grams, setGrams] = useState<string>('150');
  const [per100Carbs, setPer100Carbs] = useState<string>('0');
  const [per100Protein, setPer100Protein] = useState<string>('23');
  const [per100Fat, setPer100Fat] = useState<string>('1.2');
  const [matchedHint, setMatchedHint] = useState<boolean>(true);
  const [formError, setFormError] = useState<string>('');
  const [showRecommendation, setShowRecommendation] = useState<boolean>(false);
  const [appliedRecFeedback, setAppliedRecFeedback] = useState<boolean>(false);

  const consumed = useMemo(() => calculateTrackerTotals(entries), [entries]);
  const rem = useMemo(() => calculateRemainingMacros(targets, consumed), [targets, consumed]);

  const recommendation = useMemo(() => {
    if (!showRecommendation) return null;
    return recommendFoodsForRemaining(rem.remaining);
  }, [rem.remaining, showRecommendation]);

  const previewMacros = useMemo(() => {
    const g = Math.max(0, Number(grams) || 0);
    const c = Math.max(0, Number(per100Carbs) || 0);
    const p = Math.max(0, Number(per100Protein) || 0);
    const f = Math.max(0, Number(per100Fat) || 0);
    const factor = g / 100;
    const carbs = Math.round(c * factor);
    const protein = Math.round(p * factor);
    const fat = Math.round(f * factor);
    const calories = Math.round(c * factor * 4 + p * factor * 4 + f * factor * 9);
    return { calories, carbs, protein, fat };
  }, [grams, per100Carbs, per100Fat, per100Protein]);

  function handleSelectPresetFood(foodId: string) {
    const item = PRESET_FOODS.find((f) => f.id === foodId);
    if (!item) return;
    setFoodName(item.name);
    setPer100Carbs(String(item.per100g.carbs));
    setPer100Protein(String(item.per100g.protein));
    setPer100Fat(String(item.per100g.fat));
    setMatchedHint(true);
    setFormError('');
    if (item.category === 'fat' && item.stepG === 1) {
      setGrams('10');
    } else if (item.category === 'fat') {
      setGrams('30');
    } else {
      setGrams('150');
    }
  }

  function handleFoodNameInput(value: string) {
    setFoodName(value);
    setFormError('');
    const trimmed = value.trim();
    if (!trimmed) {
      setMatchedHint(false);
      return;
    }
    const lookup = lookupCustomFoodNutrition(trimmed);
    if (lookup.matched) {
      setPer100Carbs(String(lookup.per100g.carbs));
      setPer100Protein(String(lookup.per100g.protein));
      setPer100Fat(String(lookup.per100g.fat));
      setMatchedHint(true);
    } else {
      setMatchedHint(false);
    }
  }

  function handleSubmitLog(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = foodName.trim();
    const gVal = Number(grams);
    const cVal = Number(per100Carbs);
    const pVal = Number(per100Protein);
    const fVal = Number(per100Fat);

    if (!trimmed) {
      setFormError('음식 이름을 입력해 주세요.');
      return;
    }
    if (!Number.isFinite(gVal) || gVal <= 0 || gVal > 3000) {
      setFormError('섭취량(g)을 1~3000g 사이로 입력해 주세요.');
      return;
    }
    if (
      !Number.isFinite(cVal) ||
      !Number.isFinite(pVal) ||
      !Number.isFinite(fVal) ||
      cVal < 0 ||
      pVal < 0 ||
      fVal < 0 ||
      (cVal === 0 && pVal === 0 && fVal === 0)
    ) {
      setFormError('100g 기준 탄수화물·단백질·지방(g)을 올바르게 입력해 주세요.');
      return;
    }

    const lookup = lookupCustomFoodNutrition(trimmed);
    const category = lookup.matched ? lookup.category : inferFoodCategory(cVal, pVal, fVal);
    const entry = createFoodLogEntry(
      mealSlot,
      trimmed,
      gVal,
      { carbs: cVal, protein: pVal, fat: fVal },
      category,
    );
    onAddEntry(entry);
    setFormError('');
  }

  function handleApplyRecommendation() {
    if (!recommendation || recommendation.isGoalAlreadyMet || recommendation.items.length === 0) {
      return;
    }
    const newLogs = recommendation.items.map((alloc, idx) =>
      createFoodLogEntry(
        'extra',
        alloc.food.name,
        alloc.grams,
        alloc.food.per100g,
        alloc.food.category,
        `rec_${Date.now()}_${idx}`,
      ),
    );
    onAddEntries(newLogs);
    setAppliedRecFeedback(true);
    window.setTimeout(() => setAppliedRecFeedback(false), 2000);
  }

  const macroBars: Array<{
    key: 'carbs' | 'protein' | 'fat';
    label: string;
    dot: string;
    bar: string;
    text: string;
    target: number;
    consumed: number;
    remaining: number;
    pct: number;
  }> = [
    {
      key: 'carbs',
      label: '탄수화물',
      dot: 'bg-amber-500',
      bar: rem.remaining.carbs < 0 ? 'bg-rose-500' : 'bg-amber-500',
      text: rem.remaining.carbs < 0 ? 'text-rose-600' : 'text-amber-700',
      target: targets.carbs,
      consumed: rem.consumed.carbs,
      remaining: rem.remaining.carbs,
      pct: rem.progressPct.carbs,
    },
    {
      key: 'protein',
      label: '단백질',
      dot: 'bg-emerald-500',
      bar: rem.remaining.protein < 0 ? 'bg-rose-500' : 'bg-emerald-500',
      text: rem.remaining.protein < 0 ? 'text-rose-600' : 'text-emerald-700',
      target: targets.protein,
      consumed: rem.consumed.protein,
      remaining: rem.remaining.protein,
      pct: rem.progressPct.protein,
    },
    {
      key: 'fat',
      label: '지방',
      dot: 'bg-sky-500',
      bar: rem.remaining.fat < 0 ? 'bg-rose-500' : 'bg-sky-500',
      text: rem.remaining.fat < 0 ? 'text-rose-600' : 'text-sky-700',
      target: targets.fat,
      consumed: rem.consumed.fat,
      remaining: rem.remaining.fat,
      pct: rem.progressPct.fat,
    },
  ];

  return (
    <div className="space-y-5 animate-result-reveal">
      {/* 1. 실시간 남은 칼로리 및 탄단지 잔여량 대시보드 */}
      <section
        aria-label="남은 영양소 실시간 현황"
        className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-7 space-y-6 shadow-xs"
      >
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-emerald-700">
              오늘 남은 칼로리 · 실시간 잔여량
            </span>
            <p
              data-testid="remaining-calories"
              className={`font-mono-num text-4xl sm:text-5xl font-bold tracking-tight ${
                rem.remaining.calories < 0 ? 'text-rose-600' : 'text-slate-950'
              }`}
            >
              {rem.remaining.calories >= 0
                ? rem.remaining.calories.toLocaleString()
                : `+${Math.abs(rem.remaining.calories).toLocaleString()}`}
              <span className="text-lg font-normal text-slate-500 ml-2">
                {rem.remaining.calories >= 0 ? 'kcal 남음' : 'kcal 초과'}
              </span>
            </p>
            <p className="text-xs sm:text-sm font-mono-num text-slate-500">
              섭취 {rem.consumed.calories.toLocaleString()} kcal / 목표{' '}
              {targets.calories.toLocaleString()} kcal ({rem.progressPct.calories}%)
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowRecommendation(true)}
            data-testid="fill-remaining-btn"
            className="min-h-[44px] px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold inline-flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
          >
            <Sparkles className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>남은 영양소 채우기</span>
          </button>
        </div>

        {/* 전체 칼로리 프로그레스 바 */}
        <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              rem.remaining.calories < 0 ? 'bg-rose-500' : 'bg-emerald-600'
            }`}
            style={{ width: `${rem.progressPct.calories}%` }}
          />
        </div>

        {/* 탄단지 3개 남은량 강조 카드 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {macroBars.map((m) => (
            <div
              key={m.key}
              className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${m.dot}`} aria-hidden="true" />
                  <span className="text-xs font-semibold text-slate-800">{m.label}</span>
                </div>
                <span className="text-[11px] font-mono-num text-slate-400">{m.pct}%</span>
              </div>

              <div className="flex items-baseline justify-between gap-2">
                <span
                  data-testid={`remaining-${m.key}`}
                  className={`font-mono-num text-xl sm:text-2xl font-bold ${m.text}`}
                >
                  {m.remaining >= 0 ? `${m.remaining}g` : `+${Math.abs(m.remaining)}g`}
                  <span className="text-xs font-medium text-slate-500 ml-1">
                    {m.remaining >= 0 ? '남음' : '초과'}
                  </span>
                </span>
                <span className="text-[11px] font-mono-num text-slate-500">
                  {m.consumed} / {m.target}g
                </span>
              </div>

              <div className="w-full h-1.5 rounded-full bg-slate-200/80 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${m.bar}`}
                  style={{ width: `${m.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* 2. 잔여 영양소 맞춤 추가 식단 추천 출력 영역 */}
        {recommendation && (
          <div
            data-testid="remaining-recommendation-box"
            className="pt-5 border-t border-slate-100 space-y-4 animate-result-reveal"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-display text-base font-semibold text-slate-900">
                  남은 영양소 맞춤 추가 식단 추천
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  현재 부족한 탄수화물·단백질·지방 수치에 맞춘 단골 식재료 조합입니다
                </p>
              </div>
              {!recommendation.isGoalAlreadyMet && (
                <button
                  type="button"
                  onClick={handleApplyRecommendation}
                  data-testid="apply-recommendation-btn"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[36px] rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
                >
                  {appliedRecFeedback ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                  ) : (
                    <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                  )}
                  <span>{appliedRecFeedback ? '기록 완료' : '추천 식단 한번에 기록'}</span>
                </button>
              )}
            </div>

            {recommendation.isGoalAlreadyMet ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm font-medium">
                오늘 목표 칼로리와 탄·단·지 비율을 이미 충분히 채웠습니다.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-stretch">
                <div className="md:col-span-8 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                  {recommendation.items.map((alloc) => (
                    <div
                      key={alloc.food.id}
                      className="flex items-center justify-between gap-3 text-sm"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${CATEGORY_DOT[alloc.food.category]}`}
                          aria-hidden="true"
                        />
                        <span className="font-semibold text-slate-900">{alloc.food.name}</span>
                      </div>
                      <div className="flex items-baseline gap-3 font-mono-num shrink-0">
                        <span className="text-base font-bold text-slate-950">{alloc.grams}g</span>
                        <span className="text-xs text-slate-500">
                          {alloc.calories}kcal · 탄 {Math.round(alloc.carbs)} / 단{' '}
                          {Math.round(alloc.protein)} / 지 {Math.round(alloc.fat)}g
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="md:col-span-4 p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex flex-col justify-center space-y-1">
                  <span className="text-xs font-semibold text-emerald-800">추천 조합 합계</span>
                  <p className="font-mono-num text-2xl font-bold text-slate-950">
                    +{recommendation.totals.calories.toLocaleString()} kcal
                  </p>
                  <p className="text-xs font-mono-num text-slate-700">
                    탄 {recommendation.totals.carbs}g · 단 {recommendation.totals.protein}g · 지{' '}
                    {recommendation.totals.fat}g
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* 3. 섭취 음식 기록 입력 + 오늘 섭취 목록 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* 좌측: 음식 기록 입력 폼 */}
        <section
          aria-labelledby="food-log-heading"
          className="lg:col-span-5 bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 space-y-5 shadow-xs"
        >
          <div className="flex items-center justify-between gap-2">
            <h2
              id="food-log-heading"
              className="font-display text-base font-semibold text-slate-900"
            >
              오늘 먹은 음식 기록
            </h2>
            <button
              type="button"
              onClick={onGoToMealPlanner}
              className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 hover:text-emerald-800 cursor-pointer"
            >
              <Utensils className="w-3.5 h-3.5" aria-hidden="true" />
              <span>식단 짜러 가기</span>
            </button>
          </div>

          <form onSubmit={handleSubmitLog} className="space-y-4" noValidate>
            {/* 끼니 선택 */}
            <div>
              <span className="block text-xs font-medium text-slate-500 mb-1.5">식사 구분</span>
              <div
                role="radiogroup"
                aria-label="식사 구분"
                className="grid grid-cols-4 gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200/70"
              >
                {MEAL_SLOT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    role="radio"
                    aria-checked={mealSlot === opt.value}
                    onClick={() => setMealSlot(opt.value)}
                    className={`py-1.5 px-1 min-h-[34px] rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                      mealSlot === opt.value
                        ? 'bg-white text-emerald-700 shadow-xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 자주 먹는 음식 빠른 선택 */}
            <div>
              <span className="block text-xs font-medium text-slate-500 mb-1.5">빠른 선택</span>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_PICK_IDS.map((id) => {
                  const item = PRESET_FOODS.find((f) => f.id === id);
                  if (!item) return null;
                  const active = foodName.trim() === item.name;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectPresetFood(item.id)}
                      className={`px-2.5 py-1.5 rounded-xl border text-xs font-medium transition-colors cursor-pointer ${
                        active
                          ? 'bg-emerald-50 border-emerald-600/70 text-emerald-900 font-semibold'
                          : 'bg-slate-50 border-slate-200/80 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {item.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 음식명 + 섭취량(g) */}
            <div className="grid grid-cols-12 gap-2.5">
              <div className="col-span-7">
                <label htmlFor="tracker-food-name" className="block text-xs font-medium text-slate-500 mb-1">
                  음식 이름
                </label>
                <input
                  id="tracker-food-name"
                  type="text"
                  value={foodName}
                  onChange={(e) => handleFoodNameInput(e.target.value)}
                  placeholder="예: 흰밥, 닭가슴살, 김밥"
                  className="w-full min-h-[40px] px-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-sm text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>
              <div className="col-span-5">
                <label htmlFor="tracker-grams" className="block text-xs font-medium text-slate-500 mb-1">
                  섭취량 (g)
                </label>
                <input
                  id="tracker-grams"
                  type="number"
                  min={1}
                  max={3000}
                  value={grams}
                  onChange={(e) => setGrams(e.target.value)}
                  className="w-full min-h-[40px] px-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-sm font-mono-num text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            {/* 100g당 영양성분 */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-500">100g당 영양성분 (g)</span>
                {matchedHint && (
                  <span className="text-[11px] text-emerald-700 font-medium">자동 입력됨</span>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label htmlFor="tracker-c100" className="block text-[10px] text-slate-400 mb-0.5">
                    탄수화물
                  </label>
                  <input
                    id="tracker-c100"
                    type="number"
                    min={0}
                    max={100}
                    step="0.1"
                    value={per100Carbs}
                    onChange={(e) => setPer100Carbs(e.target.value)}
                    placeholder={String(NEUTRAL_CUSTOM_DEFAULT_MACROS.carbs)}
                    className="w-full min-h-[36px] px-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-mono-num text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label htmlFor="tracker-p100" className="block text-[10px] text-slate-400 mb-0.5">
                    단백질
                  </label>
                  <input
                    id="tracker-p100"
                    type="number"
                    min={0}
                    max={100}
                    step="0.1"
                    value={per100Protein}
                    onChange={(e) => setPer100Protein(e.target.value)}
                    placeholder={String(NEUTRAL_CUSTOM_DEFAULT_MACROS.protein)}
                    className="w-full min-h-[36px] px-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-mono-num text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label htmlFor="tracker-f100" className="block text-[10px] text-slate-400 mb-0.5">
                    지방
                  </label>
                  <input
                    id="tracker-f100"
                    type="number"
                    min={0}
                    max={100}
                    step="0.1"
                    value={per100Fat}
                    onChange={(e) => setPer100Fat(e.target.value)}
                    placeholder={String(NEUTRAL_CUSTOM_DEFAULT_MACROS.fat)}
                    className="w-full min-h-[36px] px-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-mono-num text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between text-xs font-mono-num">
              <span className="text-slate-500">예상 영양소</span>
              <span className="text-slate-900 font-semibold">
                {previewMacros.calories} kcal (탄 {previewMacros.carbs} · 단{' '}
                {previewMacros.protein} · 지 {previewMacros.fat}g)
              </span>
            </div>

            {formError && (
              <p role="alert" className="text-xs text-rose-600">
                {formError}
              </p>
            )}

            <button
              type="submit"
              data-testid="add-food-log-btn"
              className="w-full min-h-[44px] px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              <span>섭취 기록 추가</span>
            </button>
          </form>
        </section>

        {/* 우측: 오늘 섭취 기록 목록 */}
        <section
          aria-label="오늘 섭취 내역"
          className="lg:col-span-7 bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 space-y-5 shadow-xs"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-base font-semibold text-slate-900">
                오늘 섭취 기록 ({entries.length}건)
              </h2>
              <p className="text-xs font-mono-num text-slate-500 mt-0.5">
                총 {rem.consumed.calories.toLocaleString()} kcal · 탄 {rem.consumed.carbs}g · 단{' '}
                {rem.consumed.protein}g · 지 {rem.consumed.fat}g
              </p>
            </div>
            {entries.length > 0 && (
              <button
                type="button"
                onClick={onClearEntries}
                data-testid="clear-tracker-btn"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-rose-600 text-xs font-medium transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                <span>전체 비우기</span>
              </button>
            )}
          </div>

          {entries.length === 0 ? (
            <div className="py-14 text-center space-y-3 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
              <p className="text-sm font-medium text-slate-700">아직 기록된 섭취 내역이 없습니다</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                왼쪽에서 식사별로 먹은 음식을 추가하거나, 식단 짜기 결과 페이지에서 &ldquo;오늘 식단으로 반영&rdquo; 버튼을 눌러 바로 불러올 수 있습니다.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {MEAL_SLOT_OPTIONS.map((slot) => {
                const slotItems = entries.filter((e) => e.mealSlot === slot.value);
                if (slotItems.length === 0) return null;
                const slotTotals = calculateTrackerTotals(slotItems);

                return (
                  <div
                    key={slot.value}
                    className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-2.5"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200/70">
                      <span className="text-xs sm:text-sm font-semibold text-slate-900">
                        {slot.label}
                      </span>
                      <span className="text-xs font-mono-num text-slate-600">
                        {slotTotals.calories.toLocaleString()} kcal (탄 {slotTotals.carbs} · 단{' '}
                        {slotTotals.protein} · 지 {slotTotals.fat}g)
                      </span>
                    </div>

                    <ul className="space-y-2">
                      {slotItems.map((entry) => (
                        <li
                          key={entry.id}
                          className="flex items-center justify-between gap-3 text-xs sm:text-sm"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className={`w-2 h-2 rounded-full shrink-0 ${CATEGORY_DOT[entry.category]}`}
                              aria-hidden="true"
                            />
                            <span className="font-medium text-slate-800 truncate">
                              {entry.foodName}
                            </span>
                            <span className="font-mono-num font-bold text-slate-950 shrink-0">
                              {entry.grams}g
                            </span>
                          </div>

                          <div className="flex items-center gap-2.5 shrink-0">
                            <span className="text-[11px] font-mono-num text-slate-500">
                              {entry.calories}kcal
                            </span>
                            <button
                              type="button"
                              onClick={() => onRemoveEntry(entry.id)}
                              aria-label={`${entry.foodName} 삭제`}
                              className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-white transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
