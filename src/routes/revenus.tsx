import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useBudget } from '../store/useBudget'
import Form from '../components/FormRevenu'
import FormEdition from '../components/FormEdition'
import { Modal } from '../components/Modal'
import format from '../lib/format'
import type { Revenu } from '../types'

export const Route = createFileRoute('/revenus')({
   component: RouteComponent,
})

function Section({ titre, liste }: { titre: string, liste: Revenu[] }) {
   const retirerRevenu = useBudget((state) => state.retirerRevenu)
   const marquerRecu = useBudget((state) => state.marquerRecu)
   const modifierRevenu = useBudget((state) => state.modifierRevenu)

   const [ouvert, setOuvert] = useState(true)
   const [enEdition, setEnEdition] = useState<Revenu | null>(null)

   const total = liste.reduce((somme, r) => somme + r.montant, 0)

   return (
      <div>
         <button onClick={() => setOuvert(!ouvert)}>
            {titre} · {format(total)} {ouvert ? '▾' : '▸'}
         </button>

         {ouvert && liste.map((revenu) => (
            <div key={revenu.id} className={revenu.estRecu ? "card recu" : "card"}>
               <h3 className="h3">{revenu.nom}</h3>
               <button onClick={() => setEnEdition(revenu)}>{format(revenu.montant)}</button>
               <button onClick={() => marquerRecu(revenu.id)}>
                  {revenu.estRecu ? "Reçu ✓" : "Marquer reçu"}
               </button>
               <button onClick={() => retirerRevenu(revenu.id)}>Retirer</button>
            </div>
         ))}

         <Modal isOpen={enEdition !== null} onClose={() => setEnEdition(null)}>
            {enEdition && (
               <FormEdition
                  nomInitial={enEdition.nom}
                  montantInitial={enEdition.montant}
                  onEnregistrer={(nom, montant) => {
                     modifierRevenu(enEdition.id, nom, montant)
                     setEnEdition(null)
                  }}
               />
            )}
         </Modal>
      </div>
   )
}

function RouteComponent() {
   const revenus = useBudget((state) => state.revenus)

   const reguliers = revenus.filter((r) => r.type === "regulier")
   const ponctuelles = revenus.filter((r) => r.type === "occasionnel")

   return (
      <div>
         <h2>Rentrées</h2>

         <Section titre="Réguliers" liste={reguliers} />
         {ponctuelles.length > 0 && <Section titre="Ponctuelles" liste={ponctuelles} />}

         <Form />
      </div>
   )
}
