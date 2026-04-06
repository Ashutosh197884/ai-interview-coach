import {
  CalendarClock,
  ClipboardList,
  Gauge,
  PlayCircle,
  UserRoundPen,
} from 'lucide-react'

function formatTimestamp(value) {
  if (!value) return 'Unknown'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Unknown'
  return date.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

function scoreClass(score) {
  if (score >= 8) return 'text-emerald-300'
  if (score >= 6) return 'text-amber-300'
  return 'text-rose-300'
}

export default function Dashboard({
  config,
  history,
  loading,
  error,
  onStart,
  onEditProfile,
}) {
  const averageScore = history.length
    ? (
        history.reduce((sum, item) => sum + Number(item.overall_score || 0), 0) /
        history.length
      ).toFixed(1)
    : '-'

  const bestScore = history.length
    ? Math.max(...history.map(item => Number(item.overall_score || 0))).toFixed(1)
    : '-'

  return (
    <section className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-8 sm:px-8">
      <div className="grid w-full gap-6 lg:grid-cols-[1fr_1.2fr]">
        <div className="card-panel animate-rise p-6 sm:p-8">
          <p className="eyebrow mb-3">Candidate Profile</p>
          <h1 className="display-title mb-2">{config.name}</h1>
          <p className="text-sm text-slate-300">
            {config.role} · {config.difficulty} · {config.type} Focus
          </p>

          <div className="mt-6 space-y-3">
            <div className="stat-card">
              <ClipboardList className="h-4 w-4 text-brand-300" />
              <span className="text-sm text-slate-300">Total Sessions</span>
              <span className="ml-auto text-sm font-semibold text-slate-100">
                {history.length}
              </span>
            </div>
            <div className="stat-card">
              <Gauge className="h-4 w-4 text-brand-300" />
              <span className="text-sm text-slate-300">Average Score</span>
              <span className="ml-auto text-sm font-semibold text-slate-100">
                {averageScore === '-' ? '-' : `${averageScore}/10`}
              </span>
            </div>
            <div className="stat-card">
              <CalendarClock className="h-4 w-4 text-brand-300" />
              <span className="text-sm text-slate-300">Best Score</span>
              <span className="ml-auto text-sm font-semibold text-slate-100">
                {bestScore === '-' ? '-' : `${bestScore}/10`}
              </span>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button className="btn-primary" onClick={onStart}>
              <PlayCircle className="h-4 w-4" />
              Start New Interview
            </button>
            <button className="btn-ghost" onClick={onEditProfile}>
              <UserRoundPen className="h-4 w-4" />
              Edit Setup
            </button>
          </div>
        </div>

        <div className="card-panel animate-rise p-6 sm:p-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="section-title">Recent Sessions</h2>
            {loading && (
              <span className="text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
                Loading...
              </span>
            )}
          </div>

          {error && <p className="mb-4 text-sm text-rose-300">{error}</p>}

          {!loading && !history.length && !error && (
            <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-6 text-sm text-slate-300">
              No sessions saved yet. Start your first mock interview to build
              your performance history.
            </div>
          )}

          {!!history.length && (
            <div className="max-h-[420px] space-y-3 overflow-auto pr-1">
              {history.map(item => (
                <article
                  key={item.id}
                  className="rounded-2xl border border-white/10 bg-slate-950/45 p-4"
                >
                  <div className="mb-2 flex items-center justify-between gap-4">
                    <p className="text-sm font-semibold text-slate-100">
                      {item.role}
                    </p>
                    <p
                      className={`text-sm font-bold ${scoreClass(
                        Number(item.overall_score || 0)
                      )}`}
                    >
                      {Number(item.overall_score || 0).toFixed(1)}/10
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
                    <span>{item.difficulty}</span>
                    <span>{item.question_type || 'Mixed'} Focus</span>
                    <span>{formatTimestamp(item.created_at)}</span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
