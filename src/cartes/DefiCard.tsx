import { Trash2 } from 'lucide-react'
import { useBudget } from '../store/useBudget'
import { progressionDefi } from '../lib/defis'
import format from '../lib/format'
import type { Defi } from '../types'

export default function DefiCard({ defi }: { defi: Defi }) {
   const basculerCase = useBudget((s) => s.basculerCaseDefi)
   const retirer = useBudget((s) => s.retirerDefi)

   const { epargne, total, pct } = progressionDefi(defi)
   const nbFaites = defi.faites.filter(Boolean).length

   return (
      <div className="card">
         <div className="voeu-tete">
            <h3>{defi.nom}</h3>
            <button className="carre-mini" onClick={() => retirer(defi.id)} aria-label="Supprimer">
               <Trash2 size={14} />
            </button>
         </div>
         <p className="voeu-montant" style={{ color: "var(--accent)" }}>
            {format(epargne)} <span className="pct">· {Math.round(pct)} % sur {format(total)}</span>
         </p>

         <div className="defi-barre"><div className="defi-barre-remplie" style={{ width: pct + "%" }} /></div>

         <div className="defi-meta">{nbFaites} / {defi.cases.length} cases cochées</div>

         <div className="defi-grille">
            {defi.cases.map((montant, i) => (
               <button
                  key={i}
                  className={defi.faites[i] ? "defi-case faite" : "defi-case"}
                  onClick={() => basculerCase(defi.id, i)}
                  aria-label={(defi.faites[i] ? "Décocher " : "Cocher ") + montant + " €"}
               >
                  {montant}
               </button>
            ))}
         </div>
      </div>
   )
}
