import { LoaderCircle, Mic, MicOff, SendHorizontal, StopCircle } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { API_BASE_URL } from '../lib/config'

export default function InterviewRoom({
  config,
  sessionData,
  onFeedback,
  onFinish,
  totalQuestions,
}) {
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [listening, setListening] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const recognitionRef = useRef(null)
  const questionNumber = sessionData.questions.length + 1

  useEffect(() => {
    if (questionNumber > totalQuestions) {
      onFinish()
      return
    }
    void fetchQuestion()
    return () => {
      recognitionRef.current?.stop()
    }
  }, [])

  async function fetchQuestion() {
    setLoading(true)
    setErrorMessage('')
    setAnswer('')

    try {
      const response = await axios.post(`${API_BASE_URL}/get-question`, {
        role: config.role,
        difficulty: config.difficulty,
        question_type: config.type,
        previous_questions: sessionData.questions,
      })
      setQuestion(String(response.data?.question || '').trim())
    } catch (error) {
      console.error(error)
      setQuestion('')
      setErrorMessage('Unable to generate a new question. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function submitAnswer() {
    if (!answer.trim() || !question.trim()) return

    setSubmitting(true)
    setErrorMessage('')

    try {
      const response = await axios.post(`${API_BASE_URL}/evaluate`, {
        question,
        answer,
        role: config.role,
        difficulty: config.difficulty,
        question_type: config.type,
      })
      onFeedback(question, answer.trim(), response.data)
    } catch (error) {
      console.error(error)
      setErrorMessage('Answer evaluation failed. Please submit again.')
    } finally {
      setSubmitting(false)
    }
  }

  function toggleVoice() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setErrorMessage('Speech recognition is not supported in this browser.')
      return
    }

    if (listening) {
      recognitionRef.current?.stop()
      setListening(false)
      return
    }

    const recognizer = new SpeechRecognition()
    recognizer.continuous = true
    recognizer.interimResults = false

    recognizer.onresult = event => {
      const transcript = Array.from(event.results)
        .map(item => item[0].transcript)
        .join(' ')
      setAnswer(prev => `${prev} ${transcript}`.trim())
    }

    recognizer.onerror = () => {
      setErrorMessage('Microphone input failed. Please type your answer.')
      setListening(false)
    }

    recognizer.onend = () => {
      setListening(false)
    }

    recognizer.start()
    recognitionRef.current = recognizer
    setListening(true)
  }

  return (
    <section className="mx-auto flex min-h-screen w-full max-w-4xl items-center px-4 py-8 sm:px-8">
      <div className="card-panel w-full animate-rise p-6 sm:p-8">
        <div className="mb-6">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs uppercase tracking-[0.14em] text-slate-400">
            <span>
              {config.role} · {config.difficulty} · {config.type}
            </span>
            <span>
              Question {questionNumber} of {totalQuestions}
            </span>
          </div>
          <div className="h-2 rounded-full bg-slate-800/80">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-200 transition-all duration-400"
              style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-5">
          {loading && (
            <p className="inline-flex items-center gap-2 text-sm text-slate-300">
              <LoaderCircle className="h-4 w-4 animate-spin" />
              Generating your next interview question...
            </p>
          )}
          {!loading && !!question && (
            <p className="text-base leading-relaxed text-slate-100 sm:text-lg">
              {question}
            </p>
          )}
          {!loading && !question && (
            <p className="text-sm text-rose-300">Question unavailable.</p>
          )}
        </div>

        <div className="mt-5">
          <label className="field-label">Your answer</label>
          <textarea
            className="field-input h-40 resize-none"
            placeholder="Use a concise structure: context, action, result, and impact."
            value={answer}
            onChange={event => setAnswer(event.target.value)}
          />
        </div>

        {errorMessage && <p className="mt-3 text-sm text-rose-300">{errorMessage}</p>}

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={toggleVoice}
            className="btn-ghost"
          >
            {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            {listening ? 'Stop Voice Input' : 'Voice Input'}
          </button>

          <button
            type="button"
            onClick={submitAnswer}
            disabled={!answer.trim() || loading || submitting}
            className="btn-primary ml-auto disabled:cursor-not-allowed disabled:opacity-45"
          >
            {submitting ? (
              <>
                <LoaderCircle className="h-4 w-4 animate-spin" />
                Evaluating...
              </>
            ) : (
              <>
                <SendHorizontal className="h-4 w-4" />
                Submit Answer
              </>
            )}
          </button>

          <button type="button" onClick={onFinish} className="btn-ghost">
            <StopCircle className="h-4 w-4" />
            End Session
          </button>
        </div>
      </div>
    </section>
  )
}