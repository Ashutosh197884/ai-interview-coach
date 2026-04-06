import { useState } from 'react'
import { BriefcaseBusiness, Sparkles, UserRound } from 'lucide-react'

const ROLES = [
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'Data Analyst',
  'ML Engineer',
  'Product Manager',
  'UI/UX Designer',
  'Business Analyst',
]

export default function Setup({ onStart, initialConfig }) {
  const [name, setName] = useState(initialConfig?.name || '')
  const [role, setRole] = useState(initialConfig?.role || '')
  const [difficulty, setDifficulty] = useState(
    initialConfig?.difficulty || 'Fresher'
  )
  const [type, setType] = useState(initialConfig?.type || 'Mixed')

  const canStart = name.trim() && role

  return (
    <section className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-8 sm:px-8">
      <div className="grid w-full gap-6 lg:grid-cols-[1.1fr_1fr]">
        <div className="animate-rise px-1 py-2">
          <p className="eyebrow mb-4">AI Interview Coach</p>
          <h1 className="display-title max-w-xl">
            Practice interviews in a structured, professional simulation.
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">
            Configure your role, experience level, and interview focus. The
            coach will generate realistic questions and score each response with
            actionable feedback.
          </p>

          <div className="mt-8 grid gap-3 sm:max-w-lg sm:grid-cols-3">
            <article className="stat-card">
              <Sparkles className="h-4 w-4 text-brand-300" />
              <span className="text-xs text-slate-300">AI generated</span>
            </article>
            <article className="stat-card">
              <BriefcaseBusiness className="h-4 w-4 text-brand-300" />
              <span className="text-xs text-slate-300">Role specific</span>
            </article>
            <article className="stat-card">
              <UserRound className="h-4 w-4 text-brand-300" />
              <span className="text-xs text-slate-300">Personal progress</span>
            </article>
          </div>
        </div>

        <div className="card-panel animate-rise p-6 sm:p-8">
          <h2 className="section-title mb-5">Interview Setup</h2>

          <label className="field-label">Candidate name</label>
          <input
            className="field-input mb-4"
            placeholder="Enter your full name"
            value={name}
            onChange={event => setName(event.target.value)}
          />

          <label className="field-label">Target role</label>
          <select
            className="field-input mb-4"
            value={role}
            onChange={event => setRole(event.target.value)}
          >
            <option value="">Select a role</option>
            {ROLES.map(item => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <label className="field-label">Difficulty level</label>
          <div className="mb-4 grid gap-2 sm:grid-cols-3">
            {['Fresher', 'Mid-level', 'Senior'].map(item => (
              <button
                key={item}
                type="button"
                onClick={() => setDifficulty(item)}
                className={`pill-button ${difficulty === item ? 'is-active' : ''}`}
              >
                {item}
              </button>
            ))}
          </div>

          <label className="field-label">Interview focus</label>
          <div className="mb-6 grid gap-2 sm:grid-cols-3">
            {['Technical', 'HR', 'Mixed'].map(item => (
              <button
                key={item}
                type="button"
                onClick={() => setType(item)}
                className={`pill-button ${type === item ? 'is-active' : ''}`}
              >
                {item}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() =>
              onStart({ name: name.trim(), role, difficulty, type })
            }
            disabled={!canStart}
            className="btn-primary w-full justify-center py-3 disabled:cursor-not-allowed disabled:opacity-45"
          >
            Continue to Dashboard
          </button>
        </div>
      </div>
    </section>
  )
}