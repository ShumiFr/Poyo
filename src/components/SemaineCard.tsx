import { useState } from 'react'
import { Check } from 'lucide-react'
import { useBudget } from '../store/useBudget'
import { Modal } from './Modal'
import Champ from './Champ'
import format, { enNombre } from '../lib/format'
import type { SemaineCourses } from '../types'

export default function SemaineCard({ index, semaine }: { index: number, semaine: SemaineCourses }) {
   const definirBudget = useBudget((state) => state.definirBudgetSemaine)
   const basculer = useBudget((state) => state.basculerSemaineFaite)

   const [ouvertEdit, setOuvertEdit] = useState(false)
   const [saisie, setSaisie] = useState("")

   function ouvrirEdit() {
      setSaisie(String(semaine.budget))
      setOuvertEdit(true)
   }

   function enregistrer() {
      definirBudget(index, enNombre(saisie))
      setOuvertEdit(false)
   }

   return (
      <div className={semaine.faite ? "semaine-row faite" : "semaine-row"}>
         <span className="semaine-nom">Semaine {index + 1}</span>

         {semaine.faite
            ? <span className="montant text-navy">{format(semaine.budget)}</span>
            : <button className="montant-edit text-navy" onClick={ouvrirEdit}>{format(semaine.budget)}</button>}

         <button
            className={semaine.faite ? "semaine-check ok" : "semaine-check"}
            onClick={() => basculer(index)}
            aria-label={semaine.faite ? "Annuler les courses" : "Courses faites"}
         >
            {semaine.faite && <Check size={16} />}
         </button>

         <Modal isOpen={ouvertEdit} onClose={() => setOuvertEdit(false)}>
            <h2>Budget · Semaine {index + 1}</h2>
            <p className="sous">Montant prévu pour cette semaine</p>
            <Champ label="Montant" valeur={saisie} onChange={setSaisie} />
            <div className="pave-actions">
               <button className="btn" onClick={() => setOuvertEdit(false)}>Annuler</button>
               <button className="btn btn-primary" onClick={enregistrer}>Enregistrer</button>
            </div>
         </Modal>
      </div>
   )
}
