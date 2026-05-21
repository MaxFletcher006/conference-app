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
        .lp-logos {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 36px;
        }
        .lp-conf-logo {
          height: 180px;
          width: 180px;
          object-fit: contain;
          flex-shrink: 0;
          border-radius: 20px;
        }
        .lp-divider {
          width: 1px;
          height: 100px;
          background: rgba(56,189,248,0.25);
          flex-shrink: 0;
        }
        .lp-sda-logo {
          height: 72px;
          width: 72px;
          object-fit: contain;
          flex-shrink: 0;
        }
        .lp-sda-name span {
          display: block;
          font-weight: 700;
          letter-spacing: 0.06em;
          color: #eef4ff;
          text-transform: uppercase;
          font-size: 15px;
          line-height: 1.4;
        }
        @media (max-width: 1100px) {
          .lp-conf-logo { height: 140px; width: 140px; }
          .lp-sda-logo  { height: 56px; width: 56px; }
          .lp-sda-name span { font-size: 13px; }
          .lp-divider   { height: 80px; }
        }
        @media (max-width: 860px) {
          .lp-conf-logo { height: 110px; width: 110px; border-radius: 14px; }
          .lp-sda-logo  { height: 44px; width: 44px; }
          .lp-sda-name span { font-size: 11px; }
          .lp-divider   { height: 60px; }
          .lp-logos     { gap: 14px; margin-bottom: 24px; }
        }
      `}</style>

      <div className="lp-logos">
        <img
          src="/logos/conf_logo.png"
          alt="Mongolia-CERN LHCb 2026"
          className="lp-conf-logo"
        />
        <div className="lp-divider" />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img
            src="/logos/SDAlogo.svg"
            alt="Science Development Accelerator"
            className="lp-sda-logo"
          />
          <div className="lp-sda-name">
            <span>Science Development</span>
            <span>Accelerator</span>
          </div>
        </div>
      </div>

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

      <div style={{ display: 'flex', gap: 16, marginBottom: 32 }}>
        {[
          { num: '14 TeV', label: 'COLLISION ENERGY' },
          { num: '6+',     label: 'SPEAKERS' },
          { num: '2 Days', label: 'PROGRAMME' },
        ].map(s => (
          <div className="lp-stat" key={s.label}>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#ffffff' }}>{s.num}</div>
            <div style={{ fontSize: 10, color: '#8aaabb', marginTop: 3, letterSpacing: '.05em' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {[
        { color: '#38bdf8', shadow: 'rgba(56,189,248,.55)', text: 'Keynotes from LHCb collaboration physicists' },
        { color: '#34d399', shadow: 'rgba(52,211,153,.55)', text: 'Live Q&A with speakers during all sessions' },
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
