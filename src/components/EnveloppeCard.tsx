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
      if (montant <= disponible) ajouterArgent(enveloppe.id, montant)
      else setMontantEnAttente(montant)
   }

   function confirmerDepassement() {
      if (montantEnAttente !== null) ajouterArgent(enveloppe.id, montantEnAttente)
      setMontantEnAttente(null)
   }

   function handleRetrait(montant: number) {
      retirerArgent(enveloppe.id, montant)
      setOuvertRetrait(false)
   }

   return (
      <div className="card">
         <div className="carte-tete">
            <span className={"icone-box text-" + enveloppe.couleur}>{enveloppe.icone}</span>
            <h3>{enveloppe.nom}</h3>
            <span className={"montant text-" + enveloppe.couleur}>{format(enveloppe.montant)}</span>
         </div>

         <div className="carte-actions">
            <button className="btn" onClick={() => setOuvertRetrait(true)}>Retirer</button>
            <button className={"btn bg-" + enveloppe.couleur} onClick={() => setOuvert(true)}>Ajouter</button>
         </div>

         <Modal isOpen={ouvert} onClose={() => setOuvert(false)}>
            <PaveNumerique
               titre={"Ajouter · " + enveloppe.nom}
               sousTitre={"Disponible : " + format(disponible)}
               couleur={enveloppe.couleur}
               libelleValider="Ajouter"
               onAnnuler={() => setOuvert(false)}
               onValider={handleValider}
            />
         </Modal>

         <Modal isOpen={ouvertRetrait} onClose={() => setOuvertRetrait(false)}>
            <PaveNumerique
               titre={"Retirer · " + enveloppe.nom}
               sousTitre={"Dans l'enveloppe : " + format(enveloppe.montant)}
               couleur={enveloppe.couleur}
               libelleValider="Retirer"
               onAnnuler={() => setOuvertRetrait(false)}
               onValider={handleRetrait}
            />
         </Modal>

         <Modal isOpen={montantEnAttente !== null} onClose={() => setMontantEnAttente(null)}>
            <h2>Dépassement du disponible</h2>
            <p className="sous">Vérifie avant de placer</p>
            <ul className="legende">
               <li><span className="libelle">Disponible sur le compte</span><span className="valeur">{format(disponible)}</span></li>
               <li><span className="libelle">Montant à placer</span><span className="valeur text-red">{format(montantEnAttente ?? 0)}</span></li>
            </ul>
            <div className="pave-actions">
               <button className="btn" onClick={() => setMontantEnAttente(null)}>Annuler</button>
               <button className="btn btn-primary" onClick={confirmerDepassement}>Valider</button>
            </div>
         </Modal>
      </div>
   )
}
