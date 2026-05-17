import { useEffect, useState } from 'react'
import { getAllQuestions, getAllEvents, Question, Event } from '../api/client'
import { Page, SectionHeader, Card, Table, toast } from '../components/UI'

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getAllQuestions(), getAllEvents()])
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
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-3)' }}>
            {questions.length} total
          </span>
        }
      />

      <Card style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 24, color: 'var(--text-3)', fontSize: 13 }}>Loading...</div>
        ) : questions.length === 0 ? (
          <div style={{ padding: 32, color: 'var(--text-3)', fontSize: 14, textAlign: 'center' }}>
            No questions submitted yet
          </div>
        ) : (
          <Table
            headers={['Event', 'User ID', 'Question', 'Time']}
            rows={questions.map(q => [
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--blue)' }}>
                {getEventLabel(q.event_id)}
              </span>,
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-3)' }}>
                #{q.user_id}
              </span>,
              <span style={{ color: 'var(--text)', fontSize: 14 }}>{q.question}</span>,
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)' }}>
                {q.time}
              </span>,
            ])}
          />
        )}
      </Card>
    </Page>
  )
}
