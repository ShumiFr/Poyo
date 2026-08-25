import { useState } from "react"

type Segment = { valeur: number; couleur: string; onClick?: () => void; label?: string }

export default function Donut({
   segments,
   total,
   centre,
   sousCentre,
   onCentre,
}: {
   segments: Segment[]
   total: number
   centre: string
   sousCentre: string
   onCentre?: () => void
}) {
   const R = 66          // rayon du cercle
   const W = 16          // épaisseur de l'anneau (fine → grand trou central)
   const C = 2 * Math.PI * R

   const [survol, setSurvol] = useState<string | null>(null)

   // On accumule la position de chaque segment le long du cercle.
   let offset = 0

   return (
      <div className="donut">
         {/* étiquette de survol (desktop) */}
         {survol && <div className="donut-tooltip">{survol}</div>}

         <svg viewBox="0 0 160 160" width="220" height="220">
            {/* piste de fond */}
            <circle cx="80" cy="80" r={R} fill="none" stroke="var(--line)" strokeWidth={W} />

            {total > 0 && segments.map((s, i) => {
               const longueur = (s.valeur / total) * C
               const cercle = (
                  <circle
                     key={i}
                     cx="80" cy="80" r={R}
                     fill="none"
                     stroke={s.couleur}
                     strokeWidth={W}
                     strokeDasharray={`${longueur} ${C - longueur}`}
                     strokeDashoffset={-offset}
                     transform="rotate(-90 80 80)"
                     onClick={s.onClick}
                     onMouseOver={s.label ? () => setSurvol(s.label!) : undefined}
                     onMouseOut={s.label ? () => setSurvol(null) : undefined}
                     style={s.onClick ? { cursor: "pointer" } : undefined}
                  />
               )
               offset += longueur
               return cercle
            })}
         </svg>

         <div className="donut-centre" onClick={onCentre} style={onCentre ? { cursor: "pointer" } : undefined}>
            <div className="donut-label">Ce qu'il reste</div>
            <div className="donut-valeur">{centre}</div>
            <div className="donut-sous">{sousCentre}</div>
         </div>
      </div>
   )
}
