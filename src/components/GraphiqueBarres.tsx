import type { StatMois } from "../lib/stats";

// Barres groupées : pour chaque mois, une barre revenus (verte) et une barre
// dépenses (rouge), à l'échelle du plus gros montant de la période.
export default function GraphiqueBarres({ data }: { data: StatMois[] }) {
   const H = 150;              // hauteur de la zone de barres
   const largeurGroupe = 56;   // largeur réservée à un mois
   const largeurBarre = 18;
   const gap = 6;              // espace entre les 2 barres d'un mois
   const margeBas = 22;        // place pour le libellé du mois
   const largeur = Math.max(1, data.length) * largeurGroupe;
   const hauteur = H + margeBas;

   // Échelle : la plus grande valeur (revenus ou dépenses) occupe toute la hauteur.
   const max = Math.max(1, ...data.map((d) => Math.max(d.revenus, d.depenses)));

   return (
      <div className="graph-scroll">
         <svg viewBox={`0 0 ${largeur} ${hauteur}`} width="100%" height={hauteur} preserveAspectRatio="xMidYMax meet">
            {data.map((d, i) => {
               const bloc = i * largeurGroupe;
               const x = bloc + (largeurGroupe - (largeurBarre * 2 + gap)) / 2;
               const hRev = (d.revenus / max) * H;
               const hDep = (d.depenses / max) * H;
               const moisCourt = new Date(d.annee, d.mois).toLocaleDateString("fr-FR", { month: "short" });
               return (
                  <g key={d.annee + "-" + d.mois}>
                     <rect x={x} y={H - hRev} width={largeurBarre} height={hRev} rx="3" fill="var(--vert)" />
                     <rect x={x + largeurBarre + gap} y={H - hDep} width={largeurBarre} height={hDep} rx="3" fill="var(--rouge)" />
                     <text x={bloc + largeurGroupe / 2} y={H + 15} textAnchor="middle" fontSize="11" fill="var(--muted)">
                        {moisCourt}
                     </text>
                  </g>
               );
            })}
         </svg>
      </div>
   );
}
