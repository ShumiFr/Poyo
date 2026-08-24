import { useState } from 'react'
import { useBudget } from '../store/useBudget'
import { Modal } from './Modal'
import FormEdition from './FormEdition'
import format from '../lib/format'
import type { Depense } from '../types'

export default function DepenseCard({ depense }: { depense: Depense }) {
   const marquerPayer = useBudget((state) => state.marquerPayer)
   const retirerDepense = useBudget((state) => state.retirerDepense)
   const modifierDepense = useBudget((state) => state.modifierDepense)

   const [enEdition, setEnEdition] = useState(false)

   return (
      <div id={depense.id} className={depense.estPayer ? "card payee" : "card"}>
         <div>
            <h3 className="h3">{depense.nom}</h3>
            {depense.type === "regulier" ? <p>{format(depense.montant)} / mois</p> : <p>Occasionnel</p>}
         </div>
         <button className="h3-depense" onClick={() => setEnEdition(true)}>{format(depense.montant)}</button>
         <button onClick={() => marquerPayer(depense.id)}>
            {depense.estPayer ? "Payé ✓" : "Payer"}
         </button>
         <button onClick={() => retirerDepense(depense.id)}>Supprimer</button>

         <Modal isOpen={enEdition} onClose={() => setEnEdition(false)}>
            <FormEdition
               nomInitial={depense.nom}
               montantInitial={depense.montant}
               onEnregistrer={(nom, montant) => {
                  modifierDepense(depense.id, nom, montant)
                  setEnEdition(false)
               }}
            />
         </Modal>
      </div>
   )
}
