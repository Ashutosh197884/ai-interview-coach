import { LoaderCircle, Mic, MicOff, SendHorizontal, StopCircle, AlertCircle, Volume2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { API_BASE_URL } from '../lib/config'

const MIN_ANSWER_LENGTH = 10
const MAX_ANSWER_LENGTH = 5000

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
  const [answerWarning, setAnswerWarning] = useState('')
  const [isSpeaking, setIsSpeaking] = useState(false)

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

  const answerWordCount = answer.trim().split(/\s+/).length

  async function fetchQuestion() {
    setLoading(true)
    setErrorMessage('')
    setAnswer('')
    setAnswerWarning('')

    try {
      const response = await axios.post(`${API_BASE_URL}/get-question`, {
        role: config.role,
        difficulty: config.difficulty,
        question_type: config.type,
        previous_questions: sessionData.questions,
      })
      const newQuestion = String(response.data?.question || '').trim()
      if (!newQuestion) {
        throw new Error('Empty question received')
      }
      setQuestion(newQuestion)
      speakQuestion(newQuestion)
    } catch (error) {
      console.error(error)
      setQuestion('')
      setErrorMessage('Unable to generate a question. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function speakQuestion(text) {
    if (!text.trim()) return

    // Check browser support
    if (!window.speechSynthesis) {
      console.warn('Speech Synthesis not supported')
      return
    }

    // Stop any ongoing speech
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'en-US'
    utterance.rate = 0.95
    utterance.pitch = 1.0
    utterance.volume = 1.0

    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    window.speechSynthesis.speak(utterance)
  }

  function validateAnswer() {
    if (!answer.trim()) {
      setAnswerWarning('Please provide an answer')
      return false
    }
    if (answer.length > MAX_ANSWER_LENGTH) {
      setAnswerWarning(`Answer exceeds maximum length (${MAX_ANSWER_LENGTH} characters)`)
      return false
    }
    if (answerWordCount < MIN_ANSWER_LENGTH) {
      setAnswerWarning(`Minimum ${MIN_ANSWER_LENGTH} words required (${answerWordCount} provided)`)
      return false
    }
    setAnswerWarning('')
    return true
  }

  async function submitAnswer() {
    if (!validateAnswer() || !question.trim()) return

    setSubmitting(true)
    setErrorMessage('')

    try {
      const response = await axios.post(`${API_BASE_URL}/evaluate`, {
        question,
        answer: answer.trim(),
        role: config.role,
        difficulty: config.difficulty,
        question_type: config.type,
      })
      
      if (!response.data || typeof response.data.overall_score === 'undefined') {
        throw new Error('Invalid evaluation response')
      }
      
      onFeedback(question, answer.trim(), response.data)
    } catch (error) {
      console.error(error)
      setErrorMessage('Failed to evaluate answers. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  function toggleVoice() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setErrorMessage('Speech recognition is not supported in this browser. Please type your answer.')
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
    recognizer.lang = 'en-US'

    recognizer.onstart = () => {
      setListening(true)
      setErrorMessage('')
    }

    recognizer.onresult = event => {
      const transcript = Array.from(event.results)
        .map(item => item[0].transcript)
        .join(' ')
      setAnswer(prev => {
        const updated = `${prev} ${transcript}`.trim()
        if (updated.length > MAX_ANSWER_LENGTH) {
          setErrorMessage('Answer length limit reached')
          recognizer.stop()
          return prev
        }
        return updated
      })
    }

    recognizer.onerror = (event) => {
      console.error('Speech recognition error:', event.error)
      setErrorMessage(`Microphone error: ${event.error}. Please type your answer.`)
      setListening(false)
    }

    recognizer.onend = () => {
      setListening(false)
    }

    try {
      recognizer.start()
      recognitionRef.current = recognizer
    } catch (error) {
      console.error('Failed to start speech recognition:', error)
      setErrorMessage('Could not start speech recognition. Please type your answer.')
    }
  }

  const canSubmit = answer.trim() && answerWordCount >= MIN_ANSWER_LENGTH && !loading && !submitting

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

        {/* Interviewer Avatar */}
        <div className={`interviewer-avatar ${isSpeaking ? 'speaking' : ''}`}>
          <img 
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&amp;auto=format&amp;fit=crop&amp;w=100&amp;q=80&amp;crop=face" 
            alt="AI Interviewer" 
            className="avatar-image"
          />
          <div className="mouth-overlay" />
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
            <p className="flex items-center gap-2 text-sm text-rose-300">
              <AlertCircle className="h-4 w-4" />
              Unable to generate a question. Please try again.
            </p>
          )}
        </div>

        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between">
            <label className="field-label">Your answer</label>
            <span className={`text-xs ${answerWordCount < MIN_ANSWER_LENGTH ? 'text-rose-400' : 'text-slate-400'}`}>
              {answerWordCount} words
            </span>
          </div>
          <textarea
            className="field-input h-40 resize-none"
            placeholder="Use a concise structure: context, action, result, and impact."
            value={answer}
            onChange={event => {
              const newAnswer = event.target.value
              if (newAnswer.length <= MAX_ANSWER_LENGTH) {
                setAnswer(newAnswer)
                setAnswerWarning('')
              }
            }}
            disabled={loading || submitting}
            maxLength={MAX_ANSWER_LENGTH}
            aria-label="Your answer"
          />
        </div>

        {errorMessage && (
          <div className="mt-3 flex items-center gap-2 rounded-md bg-rose-500/10 p-3 text-sm text-rose-300">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {errorMessage}
          </div>
        )}

        {answerWarning && !errorMessage && (
          <div className="mt-3 flex items-center gap-2 rounded-md bg-amber-500/10 p-3 text-sm text-amber-300">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {answerWarning}
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => speakQuestion(question)}
            disabled={loading || !question || isSpeaking}
            className="btn-ghost disabled:opacity-45 disabled:cursor-not-allowed"
            title="Re-speak question"
          >
            <Volume2 className={`h-4 w-4 ${isSpeaking ? 'animate-pulse' : ''}`} />
            {isSpeaking ? 'Speaking...' : '🔊 Re-speak'}
          </button>

          <button
            type="button"
            onClick={toggleVoice}
            disabled={submitting || loading || isSpeaking}
            className="btn-ghost disabled:opacity-45 disabled:cursor-not-allowed"
            title={listening ? 'Stop recording' : 'Start recording'}
          >
            {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            {listening ? 'Stop Voice Input' : 'Voice Input'}
          </button>

          <button
            type="button"
            onClick={submitAnswer}
            disabled={!canSubmit}
            className="btn-primary ml-auto disabled:cursor-not-allowed disabled:opacity-45"
            title={!canSubmit ? `At least ${MIN_ANSWER_LENGTH} words required` : 'Submit answer for evaluation'}
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

          <button 
            type="button" 
            onClick={onFinish} 
            disabled={submitting}
            className="btn-ghost disabled:opacity-45 disabled:cursor-not-allowed"
            title="End the interview session"
          >
            <StopCircle className="h-4 w-4" />
            End Session
          </button>
        </div>
      </div>
    </section>
  )
}