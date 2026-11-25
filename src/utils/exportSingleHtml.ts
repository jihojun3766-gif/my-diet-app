import {
  CUSTOM_FOOD_DICTIONARY,
  MEAL_COUNT_OPTIONS,
  NEUTRAL_CUSTOM_DEFAULT_MACROS,
  PRESET_FOODS,
} from './mealPlanner';
import {
  EXPERIENCE_OPTIONS,
  FITNESS_LEVEL_OPTIONS,
  FOOD_CONSTANTS,
  FREQUENCY_OPTIONS,
  LIFESTYLE_OPTIONS,
} from './nutrition';

export function buildStandaloneHtmlDocument(): string {
  const lifestyleJson = JSON.stringify(LIFESTYLE_OPTIONS);
  const experienceJson = JSON.stringify(EXPERIENCE_OPTIONS);
  const frequencyJson = JSON.stringify(FREQUENCY_OPTIONS);
  const fitnessJson = JSON.stringify(FITNESS_LEVEL_OPTIONS);
  const foodConstantsJson = JSON.stringify(FOOD_CONSTANTS);
  const presetFoodsJson = JSON.stringify(PRESET_FOODS);
  const customDictJson = JSON.stringify(CUSTOM_FOOD_DICTIONARY);
  const neutralCustomJson = JSON.stringify(NEUTRAL_CUSTOM_DEFAULT_MACROS);
  const mealCountsJson = JSON.stringify(MEAL_COUNT_OPTIONS);

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>내몸맞춤식단계획생성기</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Noto+Sans+KR:wght@400;500;600;700&family=Outfit:wght@500;600;700&display=swap" rel="stylesheet" />
  <style>
    html { color-scheme: light; }
    body { font-family: 'Noto Sans KR', system-ui, sans-serif; background-color: #f6f7f9; color: #0f172a; }
    .font-display { font-family: 'Outfit', 'Noto Sans KR', system-ui, sans-serif; }
    .font-mono-num { font-family: 'JetBrains Mono', monospace; font-variant-numeric: tabular-nums; }
    @keyframes reveal {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-reveal { animation: reveal 200ms cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  </style>
</head>
<body class="antialiased min-h-screen">
  <header class="border-b border-slate-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-30">
    <div class="max-w-6xl mx-auto px-3 sm:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
      <button type="button" id="brand-btn" class="font-display text-[13px] sm:text-lg font-bold tracking-tight text-slate-900 hover:text-emerald-700 transition-colors cursor-pointer whitespace-nowrap shrink-0">
        내몸맞춤식단계획생성기
      </button>
      <nav aria-label="주요 메뉴" class="flex items-center gap-3 sm:gap-6">
        <button type="button" id="nav-calc-btn" class="relative h-16 inline-flex items-center px-0.5 sm:px-1 text-xs sm:text-sm font-semibold text-slate-950 whitespace-nowrap cursor-pointer">
          <span>칼로리 계산</span>
          <span id="nav-calc-bar" class="absolute bottom-0 left-0 right-0 h-[2px] bg-emerald-600 rounded-full"></span>
        </button>
        <button type="button" id="nav-roadmap-btn" class="relative h-16 inline-flex items-center px-0.5 sm:px-1 text-xs sm:text-sm font-medium text-slate-500 hover:text-slate-900 whitespace-nowrap cursor-pointer">
          <span>목표 체중 계획</span>
          <span id="nav-roadmap-bar" class="hidden absolute bottom-0 left-0 right-0 h-[2px] bg-emerald-600 rounded-full"></span>
        </button>
        <button type="button" id="nav-planner-btn" class="relative h-16 inline-flex items-center px-0.5 sm:px-1 text-xs sm:text-sm font-medium text-slate-500 hover:text-slate-900 whitespace-nowrap cursor-pointer">
          <span>식단 짜기</span>
          <span id="nav-planner-bar" class="hidden absolute bottom-0 left-0 right-0 h-[2px] bg-emerald-600 rounded-full"></span>
        </button>
      </nav>
    </div>
  </header>

  <main class="max-w-6xl mx-auto px-4 sm:px-8 py-5 sm:py-6">
    <!-- PAGE 1: 칼로리 · 탄단지 계산기 -->
    <div id="view-calculator" class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <section id="calculator" class="lg:col-span-7 bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs">
        <div class="flex items-center justify-between gap-3 mb-4">
          <h2 class="font-display text-base font-semibold text-slate-900">신체 및 활동 정보</h2>
          <button type="button" id="reset-calc-btn" class="text-xs font-medium text-slate-500 hover:text-slate-900 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
            초기화
          </button>
        </div>

        <form id="macro-form" class="space-y-4" novalidate>
          <div class="space-y-2.5">
            <div>
              <span class="block text-xs font-medium text-slate-500 mb-1.5">성별</span>
              <div class="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-slate-100 border border-slate-200/70">
                <label class="cursor-pointer">
                  <input type="radio" name="gender" value="male" checked class="sr-only peer" />
                  <span class="flex items-center justify-center min-h-[36px] rounded-xl border border-transparent text-sm font-medium text-slate-600 peer-checked:bg-white peer-checked:text-emerald-700 peer-checked:border-emerald-600/30 peer-checked:shadow-xs peer-checked:font-semibold transition-colors">남성</span>
                </label>
                <label class="cursor-pointer">
                  <input type="radio" name="gender" value="female" class="sr-only peer" />
                  <span class="flex items-center justify-center min-h-[36px] rounded-xl border border-transparent text-sm font-medium text-slate-600 peer-checked:bg-white peer-checked:text-emerald-700 peer-checked:border-emerald-600/30 peer-checked:shadow-xs peer-checked:font-semibold transition-colors">여성</span>
                </label>
              </div>
            </div>

            <div class="grid grid-cols-3 gap-2.5">
              <div>
                <label for="age" class="block text-xs font-medium text-slate-500 mb-1">나이</label>
                <div class="relative">
                  <input id="age" type="number" value="28" min="10" max="110" class="w-full min-h-[40px] px-3.5 pr-8 rounded-2xl border border-slate-200 text-sm font-mono-num bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-600" />
                  <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">세</span>
                </div>
              </div>
              <div>
                <label for="height" class="block text-xs font-medium text-slate-500 mb-1">키</label>
                <div class="relative">
                  <input id="height" type="number" value="175" min="100" max="240" class="w-full min-h-[40px] px-3.5 pr-9 rounded-2xl border border-slate-200 text-sm font-mono-num bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-600" />
                  <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">cm</span>
                </div>
              </div>
              <div>
                <label for="weight" class="block text-xs font-medium text-slate-500 mb-1">체중</label>
                <div class="relative">
                  <input id="weight" type="number" value="72" min="25" max="250" class="w-full min-h-[40px] px-3.5 pr-9 rounded-2xl border border-slate-200 text-sm font-mono-num bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-600" />
                  <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">kg</span>
                </div>
              </div>
            </div>
            <p id="form-error" class="hidden text-xs text-rose-600" role="alert"></p>
          </div>

          <div class="pt-3.5 border-t border-slate-100">
            <span class="block text-xs font-medium text-slate-500 mb-1.5">생활 습관</span>
            <div id="lifestyle-group" class="grid grid-cols-2 gap-2"></div>
          </div>

          <div>
            <span class="block text-xs font-medium text-slate-500 mb-1.5">주간 운동 횟수</span>
            <div id="frequency-group" class="grid grid-cols-7 gap-1 p-1 rounded-2xl bg-slate-100 border border-slate-200/70"></div>
          </div>

          <div>
            <span class="block text-xs font-medium text-slate-500 mb-1.5">운동 구력</span>
            <div id="experience-group" class="grid grid-cols-4 sm:grid-cols-7 gap-1 p-1 rounded-2xl bg-slate-100 border border-slate-200/70"></div>
          </div>

          <div>
            <span class="block text-xs font-medium text-slate-500 mb-1.5">체력 수준 (걷기 · 달리기 기준)</span>
            <div id="fitness-group" class="space-y-1.5"></div>
          </div>

          <button type="submit" class="w-full min-h-[46px] px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold transition-colors cursor-pointer">
            계산하기
          </button>
        </form>
      </section>

      <section id="results" class="lg:col-span-5 lg:sticky lg:top-20">
        <div id="empty-state" class="bg-white border border-slate-200/90 rounded-3xl p-8 sm:p-10 flex flex-col justify-center items-center text-center min-h-[440px] shadow-xs">
          <svg width="96" height="96" viewBox="0 0 96 96" aria-hidden="true" class="mb-6">
            <circle cx="48" cy="48" r="38" fill="none" stroke="#E2E8F0" stroke-width="8" />
            <circle cx="48" cy="48" r="38" fill="none" stroke="#059669" stroke-width="8" stroke-dasharray="119 239" stroke-linecap="round" transform="rotate(-90 48 48)" />
          </svg>
          <h2 class="font-display text-xl font-semibold text-slate-900">정보를 선택하고 계산하기를 눌러 주세요</h2>
          <p class="mt-2 text-sm text-slate-500 max-w-xs leading-relaxed">유지 칼로리와 기초대사량을 계산한 뒤 목표 체중을 설정해 맞춤 식단을 짤 수 있습니다.</p>
        </div>

        <div id="result-content" class="hidden bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 space-y-6 shadow-xs">
          <div>
            <div class="flex items-center justify-between gap-2 mb-1.5">
              <span class="text-xs font-semibold text-emerald-700">하루 유지 칼로리</span>
              <span id="out-current-weight-label" class="text-xs font-mono-num text-slate-500">-</span>
            </div>
            <p id="out-tdee" class="font-mono-num text-4xl sm:text-5xl font-bold tracking-tight text-slate-950">-</p>
            <div class="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-100">
              <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70">
                <p class="text-xs font-medium text-slate-500">기초대사량</p>
                <p id="out-bmr" class="mt-1 font-mono-num text-lg sm:text-xl font-semibold text-slate-900">-</p>
              </div>
              <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70">
                <p class="text-xs font-medium text-slate-500">생활 반영 대사량</p>
                <p id="out-lifestyle" class="mt-1 font-mono-num text-lg sm:text-xl font-semibold text-slate-900">-</p>
              </div>
            </div>
          </div>

          <div class="pt-5 border-t border-slate-100">
            <div class="flex items-center gap-5 mb-5">
              <div class="relative w-24 h-24 shrink-0">
                <svg viewBox="0 0 100 100" class="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="#F59E0B" stroke-width="10" stroke-dasharray="131.945 263.89" stroke-dashoffset="0" />
                  <circle cx="50" cy="50" r="42" fill="none" stroke="#10B981" stroke-width="10" stroke-dasharray="79.167 263.89" stroke-dashoffset="-131.945" />
                  <circle cx="50" cy="50" r="42" fill="none" stroke="#0EA5E9" stroke-width="10" stroke-dasharray="52.778 263.89" stroke-dashoffset="-211.112" />
                </svg>
                <div class="absolute inset-0 flex items-center justify-center"><span class="font-mono-num text-xs font-semibold text-slate-900">5:3:2</span></div>
              </div>
              <div>
                <h3 class="font-display text-base font-semibold text-slate-900">유지 기준 탄단지 5:3:2</h3>
                <p class="mt-1 text-xs text-slate-500">탄수화물 50% · 단백질 30% · 지방 20%</p>
              </div>
            </div>

            <div class="space-y-2.5">
              <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <div class="flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-amber-500"></span><span class="text-sm font-medium text-slate-800">탄수화물</span><span class="text-xs font-mono-num text-slate-400">50%</span></div>
                <div class="flex flex-wrap items-baseline gap-x-2.5 ml-auto"><span id="out-carbs" class="font-mono-num text-lg font-bold text-slate-950">-</span><span id="out-rice" class="text-xs sm:text-sm font-mono-num text-amber-700 font-medium">-</span></div>
              </div>
              <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <div class="flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-emerald-500"></span><span class="text-sm font-medium text-slate-800">단백질</span><span class="text-xs font-mono-num text-slate-400">30%</span></div>
                <div class="flex flex-wrap items-baseline gap-x-2.5 ml-auto"><span id="out-protein" class="font-mono-num text-lg font-bold text-slate-950">-</span><span id="out-chicken" class="text-xs sm:text-sm font-mono-num text-emerald-700 font-medium">-</span></div>
              </div>
              <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <div class="flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-sky-500"></span><span class="text-sm font-medium text-slate-800">지방</span><span class="text-xs font-mono-num text-slate-400">20%</span></div>
                <div class="flex flex-wrap items-baseline gap-x-2.5 ml-auto"><span id="out-fat" class="font-mono-num text-lg font-bold text-slate-950">-</span><span id="out-oil" class="text-xs sm:text-sm font-mono-num text-sky-700 font-medium">-</span></div>
              </div>
            </div>
          </div>

          <div class="pt-2">
            <button type="button" id="go-to-weight-plan-btn" class="w-full min-h-[48px] px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer">
              <span>목표 설정하러 가기 →</span>
            </button>
          </div>
        </div>
      </section>
    </div>

    <!-- PAGE 2: 식단 음식 선택 페이지 -->
    <div id="view-planner-select" class="hidden max-w-4xl mx-auto space-y-5 animate-reveal">
      <div class="bg-white border border-slate-200/90 rounded-3xl px-5 py-4 sm:px-6 flex flex-wrap items-center justify-between gap-4 shadow-xs">
        <div class="flex items-center gap-3">
          <button type="button" id="back-to-calc-from-select" class="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium transition-colors whitespace-nowrap cursor-pointer">
            ← 칼로리 계산기로
          </button>
          <h2 class="font-display text-base sm:text-lg font-semibold text-slate-900">식단 음식 선택</h2>
        </div>
        <div id="planner-target-summary" class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm font-mono-num"></div>
      </div>

      <section class="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-7 space-y-6 shadow-xs">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <h3 class="font-display text-base sm:text-lg font-semibold text-slate-900">식단에 사용할 음식 선택</h3>
          <span class="text-xs text-slate-500">원하는 음식을 여러 개 선택한 뒤 식단 짜기 버튼을 눌러 주세요</span>
        </div>

        <div id="food-categories-container" class="space-y-5"></div>

        <form id="custom-food-form" class="pt-5 border-t border-slate-100 space-y-3" novalidate>
          <div class="flex flex-wrap items-center justify-between gap-2">
            <span class="text-xs sm:text-sm font-semibold text-slate-800">목록에 없는 음식 직접 추가</span>
            <span id="custom-match-hint" class="text-xs text-slate-400">이름을 입력하면 탄·단·지 비율을 자동으로 분류해 식단에 반영합니다</span>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
            <div class="sm:col-span-10">
              <input id="custom-food-name" type="text" placeholder="예: 훈제오리, 김밥, 블루베리, 통밀빵, 수제메뉴..." class="w-full min-h-[42px] px-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600" />
            </div>
            <button type="submit" class="sm:col-span-2 min-h-[42px] px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold inline-flex items-center justify-center gap-1 transition-colors whitespace-nowrap cursor-pointer">
              + 추가
            </button>
          </div>
          <div class="grid grid-cols-3 gap-2.5">
            <div>
              <label for="custom-carbs" class="block text-[11px] text-slate-500 mb-1">100g당 탄수화물(g)</label>
              <input id="custom-carbs" type="number" min="0" max="100" step="0.1" class="w-full min-h-[38px] px-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-mono-num text-slate-900 focus:outline-none focus:border-emerald-600" />
            </div>
            <div>
              <label for="custom-protein" class="block text-[11px] text-slate-500 mb-1">100g당 단백질(g)</label>
              <input id="custom-protein" type="number" min="0" max="100" step="0.1" class="w-full min-h-[38px] px-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-mono-num text-slate-900 focus:outline-none focus:border-emerald-600" />
            </div>
            <div>
              <label for="custom-fat" class="block text-[11px] text-slate-500 mb-1">100g당 지방(g)</label>
              <input id="custom-fat" type="number" min="0" max="100" step="0.1" class="w-full min-h-[38px] px-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-mono-num text-slate-900 focus:outline-none focus:border-emerald-600" />
            </div>
          </div>
          <div id="custom-foods-list" class="hidden pt-2 space-y-2">
            <span class="block text-xs font-medium text-slate-600">직접 추가한 음식</span>
            <div id="custom-foods-chips" class="flex flex-wrap gap-2"></div>
          </div>
          <p id="custom-food-error" class="hidden text-xs text-rose-600" role="alert"></p>
        </form>

        <div class="pt-5 border-t border-slate-100 space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span class="block text-sm font-semibold text-slate-800">하루 끼니 수</span>
              <span class="block text-xs text-slate-500 mt-0.5">끼니 수를 늘려도 간식이 아니라 모두 한 끼 식사로 나누어 배분됩니다</span>
            </div>
            <div id="select-meal-count-group" class="grid grid-cols-5 gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200/70"></div>
          </div>
          <button type="button" id="generate-meal-plan-btn" class="w-full min-h-[48px] px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-sm font-bold inline-flex items-center justify-center gap-2 transition-colors whitespace-nowrap cursor-pointer">
            선택한 사항으로 식단 짜러 가기 →
          </button>
        </div>
      </section>
    </div>

    <!-- PAGE 3: 짜여진 식단 결과 페이지 -->
    <div id="view-planner-result" class="hidden max-w-5xl mx-auto space-y-5 animate-reveal">
      <div class="bg-white border border-slate-200/90 rounded-3xl px-5 py-4 sm:px-6 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div class="flex flex-wrap items-center gap-2.5">
          <button type="button" id="back-to-select-btn" class="inline-flex items-center gap-1.5 px-3.5 py-1.5 min-h-[36px] rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer">
            ← 음식 다시 선택하기
          </button>
          <button type="button" id="back-to-calc-from-result" class="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 text-xs font-medium transition-colors whitespace-nowrap cursor-pointer">
            칼로리 계산기로
          </button>
        </div>
        <button type="button" id="copy-plan-btn" class="inline-flex items-center gap-1.5 px-3.5 py-1.5 min-h-[36px] rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer">
          식단 복사
        </button>
      </div>

      <div id="meal-plan-summary-card" class="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-7 shadow-xs"></div>
      <div id="meal-plan-cards-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"></div>
      <div id="meal-plan-ingredients-card" class="bg-white border border-slate-200/90 rounded-3xl px-5 py-4 sm:px-6 shadow-xs"></div>
    </div>

    <!-- PAGE 4: 주간 체중 변화 및 칼로리 로드맵 -->
    <div id="view-roadmap" class="hidden space-y-5 animate-reveal max-w-4xl mx-auto">
      <section class="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-7 space-y-6 shadow-xs">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 class="font-display text-lg sm:text-xl font-bold text-slate-900">목표 체중 계획</h2>
            <p class="text-xs sm:text-sm text-slate-500 mt-1">앞에서 입력한 현재 체중을 기준으로 목표 체중과 기간만 고르면 다이어트·유지·벌크업 중 무엇을 해야 하는지 바로 알려드려요.</p>
          </div>
          <div id="wp-current-badge" class="px-3.5 py-2 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 font-mono-num shrink-0"></div>
        </div>

        <div class="pt-4 border-t border-slate-100 space-y-3">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <label for="wp-target-weight" class="text-sm font-semibold text-slate-900">1. 목표 체중이 몇 kg인가요?</label>
            <span id="wp-direction-badge" class="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold"></span>
          </div>
          <div class="flex flex-col sm:flex-row sm:items-center gap-3">
            <div class="relative w-full sm:w-44 shrink-0">
              <input id="wp-target-weight" type="text" inputmode="decimal" class="w-full min-h-[46px] px-4 pr-11 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white text-base font-mono-num font-semibold text-slate-950 focus:outline-none focus:border-emerald-600" />
              <span class="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">kg</span>
            </div>
            <div id="wp-quick-deltas" class="flex flex-wrap gap-1.5"></div>
          </div>
          <p id="wp-target-error" class="hidden text-xs text-rose-600" role="alert"></p>
        </div>

        <div class="pt-4 border-t border-slate-100 space-y-3">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <span class="text-sm font-semibold text-slate-900">2. 어느 정도 기간으로 생각하고 있나요?</span>
            <div class="flex items-center gap-2 text-xs text-slate-500">
              <label for="wp-custom-weeks" class="whitespace-nowrap">직접 입력:</label>
              <div class="relative w-20">
                <input id="wp-custom-weeks" type="number" min="1" max="104" class="w-full min-h-[34px] px-2.5 pr-6 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-mono-num text-slate-900 focus:outline-none focus:border-emerald-600" />
                <span class="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] text-slate-400">주</span>
              </div>
            </div>
          </div>
          <div id="wp-duration-presets" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5"></div>
          <div id="wp-realism-box" class="hidden p-3.5 rounded-2xl border flex flex-wrap items-center justify-between gap-3"></div>
        </div>
      </section>

      <section class="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-7 space-y-6 shadow-xs">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span class="inline-block text-xs font-semibold text-emerald-700">맞춤 방향 안내</span>
            <h3 id="wp-summary-headline" class="font-display text-lg sm:text-xl font-bold text-slate-950 mt-0.5"></h3>
          </div>
        </div>

        <div id="wp-kpi-grid" class="grid grid-cols-1 sm:grid-cols-3 gap-3"></div>

        <div class="pt-4 border-t border-slate-100 space-y-3">
          <span class="block text-xs font-semibold text-slate-500">예상 체중 변화 흐름</span>
          <div id="wp-milestones" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5"></div>
        </div>

        <div class="pt-4 border-t border-slate-100 space-y-2.5">
          <span class="block text-xs font-semibold text-slate-500">이렇게 진행하면 돼요</span>
          <ul id="wp-guides" class="space-y-2"></ul>
        </div>

        <div class="pt-4 border-t border-slate-100">
          <button type="button" id="wp-go-planner-btn" class="w-full min-h-[50px] px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold inline-flex items-center justify-center gap-2 transition-colors whitespace-nowrap cursor-pointer"></button>
        </div>
      </section>
    </div>
  </main>

  <script>
    const LIFESTYLES = ${lifestyleJson};
    const EXPERIENCES = ${experienceJson};
    const FREQUENCIES = ${frequencyJson};
    const FITNESS_LEVELS = ${fitnessJson};
    const FOODS = ${foodConstantsJson};
    const PRESET_FOODS = ${presetFoodsJson};
    const CUSTOM_DICT = ${customDictJson};
    const NEUTRAL_CUSTOM = ${neutralCustomJson};
    const MEAL_COUNTS = ${mealCountsJson};

    const LIFESTYLE_META = {
      sedentary: ['좌식 위주', '사무직 · 학생 · 재택'],
      light: ['가벼운 이동', '출퇴근 · 일상 보행'],
      active: ['활동적 근무', '서서 일함 · 이동 많음'],
      very_active: ['육체 활동', '현장직 · 하루 종일 움직임']
    };
    const FREQ_SHORT = { freq_0: '안 함', freq_1: '1회', freq_2: '2회', freq_3: '3회', freq_4: '4회', freq_5: '5회', freq_6_7: '6~7회' };
    const EXP_SHORT = { exp_under_3m: '~3개월', exp_3_6m: '3~6개월', exp_6_12m: '6~12개월', exp_1_2y: '1~2년', exp_2_3y: '2~3년', exp_3_5y: '3~5년', exp_5y_plus: '5년+' };
    const FIT_TAG = { fit_low: '입문', fit_walk: '걷기', fit_jog: '조깅', fit_run_3_5: '러닝', fit_run_10: '고강도' };
    const CAT_META = {
      protein: { title: '단백질', dot: 'bg-emerald-500', active: 'bg-emerald-50 border-emerald-600/70 text-emerald-950', accent: 'text-emerald-700' },
      carb: { title: '탄수화물', dot: 'bg-amber-500', active: 'bg-amber-50 border-amber-600/70 text-amber-950', accent: 'text-amber-700' },
      fat: { title: '지방', dot: 'bg-sky-500', active: 'bg-sky-50 border-sky-600/70 text-sky-950', accent: 'text-sky-700' }
    };

    const INITIAL_STATE = { lifestyle: 'sedentary', frequency: 'freq_3', experience: 'exp_1_2y', fitnessLevel: 'fit_jog' };
    let state = Object.assign({}, INITIAL_STATE);
    let hasCalculated = false;
    let activePage = 'calculator'; // 'calculator' | 'select' | 'result' | 'roadmap'
    let currentTargets = { calories: 2300, carbs: 288, protein: 173, fat: 51 };

    let selectedIds = ['p_chicken_breast', 'p_egg', 'c_white_rice', 'c_sweet_potato', 'f_avocado', 'f_olive_oil'];
    let customFoods = [];
    let mealCount = 3;
    let lastGeneratedPlan = null;

    const formEl = document.getElementById('macro-form');
    const errorEl = document.getElementById('form-error');
    const customNameInput = document.getElementById('custom-food-name');
    const customCarbsInput = document.getElementById('custom-carbs');
    const customProteinInput = document.getElementById('custom-protein');
    const customFatInput = document.getElementById('custom-fat');
    customCarbsInput.value = String(NEUTRAL_CUSTOM.carbs);
    customProteinInput.value = String(NEUTRAL_CUSTOM.protein);
    customFatInput.value = String(NEUTRAL_CUSTOM.fat);

    let wpState = { baseWeight: 72, targetWeight: 72, durationWeeks: 8 };

    function setPage(page) {
      activePage = page;
      document.getElementById('view-calculator').classList.toggle('hidden', page !== 'calculator');
      document.getElementById('view-planner-select').classList.toggle('hidden', page !== 'select');
      document.getElementById('view-planner-result').classList.toggle('hidden', page !== 'result');
      document.getElementById('view-roadmap').classList.toggle('hidden', page !== 'roadmap');

      const calcBtn = document.getElementById('nav-calc-btn');
      const planBtn = document.getElementById('nav-planner-btn');
      const rmBtn = document.getElementById('nav-roadmap-btn');
      const isCalc = page === 'calculator';
      const isPlan = page === 'select' || page === 'result';
      const isRm = page === 'roadmap';

      calcBtn.className = 'relative h-16 inline-flex items-center px-0.5 sm:px-1 text-xs sm:text-sm whitespace-nowrap cursor-pointer ' + (isCalc ? 'font-semibold text-slate-950' : 'font-medium text-slate-500 hover:text-slate-900');
      planBtn.className = 'relative h-16 inline-flex items-center px-0.5 sm:px-1 text-xs sm:text-sm whitespace-nowrap cursor-pointer ' + (isPlan ? 'font-semibold text-slate-950' : 'font-medium text-slate-500 hover:text-slate-900');
      rmBtn.className = 'relative h-16 inline-flex items-center px-0.5 sm:px-1 text-xs sm:text-sm whitespace-nowrap cursor-pointer ' + (isRm ? 'font-semibold text-slate-950' : 'font-medium text-slate-500 hover:text-slate-900');
      document.getElementById('nav-calc-bar').classList.toggle('hidden', !isCalc);
      document.getElementById('nav-planner-bar').classList.toggle('hidden', !isPlan);
      document.getElementById('nav-roadmap-bar').classList.toggle('hidden', !isRm);

      if (page === 'select') renderPlannerSelectPage();
      if (page === 'result') renderPlannerResultPage();
      if (page === 'roadmap') renderRoadmapPage();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    document.getElementById('brand-btn').onclick = () => setPage('calculator');
    document.getElementById('nav-calc-btn').onclick = () => setPage('calculator');
    document.getElementById('nav-planner-btn').onclick = () => {
      computeCurrentTargets(false);
      setPage('select');
    };
    document.getElementById('nav-roadmap-btn').onclick = () => setPage('roadmap');
    document.getElementById('back-to-calc-from-select').onclick = () => setPage('calculator');
    document.getElementById('back-to-calc-from-result').onclick = () => setPage('calculator');
    document.getElementById('back-to-select-btn').onclick = () => setPage('select');
    document.getElementById('go-to-weight-plan-btn').onclick = () => setPage('roadmap');

    document.getElementById('reset-calc-btn').onclick = () => {
      document.querySelector('input[name="gender"][value="male"]').checked = true;
      document.getElementById('age').value = '28';
      document.getElementById('height').value = '175';
      document.getElementById('weight').value = '72';
      state = Object.assign({}, INITIAL_STATE);
      wpState = { baseWeight: 72, targetWeight: 72, durationWeeks: 8 };
      hasCalculated = false;
      errorEl.classList.add('hidden');
      document.getElementById('empty-state').classList.remove('hidden');
      document.getElementById('result-content').classList.add('hidden');
      renderAllSelectors();
    };

    function renderAllSelectors() {
      const lEl = document.getElementById('lifestyle-group');
      lEl.innerHTML = '';
      LIFESTYLES.forEach(item => {
        const active = state.lifestyle === item.value;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'px-3 py-2 rounded-2xl border text-left transition-colors cursor-pointer ' + (active ? 'bg-emerald-50/90 text-slate-950 border-emerald-600/70' : 'bg-slate-50/80 text-slate-800 border-slate-200/80');
        btn.innerHTML = '<span class="block text-xs font-semibold">' + LIFESTYLE_META[item.value][0] + '</span><span class="block mt-0.5 text-[11px] ' + (active ? 'text-emerald-700' : 'text-slate-500') + '">' + LIFESTYLE_META[item.value][1] + '</span>';
        btn.onclick = () => { state.lifestyle = item.value; renderAllSelectors(); if (hasCalculated) computeAndRender(false); };
        lEl.appendChild(btn);
      });

      const fEl = document.getElementById('frequency-group');
      fEl.innerHTML = '';
      FREQUENCIES.forEach(item => {
        const active = state.frequency === item.value;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'py-1.5 px-1 min-h-[34px] rounded-xl border text-[11px] sm:text-xs font-medium transition-colors cursor-pointer ' + (active ? 'bg-white text-emerald-700 border-emerald-600/30 shadow-xs font-semibold' : 'border-transparent text-slate-600 hover:text-slate-900');
        btn.textContent = FREQ_SHORT[item.value];
        btn.onclick = () => { state.frequency = item.value; renderAllSelectors(); if (hasCalculated) computeAndRender(false); };
        fEl.appendChild(btn);
      });

      const eEl = document.getElementById('experience-group');
      eEl.innerHTML = '';
      EXPERIENCES.forEach(item => {
        const active = state.experience === item.value;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'py-1.5 px-1 min-h-[34px] rounded-xl border text-[11px] font-medium transition-colors cursor-pointer ' + (active ? 'bg-white text-emerald-700 border-emerald-600/30 shadow-xs font-semibold' : 'border-transparent text-slate-600 hover:text-slate-900');
        btn.textContent = EXP_SHORT[item.value];
        btn.onclick = () => { state.experience = item.value; renderAllSelectors(); if (hasCalculated) computeAndRender(false); };
        eEl.appendChild(btn);
      });

      const fitEl = document.getElementById('fitness-group');
      fitEl.innerHTML = '';
      FITNESS_LEVELS.forEach(item => {
        const active = state.fitnessLevel === item.value;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'w-full px-3.5 py-2 min-h-[36px] rounded-xl border flex items-center justify-between gap-3 text-left transition-colors cursor-pointer ' + (active ? 'bg-emerald-50/90 text-slate-950 border-emerald-600/70' : 'bg-slate-50/80 text-slate-700 border-slate-200/80');
        btn.innerHTML = '<span class="text-xs font-medium">' + item.label + '</span><span class="text-[11px] font-mono-num shrink-0 ' + (active ? 'text-emerald-700 font-semibold' : 'text-slate-400') + '">' + FIT_TAG[item.value] + '</span>';
        btn.onclick = () => { state.fitnessLevel = item.value; renderAllSelectors(); if (hasCalculated) computeAndRender(false); };
        fitEl.appendChild(btn);
      });
    }
    renderAllSelectors();

    function computeCurrentTargets(strictValidate) {
      const gender = document.querySelector('input[name="gender"]:checked').value;
      let age = Number(document.getElementById('age').value);
      let height = Number(document.getElementById('height').value);
      let weight = Number(document.getElementById('weight').value);

      if (!age || age < 10 || age > 110 || !height || height < 100 || height > 240 || !weight || weight < 25 || weight > 250) {
        if (strictValidate) return null;
        age = 28; height = 175; weight = 72;
      }

      const curW = syncWeightInputToPlan();
      const rawBmr = gender === 'male'
        ? 66.47 + (13.75 * curW) + (5 * height) - (6.76 * age)
        : 655.1 + (9.56 * curW) + (1.85 * height) - (4.68 * age);
      const bmr = Math.round(rawBmr);
      const lW = LIFESTYLES.find(x => x.value === state.lifestyle).weight;
      const eB = EXPERIENCES.find(x => x.value === state.experience).bonus;
      const fB = FREQUENCIES.find(x => x.value === state.frequency).bonus;
      const fitB = FITNESS_LEVELS.find(x => x.value === state.fitnessLevel).bonus;
      const totalMult = Number((lW + eB + fB + fitB).toFixed(2));
      const lifestyleMetabolism = Math.round(rawBmr * lW);
      const tdee = Math.round(rawBmr * totalMult);

      const maintMacros = wpMacros(tdee);
      const plan = computeWeightPlanWithBase(curW, bmr, tdee);
      currentTargets = Object.assign({ calories: plan.dailyCal }, plan.macros);
      return { curW, bmr, lifestyleMetabolism, tdee, maintMacros, plan };
    }

    function computeAndRender(shouldAnimate) {
      const calc = computeCurrentTargets(true);
      if (!calc) {
        errorEl.textContent = '나이(10~110), 키(100~240cm), 체중(25~250kg)을 올바르게 입력해 주세요.';
        errorEl.classList.remove('hidden');
        return false;
      }
      errorEl.classList.add('hidden');

      document.getElementById('out-current-weight-label').textContent = '현재 체중 ' + calc.curW + 'kg 기준';
      document.getElementById('out-tdee').textContent = calc.tdee.toLocaleString() + ' kcal';
      document.getElementById('out-bmr').textContent = calc.bmr.toLocaleString() + ' kcal';
      document.getElementById('out-lifestyle').textContent = calc.lifestyleMetabolism.toLocaleString() + ' kcal';

      const m = calc.maintMacros;
      const riceCount = (m.carbs / FOODS.RICE_CARBS_PER_SERVING).toFixed(1);
      const riceG = Math.round((m.carbs / FOODS.RICE_CARBS_PER_SERVING) * FOODS.RICE_SERVING_GRAMS);
      const chickenCount = (m.protein / FOODS.CHICKEN_PROTEIN_PER_SERVING).toFixed(1);
      const chickenG = Math.round((m.protein / FOODS.CHICKEN_PROTEIN_PER_SERVING) * FOODS.CHICKEN_SERVING_GRAMS);
      const oilCount = (m.fat / FOODS.OLIVE_OIL_FAT_PER_TBSP).toFixed(1);
      const oilG = Math.round((m.fat / FOODS.OLIVE_OIL_FAT_PER_TBSP) * FOODS.OLIVE_OIL_TBSP_GRAMS);

      document.getElementById('out-carbs').textContent = m.carbs.toLocaleString() + 'g';
      document.getElementById('out-rice').textContent = '약 흰밥 ' + riceG.toLocaleString() + 'g (' + riceCount + '그릇)';
      document.getElementById('out-protein').textContent = m.protein.toLocaleString() + 'g';
      document.getElementById('out-chicken').textContent = '약 닭가슴살 ' + chickenG.toLocaleString() + 'g (' + chickenCount + '팩)';
      document.getElementById('out-fat').textContent = m.fat.toLocaleString() + 'g';
      document.getElementById('out-oil').textContent = '약 올리브오일 ' + oilG.toLocaleString() + 'g (' + oilCount + '큰술)';

      document.getElementById('empty-state').classList.add('hidden');
      const resultEl = document.getElementById('result-content');
      resultEl.classList.remove('hidden');
      if (shouldAnimate) {
        resultEl.classList.remove('animate-reveal');
        void resultEl.offsetWidth;
        resultEl.classList.add('animate-reveal');
      }
      return true;
    }

    formEl.addEventListener('submit', (e) => {
      e.preventDefault();
      if (computeAndRender(true)) hasCalculated = true;
    });

    ['input', 'change'].forEach(evt => {
      formEl.addEventListener(evt, () => {
        if (hasCalculated) computeAndRender(false);
      });
    });

    // ----- MEAL PLANNER LOGIC -----
    function escapeHtml(str) {
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    function calcFoodCalories(c, p, f) {
      return Math.round(c * 4 + p * 4 + f * 9);
    }

    function inferFoodCategory(c, p, f) {
      const ck = Math.max(0, c) * 4;
      const pk = Math.max(0, p) * 4;
      const fk = Math.max(0, f) * 9;
      if (pk >= ck && pk >= fk) return 'protein';
      if (fk > ck && fk > pk) return 'fat';
      return 'carb';
    }

    function lookupFood(rawName) {
      const norm = rawName.replace(/\\s+/g, '').toLowerCase();
      if (!norm) return null;
      const preset = PRESET_FOODS.find(f => f.name.replace(/\\s+/g, '').toLowerCase() === norm);
      if (preset) return { category: preset.category, per100g: preset.per100g, role: preset.role };
      const dict = CUSTOM_DICT.find(entry => entry.keywords.some(kw => norm.includes(kw.toLowerCase())));
      if (dict) {
        return {
          category: dict.category,
          per100g: { carbs: dict.carbs, protein: dict.protein, fat: dict.fat, calories: calcFoodCalories(dict.carbs, dict.protein, dict.fat) },
          role: dict.role || 'moderate'
        };
      }
      return null;
    }

    function toggleFoodSelection(id) {
      if (selectedIds.includes(id)) {
        selectedIds = selectedIds.filter(x => x !== id);
      } else {
        selectedIds = selectedIds.concat([id]);
      }
      renderPlannerSelectPage();
    }

    function getActiveWeightPlanSummary() {
      const calc = computeCurrentTargets(false);
      const p = calc.plan;
      const text = p.gType === 'maintain'
        ? ('체중 유지 (' + p.curW + 'kg)')
        : (p.badge + ' (' + p.curW + 'kg → ' + p.tgtW + 'kg · ' + p.weeks + '주)');
      const cls = p.gType === 'diet'
        ? 'bg-emerald-50 text-emerald-700 border border-emerald-600/20'
        : (p.gType === 'bulk'
            ? 'bg-sky-50 text-sky-700 border border-sky-600/20'
            : 'bg-slate-100 text-slate-700 border border-slate-200');
      return { text, cls };
    }

    function renderPlannerSelectPage() {
      const wpBadge = getActiveWeightPlanSummary();
      const summaryEl = document.getElementById('planner-target-summary');
      summaryEl.innerHTML =
        '<span class="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-sans font-semibold ' + wpBadge.cls + '">' + escapeHtml(wpBadge.text) + '</span>' +
        '<span class="text-slate-900 font-bold">목표 ' + currentTargets.calories.toLocaleString() + ' kcal</span>' +
        '<span class="text-slate-300">·</span>' +
        '<span class="text-amber-700 font-medium">탄 ' + currentTargets.carbs + 'g</span>' +
        '<span class="text-emerald-700 font-medium">단 ' + currentTargets.protein + 'g</span>' +
        '<span class="text-sky-700 font-medium">지 ' + currentTargets.fat + 'g</span>' +
        '<button type="button" id="edit-wp-from-select-btn" class="font-sans text-xs font-medium text-emerald-700 hover:text-emerald-800 underline underline-offset-2 cursor-pointer">계획 수정</button>';
      document.getElementById('edit-wp-from-select-btn').onclick = () => setPage('roadmap');

      const container = document.getElementById('food-categories-container');
      container.innerHTML = '';
      ['protein', 'carb', 'fat'].forEach((cat, idx) => {
        const meta = CAT_META[cat];
        const items = PRESET_FOODS.filter(f => f.category === cat);
        const selCount = items.filter(f => selectedIds.includes(f.id)).length;

        const block = document.createElement('div');
        block.className = idx === 0 ? '' : 'pt-5 border-t border-slate-100';

        const header = document.createElement('div');
        header.className = 'flex items-center justify-between gap-2 mb-3';
        header.innerHTML =
          '<div class="flex items-center gap-2"><span class="w-2 h-2 rounded-full ' + meta.dot + '"></span><span class="text-sm font-semibold text-slate-900">' + meta.title + '</span></div>' +
          '<span class="text-xs font-mono-num text-slate-500">' + selCount + '개 선택됨</span>';
        block.appendChild(header);

        const chips = document.createElement('div');
        chips.className = 'flex flex-wrap gap-2';
        items.forEach(item => {
          const isSel = selectedIds.includes(item.id);
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.setAttribute('aria-pressed', String(isSel));
          btn.className = 'inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[38px] text-xs sm:text-sm font-medium rounded-xl border transition-colors cursor-pointer ' +
            (isSel ? meta.active : 'bg-slate-50 border-slate-200/80 text-slate-700 hover:bg-slate-100');
          btn.textContent = (isSel ? '✓ ' : '') + item.name;
          btn.onclick = () => toggleFoodSelection(item.id);
          chips.appendChild(btn);
        });
        block.appendChild(chips);
        container.appendChild(block);
      });

      const customWrap = document.getElementById('custom-foods-list');
      const customChips = document.getElementById('custom-foods-chips');
      customChips.innerHTML = '';
      if (customFoods.length > 0) {
        customWrap.classList.remove('hidden');
        customFoods.forEach(item => {
          const isSel = selectedIds.includes(item.id);
          const meta = CAT_META[item.category];
          const row = document.createElement('div');
          row.className = 'inline-flex items-center';

          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[38px] text-xs sm:text-sm font-medium rounded-l-xl border transition-colors cursor-pointer ' +
            (isSel ? meta.active : 'bg-slate-50 border-slate-200/80 text-slate-700 hover:bg-slate-100');
          btn.textContent = (isSel ? '✓ ' : '') + item.name;
          btn.onclick = () => toggleFoodSelection(item.id);

          const delBtn = document.createElement('button');
          delBtn.type = 'button';
          delBtn.className = 'px-2.5 py-2 min-h-[38px] rounded-r-xl border-y border-r text-slate-400 hover:text-rose-600 transition-colors cursor-pointer ' +
            (isSel ? meta.active : 'bg-slate-50 border-slate-200/80');
          delBtn.textContent = '×';
          delBtn.onclick = () => {
            customFoods = customFoods.filter(f => f.id !== item.id);
            selectedIds = selectedIds.filter(id => id !== item.id);
            renderPlannerSelectPage();
          };

          row.appendChild(btn);
          row.appendChild(delBtn);
          customChips.appendChild(row);
        });
      } else {
        customWrap.classList.add('hidden');
      }

      const mcEl = document.getElementById('select-meal-count-group');
      mcEl.innerHTML = '';
      MEAL_COUNTS.forEach(c => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'px-3 py-1.5 min-h-[32px] rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ' +
          (mealCount === c ? 'bg-white text-emerald-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900');
        btn.textContent = c + '끼';
        btn.onclick = () => { mealCount = c; renderPlannerSelectPage(); };
        mcEl.appendChild(btn);
      });

      const genBtn = document.getElementById('generate-meal-plan-btn');
      genBtn.disabled = selectedIds.length === 0;
    }

    customNameInput.addEventListener('input', () => {
      document.getElementById('custom-food-error').classList.add('hidden');
      const trimmed = customNameInput.value.trim();
      const hintEl = document.getElementById('custom-match-hint');
      const match = trimmed ? lookupFood(trimmed) : null;
      if (match) {
        customCarbsInput.value = String(match.per100g.carbs);
        customProteinInput.value = String(match.per100g.protein);
        customFatInput.value = String(match.per100g.fat);
        hintEl.textContent = '영양성분 자동 입력됨 (100g 기준)';
        hintEl.className = 'text-xs text-emerald-700 font-medium';
      } else {
        hintEl.textContent = '이름을 입력하면 탄·단·지 비율을 자동으로 분류해 식단에 반영합니다';
        hintEl.className = 'text-xs text-slate-400';
      }
    });

    document.getElementById('custom-food-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const errEl = document.getElementById('custom-food-error');
      const trimmed = customNameInput.value.trim();
      if (!trimmed) {
        errEl.textContent = '음식 이름을 입력해 주세요.';
        errEl.classList.remove('hidden');
        return;
      }

      const allFoods = PRESET_FOODS.concat(customFoods);
      const existing = allFoods.find(f => f.name.replace(/\\s+/g, '') === trimmed.replace(/\\s+/g, ''));
      if (existing) {
        if (!selectedIds.includes(existing.id)) selectedIds = selectedIds.concat([existing.id]);
        customNameInput.value = '';
        renderPlannerSelectPage();
        return;
      }

      const cVal = Number(customCarbsInput.value);
      const pVal = Number(customProteinInput.value);
      const fVal = Number(customFatInput.value);
      if (!Number.isFinite(cVal) || !Number.isFinite(pVal) || !Number.isFinite(fVal) || cVal < 0 || pVal < 0 || fVal < 0 || (cVal === 0 && pVal === 0 && fVal === 0)) {
        errEl.textContent = '100g 기준 탄수화물·단백질·지방(g) 중 하나 이상 0보다 크게 입력해 주세요.';
        errEl.classList.remove('hidden');
        return;
      }

      const dictMatch = lookupFood(trimmed);
      const resolvedCat = dictMatch ? dictMatch.category : inferFoodCategory(cVal, pVal, fVal);
      const stepG = fVal >= 70 && cVal < 5 && pVal < 5 ? 1 : (resolvedCat === 'fat' ? 5 : 10);
      const role = dictMatch ? dictMatch.role : 'moderate';
      const newItem = {
        id: 'custom_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
        name: trimmed,
        category: resolvedCat,
        per100g: { carbs: Number(cVal.toFixed(1)), protein: Number(pVal.toFixed(1)), fat: Number(fVal.toFixed(1)), calories: calcFoodCalories(cVal, pVal, fVal) },
        stepG: stepG,
        role: role,
        roleWeight: role === 'staple' ? 2.5 : (role === 'moderate' ? 1.4 : 0.7),
        softCapG: resolvedCat === 'fat' ? (stepG === 1 ? 30 : 80) : (role === 'snack' ? 200 : 400),
        idealDailyG: resolvedCat === 'fat' ? (stepG === 1 ? 15 : 30) : (role === 'snack' ? 120 : 180),
        isCustom: true
      };
      customFoods = customFoods.concat([newItem]);
      selectedIds = selectedIds.concat([newItem.id]);
      customNameInput.value = '';
      customCarbsInput.value = String(NEUTRAL_CUSTOM.carbs);
      customProteinInput.value = String(NEUTRAL_CUSTOM.protein);
      customFatInput.value = String(NEUTRAL_CUSTOM.fat);
      document.getElementById('custom-match-hint').textContent = '이름을 입력하면 탄·단·지 비율을 자동으로 분류해 식단에 반영합니다';
      document.getElementById('custom-match-hint').className = 'text-xs text-slate-400';
      errEl.classList.add('hidden');
      renderPlannerSelectPage();
    });

    document.getElementById('generate-meal-plan-btn').onclick = () => {
      if (selectedIds.length === 0) return;
      setPage('result');
    };

    function roundToStep(value, step) {
      if (value <= 0) return 0;
      return Math.max(step, Math.round(value / step) * step);
    }

    function getMealLabels(count) {
      if (count === 2) return ['1끼 (아침)', '2끼 (저녁)'];
      if (count === 3) return ['아침', '점심', '저녁'];
      const arr = [];
      for (let i = 0; i < count; i++) arr.push(i === 0 ? '1끼 (아침)' : (i + 1) + '끼');
      return arr;
    }

    function computeAlloc(foodItem, grams) {
      const f = grams / 100;
      const carbs = Number((foodItem.per100g.carbs * f).toFixed(1));
      const protein = Number((foodItem.per100g.protein * f).toFixed(1));
      const fat = Number((foodItem.per100g.fat * f).toFixed(1));
      return { food: foodItem, grams: grams, carbs: carbs, protein: protein, fat: fat, calories: Math.round(carbs * 4 + protein * 4 + fat * 9) };
    }

    function solveMealPlan(targets, chosenFoods, mCount) {
      const safeMeals = Math.min(6, Math.max(2, Math.round(mCount)));
      const mealLabels = getMealLabels(safeMeals);
      const byCategory = {
        carb: chosenFoods.filter(f => f.category === 'carb'),
        protein: chosenFoods.filter(f => f.category === 'protein'),
        fat: chosenFoods.filter(f => f.category === 'fat')
      };
      const activeCategories = ['carb', 'protein', 'fat'].filter(c => byCategory[c].length > 0);
      const RICE_IDS = { c_white_rice: true, c_brown_rice: true };
      const hasRice = byCategory.carb.some(f => RICE_IDS[f.id]);

      const getEffWeight = (item) => {
        if (item.category === 'carb' && hasRice) {
          if (RICE_IDS[item.id]) return 8.5;
          if (item.id === 'c_pasta') return 1.1;
          if (item.role === 'snack') return 0.25;
          return 0.45;
        }
        return item.roleWeight;
      };

      const getEffCap = (item) => {
        if (item.category === 'carb' && hasRice) {
          if (RICE_IDS[item.id]) return 1400;
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

      const dailyGrams = {};
      activeCategories.forEach(cat => {
        const list = byCategory[cat];
        const totalW = list.reduce((s, x) => s + getEffWeight(x), 0);
        const key = cat === 'carb' ? 'carbs' : (cat === 'protein' ? 'protein' : 'fat');
        const targetM = cat === 'carb' ? targets.carbs : (cat === 'protein' ? targets.protein : targets.fat * 0.55);
        list.forEach(item => {
          const w = getEffWeight(item);
          const cap = getEffCap(item);
          const share = w / Math.max(0.1, totalW);
          const density = Math.max(1, item.per100g[key]);
          const est = ((targetM * share) / density) * 100;
          const seed = list.length > 1 ? Math.min(cap, est) : est;
          dailyGrams[item.id] = Math.max(item.stepG, roundToStep(seed, item.stepG));
        });
      });

      const minGramsFor = (item) => {
        if (item.category === 'fat') return item.stepG === 1 ? 3 : item.stepG;
        if (item.category === 'carb' && hasRice && !RICE_IDS[item.id]) return Math.max(item.stepG, 40);
        if (item.role === 'snack') return Math.max(item.stepG, 50);
        return Math.max(item.stepG, 30);
      };

      chosenFoods.forEach(item => {
        const minG = minGramsFor(item);
        if ((dailyGrams[item.id] || 0) < minG) dailyGrams[item.id] = minG;
      });

      function evalState() {
        let c = 0, p = 0, f = 0;
        const catTotals = { carb: 0, protein: 0, fat: 0 };
        chosenFoods.forEach(item => {
          const g = dailyGrams[item.id] || 0;
          c += (item.per100g.carbs * g) / 100;
          p += (item.per100g.protein * g) / 100;
          f += (item.per100g.fat * g) / 100;
          catTotals[item.category] += g;
        });

        let penalty = 0;
        activeCategories.forEach(cat => {
          const list = byCategory[cat];
          const totalW = list.reduce((s, x) => s + getEffWeight(x), 0);
          const hasHigher = list.some(x => x.role !== 'snack' || RICE_IDS[x.id]);
          list.forEach(item => {
            const g = dailyGrams[item.id] || 0;
            const cap = getEffCap(item);
            const w = getEffWeight(item);
            if (g > cap) {
              const ex = g - cap;
              const str = ((item.category === 'carb' && hasRice && !RICE_IDS[item.id]) || (item.role === 'snack' && hasHigher)) ? 2.4 : 0.35;
              penalty += str * ex * ex;
            }
            if (list.length > 1) {
              const desired = (catTotals[cat] * w) / Math.max(0.1, totalW);
              const diff = g - desired;
              const wStr = (item.category === 'carb' && hasRice && !RICE_IDS[item.id]) ? 0.25 : (item.role === 'snack' ? 0.14 : 0.05);
              penalty += wStr * diff * diff;
            }
          });
        });

        return Math.pow((c - targets.carbs) * 4, 2) + Math.pow((p - targets.protein) * 4, 2) + Math.pow((f - targets.fat) * 9, 2) + penalty;
      }

      for (let pass = 0; pass < 90; pass++) {
        let improved = false;
        chosenFoods.forEach(item => {
          const curG = dailyGrams[item.id] || item.stepG;
          const minG = minGramsFor(item);
          let bestG = curG;
          let bestScore = evalState();
          [8, 3, 1].forEach(mult => {
            const step = item.stepG * mult;
            [-1, 1].forEach(dir => {
              const candG = curG + dir * step;
              if (candG < minG) return;
              dailyGrams[item.id] = candG;
              const sc = evalState();
              if (sc < bestScore - 0.5) {
                bestScore = sc;
                bestG = candG;
                improved = true;
              }
            });
          });
          dailyGrams[item.id] = bestG;
        });
        if (!improved) break;
      }

      const mealBuckets = Array.from({ length: safeMeals }, () => ({}));
      const mealLoads = new Array(safeMeals).fill(0);
      const allIndices = Array.from({ length: safeMeals }, (_, i) => i);

      function addPortion(mIdx, item, g) {
        if (g <= 0) return;
        mealBuckets[mIdx][item.id] = (mealBuckets[mIdx][item.id] || 0) + g;
        mealLoads[mIdx] += (item.per100g.calories * g) / 100;
      }

      function splitMeals(item, totalG, indices) {
        const count = indices.length;
        if (count === 0 || totalG <= 0) return;
        if (count === 1) { addPortion(indices[0], item, totalG); return; }
        const ordered = indices.slice().sort((a, b) => mealLoads[a] - mealLoads[b]);
        let rem = totalG;
        for (let i = 0; i < count; i++) {
          const mIdx = ordered[i];
          const share = i === count - 1 ? rem : roundToStep(rem / (count - i), item.stepG);
          const clamped = Math.max(0, Math.min(rem, share));
          if (clamped > 0) { addPortion(mIdx, item, clamped); rem -= clamped; }
        }
        if (rem > 0) addPortion(ordered[0], item, rem);
      }

      const nonRiceCarbs = byCategory.carb.filter(f => !RICE_IDS[f.id]);
      const breakfastHasNonRice = hasRice && nonRiceCarbs.length > 0;
      if (hasRice) {
        nonRiceCarbs.forEach(item => {
          const g = dailyGrams[item.id] || 0;
          if (g <= 0) return;
          if (item.id === 'c_pasta' && allIndices.length >= 2) {
            const nonBf = allIndices.filter(m => m !== 0).sort((a, b) => mealLoads[a] - mealLoads[b]);
            addPortion(nonBf[0], item, g);
          } else {
            addPortion(0, item, g);
          }
        });
        const riceItems = byCategory.carb.filter(f => RICE_IDS[f.id]);
        const candidateRiceTargets = breakfastHasNonRice ? allIndices.filter(m => m !== 0) : allIndices;
        const effectiveTargets = candidateRiceTargets.length >= riceItems.length ? candidateRiceTargets : allIndices;
        if (riceItems.length === 1) {
          const g = dailyGrams[riceItems[0].id] || 0;
          if (g > 0) splitMeals(riceItems[0], g, effectiveTargets);
        } else if (riceItems.length > 1) {
          const activeRice = riceItems.filter(r => (dailyGrams[r.id] || 0) > 0);
          const riceBuckets = {};
          activeRice.forEach(r => { riceBuckets[r.id] = []; });
          const targetsForAssign = (breakfastHasNonRice && effectiveTargets.length === allIndices.length)
            ? allIndices.filter(m => m !== 0).concat([0])
            : effectiveTargets;
          targetsForAssign.forEach(mealIdx => {
            if (activeRice.length === 0) return;
            const chosen = activeRice.slice().sort((a, b) => {
              const cntA = riceBuckets[a.id].length;
              const cntB = riceBuckets[b.id].length;
              if (cntA === 0 && cntB > 0) return -1;
              if (cntB === 0 && cntA > 0) return 1;
              return ((dailyGrams[b.id] || 0) / Math.max(1, cntB)) - ((dailyGrams[a.id] || 0) / Math.max(1, cntA));
            })[0];
            riceBuckets[chosen.id].push(mealIdx);
          });
          activeRice.forEach(item => {
            const g = dailyGrams[item.id] || 0;
            if (g > 0 && riceBuckets[item.id].length > 0) splitMeals(item, g, riceBuckets[item.id]);
          });
        }
      }

      const rank = { staple: 0, moderate: 1, snack: 2 };
      const remFoods = chosenFoods
        .filter(f => !(hasRice && f.category === 'carb'))
        .sort((a, b) => (rank[a.role] !== rank[b.role] ? rank[a.role] - rank[b.role] : (dailyGrams[b.id] || 0) - (dailyGrams[a.id] || 0)));

      remFoods.forEach(item => {
        const totalG = dailyGrams[item.id] || 0;
        if (totalG <= 0) return;
        let minPerMeal = 80;
        let maxSplits = allIndices.length;
        if (item.role === 'staple') {
          minPerMeal = item.category === 'fat' ? item.stepG * 3 : Math.max(40, item.stepG * 4);
        } else if (item.role === 'moderate') {
          minPerMeal = item.category === 'fat' ? item.stepG * 4 : 80;
        } else {
          minPerMeal = item.category === 'fat' ? item.stepG * 3 : 80;
          maxSplits = 2;
        }
        const splitCount = Math.min(maxSplits, allIndices.length, Math.max(1, Math.floor(totalG / minPerMeal)));
        const chosenMeals = allIndices.slice().sort((a, b) => mealLoads[a] - mealLoads[b]).slice(0, splitCount);
        splitMeals(item, totalG, chosenMeals);
      });

      const meals = mealBuckets.map((bucket, idx) => {
        const items = [];
        ['carb', 'protein', 'fat'].forEach(cat => {
          byCategory[cat].forEach(f => {
            const g = bucket[f.id] || 0;
            if (g > 0) items.push(computeAlloc(f, g));
          });
        });
        const c = items.reduce((s, x) => s + x.carbs, 0);
        const p = items.reduce((s, x) => s + x.protein, 0);
        const f = items.reduce((s, x) => s + x.fat, 0);
        return {
          label: mealLabels[idx],
          items: items,
          totals: { calories: Math.round(c * 4 + p * 4 + f * 9), carbs: Math.round(c), protein: Math.round(p), fat: Math.round(f) }
        };
      });

      const summary = chosenFoods.map(f => computeAlloc(f, dailyGrams[f.id] || 0)).filter(x => x.grams > 0);
      const tc = Math.round(summary.reduce((s, x) => s + x.carbs, 0));
      const tp = Math.round(summary.reduce((s, x) => s + x.protein, 0));
      const tf = Math.round(summary.reduce((s, x) => s + x.fat, 0));
      const tk = Math.round(tc * 4 + tp * 4 + tf * 9);
      return { meals: meals, totals: { calories: tk, carbs: tc, protein: tp, fat: tf }, summary: summary, diffCalories: tk - targets.calories };
    }

    function renderPlannerResultPage() {
      const allFoods = PRESET_FOODS.concat(customFoods);
      const chosenFoods = allFoods.filter(f => selectedIds.includes(f.id));
      const plan = solveMealPlan(currentTargets, chosenFoods, mealCount);
      lastGeneratedPlan = plan;

      const wpBadge = getActiveWeightPlanSummary();
      const diffSign = plan.diffCalories >= 0 ? '+' + plan.diffCalories : String(plan.diffCalories);
      const summaryCard = document.getElementById('meal-plan-summary-card');
      summaryCard.innerHTML =
        '<div class="flex flex-wrap items-end justify-between gap-4">' +
          '<div>' +
            '<div class="flex flex-wrap items-center gap-2 mb-1">' +
              '<span class="text-xs font-semibold text-emerald-700">맞춤 하루 식단</span>' +
              '<span class="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold ' + wpBadge.cls + '">' + escapeHtml(wpBadge.text) + '</span>' +
              '<span class="text-xs font-mono-num text-slate-500">목표 ' + currentTargets.calories.toLocaleString() + 'kcal 대비 ' + diffSign + ' kcal</span>' +
            '</div>' +
            '<p class="font-mono-num text-4xl sm:text-5xl font-bold text-slate-950">' + plan.totals.calories.toLocaleString() + '<span class="text-lg font-normal text-slate-500 ml-2">kcal</span></p>' +
          '</div>' +
          '<div class="grid grid-cols-3 gap-2.5 w-full sm:w-auto sm:min-w-[360px]">' +
            '<div class="p-3 rounded-2xl bg-slate-50 border border-slate-200/70"><span class="block text-[11px] text-slate-500">탄수화물</span><span class="font-mono-num text-base font-bold text-amber-700">' + plan.totals.carbs + 'g</span><span class="block font-mono-num text-[11px] text-slate-400">목표 ' + currentTargets.carbs + 'g</span></div>' +
            '<div class="p-3 rounded-2xl bg-slate-50 border border-slate-200/70"><span class="block text-[11px] text-slate-500">단백질</span><span class="font-mono-num text-base font-bold text-emerald-700">' + plan.totals.protein + 'g</span><span class="block font-mono-num text-[11px] text-slate-400">목표 ' + currentTargets.protein + 'g</span></div>' +
            '<div class="p-3 rounded-2xl bg-slate-50 border border-slate-200/70"><span class="block text-[11px] text-slate-500">지방</span><span class="font-mono-num text-base font-bold text-sky-700">' + plan.totals.fat + 'g</span><span class="block font-mono-num text-[11px] text-slate-400">목표 ' + currentTargets.fat + 'g</span></div>' +
          '</div>' +
        '</div>' +
        '<div class="mt-5 pt-5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">' +
          '<span class="text-xs text-slate-500">끼니 수 변경</span>' +
          '<div id="result-meal-count-group" class="grid grid-cols-5 gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200/70"></div>' +
        '</div>';

      const rmcEl = document.getElementById('result-meal-count-group');
      MEAL_COUNTS.forEach(c => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'px-3 py-1 min-h-[30px] rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ' +
          (mealCount === c ? 'bg-white text-emerald-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900');
        btn.textContent = c + '끼';
        btn.onclick = () => { mealCount = c; renderPlannerResultPage(); };
        rmcEl.appendChild(btn);
      });

      const grid = document.getElementById('meal-plan-cards-grid');
      grid.innerHTML = '';
      plan.meals.forEach(meal => {
        const card = document.createElement('div');
        card.className = 'bg-white border border-slate-200/90 rounded-3xl p-5 flex flex-col justify-between space-y-4 shadow-xs';
        let itemsHtml = '';
        if (meal.items.length === 0) {
          itemsHtml = '<p class="text-xs text-slate-400">배정된 식품 없음</p>';
        } else {
            itemsHtml = '<ul class="space-y-2">' + meal.items.map(alloc => {
            const dot = CAT_META[alloc.food.category].dot;
            return '<li class="flex items-baseline justify-between gap-2 text-xs sm:text-sm">' +
              '<div class="flex items-center gap-2 min-w-0"><span class="w-2 h-2 rounded-full shrink-0 ' + dot + '"></span><span class="font-medium text-slate-800 truncate">' + escapeHtml(alloc.food.name) + '</span></div>' +
              '<div class="flex items-baseline gap-2 shrink-0 font-mono-num"><span class="font-bold text-slate-950">' + alloc.grams + 'g</span><span class="text-[11px] text-slate-400">' + alloc.calories + 'kcal</span></div>' +
            '</li>';
          }).join('') + '</ul>';
        }
        card.innerHTML =
          '<div class="space-y-3">' +
            '<div class="flex items-center justify-between gap-2 pb-3 border-b border-slate-100"><h3 class="font-display text-sm font-semibold text-slate-900">' + meal.label + '</h3><span class="text-xs font-mono-num font-semibold text-slate-900">' + meal.totals.calories.toLocaleString() + ' kcal</span></div>' +
            itemsHtml +
          '</div>' +
          '<div class="pt-3 border-t border-slate-100 text-[11px] font-mono-num text-slate-500 flex items-center justify-between"><span>탄 ' + meal.totals.carbs + 'g</span><span>단 ' + meal.totals.protein + 'g</span><span>지 ' + meal.totals.fat + 'g</span></div>';
        grid.appendChild(card);
      });

      const ingCard = document.getElementById('meal-plan-ingredients-card');
      ingCard.innerHTML =
        '<h4 class="text-xs font-semibold text-slate-500 mb-2">하루 총 식재료 필요량</h4>' +
        '<div class="flex flex-wrap gap-x-3 gap-y-1.5 text-xs sm:text-sm font-mono-num text-slate-700">' +
        plan.summary.map((item, idx) =>
          '<span>' + escapeHtml(item.food.name) + ' <strong class="text-slate-950">' + item.grams + 'g</strong>' +
          (idx < plan.summary.length - 1 ? '<span class="text-slate-300 ml-3">·</span>' : '') + '</span>'
        ).join('') +
        '</div>';
    }

    document.getElementById('copy-plan-btn').onclick = () => {
      if (!lastGeneratedPlan) return;
      const wpBadge = getActiveWeightPlanSummary();
      const lines = ['[맞춤 식단 · ' + wpBadge.text + '] 총 ' + lastGeneratedPlan.totals.calories.toLocaleString() + 'kcal (탄 ' + lastGeneratedPlan.totals.carbs + 'g · 단 ' + lastGeneratedPlan.totals.protein + 'g · 지 ' + lastGeneratedPlan.totals.fat + 'g)', ''];
      lastGeneratedPlan.meals.forEach(m => {
        if (!m.items.length) return;
        lines.push('• ' + m.label + ' (' + m.totals.calories + 'kcal)');
        m.items.forEach(it => lines.push('  - ' + it.food.name + ' ' + it.grams + 'g (' + it.calories + 'kcal)'));
      });
      if (navigator.clipboard) navigator.clipboard.writeText(lines.join('\\n')).catch(() => {});
      const btn = document.getElementById('copy-plan-btn');
      btn.textContent = '복사 완료';
      setTimeout(() => { btn.textContent = '식단 복사'; }, 2000);
    };

    // ----- SIMPLE WEIGHT PLAN LOGIC -----
    function calcTdeeForWeight(wtKg) {
      const gender = document.querySelector('input[name="gender"]:checked').value;
      const age = Number(document.getElementById('age').value) || 28;
      const height = Number(document.getElementById('height').value) || 175;
      const rawBmr = gender === 'male'
        ? 66.47 + (13.75 * wtKg) + (5 * height) - (6.76 * age)
        : 655.1 + (9.56 * wtKg) + (1.85 * height) - (4.68 * age);
      const lW = LIFESTYLES.find(x => x.value === state.lifestyle).weight;
      const eB = EXPERIENCES.find(x => x.value === state.experience).bonus;
      const fB = FREQUENCIES.find(x => x.value === state.frequency).bonus;
      const fitB = FITNESS_LEVELS.find(x => x.value === state.fitnessLevel).bonus;
      const mult = Number((lW + eB + fB + fitB).toFixed(2));
      return { bmr: Math.round(rawBmr), tdee: Math.round(rawBmr * mult) };
    }

    function wpMacros(cal) {
      return { carbs: Math.round((cal * 0.5) / 4), protein: Math.round((cal * 0.3) / 4), fat: Math.round((cal * 0.2) / 9) };
    }

    function formatWeeksText(w) {
      const sw = Math.max(1, Math.round(w));
      if (sw === 2) return '2주';
      if (sw === 4) return '4주 (약 1개월)';
      if (sw === 6) return '6주 (약 1개월 반)';
      if (sw === 8) return '8주 (약 2개월)';
      if (sw === 12) return '12주 (약 3개월)';
      if (sw % 4 === 0) return sw + '주 (약 ' + (sw / 4) + '개월)';
      const m = Number((sw / 4.3).toFixed(1));
      return m >= 1 ? sw + '주 (약 ' + m + '개월)' : sw + '주';
    }

    function detectWpGoal(curW, tgtW) {
      const diff = Number((tgtW - curW).toFixed(1));
      if (diff <= -0.3) return 'diet';
      if (diff >= 0.3) return 'bulk';
      return 'maintain';
    }

    function getWpPresets(curW, tgtW) {
      const gType = detectWpGoal(curW, tgtW);
      const absDiff = Math.abs(Number((tgtW - curW).toFixed(1)));
      if (gType === 'maintain') {
        return [4, 8, 12].map(w => ({ weeks: w, label: formatWeeksText(w), paceText: '현재 체중 그대로 유지', tag: w === 8 ? '추천' : '유지 기간', isRecommended: w === 8, isRealistic: true }));
      }
      const rates = gType === 'diet' ? [0.7, 0.5, 0.35, 0.25] : [0.4, 0.28, 0.2, 0.15];
      const set = new Set();
      rates.forEach(r => set.add(Math.min(104, Math.max(2, Math.round(absDiff / r)))));
      [2, 4, 6, 8, 12, 16].forEach(w => { if (set.size < 4) set.add(w); });
      const weeksList = Array.from(set).sort((a, b) => a - b).slice(0, 4);
      const idealRate = gType === 'diet' ? 0.5 : 0.28;
      let bestIdx = 0, bestDist = Infinity;
      weeksList.forEach((w, idx) => {
        const dist = Math.abs(absDiff / w - idealRate);
        if (dist < bestDist) { bestDist = dist; bestIdx = idx; }
      });
      return weeksList.map((w, idx) => {
        const weekly = Number((absDiff / w).toFixed(2));
        const isRec = idx === bestIdx;
        if (gType === 'diet') {
          const isReal = weekly <= 0.9;
          let tag = '여유롭게';
          if (!isReal) tag = '너무 빠름';
          else if (isRec) tag = '추천 · 무리 없음';
          else if (weekly > 0.6) tag = '조금 빠름';
          else if (weekly < 0.32) tag = '천천히 편하게';
          return { weeks: w, label: formatWeeksText(w), paceText: '주당 약 ' + weekly + 'kg 감량', tag: tag, isRecommended: isRec, isRealistic: isReal };
        }
        const isReal = weekly <= 0.55;
        let tag = '깔끔한 증량';
        if (!isReal) tag = '체지방 주의';
        else if (isRec) tag = '추천 · 무리 없음';
        else if (weekly > 0.34) tag = '적극 벌크업';
        return { weeks: w, label: formatWeeksText(w), paceText: '주당 약 ' + weekly + 'kg 증량', tag: tag, isRecommended: isRec, isRealistic: isReal };
      });
    }

    function syncWeightInputToPlan() {
      const rawW = Number(document.getElementById('weight').value);
      if (!Number.isFinite(rawW) || rawW < 25 || rawW > 250) {
        return wpState.baseWeight;
      }
      const curW = Number(rawW.toFixed(1));
      if (wpState.baseWeight !== curW) {
        const offset = Number((wpState.targetWeight - wpState.baseWeight).toFixed(1));
        wpState.baseWeight = curW;
        wpState.targetWeight = Number(Math.max(30, Math.min(220, curW + offset)).toFixed(1));
        const presets = getWpPresets(curW, wpState.targetWeight);
        wpState.durationWeeks = (presets.find(p => p.isRecommended) || presets[0]).weeks;
      }
      return curW;
    }

    function computeWeightPlanWithBase(curW, bmr, tdee) {
      const tgtW = Number(Math.max(30, Math.min(220, wpState.targetWeight)).toFixed(1));
      const weeks = Math.max(1, Math.min(104, Math.round(wpState.durationWeeks || 8)));
      const diff = Number((tgtW - curW).toFixed(1));
      const absDiff = Math.abs(diff);
      const gType = detectWpGoal(curW, tgtW);
      const badge = gType === 'diet' ? '다이어트' : (gType === 'bulk' ? '벌크업' : '체중 유지');

      const weeklyChg = gType === 'maintain' ? 0 : Number((diff / weeks).toFixed(2));
      const rawDelta = gType === 'maintain' ? 0 : Math.round((diff * 7700) / (weeks * 7));
      const safeMin = Math.max(1100, Math.round(bmr * 0.9));
      const uncapped = tdee + rawDelta;
      const dailyCal = gType === 'maintain' ? tdee : Math.max(safeMin, Math.min(5000, uncapped));
      const actualDelta = dailyCal - tdee;
      const macros = wpMacros(dailyCal);

      const minRecWeeks = gType === 'maintain' ? 4 : Math.max(2, Math.ceil(absDiff / (gType === 'diet' ? 0.6 : 0.35)));
      let rStatus = 'good', rMsg = '';
      if (gType === 'diet') {
        if (Math.abs(weeklyChg) > 0.9 || uncapped < safeMin) {
          rStatus = 'too_fast';
          rMsg = '기간이 너무 짧아서 근손실이나 요요가 오기 쉬워요. 최소 ' + minRecWeeks + '주 이상으로 잡는 걸 추천해요.';
        } else if (Math.abs(weeklyChg) > 0.65) {
          rStatus = 'fast';
          rMsg = '조금 빠른 속도예요. 배고픔이나 피로감이 크다면 기간을 2~4주 늘려 보세요.';
        }
      } else if (gType === 'bulk') {
        if (weeklyChg > 0.55) {
          rStatus = 'too_fast';
          rMsg = '증량 속도가 너무 빨라 체지방이 많이 늘 수 있어요. ' + minRecWeeks + '주 이상 천천히 올리는 걸 추천해요.';
        } else if (weeklyChg > 0.38) {
          rStatus = 'fast';
          rMsg = '꽤 적극적인 벌크업 속도예요. 근력 운동 강도를 충분히 함께 높여 주세요.';
        }
      }

      return { curW, tgtW, weeks, diff, absDiff, gType, badge, bmr, tdee, weeklyChg, uncapped, safeMin, dailyCal, actualDelta, macros, minRecWeeks, rStatus, rMsg };
    }

    function renderRoadmapPage(skipTargetInputOverwrite) {
      const curW = syncWeightInputToPlan();
      const { bmr, tdee } = calcTdeeForWeight(curW);
      const plan = computeWeightPlanWithBase(curW, bmr, tdee);
      const tgtW = plan.tgtW;
      const weeks = plan.weeks;
      const diff = plan.diff;
      const absDiff = plan.absDiff;
      const gType = plan.gType;
      const weeklyChg = plan.weeklyChg;
      const dailyCal = plan.dailyCal;
      const actualDelta = plan.actualDelta;
      const macros = plan.macros;

      document.getElementById('wp-current-badge').innerHTML = '현재 체중 <strong class="text-slate-950 font-semibold">' + curW + 'kg</strong> <span class="mx-1.5 text-slate-300">·</span> 유지 <strong class="text-slate-950 font-semibold">' + tdee.toLocaleString() + 'kcal</strong>';
      if (!skipTargetInputOverwrite) {
        document.getElementById('wp-target-weight').value = String(tgtW);
      }
      document.getElementById('wp-custom-weeks').value = String(weeks);

      const badge = plan.badge;
      const dirBadge = document.getElementById('wp-direction-badge');
      dirBadge.className = 'inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ' + (gType === 'diet' ? 'bg-emerald-50 text-emerald-700 border border-emerald-600/20' : (gType === 'bulk' ? 'bg-sky-50 text-sky-700 border border-sky-600/20' : 'bg-slate-100 text-slate-700 border border-slate-200'));
      dirBadge.textContent = badge + (diff !== 0 ? ' (' + (diff > 0 ? '+' : '') + diff + 'kg)' : '');

      const qWrap = document.getElementById('wp-quick-deltas');
      qWrap.innerHTML = '';
      [-5, -3, 0, 3, 5].forEach(d => {
        const cand = Number(Math.max(30, Math.min(220, curW + d)).toFixed(1));
        const active = Math.abs(tgtW - cand) < 0.05;
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'px-3 py-2 min-h-[38px] rounded-xl border text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ' + (active ? 'bg-emerald-50 border-emerald-600/70 text-emerald-800 font-semibold' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900');
        b.textContent = d === 0 ? '현재 유지 (' + cand + 'kg)' : (d > 0 ? '+' + d : d) + 'kg (' + cand + 'kg)';
        b.onclick = () => {
          wpState.targetWeight = cand;
          const ps = getWpPresets(curW, cand);
          wpState.durationWeeks = (ps.find(p => p.isRecommended) || ps[0]).weeks;
          document.getElementById('wp-target-error').classList.add('hidden');
          renderRoadmapPage(false);
        };
        qWrap.appendChild(b);
      });

      const presets = getWpPresets(curW, tgtW);
      const pWrap = document.getElementById('wp-duration-presets');
      pWrap.innerHTML = '';
      presets.forEach(p => {
        const active = weeks === p.weeks;
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'p-3.5 rounded-2xl border text-left transition-colors cursor-pointer ' + (active ? 'bg-emerald-50/80 border-emerald-600/80 text-slate-950' : 'bg-slate-50 border-slate-200/80 text-slate-700 hover:bg-slate-100/80');
        b.innerHTML = '<span class="block text-sm font-bold text-slate-950 font-mono-num">' + p.label + '</span>' +
          '<p class="mt-1 text-xs text-slate-600">' + p.paceText + '</p>' +
          '<span class="mt-2 inline-block text-[11px] font-semibold ' + (!p.isRealistic ? 'text-amber-700' : (p.isRecommended || active ? 'text-emerald-700' : 'text-slate-500')) + '">' + p.tag + '</span>';
        b.onclick = () => { wpState.durationWeeks = p.weeks; renderRoadmapPage(false); };
        pWrap.appendChild(b);
      });

      const rBox = document.getElementById('wp-realism-box');
      if (plan.rStatus === 'good') {
        rBox.classList.add('hidden');
      } else {
        rBox.classList.remove('hidden');
        rBox.className = 'p-3.5 rounded-2xl border flex flex-wrap items-center justify-between gap-3 ' + (plan.rStatus === 'too_fast' ? 'bg-amber-50 border-amber-300/80 text-amber-900' : 'bg-slate-50 border-slate-200 text-slate-700');
        rBox.innerHTML = '<span class="text-xs leading-relaxed">' + escapeHtml(plan.rMsg) + '</span>';
        if (plan.rStatus === 'too_fast') {
          const fixBtn = document.createElement('button');
          fixBtn.type = 'button';
          fixBtn.className = 'px-3 py-1.5 rounded-xl bg-white border border-amber-300 hover:bg-amber-100/50 text-amber-900 text-xs font-semibold cursor-pointer shrink-0';
          fixBtn.textContent = plan.minRecWeeks + '주로 맞추기';
          fixBtn.onclick = () => { wpState.durationWeeks = plan.minRecWeeks; renderRoadmapPage(false); };
          rBox.appendChild(fixBtn);
        }
      }

      document.getElementById('wp-summary-headline').textContent = gType === 'diet' ? ('총 ' + absDiff + 'kg 감량 다이어트가 필요해요') : (gType === 'bulk' ? ('총 ' + absDiff + 'kg 증량 벌크업이 필요해요') : '현재 체중을 그대로 유지하면 돼요');
      const goBtn = document.getElementById('wp-go-planner-btn');
      goBtn.textContent = dailyCal.toLocaleString() + 'kcal (' + badge + ')로 식단 짜러 가기 →';
      goBtn.onclick = () => {
        currentTargets = Object.assign({ calories: dailyCal }, macros);
        setPage('select');
      };

      document.getElementById('wp-kpi-grid').innerHTML =
        '<div class="p-4 rounded-2xl bg-slate-50 border border-slate-200/70"><span class="block text-xs text-slate-500">해야 할 목표</span><p class="mt-1 font-display text-xl sm:text-2xl font-bold text-slate-950">' + badge + '</p><span class="block text-xs text-slate-500 mt-1 font-mono-num">' + (gType === 'maintain' ? '현재 체중 유지' : '주당 약 ' + Math.abs(weeklyChg) + 'kg ' + (gType === 'diet' ? '감량' : '증량')) + '</span></div>' +
        '<div class="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-600/25"><span class="block text-xs font-medium text-emerald-800">하루 권장 칼로리</span><p class="mt-1 font-mono-num text-xl sm:text-2xl font-bold text-slate-950">' + dailyCal.toLocaleString() + '<span class="text-xs font-normal text-slate-500 ml-1">kcal</span></p><span class="block text-xs text-emerald-700 mt-1 font-mono-num">' + (actualDelta === 0 ? '유지 칼로리와 동일' : '유지보다 하루 ' + (actualDelta > 0 ? '+' : '') + actualDelta.toLocaleString() + 'kcal') + '</span></div>' +
        '<div class="p-4 rounded-2xl bg-slate-50 border border-slate-200/70"><span class="block text-xs text-slate-500">하루 탄 · 단 · 지 (5:3:2)</span><p class="mt-1.5 font-mono-num text-sm sm:text-base font-bold text-slate-950 flex flex-wrap items-center gap-x-1.5 gap-y-0.5"><span class="whitespace-nowrap">탄 ' + macros.carbs + 'g</span><span class="text-slate-300">·</span><span class="whitespace-nowrap">단 ' + macros.protein + 'g</span><span class="text-slate-300">·</span><span class="whitespace-nowrap">지 ' + macros.fat + 'g</span></p><span class="block text-xs text-slate-500 mt-1.5">' + formatWeeksText(weeks) + ' 기준</span></div>';

      const miles = [];
      if (gType === 'maintain') {
        miles.push({ l: '지금', w: curW }, { l: Math.round(weeks / 2) + '주 뒤', w: curW }, { l: weeks + '주 뒤', w: tgtW });
      } else {
        const sc = Math.min(4, Math.max(2, weeks >= 8 ? 4 : 2));
        for (let i = 0; i <= sc; i++) {
          const wk = Math.round((weeks * i) / sc);
          const wt = i === sc ? tgtW : Number((curW + (diff * i) / sc).toFixed(1));
          miles.push({ l: i === 0 ? '지금' : (i === sc ? wk + '주 목표' : wk + '주 뒤'), w: wt });
        }
      }
      document.getElementById('wp-milestones').innerHTML = miles.map((m, idx) => {
        const last = idx === miles.length - 1;
        return '<div class="p-3 rounded-2xl border ' + (last ? 'bg-emerald-50/70 border-emerald-600/30' : 'bg-slate-50 border-slate-200/70') + '"><span class="block text-[11px] font-medium ' + (last ? 'text-emerald-700' : 'text-slate-500') + '">' + m.l + '</span><span class="block mt-1 font-mono-num text-base font-bold text-slate-950">' + m.w + 'kg</span></div>';
      }).join('');

      const guides = gType === 'diet'
        ? [
            '유지 칼로리(' + tdee.toLocaleString() + 'kcal)보다 하루 약 ' + Math.abs(actualDelta).toLocaleString() + 'kcal 적게 드세요.',
            '근손실 예방을 위해 하루 단백질 ' + macros.protein + 'g(닭가슴살 약 ' + (macros.protein / 22.9).toFixed(1) + '덩이)을 우선 채워 주세요.',
            '주 1~2회 아침 공복에 체중을 확인하며 ' + formatWeeksText(weeks) + ' 동안 꾸준히 이어가세요.'
          ]
        : (gType === 'bulk'
            ? [
                '유지 칼로리(' + tdee.toLocaleString() + 'kcal)보다 하루 약 ' + actualDelta.toLocaleString() + 'kcal 더 드세요.',
                '근육량 위주로 늘리려면 주 3회 이상 근력 운동과 하루 단백질 ' + macros.protein + 'g 섭취가 중요해요.',
                '식사량을 한 번에 늘리기 어렵다면 탄수화물(' + macros.carbs + 'g)을 여러 끼니로 나눠 드세요.'
              ]
            : [
                '하루 유지 칼로리 ' + tdee.toLocaleString() + 'kcal에 맞춰 식사하면 체중이 안정적으로 유지돼요.',
                '단백질 ' + macros.protein + 'g을 챙기면서 현재 운동 습관을 꾸준히 이어가세요.',
                '체중이 1kg 이상 움직일 때만 식사량을 가볍게 조절해 주세요.'
              ]);
      document.getElementById('wp-guides').innerHTML = guides.map(g => '<li class="flex items-start gap-2 text-xs sm:text-sm text-slate-700 leading-relaxed"><span class="text-emerald-600 font-bold">✓</span><span>' + escapeHtml(g) + '</span></li>').join('');
    }

    document.getElementById('wp-target-weight').addEventListener('input', e => {
      const raw = e.target.value.trim();
      const err = document.getElementById('wp-target-error');
      const n = Number(raw);
      if (!raw || !Number.isFinite(n) || n < 30 || n > 220) {
        err.textContent = '30 ~ 220kg 사이로 입력해 주세요.';
        err.classList.remove('hidden');
        return;
      }
      err.classList.add('hidden');
      const curW = syncWeightInputToPlan();
      wpState.targetWeight = Number(n.toFixed(1));
      const ps = getWpPresets(curW, wpState.targetWeight);
      wpState.durationWeeks = (ps.find(p => p.isRecommended) || ps[0]).weeks;
      renderRoadmapPage(true);
    });

    document.getElementById('wp-target-weight').addEventListener('blur', () => {
      document.getElementById('wp-target-error').classList.add('hidden');
      renderRoadmapPage(false);
    });

    document.getElementById('wp-custom-weeks').addEventListener('input', e => {
      const n = Number(e.target.value.trim());
      if (Number.isFinite(n) && n >= 1 && n <= 104) {
        wpState.durationWeeks = Math.round(n);
        renderRoadmapPage(true);
      }
    });
  </script>
</body>
</html>
`;
}

export function downloadStandaloneHtmlFile(): void {
  const html = buildStandaloneHtmlDocument();
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'diet-plan-generator.html';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
