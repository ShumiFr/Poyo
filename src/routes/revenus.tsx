import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useBudget } from '../store/useBudget'
import Section from '../components/Section'
import Form from '../components/Form'
import MontantEditable from '../components/MontantEditable'
import BoutonBascule from '../components/BoutonBascule'
import { Modal } from '../components/Modal'
import { champsRevenu, champsNomMontant } from '../lib/champs'
import format, { enNombre } from '../lib/format'
import type { Frequence, Revenu } from '../types'

export const Route = createFileRoute('/revenus')({
   component: RouteComponent,
})

function RouteComponent() {
   const revenus = useBudget((state) => state.revenus)
   const ajouterRevenu = useBudget((state) => state.ajouterRevenu)
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

         <Section titre="Réguliers" total={total(reguliers)} couleur="var(--vert)">{reguliers.map(ligne)}</Section>
         {ponctuelles.length > 0 && <Section titre="Ponctuelles" total={total(ponctuelles)} couleur="var(--vert)">{ponctuelles.map(ligne)}</Section>}

         <button className="btn-ajout" onClick={() => setCreation(true)}><Plus size={18} /> Nouvelle rentrée</button>

         <Modal isOpen={creation} onClose={() => setCreation(false)}>
            <h2>Nouvelle rentrée</h2>
            <p className="sous">Un revenu à recevoir</p>
            <Form
               champs={champsRevenu}
               valeursInitiales={{ nom: "", type: "regulier", montant: "" }}
               couleur="green"
               estValide={(v) => v.nom.trim() !== "" && enNombre(v.montant) > 0}
               onAnnuler={() => setCreation(false)}
               onValider={(v) => {
                  ajouterRevenu({ id: crypto.randomUUID(), nom: v.nom.trim(), montant: enNombre(v.montant), type: v.type as Frequence, estRecu: false })
                  setCreation(false)
               }}
            />
         </Modal>

         <Modal isOpen={enEdition !== null} onClose={() => setEnEdition(null)}>
            {enEdition && (
               <>
                  <h2>Modifier · {enEdition.nom}</h2>
                  <p className="sous">Nom et montant du revenu</p>
                  <Form
                     champs={champsNomMontant}
                     valeursInitiales={{ nom: enEdition.nom, montant: String(enEdition.montant) }}
                     couleur="green"
                     libelle="Enregistrer"
                     estValide={(v) => v.nom.trim() !== "" && enNombre(v.montant) > 0}
                     onAnnuler={() => setEnEdition(null)}
                     onValider={(v) => { modifierRevenu(enEdition.id, v.nom.trim(), enNombre(v.montant)); setEnEdition(null) }}
                  />
               </>
            )}
         </Modal>
      </>
   )
}
