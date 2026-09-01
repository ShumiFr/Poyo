import { useState } from 'react'
import { useBudget } from '../store/useBudget'
import { Modal } from '../components/Modal'
import ModalePave from '../components/ModalePave'
import ConfirmationDepassement from '../components/ConfirmationDepassement'
import format, { enNombre } from '../lib/format'
import type { Voeu } from '../types'

export default function VoeuCard({ voeu, disponible }: { voeu: Voeu, disponible: number }) {
   const ajouterArgent = useBudget((state) => state.ajouterArgentVoeu)
   const retirerArgent = useBudget((state) => state.retirerArgentVoeu)
   const acheterVoeu = useBudget((state) => state.acheterVoeu)

   const [ouvert, setOuvert] = useState(false)
   const [ouvertRetrait, setOuvertRetrait] = useState(false)
   const [montantEnAttente, setMontantEnAttente] = useState<number | null>(null)
   const [ouvertAchat, setOuvertAchat] = useState(false)
   const [prixReel, setPrixReel] = useState("")

   const pourcentage = Math.min(100, (voeu.montantActuel / voeu.montantTotal) * 100)
   const atteint = voeu.montantActuel >= voeu.montantTotal

   function handleValider(montant: number) {
      setOuvert(false)
      if (montant <= disponible) ajouterArgent(voeu.id, montant)
      else setMontantEnAttente(montant)
   }

   function confirmerDepassement() {
      if (montantEnAttente !== null) ajouterArgent(voeu.id, montantEnAttente)
      setMontantEnAttente(null)
   }

   function handleRetrait(montant: number) {
      retirerArgent(voeu.id, montant)
      setOuvertRetrait(false)
   }

   function ouvrirAchat() {
      setPrixReel(String(voeu.montantTotal))   // prérempli au prix visé
      setOuvertAchat(true)
   }

   function confirmerAchat() {
      acheterVoeu(voeu.id, enNombre(prixReel))
      setOuvertAchat(false)
   }

   // Vœu déjà acheté : carte grisée, sans actions
   if (voeu.estTermine) {
      return (
         <div className="card payee">
            <div className="voeu-tete">
               <h3>{voeu.nom}</h3>
               <span className="sur">Acheté ✓</span>
            </div>
         </div>
      )
   }

   return (
      <div className="card">
         <div className="voeu-tete">
            <h3>{voeu.nom}</h3>
            <span className="sur">sur {format(voeu.montantTotal)}</span>
         </div>
         <p className="voeu-montant text-purple">
            {format(voeu.montantActuel)} <span className="pct">· {Math.round(pourcentage)} %</span>
         </p>

         <div className="barre">
            <div className="barre-remplie" style={{ width: pourcentage + '%' }} />
         </div>

         <div className="carte-actions">
            <button className="btn" onClick={() => setOuvertRetrait(true)}>Retirer</button>
            <button className="btn bg-purple" onClick={() => setOuvert(true)}>Mettre de côté</button>
         </div>

         {atteint && (
            <button className="btn btn-green btn-full" style={{ marginTop: 10 }} onClick={ouvrirAchat}>
               Acheter
            </button>
         )}

         <ModalePave
            ouvert={ouvert}
            onFermer={() => setOuvert(false)}
            titre={"Mettre de côté · " + voeu.nom}
            sousTitre={"Disponible : " + format(disponible)}
            couleur="purple"
            libelleValider="Mettre de côté"
            onValider={handleValider}
         />

         <ModalePave
            ouvert={ouvertRetrait}
            onFermer={() => setOuvertRetrait(false)}
            titre={"Retirer · " + voeu.nom}
            sousTitre={"Mis de côté : " + format(voeu.montantActuel)}
            couleur="purple"
            libelleValider="Retirer"
            onValider={handleRetrait}
         />

         <Modal isOpen={ouvertAchat} onClose={() => setOuvertAchat(false)}>
            <h2>Acheter · {voeu.nom}</h2>
            <p className="sous">Confirme le montant réel de l'achat</p>
            <ul className="legende">
               <li><span className="libelle">Mis de côté</span><span className="valeur">{format(voeu.montantActuel)}</span></li>
            </ul>
            <div className="champ">
               <label>Montant réel payé</label>
               <input value={prixReel} onChange={(e) => setPrixReel(e.target.value)} />
            </div>
            <div className="pave-actions">
               <button className="btn" onClick={() => setOuvertAchat(false)}>Annuler</button>
               <button className="btn btn-green" onClick={confirmerAchat}>Acheter</button>
            </div>
         </Modal>

         <ConfirmationDepassement
            montant={montantEnAttente}
            disponible={disponible}
            couleur="purple"
            onAnnuler={() => setMontantEnAttente(null)}
            onValider={confirmerDepassement}
         />
      </div>
   )
}
