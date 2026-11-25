import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, CheckCircle2, AlertCircle, Utensils } from 'lucide-react';
import type { UserMetricsInput } from '../utils/nutrition';
import {
  calculateSimpleWeightPlan,
  getRealisticDurationPresets,
  getRecommendedDurationWeeks,
} from '../utils/roadmap';

interface DietRoadmapPageProps {
  metrics: UserMetricsInput;
  targetWeightKg: number;
  durationWeeks: number;
  onChangeTargetWeight: (nextTargetKg: number, nextDurationWeeks?: number) => void;
  onChangeDurationWeeks: (weeks: number) => void;
  onUseRoadmapCalories: (calories: number) => void;
}

const QUICK_DELTAS = [-5, -3, 0, 3, 5] as const;

export function DietRoadmapPage({
  metrics,
  targetWeightKg,
  durationWeeks,
  onChangeTargetWeight,
  onChangeDurationWeeks,
  onUseRoadmapCalories,
}: DietRoadmapPageProps) {
  const currentWeightKg = useMemo(() => {
    const num = Number(metrics.weightKg);
    return Number.isFinite(num) && num >= 25 ? Number(num.toFixed(1)) : 72;
  }, [metrics.weightKg]);

  const [targetInputStr, setTargetInputStr] = useState<string>(() => String(targetWeightKg));
  const [customWeeksStr, setCustomWeeksStr] = useState<string>(() => String(durationWeeks));
  const [targetError, setTargetError] = useState<string>('');

  useEffect(() => {
    setTargetInputStr(String(targetWeightKg));
    setTargetError('');
  }, [targetWeightKg]);

  useEffect(() => {
    setCustomWeeksStr(String(durationWeeks));
  }, [durationWeeks]);

  const durationPresets = useMemo(
    () => getRealisticDurationPresets(currentWeightKg, targetWeightKg),
    [currentWeightKg, targetWeightKg],
  );

  const plan = useMemo(
    () => calculateSimpleWeightPlan(metrics, targetWeightKg, durationWeeks),
    [metrics, targetWeightKg, durationWeeks],
  );

  function applyTargetWeight(nextTarget: number) {
    const clamped = Number(Math.max(30, Math.min(220, nextTarget)).toFixed(1));
    const recWeeks = getRecommendedDurationWeeks(currentWeightKg, clamped);
    setTargetInputStr(String(clamped));
    setCustomWeeksStr(String(recWeeks));
    setTargetError('');
    onChangeTargetWeight(clamped, recWeeks);
  }

  function handleTargetInputChange(raw: string) {
    setTargetInputStr(raw);
    const trimmed = raw.trim();
    if (trimmed === '') {
      setTargetError('목표 체중을 입력해 주세요.');
      return;
    }
    const parsed = Number(trimmed);
    if (!Number.isFinite(parsed) || parsed < 30 || parsed > 220) {
      setTargetError('30 ~ 220kg 사이로 입력해 주세요.');
      return;
    }
    setTargetError('');
    const rounded = Number(parsed.toFixed(1));
    const nextRecWeeks = getRecommendedDurationWeeks(currentWeightKg, rounded);
    onChangeTargetWeight(rounded, nextRecWeeks);
  }

  function handleTargetInputBlur() {
    const parsed = Number(targetInputStr.trim());
    if (!Number.isFinite(parsed) || parsed < 30 || parsed > 220) {
      setTargetInputStr(String(targetWeightKg));
      setTargetError('');
      return;
    }
    const rounded = Number(parsed.toFixed(1));
    setTargetInputStr(String(rounded));
    setTargetError('');
  }

  function handleSelectWeeks(weeks: number) {
    const safeWeeks = Math.max(1, Math.min(104, Math.round(weeks)));
    setCustomWeeksStr(String(safeWeeks));
    onChangeDurationWeeks(safeWeeks);
  }

  function handleCustomWeeksChange(raw: string) {
    setCustomWeeksStr(raw);
    const parsed = Number(raw.trim());
    if (Number.isFinite(parsed) && parsed >= 1 && parsed <= 104) {
      onChangeDurationWeeks(Math.round(parsed));
    }
  }

  function handleCustomWeeksBlur() {
    const parsed = Number(customWeeksStr.trim());
    if (!Number.isFinite(parsed) || parsed < 1 || parsed > 104) {
      setCustomWeeksStr(String(durationWeeks));
      return;
    }
    const safe = Math.round(parsed);
    setCustomWeeksStr(String(safe));
    onChangeDurationWeeks(safe);
  }

  function handleGoToMealPlanner() {
    onUseRoadmapCalories(plan.dailyCalories);
  }

  return (
    <div className="space-y-5 animate-result-reveal max-w-4xl mx-auto">
      {/* 1. 입력 카드: 현재 체중 확인 + 목표 체중 + 현실적인 기간 */}
      <section
        aria-labelledby="weight-plan-heading"
        className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-7 space-y-6 shadow-xs"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 id="weight-plan-heading" className="font-display text-lg sm:text-xl font-bold text-slate-900">
              목표 체중 계획
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              앞에서 입력한 현재 체중을 기준으로 목표 체중과 기간만 고르면 다이어트·유지·벌크업 중 무엇을 해야 하는지 바로 알려드려요.
            </p>
          </div>

          <div className="px-3.5 py-2 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 font-mono-num shrink-0">
            현재 체중 <strong className="text-slate-950 font-semibold">{currentWeightKg}kg</strong>
            <span className="mx-1.5 text-slate-300">·</span>
            유지 <strong className="text-slate-950 font-semibold">{plan.maintenanceCalories.toLocaleString()}kcal</strong>
          </div>
        </div>

        {/* Step 1: 목표 체중 설정 */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label htmlFor="plan-target-weight" className="text-sm font-semibold text-slate-900">
              1. 목표 체중이 몇 kg인가요?
            </label>
            <span
              data-testid="plan-direction-badge"
              className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${
                plan.planType === 'diet'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-600/20'
                  : plan.planType === 'bulk'
                    ? 'bg-sky-50 text-sky-700 border border-sky-600/20'
                    : 'bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              {plan.planBadge}
              {plan.diffKg !== 0 && ` (${plan.diffKg > 0 ? '+' : ''}${plan.diffKg}kg)`}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="relative w-full sm:w-44 shrink-0">
              <input
                id="plan-target-weight"
                type="text"
                inputMode="decimal"
                value={targetInputStr}
                onChange={(e) => handleTargetInputChange(e.target.value)}
                onBlur={handleTargetInputBlur}
                className="w-full min-h-[46px] px-4 pr-11 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white text-base font-mono-num font-semibold text-slate-950 focus:outline-none focus:border-emerald-600"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
                kg
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {QUICK_DELTAS.map((delta) => {
                const candidate = Number(Math.max(30, Math.min(220, currentWeightKg + delta)).toFixed(1));
                const active = Math.abs(targetWeightKg - candidate) < 0.05;
                const label =
                  delta === 0
                    ? `현재 유지 (${candidate}kg)`
                    : `${delta > 0 ? `+${delta}` : delta}kg (${candidate}kg)`;
                return (
                  <button
                    key={delta}
                    type="button"
                    onClick={() => applyTargetWeight(candidate)}
                    className={`px-3 py-2 min-h-[38px] rounded-xl border text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                      active
                        ? 'bg-emerald-50 border-emerald-600/70 text-emerald-800 font-semibold'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {targetError && (
            <p role="alert" className="text-xs text-rose-600">
              {targetError}
            </p>
          )}
        </div>

        {/* Step 2: 현실적인 기간 선택 */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm font-semibold text-slate-900">
              2. 어느 정도 기간으로 생각하고 있나요?
            </span>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <label htmlFor="plan-custom-weeks" className="whitespace-nowrap">
                직접 입력:
              </label>
              <div className="relative w-20">
                <input
                  id="plan-custom-weeks"
                  type="number"
                  min={1}
                  max={104}
                  value={customWeeksStr}
                  onChange={(e) => handleCustomWeeksChange(e.target.value)}
                  onBlur={handleCustomWeeksBlur}
                  className="w-full min-h-[34px] px-2.5 pr-6 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-mono-num text-slate-900 focus:outline-none focus:border-emerald-600"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] text-slate-400">
                  주
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {durationPresets.map((preset) => {
              const active = durationWeeks === preset.weeks;
              return (
                <button
                  key={preset.weeks}
                  type="button"
                  aria-pressed={active}
                  onClick={() => handleSelectWeeks(preset.weeks)}
                  className={`p-3.5 rounded-2xl border text-left transition-colors cursor-pointer ${
                    active
                      ? 'bg-emerald-50/80 border-emerald-600/80 text-slate-950'
                      : 'bg-slate-50 border-slate-200/80 text-slate-700 hover:bg-slate-100/80'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="text-sm font-bold text-slate-950 font-mono-num">
                      {preset.label}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-600">{preset.paceText}</p>
                  <span
                    className={`mt-2 inline-block text-[11px] font-semibold ${
                      !preset.isRealistic
                        ? 'text-amber-700'
                        : preset.isRecommended || active
                          ? 'text-emerald-700'
                          : 'text-slate-500'
                    }`}
                  >
                    {preset.tag}
                  </span>
                </button>
              );
            })}
          </div>

          {plan.realismStatus !== 'good' && (
            <div
              role="status"
              className={`p-3.5 rounded-2xl border flex flex-wrap items-center justify-between gap-3 ${
                plan.realismStatus === 'too_fast'
                  ? 'bg-amber-50 border-amber-300/80 text-amber-900'
                  : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <div className="flex items-start gap-2 text-xs leading-relaxed">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" aria-hidden="true" />
                <span>{plan.realismMessage}</span>
              </div>
              {plan.realismStatus === 'too_fast' && (
                <button
                  type="button"
                  onClick={() => handleSelectWeeks(plan.minRecommendedWeeks)}
                  className="px-3 py-1.5 rounded-xl bg-white border border-amber-300 hover:bg-amber-100/50 text-amber-900 text-xs font-semibold transition-colors cursor-pointer shrink-0"
                >
                  {plan.minRecommendedWeeks}주로 맞추기
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* 2. 결과 카드: 해야 할 일 요약 + 칼로리/탄단지 + 예상 흐름 + 식단 연결 */}
      <section
        aria-labelledby="plan-summary-heading"
        className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-7 space-y-6 shadow-xs"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="inline-block text-xs font-semibold text-emerald-700">
              맞춤 방향 안내
            </span>
            <h3 id="plan-summary-heading" className="font-display text-lg sm:text-xl font-bold text-slate-950 mt-0.5">
              {plan.planHeadline}
            </h3>
          </div>
        </div>

        {/* 3개 핵심 숫자 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
            <span className="block text-xs text-slate-500">해야 할 목표</span>
            <p data-testid="plan-result-type" className="mt-1 font-display text-xl sm:text-2xl font-bold text-slate-950">
              {plan.planBadge}
            </p>
            <span className="block text-xs text-slate-500 mt-1 font-mono-num">
              {plan.planType === 'maintain'
                ? '현재 체중 유지'
                : `주당 약 ${Math.abs(plan.weeklyChangeKg)}kg ${plan.planType === 'diet' ? '감량' : '증량'}`}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-600/25">
            <span className="block text-xs font-medium text-emerald-800">하루 권장 칼로리</span>
            <p data-testid="plan-daily-calories" className="mt-1 font-mono-num text-xl sm:text-2xl font-bold text-slate-950">
              {plan.dailyCalories.toLocaleString()}
              <span className="text-xs font-normal text-slate-500 ml-1">kcal</span>
            </p>
            <span className="block text-xs text-emerald-700 mt-1 font-mono-num">
              {plan.actualDailyDelta === 0
                ? '유지 칼로리와 동일'
                : `유지보다 하루 ${plan.actualDailyDelta > 0 ? '+' : ''}${plan.actualDailyDelta.toLocaleString()}kcal`}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
            <span className="block text-xs text-slate-500">하루 탄 · 단 · 지 (5:3:2)</span>
            <p className="mt-1.5 font-mono-num text-sm sm:text-base font-bold text-slate-950 flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
              <span className="whitespace-nowrap">탄 {plan.macros.carbs}g</span>
              <span className="text-slate-300">·</span>
              <span className="whitespace-nowrap">단 {plan.macros.protein}g</span>
              <span className="text-slate-300">·</span>
              <span className="whitespace-nowrap">지 {plan.macros.fat}g</span>
            </p>
            <span className="block text-xs text-slate-500 mt-1.5">
              {plan.durationLabel} 기준
            </span>
          </div>
        </div>

        {/* 간단한 체중 변화 흐름 */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <span className="block text-xs font-semibold text-slate-500">
            예상 체중 변화 흐름
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
            {plan.milestones.map((m, idx) => {
              const isLast = idx === plan.milestones.length - 1;
              return (
                <div
                  key={`${m.week}-${idx}`}
                  className={`p-3 rounded-2xl border ${
                    isLast
                      ? 'bg-emerald-50/70 border-emerald-600/30'
                      : 'bg-slate-50 border-slate-200/70'
                  }`}
                >
                  <span className={`block text-[11px] font-medium ${isLast ? 'text-emerald-700' : 'text-slate-500'}`}>
                    {m.label}
                  </span>
                  <span className="block mt-1 font-mono-num text-base font-bold text-slate-950">
                    {m.weightKg}kg
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 쉬운 실천 가이드 */}
        <div className="pt-4 border-t border-slate-100 space-y-2.5">
          <span className="block text-xs font-semibold text-slate-500">
            이렇게 진행하면 돼요
          </span>
          <ul className="space-y-2">
            {plan.actionGuides.map((guide, i) => (
              <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700 leading-relaxed">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
                <span>{guide}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 설정 완료 후 마지막 식단 짜러 가기 버튼 */}
        <div className="pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={handleGoToMealPlanner}
            data-testid="roadmap-go-meal-planner"
            className="w-full min-h-[50px] px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-sm font-bold inline-flex items-center justify-center gap-2 transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 cursor-pointer"
          >
            <Utensils className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>{plan.dailyCalories.toLocaleString()}kcal ({plan.planBadge})로 식단 짜러 가기</span>
            <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
          </button>
        </div>
      </section>
    </div>
  );
}
