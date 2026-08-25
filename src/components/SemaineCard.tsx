import { Minus, Plus } from 'lucide-react'
import { useBudget } from '../store/useBudget'
import format from '../lib/format'
import type { SemaineCourses } from '../types'

export default function SemaineCard({ index, semaine }: { index: number, semaine: SemaineCourses }) {
   const ajuster = useBudget((state) => state.ajusterSemaine)
   const basculer = useBudget((state) => state.basculerSemaineFaite)

   return (
      <div className={semaine.faite ? "card payee" : "card"}>
         <div className="carte-tete">
            <span className="libelle-col">
               <h3>Semaine {index + 1}</h3>
               <div className="sous">Budget prévu</div>
            </span>
            <span className="montant text-navy">{format(semaine.budget)}</span>
         </div>

         <div className="carte-actions">
            <button className="carre" onClick={() => ajuster(index, -5)} aria-label="Moins 5 €"><Minus size={16} /></button>
            <button className="carre" onClick={() => ajuster(index, 5)} aria-label="Plus 5 €"><Plus size={16} /></button>
            <button className="btn btn-primary" onClick={() => basculer(index)}>
               {semaine.faite ? "Fait ✓" : "Courses faites"}
            </button>
         </div>
      </div>
   )
}
