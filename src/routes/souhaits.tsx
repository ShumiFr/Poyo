import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useBudget } from '../store/useBudget'
import VoeuCard from '../components/VoeuCard'
import FormVoeu from '../components/FormVoeu'
import { Modal } from '../components/Modal'
import calculerDisponible from '../lib/calculs'
import format from '../lib/format'

export const Route = createFileRoute('/souhaits')({
   component: RouteComponent,
})

function RouteComponent() {
   const compte = useBudget((state) => state.compte)
   const depenses = useBudget((state) => state.depenses)
   const enveloppes = useBudget((state) => state.enveloppes)
   const voeux = useBudget((state) => state.voeux)

   const [creation, setCreation] = useState(false)

   const totalDisponible = calculerDisponible(compte, depenses, enveloppes, voeux)

   return (
      <>
         <div className="screen-titre-row">
            <h2>Vœux</h2>
            <span className="screen-resume info">{format(Math.max(0, totalDisponible))} libre</span>
         </div>

         {voeux.map((voeu) => (
            <VoeuCard key={voeu.id} voeu={voeu} disponible={totalDisponible} />
         ))}

         <button className="btn-ajout" onClick={() => setCreation(true)}><Plus size={18} /> Nouveau vœu</button>

         <Modal isOpen={creation} onClose={() => setCreation(false)}>
            <h2>Nouveau vœu</h2>
            <p className="sous">Un projet à financer petit à petit</p>
            <FormVoeu onFini={() => setCreation(false)} />
         </Modal>
      </>
   )
}
