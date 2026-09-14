import type { StatMois } from "../lib/stats";

// Courbe du solde de fin de mois. La ligne du 0 sert de repère (le solde peut
// être négatif). L'aire sous la courbe est teintée pour la lisibilité.
export default function GraphiqueLigne({ data }: { data: StatMois[] }) {
   const H = 130;
   const largeurPoint = 56;
   const margeBas = 22;
   const largeur = Math.max(1, data.length) * largeurPoint;
   const hauteur = H + margeBas;

   const soldes = data.map((d) => d.solde);
   const max = Math.max(0, ...soldes);
   const min = Math.min(0, ...soldes);
   const etendue = max - min || 1;

   // Convertit un montant en coordonnée verticale (haut = max, bas = min).
   const y = (v: number) => H - ((v - min) / etendue) * H;
   const x = (i: number) => i * largeurPoint + largeurPoint / 2;

   const points = data.map((d, i) => `${x(i)},${y(d.solde)}`).join(" ");
   // Aire fermée : la ligne, puis on redescend à la ligne du 0 aux extrémités.
   const aire = `${x(0)},${y(0)} ${points} ${x(data.length - 1)},${y(0)}`;

   return (
      <div className="graph-scroll">
         <svg viewBox={`0 0 ${largeur} ${hauteur}`} width="100%" height={hauteur} preserveAspectRatio="xMidYMax meet">
            {/* ligne du zéro */}
            <line x1="0" y1={y(0)} x2={largeur} y2={y(0)} stroke="var(--ligne)" strokeWidth="1" />

            {data.length > 1 && <polygon points={aire} fill="var(--accent)" opacity="0.12" />}
            {data.length > 1 && (
               <polyline points={points} fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
            )}

            {data.map((d, i) => {
               const moisCourt = new Date(d.annee, d.mois).toLocaleDateString("fr-FR", { month: "short" });
               return (
                  <g key={d.annee + "-" + d.mois}>
                     <circle cx={x(i)} cy={y(d.solde)} r="3.5" fill="var(--accent)" />
                     <text x={x(i)} y={H + 15} textAnchor="middle" fontSize="11" fill="var(--muted)">
                        {moisCourt}
                     </text>
                  </g>
               );
            })}
         </svg>
      </div>
   );
}
