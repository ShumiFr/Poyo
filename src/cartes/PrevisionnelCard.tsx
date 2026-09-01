import { Minus, Plus, Trash2 } from 'lucide-react'
import { useBudget } from '../store/useBudget'
import format from '../lib/format'
import type { Previsionnel } from '../types'

export default function PrevisionnelCard({ prev }: { prev: Previsionnel }) {
   const ajuster = useBudget((state) => state.ajusterPrevisionnel)
   const basculer = useBudget((state) => state.basculerPrevisionnelDepense)
   const retirer = useBudget((state) => state.retirerPrevisionnel)

   return (
      <div className={prev.estDepense ? "card payee" : "card"}>
         <div className="carte-tete">
            <span className="libelle-col">
               <h3>{prev.nom}</h3>
               <div className="sous">Budget prévu ce mois</div>
            </span>
            <span className="montant text-navy">{format(prev.montant)}</span>
            <button className="carre-mini" onClick={() => retirer(prev.id)} aria-label="Supprimer"><Trash2 size={15} /></button>
         </div>

         <div className="carte-actions">
            <button className="carre" onClick={() => ajuster(prev.id, -10)} aria-label="Moins 10 €"><Minus size={16} /></button>
            <button className="carre" onClick={() => ajuster(prev.id, 10)} aria-label="Plus 10 €"><Plus size={16} /></button>
            <button className="btn btn-primary" onClick={() => basculer(prev.id)}>
               {prev.estDepense ? "Dépensé ✓" : "Dépensé ce mois"}
            </button>
         </div>
      </div>
   )
}
