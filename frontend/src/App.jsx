import { useState } from 'react'
import Setup from './components/Setup'
import InterviewRoom from './components/InterviewRoom'
import FeedbackCard from './components/FeedbackCard'
import SessionReport from './components/SessionReport'

export default function App() {
  const [screen, setScreen] = useState('setup')
  const [config, setConfig] = useState({})
  const [currentQ, setCurrentQ] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [sessionData, setSessionData] = useState({
    questions: [], answers: [], scores: []
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      {screen === 'setup' && (
        <Setup onStart={(cfg) => { setConfig(cfg); setScreen('interview') }} />
      )}
      {screen === 'interview' && (
        <InterviewRoom
          config={config}
          sessionData={sessionData}
          onFeedback={(q, a, fb) => {
            setCurrentQ(q)
            setFeedback(fb)
            setSessionData(prev => ({
              questions: [...prev.questions, q],
              answers: [...prev.answers, a],
              scores: [...prev.scores, fb.overall_score]
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
          totalQuestions={10}
        />
      )}
      {screen === 'report' && (
        <SessionReport config={config} sessionData={sessionData} />
      )}
    </div>
  )
}
