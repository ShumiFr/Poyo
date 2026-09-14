import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { useBudget } from '../store/useBudget'
import { Modal } from '../components/Modal'
import Form from '../components/Form'
import MontantEditable from '../components/MontantEditable'
import BoutonBascule from '../components/BoutonBascule'
import { champsNomMontant, champsDepenseEdition } from '../lib/champs'
import { statutEcheance } from '../lib/echeances'
import { enNombre } from '../lib/format'
import type { Depense } from '../types'

export default function DepenseCard({ depense, estMoisReel = false }: { depense: Depense, estMoisReel?: boolean }) {
   const marquerPayer = useBudget((state) => state.marquerPayer)
   const retirerDepense = useBudget((state) => state.retirerDepense)
   const modifierDepense = useBudget((state) => state.modifierDepense)

   const [enEdition, setEnEdition] = useState(false)

   const jour = depense.jourEcheance
   // Le statut « en retard / bientôt » n'a de sens que pour une facture non payée du mois en cours.
   const statut = estMoisReel && !depense.estPayer && jour !== undefined ? statutEcheance(jour) : null

   const champsEdit = depense.type === "regulier" ? champsDepenseEdition : champsNomMontant

   return (
      <div className={depense.estPayer ? "card depense payee" : "card depense"}>
         <div className="carte-tete">
            <span className="libelle-col">
               <h3>{depense.nom}</h3>
               {depense.type === "occasionnel" && <div className="sous">Ponctuelle</div>}
               {depense.type === "regulier" && jour !== undefined && (
                  <div className="echeance">
                     Le {jour}
                     {statut === "enRetard" && <span className="echeance-badge retard">En retard</span>}
                     {statut === "bientot" && <span className="echeance-badge bientot">Bientôt</span>}
                  </div>
               )}
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
            <p className="sous">Nom, montant{depense.type === "regulier" ? " et échéance" : ""} de la dépense</p>
            <Form
               champs={champsEdit}
               valeursInitiales={{
                  nom: depense.nom,
                  montant: String(depense.montant),
                  type: depense.type,
                  jourEcheance: depense.jourEcheance ? String(depense.jourEcheance) : "",
               }}
               couleur="red"
               libelle="Enregistrer"
               estValide={(v) => v.nom.trim() !== "" && enNombre(v.montant) > 0}
               onAnnuler={() => setEnEdition(false)}
               onValider={(v) => {
                  const jourEcheance = v.jourEcheance ? Number(v.jourEcheance) : undefined
                  modifierDepense(depense.id, v.nom.trim(), enNombre(v.montant), jourEcheance)
                  setEnEdition(false)
               }}
            />
         </Modal>
      </div>
   )
}
