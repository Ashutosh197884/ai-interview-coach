import { CheckCircle2, RotateCcw, Save } from 'lucide-react'

function gradeInfo(score) {
  if (score >= 8) return { label: 'Excellent', tone: 'text-emerald-300' }
  if (score >= 6) return { label: 'Good', tone: 'text-amber-300' }
  return { label: 'Needs Work', tone: 'text-rose-300' }
}

export default function SessionReport({
  config,
  sessionData,
  averageScore,
  totalQuestions,
  onSave,
  saveState,
  onRestart,
}) {
  const grade = gradeInfo(Number(averageScore || 0))

  return (
    <section className="mx-auto flex min-h-screen w-full max-w-4xl items-center px-4 py-8 sm:px-8">
      <div className="card-panel w-full animate-rise p-6 sm:p-8">
        <p className="eyebrow mb-3">Session Summary</p>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="section-title">Interview complete</h2>
            <p className="mt-1 text-sm text-slate-300">
              {config.name} · {config.role} · {config.difficulty} · {config.type} Focus
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-[0.14em] text-slate-400">
              Overall Score
            </p>
            <p className={`text-5xl font-bold tracking-tight ${grade.tone}`}>
              {Number(averageScore || 0).toFixed(1)}
              <span className="ml-1 text-xl text-slate-400">/10</span>
            </p>
            <p className={`text-sm font-semibold ${grade.tone}`}>{grade.label}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
          <div className="mb-3 flex items-center justify-between text-xs uppercase tracking-[0.14em] text-slate-400">
            <span>Per-question performance</span>
            <span>{sessionData.scores.length} / {totalQuestions} answered</span>
          </div>

          <div className="space-y-3">
            {sessionData.scores.map((score, index) => (
              <div key={`${score}-${index}`} className="flex items-center gap-3">
                <span className="w-14 text-xs text-slate-400">Q{index + 1}</span>
                <div className="h-2 flex-1 rounded-full bg-slate-800/80">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-200"
                    style={{ width: `${Math.max(10, Math.min(100, Number(score) * 10))}%` }}
                  />
                </div>
                <span className="w-10 text-right text-sm text-slate-200">
                  {Number(score).toFixed(1)}
                </span>
              </div>
            ))}

            {!sessionData.scores.length && (
              <p className="text-sm text-slate-400">No scores recorded yet.</p>
            )}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onSave}
            disabled={saveState.status === 'saving' || saveState.status === 'saved'}
            className="btn-primary disabled:cursor-not-allowed disabled:opacity-45"
          >
            {saveState.status === 'saved' ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Session Saved
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {saveState.status === 'saving' ? 'Saving...' : 'Save Session'}
              </>
            )}
          </button>

          <button type="button" onClick={onRestart} className="btn-ghost">
            <RotateCcw className="h-4 w-4" />
            Back to Dashboard
          </button>
        </div>

        {saveState.message && (
          <p
            className={`mt-4 text-sm ${
              saveState.status === 'saved' ? 'text-emerald-300' : 'text-rose-300'
            }`}
          >
            {saveState.message}
          </p>
        )}
      </div>
    </section>
  )
}