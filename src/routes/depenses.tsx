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
         <button onClick={() => setOuvert(!ouvert)}>
            {titre} · {format(total)} {ouvert ? '▾' : '▸'}
         </button>
         {ouvert && liste.map((depense) => (
            <DepenseCard key={depense.id} depense={depense} />
         ))}
      </div>
   )
}

function RouteComponent() {
   const depenses = useBudget((state) => state.depenses)
   const [isOpen, setIsOpen] = useState(false)

   const regulieres = depenses.filter((d) => d.type === "regulier")
   const ponctuelles = depenses.filter((d) => d.type === "occasionnel")

   // D8 — total « à venir » : charges non payées (+ réserve courses plus tard)
   const aVenir = depenses.filter((d) => !d.estPayer).reduce((somme, d) => somme + d.montant, 0)

   return (
      <div>
         <h2>Dépenses</h2>
         <p>{format(aVenir)} à venir</p>

         <Section titre="Régulières" liste={regulieres} />
         {ponctuelles.length > 0 && <Section titre="Ponctuelles" liste={ponctuelles} />}

         <button onClick={() => setIsOpen(true)}><Plus /></button>

         <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
            <FormDepense />
         </Modal>
      </div>
   )
}
