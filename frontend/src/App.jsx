import { useMemo, useState } from 'react'
import axios from 'axios'
import Setup from './components/Setup'
import Dashboard from './components/Dashboard'
import InterviewRoom from './components/InterviewRoom'
import FeedbackCard from './components/FeedbackCard'
import SessionReport from './components/SessionReport'
import { API_BASE_URL, TOTAL_QUESTIONS } from './lib/config'

function emptySessionData() {
  return {
    questions: [],
    answers: [],
    scores: [],
    feedbackByQuestion: [],
  }
}

function calculateAverage(scores) {
  if (!scores.length) return 0
  const total = scores.reduce((sum, score) => sum + Number(score || 0), 0)
  return Number((total / scores.length).toFixed(1))
}

export default function App() {
  const [screen, setScreen] = useState('setup')
  const [config, setConfig] = useState({
    name: '',
    role: '',
    difficulty: 'Fresher',
    type: 'Mixed',
  })
  const [currentQ, setCurrentQ] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [sessionData, setSessionData] = useState(emptySessionData)
  const [history, setHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyError, setHistoryError] = useState('')
  const [saveState, setSaveState] = useState({
    status: 'idle',
    message: '',
  })

  const averageScore = useMemo(
    () => calculateAverage(sessionData.scores),
    [sessionData.scores]
  )

  async function loadHistory(name) {
    if (!name?.trim()) {
      setHistory([])
      return
    }

    setHistoryLoading(true)
    setHistoryError('')

    try {
      const response = await axios.get(
        `${API_BASE_URL}/history/${encodeURIComponent(name.trim())}`
      )
      setHistory(Array.isArray(response.data) ? response.data : [])
    } catch (error) {
      console.error(error)
      setHistory([])
      setHistoryError('Unable to load past sessions right now.')
    } finally {
      setHistoryLoading(false)
    }
  }

  async function handleSetupStart(nextConfig) {
    setConfig(nextConfig)
    setSaveState({ status: 'idle', message: '' })
    await loadHistory(nextConfig.name)
    setScreen('dashboard')
  }

  function startInterview() {
    setSessionData(emptySessionData())
    setFeedback(null)
    setCurrentQ('')
    setSaveState({ status: 'idle', message: '' })
    setScreen('interview')
  }

  async function handleSaveSession() {
    if (!sessionData.scores.length) {
      setSaveState({
        status: 'error',
        message: 'No answers were submitted, so this session cannot be saved.',
      })
      return
    }

    setSaveState({ status: 'saving', message: '' })

    try {
      await axios.post(`${API_BASE_URL}/save-session`, {
        name: config.name.trim(),
        role: config.role,
        difficulty: config.difficulty,
        question_type: config.type,
        overall_score: averageScore,
        questions: sessionData.questions,
        answers: sessionData.answers,
        scores: sessionData.scores,
      })
      setSaveState({
        status: 'saved',
        message: 'Session saved successfully.',
      })
      await loadHistory(config.name)
    } catch (error) {
      console.error(error)
      setSaveState({
        status: 'error',
        message: 'Failed to save this session. Please try again.',
      })
    }
  }

  return (
    <div className="app-shell text-slate-100">
      {screen === 'setup' && (
        <Setup onStart={handleSetupStart} initialConfig={config} />
      )}

      {screen === 'dashboard' && (
        <Dashboard
          config={config}
          history={history}
          loading={historyLoading}
          error={historyError}
          onStart={startInterview}
          onEditProfile={() => setScreen('setup')}
        />
      )}

      {screen === 'interview' && (
        <InterviewRoom
          config={config}
          sessionData={sessionData}
          totalQuestions={TOTAL_QUESTIONS}
          onFeedback={(question, answer, payload) => {
            setCurrentQ(question)
            setFeedback(payload)
            setSessionData(prev => ({
              questions: [...prev.questions, question],
              answers: [...prev.answers, answer],
              scores: [...prev.scores, Number(payload.overall_score || 0)],
              feedbackByQuestion: [...prev.feedbackByQuestion, payload],
            }))
            setScreen('feedback')
          }}
          onFinish={() => setScreen('report')}
        />
      )}

      {screen === 'feedback' && (
        <FeedbackCard
          feedback={feedback}
          question={currentQ}
          onNext={() => setScreen('interview')}
          onFinish={() => setScreen('report')}
          questionNum={sessionData.questions.length}
          totalQuestions={TOTAL_QUESTIONS}
        />
      )}

      {screen === 'report' && (
        <SessionReport
          config={config}
          sessionData={sessionData}
          averageScore={averageScore}
          totalQuestions={TOTAL_QUESTIONS}
          onSave={handleSaveSession}
          saveState={saveState}
          onRestart={() => setScreen('dashboard')}
        />
      )}
    </div>
  )
}