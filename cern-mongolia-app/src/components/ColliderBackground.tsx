import { useEffect, useRef } from 'react'

export default function ColliderBackground() {
  const collisionsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = collisionsRef.current!
    if (!container) return

    const colors = [
      { c: '#38bdf8', s: 'rgba(56,189,248,0.9)',  r: 'rgba(56,189,248,0.3)'  },
      { c: '#f472b6', s: 'rgba(244,114,182,0.9)', r: 'rgba(244,114,182,0.3)' },
      { c: '#34d399', s: 'rgba(52,211,153,0.9)',  r: 'rgba(52,211,153,0.3)'  },
      { c: '#fbbf24', s: 'rgba(251,191,36,0.9)',  r: 'rgba(251,191,36,0.3)'  },
      { c: '#a78bfa', s: 'rgba(167,139,250,0.9)', r: 'rgba(167,139,250,0.3)' },
    ]

    const rng = (a: number, b: number) => a + Math.random() * (b - a)
    const pick = () => colors[Math.floor(Math.random() * colors.length)]

    let timeouts: ReturnType<typeof setTimeout>[] = []

    function spawnCollision() {
      const x = rng(12, 88)
      const y = rng(12, 88)
      const col  = pick()
      const col2 = pick()

      const g = document.createElement('div')
      g.style.cssText = `position:absolute;left:${x}%;top:${y}%;pointer-events:none`
      container.appendChild(g)

      // Primary burst
      const burst = document.createElement('div')
      burst.style.cssText = `
        position:absolute;width:44px;height:44px;border-radius:50%;
        background:${col.c};opacity:0;
        transform:translate(-50%,-50%) scale(0.2);
        box-shadow:0 0 32px 16px ${col.s},0 0 64px 32px ${col.r};
        animation:cb-collision-flash 0.95s ease-out forwards`
      g.appendChild(burst)

      // Secondary burst
      const burst2 = document.createElement('div')
      burst2.style.cssText = `
        position:absolute;width:26px;height:26px;border-radius:50%;
        background:${col2.c};opacity:0;
        transform:translate(-50%,-50%) scale(0.1);
        box-shadow:0 0 22px 11px ${col2.s};
        animation:cb-collision-flash 0.72s ease-out 0.1s forwards`
      g.appendChild(burst2)

      // Shockwaves
      for (let w = 0; w < 3; w++) {
        const wave = document.createElement('div')
        const wc = w % 2 === 0 ? col : col2
        wave.style.cssText = `
          position:absolute;width:20px;height:20px;border-radius:50%;
          border:1.5px solid ${wc.c};
          transform:translate(-50%,-50%) scale(0);opacity:0;
          animation:cb-ring-expand ${0.85 + w * 0.38}s ease-out ${w * 0.19}s forwards`
        g.appendChild(wave)
      }

      // Fragments
      const numFrag = 10 + Math.floor(Math.random() * 8)
      for (let i = 0; i < numFrag; i++) {
        const angle = (i / numFrag) * Math.PI * 2 + rng(-0.3, 0.3)
        const dist  = rng(45, 120)
        const size  = rng(3, 8)
        const fc    = Math.random() > 0.5 ? col : col2
        const dx    = Math.cos(angle) * dist
        const dy    = Math.sin(angle) * dist
        const frag  = document.createElement('div')
        frag.style.cssText = `
          position:absolute;
          width:${size}px;height:${size}px;border-radius:50%;
          background:${fc.c};
          box-shadow:0 0 ${size * 2}px ${size}px ${fc.s};
          left:${-size / 2}px;top:${-size / 2}px;
          --dx:translate(${dx}px,${dy}px);
          animation:cb-fragment-fly ${rng(0.65, 1.25)}s ease-out ${rng(0, 0.15)}s forwards`
        g.appendChild(frag)
      }

      // Orbiting debris
      for (let i = 0; i < 6; i++) {
        const r    = rng(18, 55)
        const size = rng(2, 5)
        const fc   = pick()
        const db   = document.createElement('div')
        db.style.cssText = `
          position:absolute;
          width:${size}px;height:${size}px;border-radius:50%;
          background:${fc.c};opacity:0.85;
          box-shadow:0 0 ${size * 1.5}px ${size}px ${fc.s};
          --r:${r}px;
          animation:cb-debris-spin ${rng(1.4, 3)}s linear ${rng(0, 0.3)}s forwards`
        g.appendChild(db)
      }

      const t = setTimeout(() => {
        if (g.parentNode) g.parentNode.removeChild(g)
      }, 2400)
      timeouts.push(t)
    }

    function scheduleNext() {
      const t = setTimeout(() => {
        spawnCollision()
        scheduleNext()
      }, rng(600, 1700))
      timeouts.push(t)
    }

    spawnCollision()
    const t1 = setTimeout(spawnCollision, 450)
    const t2 = setTimeout(spawnCollision, 900)
    timeouts.push(t1, t2)
    scheduleNext()

    return () => {
      timeouts.forEach(clearTimeout)
      if (container) container.innerHTML = ''
    }
  }, [])

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      <style>{`
        @keyframes cb-orbit-cw   { from{transform:rotate(0deg)}   to{transform:rotate(360deg)} }
        @keyframes cb-orbit-ccw  { from{transform:rotate(0deg)}   to{transform:rotate(-360deg)} }
        @keyframes cb-orbit-cw2  { from{transform:rotate(45deg)}  to{transform:rotate(405deg)} }
        @keyframes cb-orbit-ccw2 { from{transform:rotate(-20deg)} to{transform:rotate(-380deg)} }

        @keyframes cb-beam-h  { 0%{left:-28%}  100%{left:128%} }
        @keyframes cb-beam-h2 { 0%{left:128%}  100%{left:-28%} }
        @keyframes cb-beam-v  { 0%{top:-28%}   100%{top:128%} }
        @keyframes cb-beam-v2 { 0%{top:128%}   100%{top:-28%} }
        @keyframes cb-beam-d1 { 0%{transform:translate(-130%,-130%)} 100%{transform:translate(260%,260%)} }
        @keyframes cb-beam-d2 { 0%{transform:translate(260%,-130%)}  100%{transform:translate(-130%,260%)} }

        @keyframes cb-nucleon {
          0%,100%{transform:translate(0,0) scale(1)}
          25%{transform:translate(1px,-1.5px) scale(1.1)}
          75%{transform:translate(-1px,1px) scale(0.92)}
        }
        @keyframes cb-pulse-ring {
          0%,100%{opacity:0.06} 50%{opacity:0.18}
        }
        @keyframes cb-collision-flash {
          0%  {opacity:0;   transform:translate(-50%,-50%) scale(0.2)}
          14% {opacity:1;   transform:translate(-50%,-50%) scale(1.7)}
          40% {opacity:0.65;transform:translate(-50%,-50%) scale(1.1)}
          100%{opacity:0;   transform:translate(-50%,-50%) scale(0.05)}
        }
        @keyframes cb-fragment-fly {
          0%  {opacity:1; transform:translate(0,0) scale(1)}
          100%{opacity:0; transform:var(--dx) scale(0.15)}
        }
        @keyframes cb-ring-expand {
          0%  {transform:translate(-50%,-50%) scale(0);   opacity:0.85}
          100%{transform:translate(-50%,-50%) scale(3.5); opacity:0}
        }
        @keyframes cb-debris-spin {
          from{transform:rotate(0deg)   translateX(var(--r)) rotate(0deg)}
          to  {transform:rotate(360deg) translateX(var(--r)) rotate(-360deg)}
        }
      `}</style>

      {/* Ambient glow blobs */}
      <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="cbg1" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#38bdf8" stopOpacity="0.14"/>
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0"/>
          </radialGradient>
          <radialGradient id="cbg2" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#f472b6" stopOpacity="0.10"/>
            <stop offset="100%" stopColor="#f472b6" stopOpacity="0"/>
          </radialGradient>
          <radialGradient id="cbg3" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#a78bfa" stopOpacity="0.08"/>
            <stop offset="100%" stopColor="#a78bfa" stopOpacity="0"/>
          </radialGradient>
        </defs>
        <ellipse cx="50%" cy="50%" rx="40%" ry="40%" fill="url(#cbg1)"/>
        <ellipse cx="28%" cy="62%" rx="22%" ry="22%" fill="url(#cbg2)"/>
        <ellipse cx="72%" cy="33%" rx="18%" ry="18%" fill="url(#cbg3)"/>
      </svg>

      {/* Static pulse rings */}
      {[
        { size: 700, delay: '0s',   color: 'rgba(56,189,248,0.09)'  },
        { size: 500, delay: '-2s',  color: 'rgba(244,114,182,0.07)' },
        { size: 310, delay: '-4s',  color: 'rgba(167,139,250,0.09)' },
        { size: 155, delay: '-1s',  color: 'rgba(52,211,153,0.08)'  },
      ].map((r, i) => (
        <div key={i} style={{
          position: 'absolute', borderRadius: '50%',
          top: '50%', left: '50%',
          width: r.size, height: r.size,
          marginTop: -r.size / 2, marginLeft: -r.size / 2,
          border: `1px solid ${r.color}`,
          animation: `cb-pulse-ring 6s ease-in-out ${r.delay} infinite`,
        }} />
      ))}

      {/* Outer orbit — blue protons */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        width: 680, height: 680, marginTop: -340, marginLeft: -340,
        animation: 'cb-orbit-cw 18s linear infinite',
      }}>
        <div style={{ position: 'absolute', borderRadius: '50%', width: 14, height: 14, background: '#38bdf8', boxShadow: '0 0 20px 7px rgba(56,189,248,0.85),0 0 4px 2px #fff', top: -7, left: 333, animation: 'cb-nucleon 0.38s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', borderRadius: '50%', width: 10, height: 10, background: '#7dd3fc', boxShadow: '0 0 13px 4px rgba(125,211,252,0.75)', top: 671, left: 335, animation: 'cb-nucleon 0.46s ease-in-out -0.2s infinite' }} />
        <div style={{ position: 'absolute', borderRadius: '50%', width: 8,  height: 8,  background: '#bae6fd', boxShadow: '0 0 9px 3px rgba(186,230,253,0.65)',  top: 336, left: -4,  animation: 'cb-nucleon 0.52s ease-in-out -0.1s infinite' }} />
      </div>

      {/* Mid orbit — pink protons */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        width: 480, height: 480, marginTop: -240, marginLeft: -240,
        animation: 'cb-orbit-ccw 11s linear infinite',
      }}>
        <div style={{ position: 'absolute', borderRadius: '50%', width: 12, height: 12, background: '#f472b6', boxShadow: '0 0 17px 6px rgba(244,114,182,0.85),0 0 4px 1px #fff', top: -6, left: 234, animation: 'cb-nucleon 0.41s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', borderRadius: '50%', width: 9,  height: 9,  background: '#f9a8d4', boxShadow: '0 0 11px 3px rgba(249,168,212,0.7)',   top: 471, left: 236, animation: 'cb-nucleon 0.49s ease-in-out -0.15s infinite' }} />
      </div>

      {/* Inner orbit — green protons */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        width: 300, height: 300, marginTop: -150, marginLeft: -150,
        animation: 'cb-orbit-cw2 7s linear infinite',
      }}>
        <div style={{ position: 'absolute', borderRadius: '50%', width: 10, height: 10, background: '#34d399', boxShadow: '0 0 15px 5px rgba(52,211,153,0.85)', top: -5, left: 145, animation: 'cb-nucleon 0.35s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', borderRadius: '50%', width: 7,  height: 7,  background: '#6ee7b7', boxShadow: '0 0 9px 3px rgba(110,231,183,0.65)',  top: 293, left: 147, animation: 'cb-nucleon 0.43s ease-in-out -0.18s infinite' }} />
      </div>

      {/* Core orbit — amber proton */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        width: 175, height: 175, marginTop: -87.5, marginLeft: -87.5,
        animation: 'cb-orbit-ccw2 4.5s linear infinite',
      }}>
        <div style={{ position: 'absolute', borderRadius: '50%', width: 8, height: 8, background: '#fbbf24', boxShadow: '0 0 14px 5px rgba(251,191,36,0.85)', top: -4, left: 83.5, animation: 'cb-nucleon 0.37s ease-in-out infinite' }} />
      </div>

      {/* Beam lines */}
      {/* Horizontal */}
      <div style={{ position:'absolute',width:'100%',height:2,top:'28%',overflow:'hidden' }}>
        <div style={{ position:'absolute',height:'100%',width:'28%',background:'linear-gradient(90deg,transparent,rgba(56,189,248,0.9) 70%,#bae6fd)',boxShadow:'0 0 8px 2px rgba(56,189,248,0.5)',animation:'cb-beam-h 2.8s linear infinite' }} />
        <div style={{ position:'absolute',height:'100%',width:'22%',background:'linear-gradient(90deg,transparent,rgba(56,189,248,0.65) 70%,#93c5fd)',boxShadow:'0 0 6px 2px rgba(56,189,248,0.38)',animation:'cb-beam-h 2.8s linear -1.4s infinite' }} />
      </div>
      <div style={{ position:'absolute',width:'100%',height:2,top:'72%',overflow:'hidden' }}>
        <div style={{ position:'absolute',height:'100%',width:'26%',background:'linear-gradient(90deg,#fbcfe8,rgba(244,114,182,0.9) 30%,transparent)',boxShadow:'0 0 7px 2px rgba(244,114,182,0.5)',animation:'cb-beam-h2 3.1s linear infinite' }} />
      </div>
      <div style={{ position:'absolute',width:'100%',height:2,top:'50%',overflow:'hidden' }}>
        <div style={{ position:'absolute',height:'100%',width:'20%',background:'linear-gradient(90deg,transparent,rgba(167,139,250,0.8) 70%,#c4b5fd)',boxShadow:'0 0 6px 2px rgba(167,139,250,0.4)',animation:'cb-beam-h 4.2s linear -2.1s infinite' }} />
        <div style={{ position:'absolute',height:'100%',width:'20%',background:'linear-gradient(90deg,#c4b5fd,rgba(167,139,250,0.8) 30%,transparent)',boxShadow:'0 0 6px 2px rgba(167,139,250,0.4)',animation:'cb-beam-h2 4.2s linear -0.5s infinite' }} />
      </div>

      {/* Vertical */}
      <div style={{ position:'absolute',width:2,height:'100%',left:'22%',overflow:'hidden' }}>
        <div style={{ position:'absolute',width:'100%',height:'26%',background:'linear-gradient(180deg,transparent,rgba(52,211,153,0.9) 70%,#a7f3d0)',boxShadow:'0 0 7px 2px rgba(52,211,153,0.5)',animation:'cb-beam-v 3.4s linear infinite' }} />
      </div>
      <div style={{ position:'absolute',width:2,height:'100%',left:'78%',overflow:'hidden' }}>
        <div style={{ position:'absolute',width:'100%',height:'24%',background:'linear-gradient(180deg,#fde68a,rgba(251,191,36,0.9) 30%,transparent)',boxShadow:'0 0 6px 2px rgba(251,191,36,0.4)',animation:'cb-beam-v2 3.7s linear -1.8s infinite' }} />
      </div>

      {/* Diagonal */}
      <div style={{ position:'absolute',width:'160%',height:'160%',top:'-30%',left:'-30%',transform:'rotate(32deg)',overflow:'hidden' }}>
        <div style={{ position:'absolute',height:2,width:'22%',background:'linear-gradient(90deg,transparent,rgba(244,114,182,0.7) 70%,#fbcfe8)',boxShadow:'0 0 5px 2px rgba(244,114,182,0.4)',top:'50%',animation:'cb-beam-d1 5s linear infinite' }} />
      </div>
      <div style={{ position:'absolute',width:'160%',height:'160%',top:'-30%',left:'-30%',transform:'rotate(-32deg)',overflow:'hidden' }}>
        <div style={{ position:'absolute',height:2,width:'20%',background:'linear-gradient(90deg,transparent,rgba(52,211,153,0.65) 70%,#a7f3d0)',boxShadow:'0 0 5px 2px rgba(52,211,153,0.35)',top:'50%',animation:'cb-beam-d2 4.5s linear -2.3s infinite' }} />
      </div>

      {/* Collision container (JS-populated) */}
      <div ref={collisionsRef} style={{ position: 'absolute', inset: 0 }} />
    </div>
  )
}