import React from 'react';
import { ArrowRight, RotateCcw } from 'lucide-react';
import {
  type ExperienceKey,
  type FitnessLevelKey,
  type FrequencyKey,
  type Gender,
  type LifestyleKey,
  type UserMetricsInput,
  type ValidationErrors,
} from '../utils/nutrition';

interface InputPanelProps {
  input: UserMetricsInput;
  errors: ValidationErrors;
  hasCalculated: boolean;
  onChange: <K extends keyof UserMetricsInput>(field: K, value: UserMetricsInput[K]) => void;
  onSubmit: (e: React.FormEvent) => void;
  onReset: () => void;
}

const LIFESTYLE_TILES: ReadonlyArray<{
  value: LifestyleKey;
  title: string;
  desc: string;
}> = [
  { value: 'sedentary', title: '좌식 위주', desc: '사무직 · 학생 · 재택' },
  { value: 'light', title: '가벼운 이동', desc: '출퇴근 · 일상 보행' },
  { value: 'active', title: '활동적 근무', desc: '서서 일함 · 이동 많음' },
  { value: 'very_active', title: '육체 활동', desc: '현장직 · 하루 종일 움직임' },
];

const FREQUENCY_STEPS: ReadonlyArray<{ value: FrequencyKey; label: string }> = [
  { value: 'freq_0', label: '안 함' },
  { value: 'freq_1', label: '1회' },
  { value: 'freq_2', label: '2회' },
  { value: 'freq_3', label: '3회' },
  { value: 'freq_4', label: '4회' },
  { value: 'freq_5', label: '5회' },
  { value: 'freq_6_7', label: '6~7회' },
];

const EXPERIENCE_STEPS: ReadonlyArray<{ value: ExperienceKey; label: string }> = [
  { value: 'exp_under_3m', label: '~3개월' },
  { value: 'exp_3_6m', label: '3~6개월' },
  { value: 'exp_6_12m', label: '6~12개월' },
  { value: 'exp_1_2y', label: '1~2년' },
  { value: 'exp_2_3y', label: '2~3년' },
  { value: 'exp_3_5y', label: '3~5년' },
  { value: 'exp_5y_plus', label: '5년+' },
];

const FITNESS_TILES: ReadonlyArray<{
  value: FitnessLevelKey;
  label: string;
  tag: string;
}> = [
  { value: 'fit_low', label: '조금만 걸어도 숨이 차고 쉽게 피곤함', tag: '입문' },
  { value: 'fit_walk', label: '30분 이상 걷기는 거뜬하지만 달리기는 힘듦', tag: '걷기' },
  { value: 'fit_jog', label: '1~2km (10~15분) 정도 가볍게 뛸 수 있음', tag: '조깅' },
  { value: 'fit_run_3_5', label: '3~5km (20~30분)를 멈추지 않고 달릴 수 있음', tag: '러닝' },
  { value: 'fit_run_10', label: '5~10km 이상 꾸준히 달리거나 고강도 운동 가능', tag: '고강도' },
];

export function InputPanel({
  input,
  errors,
  hasCalculated,
  onChange,
  onSubmit,
  onReset,
}: InputPanelProps) {

  return (
    <section
      id="calculator"
      aria-labelledby="input-panel-heading"
      className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs"
    >
      <div className="flex items-center justify-between gap-4 mb-4">
        <h2 id="input-panel-heading" className="font-display text-base font-semibold text-slate-900">
          신체 및 활동 정보
        </h2>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 min-h-[32px] rounded-xl text-xs font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 cursor-pointer"
          aria-label="입력값 초기화"
        >
          <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
          <span>초기화</span>
        </button>
      </div>

      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {/* 성별 + 나이/키/체중 */}
        <div className="space-y-2.5">
          <fieldset>
            <legend className="block text-xs font-medium text-slate-500 mb-1.5">성별</legend>
            <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-slate-100 border border-slate-200/70">
              <label className="relative cursor-pointer">
                <input
                  type="radio"
                  name="gender"
                  value="male"
                  checked={input.gender === 'male'}
                  onChange={() => onChange('gender', 'male' as Gender)}
                  className="sr-only peer"
                />
                <span className="flex items-center justify-center min-h-[36px] rounded-xl border border-transparent text-sm font-medium text-slate-600 peer-checked:bg-white peer-checked:text-emerald-700 peer-checked:border-emerald-600/30 peer-checked:shadow-xs peer-checked:font-semibold peer-focus-visible:ring-2 peer-focus-visible:ring-emerald-600 transition-colors">
                  남성
                </span>
              </label>
              <label className="relative cursor-pointer">
                <input
                  type="radio"
                  name="gender"
                  value="female"
                  checked={input.gender === 'female'}
                  onChange={() => onChange('gender', 'female' as Gender)}
                  className="sr-only peer"
                />
                <span className="flex items-center justify-center min-h-[36px] rounded-xl border border-transparent text-sm font-medium text-slate-600 peer-checked:bg-white peer-checked:text-emerald-700 peer-checked:border-emerald-600/30 peer-checked:shadow-xs peer-checked:font-semibold peer-focus-visible:ring-2 peer-focus-visible:ring-emerald-600 transition-colors">
                  여성
                </span>
              </label>
            </div>
          </fieldset>

          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label htmlFor="age-input" className="block text-xs font-medium text-slate-500 mb-1">
                나이
              </label>
              <div className="relative">
                <input
                  id="age-input"
                  type="number"
                  inputMode="numeric"
                  min={10}
                  max={110}
                  value={input.age}
                  onChange={(e) => onChange('age', e.target.value)}
                  aria-invalid={Boolean(errors.age)}
                  aria-describedby={errors.age ? 'age-error' : undefined}
                  className={`w-full min-h-[40px] px-3.5 pr-8 rounded-2xl border text-sm font-mono-num bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 transition-colors ${
                    errors.age
                      ? 'border-rose-500 focus:ring-rose-500/20'
                      : 'border-slate-200 focus:border-emerald-600 focus:ring-emerald-600/15'
                  }`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">
                  세
                </span>
              </div>
              {errors.age && (
                <p id="age-error" role="alert" className="mt-1 text-xs text-rose-600">
                  {errors.age}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="height-input" className="block text-xs font-medium text-slate-500 mb-1">
                키
              </label>
              <div className="relative">
                <input
                  id="height-input"
                  type="number"
                  inputMode="decimal"
                  step="0.5"
                  min={100}
                  max={240}
                  value={input.heightCm}
                  onChange={(e) => onChange('heightCm', e.target.value)}
                  aria-invalid={Boolean(errors.heightCm)}
                  aria-describedby={errors.heightCm ? 'height-error' : undefined}
                  className={`w-full min-h-[40px] px-3.5 pr-9 rounded-2xl border text-sm font-mono-num bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 transition-colors ${
                    errors.heightCm
                      ? 'border-rose-500 focus:ring-rose-500/20'
                      : 'border-slate-200 focus:border-emerald-600 focus:ring-emerald-600/15'
                  }`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">
                  cm
                </span>
              </div>
              {errors.heightCm && (
                <p id="height-error" role="alert" className="mt-1 text-xs text-rose-600">
                  {errors.heightCm}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="weight-input" className="block text-xs font-medium text-slate-500 mb-1">
                체중
              </label>
              <div className="relative">
                <input
                  id="weight-input"
                  type="number"
                  inputMode="decimal"
                  step="0.5"
                  min={25}
                  max={250}
                  value={input.weightKg}
                  onChange={(e) => onChange('weightKg', e.target.value)}
                  aria-invalid={Boolean(errors.weightKg)}
                  aria-describedby={errors.weightKg ? 'weight-error' : undefined}
                  className={`w-full min-h-[40px] px-3.5 pr-9 rounded-2xl border text-sm font-mono-num bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 transition-colors ${
                    errors.weightKg
                      ? 'border-rose-500 focus:ring-rose-500/20'
                      : 'border-slate-200 focus:border-emerald-600 focus:ring-emerald-600/15'
                  }`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">
                  kg
                </span>
              </div>
              {errors.weightKg && (
                <p id="weight-error" role="alert" className="mt-1 text-xs text-rose-600">
                  {errors.weightKg}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* 생활 습관 (4 타일) */}
        <div className="pt-3.5 border-t border-slate-100">
          <span id="lifestyle-label" className="block text-xs font-medium text-slate-500 mb-1.5">
            생활 습관
          </span>
          <div
            role="radiogroup"
            aria-labelledby="lifestyle-label"
            className="grid grid-cols-2 gap-2"
          >
            {LIFESTYLE_TILES.map((item) => {
              const active = input.lifestyle === item.value;
              return (
                <button
                  key={item.value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => onChange('lifestyle', item.value)}
                  className={`px-3 py-2 rounded-2xl border text-left transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 ${
                    active
                      ? 'bg-emerald-50/90 text-slate-950 border-emerald-600/70'
                      : 'bg-slate-50/80 text-slate-800 border-slate-200/80 hover:bg-slate-100'
                  }`}
                >
                  <span className="block text-xs font-semibold">{item.title}</span>
                  <span
                    className={`block mt-0.5 text-[11px] ${
                      active ? 'text-emerald-700' : 'text-slate-500'
                    }`}
                  >
                    {item.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 주간 운동 횟수 (7단계 버튼 바) */}
        <div>
          <span id="freq-label" className="block text-xs font-medium text-slate-500 mb-1.5">
            주간 운동 횟수
          </span>
          <div
            role="radiogroup"
            aria-labelledby="freq-label"
            className="grid grid-cols-7 gap-1 p-1 rounded-2xl bg-slate-100 border border-slate-200/70"
          >
            {FREQUENCY_STEPS.map((step) => {
              const active = input.frequency === step.value;
              return (
                <button
                  key={step.value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => onChange('frequency', step.value)}
                  className={`py-1.5 px-1 min-h-[34px] rounded-xl border text-[11px] sm:text-xs font-medium transition-colors whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 ${
                    active
                      ? 'bg-white text-emerald-700 border-emerald-600/30 shadow-xs font-semibold'
                      : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  {step.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 운동 구력 (7단계 버튼 바) */}
        <div>
          <span id="exp-label" className="block text-xs font-medium text-slate-500 mb-1.5">
            운동 구력
          </span>
          <div
            role="radiogroup"
            aria-labelledby="exp-label"
            className="grid grid-cols-4 sm:grid-cols-7 gap-1 p-1 rounded-2xl bg-slate-100 border border-slate-200/70"
          >
            {EXPERIENCE_STEPS.map((step) => {
              const active = input.experience === step.value;
              return (
                <button
                  key={step.value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => onChange('experience', step.value)}
                  className={`py-1.5 px-1 min-h-[34px] rounded-xl border text-[11px] font-medium transition-colors whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 ${
                    active
                      ? 'bg-white text-emerald-700 border-emerald-600/30 shadow-xs font-semibold'
                      : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  {step.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 체력 수준 (걷기 · 달리기 기준) */}
        <div>
          <span id="fitness-label" className="block text-xs font-medium text-slate-500 mb-1.5">
            체력 수준 (걷기 · 달리기 기준)
          </span>
          <div role="radiogroup" aria-labelledby="fitness-label" className="space-y-1.5">
            {FITNESS_TILES.map((item) => {
              const active = input.fitnessLevel === item.value;
              return (
                <button
                  key={item.value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => onChange('fitnessLevel', item.value)}
                  className={`w-full px-3.5 py-2 min-h-[36px] rounded-xl border flex items-center justify-between gap-3 text-left transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 ${
                    active
                      ? 'bg-emerald-50/90 text-slate-950 border-emerald-600/70'
                      : 'bg-slate-50/80 text-slate-700 border-slate-200/80 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-xs font-medium">{item.label}</span>
                  <span
                    className={`text-[11px] font-mono-num shrink-0 ${
                      active ? 'text-emerald-700 font-semibold' : 'text-slate-400'
                    }`}
                  >
                    {item.tag}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="submit"
          className="w-full min-h-[46px] px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-sm font-bold inline-flex items-center justify-center gap-2 transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 cursor-pointer"
        >
          <span>{hasCalculated ? '다시 계산하기' : '계산하기'}</span>
          <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
        </button>
      </form>
    </section>
  );
}
