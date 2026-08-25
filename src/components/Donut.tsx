type Segment = { valeur: number; couleur: string }

export default function Donut({
   segments,
   total,
   centre,
   sousCentre,
}: {
   segments: Segment[]
   total: number
   centre: string
   sousCentre: string
}) {
   const R = 60          // rayon du cercle
   const W = 22          // épaisseur de l'anneau
   const C = 2 * Math.PI * R

   // On accumule la position de chaque segment le long du cercle.
   let offset = 0

   return (
      <div className="donut">
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
                  />
               )
               offset += longueur
               return cercle
            })}
         </svg>

         <div className="donut-centre">
            <div className="donut-label">Ce qu'il reste</div>
            <div className="donut-valeur">{centre}</div>
            <div className="donut-sous">{sousCentre}</div>
         </div>
      </div>
   )
}
