import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Check, Plus } from 'lucide-react'
import { useBudget } from '../store/useBudget'
import FormRevenu from '../components/FormRevenu'
import FormEdition from '../components/FormEdition'
import { Modal } from '../components/Modal'
import format from '../lib/format'
import type { Revenu } from '../types'

export const Route = createFileRoute('/revenus')({
   component: RouteComponent,
})

function Section({ titre, liste }: { titre: string, liste: Revenu[] }) {
   const marquerRecu = useBudget((state) => state.marquerRecu)
   const modifierRevenu = useBudget((state) => state.modifierRevenu)

   const [ouvert, setOuvert] = useState(true)
   const [enEdition, setEnEdition] = useState<Revenu | null>(null)

   const total = liste.reduce((somme, r) => somme + r.montant, 0)

   return (
      <div>
         <button className="section-header" onClick={() => setOuvert(!ouvert)}>
            <span>{titre}</span>
            <span className="total">{format(total)} {ouvert ? '▾' : '▸'}</span>
         </button>

         {ouvert && liste.map((revenu) => (
            <div key={revenu.id} className={revenu.estRecu ? "card recu" : "card"}>
               <div className="carte-tete">
                  <span className="libelle-col">
                     <h3>{revenu.nom}</h3>
                     <div className="sous">{revenu.type === "regulier" ? format(revenu.montant) + " / mois" : "Ponctuelle"}</div>
                  </span>
                  <button className="montant-edit text-green" onClick={() => setEnEdition(revenu)}>{format(revenu.montant)}</button>
                  <button
                     className={revenu.estRecu ? "carre bg-green" : "carre bg-green"}
                     onClick={() => marquerRecu(revenu.id)}
                     aria-label={revenu.estRecu ? "Annuler la réception" : "Marquer reçu"}
                  >
                     {revenu.estRecu ? <Check size={18} /> : <Plus size={18} />}
                  </button>
               </div>
            </div>
         ))}

         <Modal isOpen={enEdition !== null} onClose={() => setEnEdition(null)}>
            {enEdition && (
               <>
                  <h2>Modifier · {enEdition.nom}</h2>
                  <p className="sous">Nom et montant du revenu</p>
                  <FormEdition
                     nomInitial={enEdition.nom}
                     montantInitial={enEdition.montant}
                     onEnregistrer={(nom, montant) => { modifierRevenu(enEdition.id, nom, montant); setEnEdition(null) }}
                  />
               </>
            )}
         </Modal>
      </div>
   )
}

function RouteComponent() {
   const revenus = useBudget((state) => state.revenus)
   const [creation, setCreation] = useState(false)

   const reguliers = revenus.filter((r) => r.type === "regulier")
   const ponctuelles = revenus.filter((r) => r.type === "occasionnel")
   const totalRecu = revenus.filter((r) => r.estRecu).reduce((s, r) => s + r.montant, 0)

   return (
      <>
         <div className="screen-titre-row">
            <h2>Rentrées</h2>
            <span className="screen-resume pos">{format(totalRecu)} reçu</span>
         </div>

         <Section titre="Réguliers" liste={reguliers} />
         {ponctuelles.length > 0 && <Section titre="Ponctuelles" liste={ponctuelles} />}

         <button className="btn-ajout" onClick={() => setCreation(true)}><Plus size={18} /> Nouvelle rentrée</button>

         <Modal isOpen={creation} onClose={() => setCreation(false)}>
            <h2>Nouvelle rentrée</h2>
            <p className="sous">Un revenu à recevoir</p>
            <FormRevenu onFini={() => setCreation(false)} />
         </Modal>
      </>
   )
}
