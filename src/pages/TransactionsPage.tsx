import { useEffect, useState } from 'react'
import { getAllTransactions, TransactionFull } from '../api/client'
import { Page, SectionHeader, Card, Table, Spinner } from '../components/UI'

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<TransactionFull[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    getAllTransactions()
      .then(setTransactions)
      .catch(() => setTransactions([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = transactions.filter(t =>
    t.username.toLowerCase().includes(search.toLowerCase()) ||
    String(t.transaction_id).includes(search)
  )

  const totalRevenue = transactions.reduce((sum, t) => sum + t.amount, 0)

  return (
    <Page>
      <SectionHeader title="Transactions" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14, marginBottom: 32 }}>
        <StatMini label="Total" value={transactions.length} color="var(--blue)" />
        <StatMini label={`Revenue (₮)`} value={totalRevenue} color="var(--green)" />
      </div>

      <div style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Search by name or transaction ID..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%', maxWidth: 420,
            padding: '10px 16px',
            background: 'var(--bg-2)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            color: '#ffffff', fontSize: 15, outline: 'none',
            boxSizing: 'border-box',
            fontFamily: 'var(--font-sans)',
            transition: 'border-color 0.2s',
          }}
          onFocus={e => (e.target.style.borderColor = 'var(--border-3)')}
          onBlur={e => (e.target.style.borderColor = 'var(--border)')}
        />
      </div>

      <Card style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
            <Spinner size={32} />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '64px 32px', textAlign: 'center', color: 'var(--text-3)', fontFamily: 'var(--font-mono)', fontSize: 15 }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>💳</div>
            {search ? 'No results found' : 'No transactions yet'}
          </div>
        ) : (
          <div className="table-wrapper">
            <Table
              headers={['Attendee', 'Amount', 'Transaction ID', 'Date', 'Invoice']}
              rows={filtered.map(t => [
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: 'rgba(56,189,248,0.12)',
                    border: '1px solid rgba(56,189,248,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 700, color: 'var(--blue)',
                    flexShrink: 0, fontFamily: 'var(--font-mono)',
                  }}>
                    {t.username?.charAt(0).toUpperCase()}
                  </div>
                  <span style={{ fontWeight: 600, fontSize: 15, color: '#ffffff' }}>{t.username}</span>
                </div>,

                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 15, fontWeight: 700, color: 'var(--green)' }}>
                  ₮{t.amount.toLocaleString()}
                </span>,

                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 13,
                  color: 'var(--text-3)', background: 'var(--bg-3)',
                  border: '1px solid var(--border)', borderRadius: 6,
                  padding: '3px 8px',
                }}>
                  #{t.transaction_id}
                </span>,

                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: '#ffffff' }}>
                  {t.created_at
                    ? new Date(t.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                    : '—'}
                </span>,

                t.url ? (
                  <a
                    href={t.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: 13, fontFamily: 'var(--font-mono)',
                      color: 'var(--blue)', textDecoration: 'none',
                      background: 'rgba(56,189,248,0.08)',
                      border: '1px solid rgba(56,189,248,0.2)',
                      borderRadius: 6, padding: '3px 10px',
                      display: 'inline-block',
                    }}
                  >
                    View
                  </a>
                ) : <span style={{ color: 'var(--text-3)' }}>—</span>,
              ])}
            />
          </div>
        )}
      </Card>

      {!loading && filtered.length > 0 && (
        <div style={{ marginTop: 12, fontSize: 13, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', textAlign: 'right' }}>
          {filtered.length} of {transactions.length} records
        </div>
      )}
    </Page>
  )
}

function StatMini({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '16px 20px' }}>
      <div style={{ fontSize: 13, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color }}>{value.toLocaleString()}</div>
    </div>
  )
}
