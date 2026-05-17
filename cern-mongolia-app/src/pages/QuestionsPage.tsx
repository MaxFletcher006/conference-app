import { useEffect, useState } from 'react'
import { getAllQuestionsWithUsers, getAllEvents, QuestionWithUser, Event } from '../api/client'
import { Page, SectionHeader, Card, Table, toast } from '../components/UI'

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<QuestionWithUser[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getAllQuestionsWithUsers(), getAllEvents()])
      .then(([q, e]) => { setQuestions(q); setEvents(e) })
      .catch(() => toast('Failed to load questions', 'err'))
      .finally(() => setLoading(false))
  }, [])

  const getEventLabel = (eventId: number) => {
    const ev = events.find(e => e.id === eventId)
    return ev ? ev.topic : `#${eventId}`
  }

  return (
    <Page>
      <SectionHeader
        title="Questions"
        action={
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color: '#ffffff' }}>
            {questions.length} total
          </span>
        }
      />

      <Card style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 24, color: 'var(--text-3)', fontSize: 16 }}>Loading...</div>
        ) : questions.length === 0 ? (
          <div style={{ padding: 32, color: 'var(--text-3)', fontSize: 16, textAlign: 'center' }}>
            No questions submitted yet
          </div>
        ) : (
          <div className="table-wrapper">
            <Table
              headers={['Event', 'Fullname', 'Question', 'Time']}
              rows={questions.map(q => [
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color: 'var(--blue)' }}>
                  {getEventLabel(q.event_id)}
                </span>,
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color: '#ffffff' }}>
                  #{q.fullname}
                </span>,
                <span style={{ color: '#ffffff', fontSize: 16 }}>{q.question}</span>,
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color: '#ffffff' }}>
                  {q.time}
                </span>,
              ])}
            />
          </div>
        )}
      </Card>
    </Page>
  )
}