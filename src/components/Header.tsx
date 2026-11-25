export type AppPage = 'calculator' | 'planner' | 'roadmap';

interface HeaderProps {
  activePage: AppPage;
  onNavigate: (page: AppPage) => void;
}

export function Header({ activePage, onNavigate }: HeaderProps) {
  return (
    <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-3 sm:px-8 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-8">
        <button
          type="button"
          onClick={() => onNavigate('calculator')}
          className="font-display text-[13px] sm:text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 hover:text-emerald-700 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 rounded-lg"
        >
          내몸맞춤식단계획생성기
        </button>

        <nav aria-label="주요 메뉴" className="flex items-center gap-3 sm:gap-7 h-full">
          <button
            type="button"
            onClick={() => onNavigate('calculator')}
            className={`relative h-full flex items-center text-[11px] sm:text-sm font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 ${
              activePage === 'calculator'
                ? 'text-slate-950 font-semibold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            칼로리 계산
            {activePage === 'calculator' && (
              <span
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 h-[2px] bg-emerald-600 rounded-full"
              />
            )}
          </button>

          <button
            type="button"
            onClick={() => onNavigate('roadmap')}
            className={`relative h-full flex items-center text-[11px] sm:text-sm font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 ${
              activePage === 'roadmap'
                ? 'text-slate-950 font-semibold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <span>
              <span className="hidden sm:inline">목표 </span>체중 계획
            </span>
            {activePage === 'roadmap' && (
              <span
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 h-[2px] bg-emerald-600 rounded-full"
              />
            )}
          </button>

          <button
            type="button"
            onClick={() => onNavigate('planner')}
            className={`relative h-full flex items-center text-[11px] sm:text-sm font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 ${
              activePage === 'planner'
                ? 'text-slate-950 font-semibold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            식단 짜기
            {activePage === 'planner' && (
              <span
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 h-[2px] bg-emerald-600 rounded-full"
              />
            )}
          </button>
        </nav>
      </div>
    </header>
  );
}
