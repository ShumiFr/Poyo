import { createFileRoute } from '@tanstack/react-router'
import { useBudget } from '../store/useBudget'
import VoeuCard from '../components/VoeuCard'
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

   const totalDisponible = calculerDisponible(compte, depenses, enveloppes, voeux)

   return (
      <>
         <h2>Vœux</h2>
         <p>{format(Math.max(0, totalDisponible))} libre</p>

         {voeux.map((voeu) => (
            <VoeuCard key={voeu.id} voeu={voeu} disponible={totalDisponible} />
         ))}
      </>
   )
}
