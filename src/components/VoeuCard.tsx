import { useState } from 'react'
import { useBudget } from '../store/useBudget'
import { Modal } from './Modal'
import PaveNumerique from './PaveNumerique'
import format from '../lib/format'
import type { Voeu } from '../types'

export default function VoeuCard({ voeu, disponible }: { voeu: Voeu, disponible: number }) {
   const ajouterArgent = useBudget((state) => state.ajouterArgentVoeu)
   const retirerArgent = useBudget((state) => state.retirerArgentVoeu)

   const [ouvert, setOuvert] = useState(false)
   const [ouvertRetrait, setOuvertRetrait] = useState(false)
   const [montantEnAttente, setMontantEnAttente] = useState<number | null>(null)

   const pourcentage = Math.min(100, (voeu.montantActuel / voeu.montantTotal) * 100)

   function handleValider(montant: number) {
      setOuvert(false)
      if (montant <= disponible) {
         ajouterArgent(voeu.id, montant)
      } else {
         setMontantEnAttente(montant)
      }
   }

   function confirmerDepassement() {
      if (montantEnAttente !== null) {
         ajouterArgent(voeu.id, montantEnAttente)
      }
      setMontantEnAttente(null)
   }

   function handleRetrait(montant: number) {
      retirerArgent(voeu.id, montant)
      setOuvertRetrait(false)
   }

   return (
      <div id={voeu.id} className="card">
         <div>
            <h3 className="h3">{voeu.nom}</h3>
            <p>{format(voeu.montantActuel)} sur {format(voeu.montantTotal)} · {Math.round(pourcentage)} %</p>
         </div>

         <div className="barre">
            <div className="barre-remplie" style={{ width: pourcentage + '%' }} />
         </div>

         <button onClick={() => setOuvertRetrait(true)}>Retirer</button>
         <button onClick={() => setOuvert(true)}>Mettre de côté</button>

         <Modal isOpen={ouvert} onClose={() => setOuvert(false)}>
            <PaveNumerique
               titre="Mettre de côté"
               sousTitre={voeu.nom}
               onValider={handleValider}
            />
         </Modal>

         <Modal isOpen={ouvertRetrait} onClose={() => setOuvertRetrait(false)}>
            <PaveNumerique
               titre="Retirer du vœu"
               sousTitre={voeu.nom}
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
