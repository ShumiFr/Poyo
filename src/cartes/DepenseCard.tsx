import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { useBudget } from '../store/useBudget'
import { Modal } from './Modal'
import FormEdition from './FormEdition'
import MontantEditable from './MontantEditable'
import BoutonBascule from './BoutonBascule'
import format from '../lib/format'
import type { Depense } from '../types'

export default function DepenseCard({ depense }: { depense: Depense }) {
   const marquerPayer = useBudget((state) => state.marquerPayer)
   const retirerDepense = useBudget((state) => state.retirerDepense)
   const modifierDepense = useBudget((state) => state.modifierDepense)

   const [enEdition, setEnEdition] = useState(false)

   return (
      <div className={depense.estPayer ? "card depense payee" : "card depense"}>
         <div className="carte-tete">
            <span className="libelle-col">
               <h3>{depense.nom}</h3>
               <div className="sous">{depense.type === "regulier" ? format(depense.montant) + " / mois" : "Ponctuelle"}</div>
            </span>
            <MontantEditable montant={depense.montant} couleur="red" onClick={() => setEnEdition(true)} />
            <BoutonBascule
               actif={depense.estPayer}
               couleur="red"
               onClick={() => marquerPayer(depense.id)}
               label={depense.estPayer ? "Annuler le paiement" : "Payer"}
            />
            <button className="carre" onClick={() => retirerDepense(depense.id)} aria-label="Supprimer">
               <Trash2 size={16} />
            </button>
         </div>

         <Modal isOpen={enEdition} onClose={() => setEnEdition(false)}>
            <h2>Modifier · {depense.nom}</h2>
            <p className="sous">Nom et montant de la dépense</p>
            <FormEdition
               nomInitial={depense.nom}
               montantInitial={depense.montant}
               couleur="red"
               onAnnuler={() => setEnEdition(false)}
               onEnregistrer={(nom, montant) => { modifierDepense(depense.id, nom, montant); setEnEdition(false) }}
            />
         </Modal>
      </div>
   )
}
