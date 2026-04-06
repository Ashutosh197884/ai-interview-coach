import { useState } from 'react'
import { BriefcaseBusiness, Sparkles, UserRound, AlertCircle } from 'lucide-react'

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

const MAX_NAME_LENGTH = 50

export default function Setup({ onStart, initialConfig }) {
  const [name, setName] = useState(initialConfig?.name || '')
  const [role, setRole] = useState(initialConfig?.role || '')
  const [difficulty, setDifficulty] = useState(
    initialConfig?.difficulty || 'Fresher'
  )
  const [type, setType] = useState(initialConfig?.type || 'Mixed')
  const [validationError, setValidationError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const canStart = name.trim() && role && !validationError

  const handleNameChange = (event) => {
    const value = event.target.value
    if (value.length <= MAX_NAME_LENGTH) {
      setName(value)
      setValidationError('')
    }
  }

  const handleStart = async () => {
    setValidationError('')
    
    // Validate name
    if (!name.trim()) {
      setValidationError('Please enter your name')
      return
    }
    if (name.trim().length < 2) {
      setValidationError('Name must be at least 2 characters')
      return
    }
    
    // Validate role
    if (!role) {
      setValidationError('Please select a role')
      return
    }
    
    setIsSubmitting(true)
    try {
      onStart({ name: name.trim(), role, difficulty, type })
    } finally {
      setIsSubmitting(false)
    }
  }

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

          {validationError && (
            <div className="mb-4 flex items-center gap-2 rounded-md bg-rose-500/10 p-3 text-sm text-rose-300">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          <label className="field-label">Candidate name</label>
          <input
            className="field-input mb-4"
            placeholder="Enter your full name"
            value={name}
            onChange={handleNameChange}
            maxLength={MAX_NAME_LENGTH}
            disabled={isSubmitting}
            aria-label="Candidate name"
            required
          />
          <p className="mb-4 text-xs text-slate-400">
            {name.length}/{MAX_NAME_LENGTH}
          </p>

          <label className="field-label">Target role</label>
          <select
            className="field-input mb-4"
            value={role}
            onChange={event => setRole(event.target.value)}
            disabled={isSubmitting}
            aria-label="Target role"
            required
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
                disabled={isSubmitting}
                aria-pressed={difficulty === item}
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
                disabled={isSubmitting}
                aria-pressed={type === item}
                className={`pill-button ${type === item ? 'is-active' : ''}`}
              >
                {item}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleStart}
            disabled={!canStart || isSubmitting}
            className="btn-primary w-full justify-center py-3 disabled:cursor-not-allowed disabled:opacity-45"
            aria-label="Continue to dashboard"
          >
            {isSubmitting ? 'Loading...' : 'Continue to Dashboard'}
          </button>
        </div>
      </div>
    </section>
  )
}