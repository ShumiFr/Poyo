import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { useBudget } from '../store/useBudget'
import { Modal } from '../components/Modal'
import Form from '../components/Form'
import MontantEditable from '../components/MontantEditable'
import BoutonBascule from '../components/BoutonBascule'
import { champsNomMontant } from '../lib/champs'
import { enNombre } from '../lib/format'
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
               {depense.type === "occasionnel" && <div className="sous">Ponctuelle</div>}
            </span>
            <MontantEditable montant={depense.montant} couleur="red" onClick={() => setEnEdition(true)} />
            {/* Une dépense ponctuelle est déjà payée → pas de bouton, seulement les régulières se pointent */}
            {depense.type === "regulier" && (
               <BoutonBascule
                  actif={depense.estPayer}
                  couleur="red"
                  onClick={() => marquerPayer(depense.id)}
                  label={depense.estPayer ? "Annuler le paiement" : "Payer"}
               />
            )}
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
