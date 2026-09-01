import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { useBudget } from '../store/useBudget'
import { Modal } from '../components/Modal'
import Form from '../components/Form'
import MontantEditable from '../components/MontantEditable'
import BoutonBascule from '../components/BoutonBascule'
import { champsNomMontant } from '../lib/champs'
import format, { enNombre } from '../lib/format'
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
            <Form
               champs={champsNomMontant}
               valeursInitiales={{ nom: depense.nom, montant: String(depense.montant) }}
               couleur="red"
               libelle="Enregistrer"
               estValide={(v) => v.nom.trim() !== "" && enNombre(v.montant) > 0}
               onAnnuler={() => setEnEdition(false)}
               onValider={(v) => { modifierDepense(depense.id, v.nom.trim(), enNombre(v.montant)); setEnEdition(false) }}
            />
         </Modal>
      </div>
   )
}
