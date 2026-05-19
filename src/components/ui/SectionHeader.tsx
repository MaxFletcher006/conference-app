import { EyebrowLabel } from './EyebrowLabel'

interface Props {
  eyebrow?: string
  title: string
  lead?: string
  center?: boolean
}

export function SectionHeader({ eyebrow, title, lead, center }: Props) {
  return (
    <div className={center ? 'text-center max-w-2xl mx-auto' : 'max-w-2xl'}>
      {eyebrow && <EyebrowLabel>{eyebrow}</EyebrowLabel>}
      <h2 className="text-[clamp(1.6rem,3vw,2.25rem)] font-bold tracking-tight text-white mb-3">
        {title}
      </h2>
      {lead && <p className="leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)', fontSize: 17 }}>{lead}</p>}
    </div>
  )
}
