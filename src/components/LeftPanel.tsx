interface Props { subtitle?: string }

export default function LeftPanel({ subtitle = 'Access the conference platform' }: Props) {
  return (
    <div style={{
      width: '60%', padding: '60px 52px 60px 80px',
      display: 'flex', flexDirection: 'column', justifyContent: 'center',
      position: 'relative', zIndex: 10,
    }}>
      <style>{`
        @keyframes flicker{0%,100%{opacity:1}48%{opacity:.8}50%{opacity:1}}
        .lp-badge{
          display:inline-block; font-family:var(--font-mono);
          font-size:18px; letter-spacing:.1em; color:#38bdf8;
          border:1px solid rgba(56,189,248,.28);
          background:rgba(56,189,248,.07);
          padding:5px 12px; border-radius:4px;
          margin-bottom:28px;
          animation:flicker 7s ease-in-out infinite;
        }
        .lp-stat{
          flex:1; padding:14px 16px;
          background:rgba(56,189,248,.05);
          border:1px solid rgba(56,189,248,.12);
          border-radius:10px;
        }
        .lp-dot{
          width:8px;height:8px;border-radius:50%;
          margin-top:5px;flex-shrink:0;
        }
        .lp-energy{
          height:3px;border-radius:2px;margin-top:28px;
          background:linear-gradient(90deg,#38bdf8,#f472b6,#34d399);
          opacity:.35;
        }
      `}</style>

      <div className="lp-badge">MONGOLIA - CERN LHCb 2026</div>

      <h1 style={{
        fontSize: 42, fontWeight: 700, lineHeight: 1.1,
        letterSpacing: '-0.035em', color: '#eef4ff', marginBottom: 14,
      }}>
        Public<br />
        Lecture of<br />
        <span style={{ color: '#38bdf8' }}>High Energy Physics</span>
      </h1>

      <p style={{ fontSize: 15, color: '#a0b8cc', lineHeight: 1.7, marginBottom: 36 }}>
        Ulaanbaatar, Mongolia · June 2026<br />
        Accelerating Science in Mongol Steppe.
      </p>

      <div style={{ display: 'flex', gap: 16, marginBottom: 32}}>
        {[
          { num: '14 TeV', label: 'COLLISION ENERGY' },
          { num: '6+',   label: 'SPEAKERS' },
          { num: '2 Days', label: 'PROGRAMME' },
        ].map(s => (
          <div className="lp-stat" key={s.label}>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#ffffff' }}>{s.num}</div>
            <div style={{ fontSize: 10, color: '#8aaabb', marginTop: 3, letterSpacing: '.05em' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {[
        { color: '#38bdf8', shadow: 'rgba(56,189,248,.55)',  text: 'Keynotes from LHCb collaboration physicists' },
        { color: '#34d399', shadow: 'rgba(52,211,153,.55)',  text: 'Live Q&A with speakers during all sessions' },
      ].map(item => (
        <div key={item.text} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
          <div className="lp-dot" style={{ background: item.color, boxShadow: `0 0 7px 2px ${item.shadow}` }} />
          <div style={{ fontSize: 14, color: '#c8dce8', lineHeight: 1.55 }}>{item.text}</div>
        </div>
      ))}

      <div className="lp-energy" />
    </div>
  )
}