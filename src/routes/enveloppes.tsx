import { createFileRoute } from '@tanstack/react-router'
import { useBudget } from '../store/useBudget'
import EnveloppeCard from '../components/EnveloppeCard'
import calculerDisponible from '../lib/calculs'
import format from '../lib/format'

export const Route = createFileRoute('/enveloppes')({
  component: RouteComponent,
})

function RouteComponent() {
  const compte = useBudget((state) => (state.compte))
  const depenses = useBudget((state) => (state.depenses))
  const voeux = useBudget((state) => (state.voeux))
  const enveloppes = useBudget((state) => state.enveloppes)

  const totalDisponible = calculerDisponible(compte, depenses, enveloppes, voeux)

  return (
    <>
      <h2>Enveloppes</h2>
      <p>{format(Math.max(0, totalDisponible))} libre</p>

      {enveloppes.map((enveloppe) => (
        <EnveloppeCard key={enveloppe.id} enveloppe={enveloppe} disponible={totalDisponible} />
      ))}
    </>
  )
}
