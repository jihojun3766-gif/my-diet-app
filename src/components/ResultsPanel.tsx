import { AlertTriangle, ArrowRight } from 'lucide-react';
import { type NutritionCalculationResult } from '../utils/nutrition';

interface ResultsPanelProps {
  hasCalculated: boolean;
  revealKey: number;
  result: NutritionCalculationResult | null;
  currentWeightKg: number | string;
  hasErrors: boolean;
  onGoToWeightPlan: () => void;
}

export function ResultsPanel({
  hasCalculated,
  revealKey,
  result,
  currentWeightKg,
  hasErrors,
  onGoToWeightPlan,
}: ResultsPanelProps) {
  if (!hasCalculated) {
    return (
      <section
        id="results"
        aria-label="계산 결과 대기"
        className="bg-white border border-slate-200/90 rounded-3xl p-8 sm:p-10 flex flex-col justify-center items-center text-center min-h-[440px] shadow-xs"
      >
        <svg
          width="96"
          height="96"
          viewBox="0 0 96 96"
          aria-hidden="true"
          className="mb-6"
        >
          <circle
            cx="48"
            cy="48"
            r="38"
            fill="none"
            stroke="#E2E8F0"
            strokeWidth="8"
          />
          <circle
            cx="48"
            cy="48"
            r="38"
            fill="none"
            stroke="#059669"
            strokeWidth="8"
            strokeDasharray="119 239"
            strokeLinecap="round"
            transform="rotate(-90 48 48)"
          />
        </svg>
        <h2 className="font-display text-xl font-semibold text-slate-900">
          정보를 선택하고 계산하기를 눌러 주세요
        </h2>
        <p className="mt-2 text-sm text-slate-500 max-w-xs leading-relaxed">
          유지 칼로리와 기초대사량을 계산한 뒤 목표 체중을 설정해 맞춤 식단을 짤 수 있습니다.
        </p>
      </section>
    );
  }

  if (hasErrors || !result) {
    return (
      <section
        id="results"
        aria-label="입력 오류 안내"
        className="bg-white border border-rose-200 rounded-3xl p-8 shadow-xs"
      >
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <h2 className="font-display text-base font-semibold text-slate-900">
              입력 값을 확인해 주세요
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              나이, 키, 체중을 올바른 범위로 입력하면 결과가 바로 계산됩니다.
            </p>
          </div>
        </div>
      </section>
    );
  }

  // SVG Donut ring math (radius = 42, circumference = 2 * pi * 42 = 263.89)
  const C = 263.89;
  const carbLen = C * 0.5;
  const proteinLen = C * 0.3;
  const fatLen = C * 0.2;

  return (
    <section
      id="results"
      key={revealKey}
      aria-live="polite"
      aria-label="계산 결과"
      className="animate-result-reveal bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 space-y-6 shadow-xs"
    >
      {/* 1. 하루 유지 칼로리 + 기초대사량 + 생활 반영 대사량 */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span className="text-xs font-semibold text-emerald-700">하루 유지 칼로리</span>
          <span className="text-xs font-mono-num text-slate-500">
            현재 체중 {currentWeightKg || 72}kg 기준
          </span>
        </div>

        <p
          data-testid="result-tdee"
          className="font-mono-num text-4xl sm:text-5xl font-bold tracking-tight text-slate-950"
        >
          {result.tdee.toLocaleString()}
          <span className="text-lg font-normal text-slate-500 ml-2">kcal</span>
        </p>

        <div className="grid grid-cols-2 gap-3 mt-5 pt-5 border-t border-slate-100">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
            <p className="text-xs font-medium text-slate-500">기초대사량</p>
            <p
              data-testid="result-bmr"
              className="mt-1 font-mono-num text-lg sm:text-xl font-semibold text-slate-900"
            >
              {result.bmr.toLocaleString()}
              <span className="text-xs font-normal text-slate-500 ml-1">kcal</span>
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
            <p className="text-xs font-medium text-slate-500">생활 반영 대사량</p>
            <p className="mt-1 font-mono-num text-lg sm:text-xl font-semibold text-slate-900">
              {result.lifestyleMetabolism.toLocaleString()}
              <span className="text-xs font-normal text-slate-500 ml-1">kcal</span>
            </p>
          </div>
        </div>
      </div>

      {/* 2. SVG 5:3:2 도넛 차트 + 식품 환산량 */}
      <div className="pt-5 border-t border-slate-100">
        <div className="flex items-center gap-5 mb-5">
          <div className="relative w-24 h-24 shrink-0">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90" aria-hidden="true">
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="#F59E0B"
                strokeWidth="10"
                strokeDasharray={`${carbLen} ${C}`}
                strokeDashoffset={0}
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="#10B981"
                strokeWidth="10"
                strokeDasharray={`${proteinLen} ${C}`}
                strokeDashoffset={-carbLen}
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="#0EA5E9"
                strokeWidth="10"
                strokeDasharray={`${fatLen} ${C}`}
                strokeDashoffset={-(carbLen + proteinLen)}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-mono-num text-xs font-semibold text-slate-900">5:3:2</span>
            </div>
          </div>

          <div>
            <h3 className="font-display text-base font-semibold text-slate-900">
              유지 기준 탄단지 5:3:2
            </h3>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
              탄수화물 50% · 단백질 30% · 지방 20%
            </p>
          </div>
        </div>

        <div className="space-y-2.5">
          {/* 탄수화물 */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" aria-hidden="true" />
              <span className="text-sm font-medium text-slate-800">탄수화물</span>
              <span className="text-xs font-mono-num text-slate-400">50%</span>
            </div>
            <div className="flex flex-wrap items-baseline gap-x-2.5 ml-auto">
              <span
                data-testid="result-carbs-g"
                className="font-mono-num text-lg font-bold text-slate-950"
              >
                {result.macros.carbs.grams.toLocaleString()}g
              </span>
              <span
                data-testid="result-food-rice"
                className="text-xs sm:text-sm font-mono-num text-amber-700 font-medium"
              >
                약 흰밥 {result.foods.riceTotalGrams.toLocaleString()}g ({result.foods.riceBowls}그릇)
              </span>
            </div>
          </div>

          {/* 단백질 */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" aria-hidden="true" />
              <span className="text-sm font-medium text-slate-800">단백질</span>
              <span className="text-xs font-mono-num text-slate-400">30%</span>
            </div>
            <div className="flex flex-wrap items-baseline gap-x-2.5 ml-auto">
              <span
                data-testid="result-protein-g"
                className="font-mono-num text-lg font-bold text-slate-950"
              >
                {result.macros.protein.grams.toLocaleString()}g
              </span>
              <span
                data-testid="result-food-chicken"
                className="text-xs sm:text-sm font-mono-num text-emerald-700 font-medium"
              >
                약 닭가슴살 {result.foods.chickenTotalGrams.toLocaleString()}g ({result.foods.chickenPacks}팩)
              </span>
            </div>
          </div>

          {/* 지방 */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-500 shrink-0" aria-hidden="true" />
              <span className="text-sm font-medium text-slate-800">지방</span>
              <span className="text-xs font-mono-num text-slate-400">20%</span>
            </div>
            <div className="flex flex-wrap items-baseline gap-x-2.5 ml-auto">
              <span
                data-testid="result-fat-g"
                className="font-mono-num text-lg font-bold text-slate-950"
              >
                {result.macros.fat.grams.toLocaleString()}g
              </span>
              <span
                data-testid="result-food-oil"
                className="text-xs sm:text-sm font-mono-num text-sky-700 font-medium"
              >
                약 올리브오일 {result.foods.oliveOilTotalGrams.toLocaleString()}g ({result.foods.oliveOilTablespoons}큰술)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. 다음 단계: 목표 설정 페이지 이동 버튼 */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onGoToWeightPlan}
          data-testid="go-to-weight-plan"
          className="w-full min-h-[48px] px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 cursor-pointer"
        >
          <span>목표 설정하러 가기</span>
          <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
