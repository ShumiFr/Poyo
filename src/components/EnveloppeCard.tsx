import { useState } from 'react'
import { useBudget } from '../store/useBudget'
import { Modal } from './Modal'
import PaveNumerique from './PaveNumerique'
import format from '../lib/format'
import type { Enveloppe } from '../types'

export default function EnveloppeCard({ enveloppe, disponible }: { enveloppe: Enveloppe, disponible: number }) {
   const ajouterArgent = useBudget((state) => state.ajouterArgentEnveloppe)
   const retirerArgent = useBudget((state) => state.retirerArgentEnveloppe)

   const [ouvert, setOuvert] = useState(false)
   const [ouvertRetrait, setOuvertRetrait] = useState(false)
   const [montantEnAttente, setMontantEnAttente] = useState<number | null>(null)

   function handleValider(montant: number) {
      setOuvert(false)
      if (montant <= disponible) {
         ajouterArgent(enveloppe.id, montant)
      } else {
         setMontantEnAttente(montant)
      }
   }

   function confirmerDepassement() {
      if (montantEnAttente !== null) {
         ajouterArgent(enveloppe.id, montantEnAttente)
      }
      setMontantEnAttente(null)
   }

   function handleRetrait(montant: number) {
      retirerArgent(enveloppe.id, montant)
      setOuvertRetrait(false)
   }

   return (
      <div id={enveloppe.id} className="card">
         <div>
            <span>{enveloppe.icone}</span>
            <h3 className="h3">{enveloppe.nom}</h3>
         </div>
         <h3 className={"text-" + enveloppe.couleur}>{format(enveloppe.montant)}</h3>
         <button onClick={() => setOuvertRetrait(true)}>Retirer</button>
         <button className={"bg-" + enveloppe.couleur} onClick={() => setOuvert(true)}>Ajouter</button>

         <Modal isOpen={ouvert} onClose={() => setOuvert(false)}>
            <PaveNumerique
               titre="Ajouter dans l'enveloppe"
               sousTitre={enveloppe.nom}
               onValider={handleValider}
            />
         </Modal>

         <Modal isOpen={ouvertRetrait} onClose={() => setOuvertRetrait(false)}>
            <PaveNumerique
               titre="Retirer de l'enveloppe"
               sousTitre={enveloppe.nom}
               onValider={handleRetrait}
            />
         </Modal>

         <Modal isOpen={montantEnAttente !== null} onClose={() => setMontantEnAttente(null)}>
            <p>Disponible sur le compte : {format(disponible)}</p>
            <p>Montant à placer : <span className="text-red">{format(montantEnAttente ?? 0)}</span></p>
            <button onClick={() => setMontantEnAttente(null)}>Annuler</button>
            <button onClick={confirmerDepassement}>Valider</button>
         </Modal>
      </div>
   )
}
