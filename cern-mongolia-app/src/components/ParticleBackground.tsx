export default function ParticleBackground() {
  return (
    <div className="physics-bg">
      {/* Grid */}
      <div className="physics-grid" />

      {/* Glow */}
      <div className="physics-glow glow-1" />
      <div className="physics-glow glow-2" />

      {/* Floating particles */}
      <div className="particles">
        {Array.from({ length: 30 }).map((_, i) => (
          <span
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${10 + Math.random() * 12}s`,
            }}
          />
        ))}
      </div>

      {/* Orbit */}
      <div className="lhc-orbit">
        <div className="orbit orbit-1"></div>
        <div className="orbit orbit-2"></div>
        <div className="orbit orbit-3"></div>

        <div className="center-core"></div>
      </div>
    </div>
  )
}