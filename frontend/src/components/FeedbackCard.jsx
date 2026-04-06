import { ArrowRight, CircleCheck, Lightbulb, ShieldAlert } from 'lucide-react'

function scoreTone(score) {
  if (score >= 8) return 'text-emerald-300'
  if (score >= 6) return 'text-amber-300'
  return 'text-rose-300'
}

function metricWidth(value) {
  const score = Number(value || 0)
  return `${Math.max(10, Math.min(100, score * 10))}%`
}

export default function FeedbackCard({
  feedback,
  question,
  onNext,
  onFinish,
  questionNum,
  totalQuestions,
}) {
  if (!feedback) {
    return (
      <section className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-4 py-8 sm:px-8">
        <div className="card-panel w-full p-6 text-sm text-rose-300">
          Feedback data is unavailable for this answer.
        </div>
      </section>
    )
  }

  const metrics = [
    { label: 'Clarity', value: Number(feedback.clarity_score || 0) },
    { label: 'Depth', value: Number(feedback.depth_score || 0) },
    { label: 'Communication', value: Number(feedback.communication_score || 0) },
  ]

  const score = Number(feedback.overall_score || 0)
  const buttonLabel = questionNum < totalQuestions ? 'Next Question' : 'View Final Report'

  return (
    <section className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-4 py-8 sm:px-8">
      <div className="card-panel w-full animate-rise p-6 sm:p-8">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="eyebrow mb-2">Answer Review</p>
            <h2 className="section-title">
              Question {questionNum} of {totalQuestions}
            </h2>
          </div>
          <p className={`text-5xl font-bold tracking-tight ${scoreTone(score)}`}>
            {score.toFixed(1)}
            <span className="ml-1 text-xl text-slate-400">/10</span>
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4 text-sm text-slate-300">
          {question}
        </div>

        <div className="mt-5 space-y-3">
          {metrics.map(metric => (
            <div key={metric.label} className="rounded-xl border border-white/10 bg-slate-950/35 p-3">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium text-slate-100">{metric.label}</span>
                <span className="text-slate-300">{metric.value.toFixed(1)}/10</span>
              </div>
              <div className="h-2 rounded-full bg-slate-800/80">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-200"
                  style={{ width: metricWidth(metric.value) }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <article className="rounded-2xl border border-emerald-400/25 bg-emerald-500/8 p-4">
            <p className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-emerald-200">
              <CircleCheck className="h-4 w-4" />
              Strengths
            </p>
            <ul className="space-y-1 text-sm text-slate-200">
              {(feedback.strengths || []).map((item, index) => (
                <li key={`${item}-${index}`}>• {item}</li>
              ))}
            </ul>
          </article>

          <article className="rounded-2xl border border-amber-400/25 bg-amber-500/8 p-4">
            <p className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-amber-200">
              <ShieldAlert className="h-4 w-4" />
              Improvements
            </p>
            <ul className="space-y-1 text-sm text-slate-200">
              {(feedback.improvements || []).map((item, index) => (
                <li key={`${item}-${index}`}>• {item}</li>
              ))}
            </ul>
          </article>
        </div>

        <article className="mt-4 rounded-2xl border border-white/10 bg-slate-950/35 p-4">
          <p className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-brand-200">
            <Lightbulb className="h-4 w-4" />
            Ideal answer direction
          </p>
          <p className="text-sm text-slate-300">{feedback.ideal_answer_hint}</p>
        </article>

        <button
          type="button"
          onClick={questionNum < totalQuestions ? onNext : onFinish}
          className="btn-primary mt-6 w-full justify-center py-3"
        >
          <ArrowRight className="h-4 w-4" />
          {buttonLabel}
        </button>
      </div>
    </section>
  )
}