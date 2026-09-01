import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useBudget } from '../store/useBudget'
import Section from '../components/Section'
import FormRevenu from '../components/FormRevenu'
import FormEdition from '../components/FormEdition'
import MontantEditable from '../components/MontantEditable'
import BoutonBascule from '../components/BoutonBascule'
import { Modal } from '../components/Modal'
import format from '../lib/format'
import type { Revenu } from '../types'

export const Route = createFileRoute('/revenus')({
   component: RouteComponent,
})

function RouteComponent() {
   const revenus = useBudget((state) => state.revenus)
   const marquerRecu = useBudget((state) => state.marquerRecu)
   const modifierRevenu = useBudget((state) => state.modifierRevenu)

   const [creation, setCreation] = useState(false)
   const [enEdition, setEnEdition] = useState<Revenu | null>(null)

   const reguliers = revenus.filter((r) => r.type === "regulier")
   const ponctuelles = revenus.filter((r) => r.type === "occasionnel")
   const totalRecu = revenus.filter((r) => r.estRecu).reduce((s, r) => s + r.montant, 0)

   const total = (liste: Revenu[]) => liste.reduce((s, r) => s + r.montant, 0)

   function ligne(revenu: Revenu) {
      return (
         <div key={revenu.id} className={revenu.estRecu ? "card recu" : "card"}>
            <div className="carte-tete">
               <span className="libelle-col">
                  <h3>{revenu.nom}</h3>
                  <div className="sous">{revenu.type === "regulier" ? format(revenu.montant) + " / mois" : "Ponctuelle"}</div>
               </span>
               <MontantEditable montant={revenu.montant} couleur="green" onClick={() => setEnEdition(revenu)} />
               <BoutonBascule
                  actif={revenu.estRecu}
                  couleur="green"
                  onClick={() => marquerRecu(revenu.id)}
                  label={revenu.estRecu ? "Annuler la réception" : "Marquer reçu"}
               />
            </div>
         </div>
      )
   }

   return (
      <>
         <div className="screen-titre-row">
            <h2>Rentrées</h2>
            <span className="screen-resume pos">{format(totalRecu)} reçu</span>
         </div>

         <Section titre="Réguliers" total={total(reguliers)}>{reguliers.map(ligne)}</Section>
         {ponctuelles.length > 0 && <Section titre="Ponctuelles" total={total(ponctuelles)}>{ponctuelles.map(ligne)}</Section>}

         <button className="btn-ajout" onClick={() => setCreation(true)}><Plus size={18} /> Nouvelle rentrée</button>

         <Modal isOpen={creation} onClose={() => setCreation(false)}>
            <h2>Nouvelle rentrée</h2>
            <p className="sous">Un revenu à recevoir</p>
            <FormRevenu onFini={() => setCreation(false)} />
         </Modal>

         <Modal isOpen={enEdition !== null} onClose={() => setEnEdition(null)}>
            {enEdition && (
               <>
                  <h2>Modifier · {enEdition.nom}</h2>
                  <p className="sous">Nom et montant du revenu</p>
                  <FormEdition
                     nomInitial={enEdition.nom}
                     montantInitial={enEdition.montant}
                     onAnnuler={() => setEnEdition(null)}
                     onEnregistrer={(nom, montant) => { modifierRevenu(enEdition.id, nom, montant); setEnEdition(null) }}
                  />
               </>
            )}
         </Modal>
      </>
   )
}
