import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useBudget } from '../store/useBudget'
import EnveloppeCard from '../components/EnveloppeCard'
import FormEnveloppe from '../components/FormEnveloppe'
import { Modal } from '../components/Modal'
import calculerDisponible from '../lib/calculs'
import format from '../lib/format'

export const Route = createFileRoute('/enveloppes')({
   component: RouteComponent,
})

function RouteComponent() {
   const compte = useBudget((state) => state.compte)
   const depenses = useBudget((state) => state.depenses)
   const voeux = useBudget((state) => state.voeux)
   const enveloppes = useBudget((state) => state.enveloppes)

   const [creation, setCreation] = useState(false)

   const totalDisponible = calculerDisponible(compte, depenses, enveloppes, voeux)

   return (
      <>
         <div className="screen-titre-row">
            <h2>Enveloppes</h2>
            <span className="screen-resume info">{format(Math.max(0, totalDisponible))} libre</span>
         </div>

         {enveloppes.map((enveloppe) => (
            <EnveloppeCard key={enveloppe.id} enveloppe={enveloppe} disponible={totalDisponible} />
         ))}

         <button className="btn-ajout" onClick={() => setCreation(true)}><Plus size={18} /> Nouvelle enveloppe</button>

         <Modal isOpen={creation} onClose={() => setCreation(false)}>
            <h2>Nouvelle enveloppe</h2>
            <p className="sous">Choisis son style</p>
            <FormEnveloppe disponible={totalDisponible} onFini={() => setCreation(false)} />
         </Modal>
      </>
   )
}
