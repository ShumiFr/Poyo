import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Plus } from 'lucide-react'
import DepenseCard from '../components/DepenseCard'
import FormDepense from '../components/FormDepense'
import { Modal } from '../components/Modal'
import { useBudget } from '../store/useBudget'
import format from '../lib/format'
import type { Depense } from '../types'

export const Route = createFileRoute('/depenses')({
   component: RouteComponent,
})

function Section({ titre, liste }: { titre: string, liste: Depense[] }) {
   const [ouvert, setOuvert] = useState(true)
   const total = liste.reduce((somme, d) => somme + d.montant, 0)

   return (
      <div>
         <button className="section-header" onClick={() => setOuvert(!ouvert)}>
            <span>{titre}</span>
            <span className="total">{format(total)} {ouvert ? '▾' : '▸'}</span>
         </button>
         {ouvert && liste.map((depense) => (
            <DepenseCard key={depense.id} depense={depense} />
         ))}
      </div>
   )
}

function RouteComponent() {
   const depenses = useBudget((state) => state.depenses)
   const [creation, setCreation] = useState(false)

   const regulieres = depenses.filter((d) => d.type === "regulier")
   const ponctuelles = depenses.filter((d) => d.type === "occasionnel")
   const aVenir = depenses.filter((d) => !d.estPayer).reduce((somme, d) => somme + d.montant, 0)

   return (
      <>
         <div className="screen-titre-row">
            <h2>Dépenses</h2>
            <span className="screen-resume neg">{format(aVenir)} à venir</span>
         </div>

         <Section titre="Régulières" liste={regulieres} />
         {ponctuelles.length > 0 && <Section titre="Ponctuelles" liste={ponctuelles} />}

         <button className="btn-ajout" onClick={() => setCreation(true)}><Plus size={18} /> Nouvelle dépense</button>

         <Modal isOpen={creation} onClose={() => setCreation(false)}>
            <h2>Nouvelle dépense</h2>
            <p className="sous">Une sortie d'argent</p>
            <FormDepense onFini={() => setCreation(false)} />
         </Modal>
      </>
   )
}
