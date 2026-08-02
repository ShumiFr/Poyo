import { createFileRoute } from "@tanstack/react-router";
import calculerDisponible from "../lib/calculs";
import { useBudget } from "../store/useBudget";

export const Route = createFileRoute('/')({
   component: DashboardComponent,
})

function DashboardComponent() {
   const compte = useBudget((state) => (state.compte))
   const depenses = useBudget((state) => (state.depenses))
   const enveloppes = useBudget((state) => (state.enveloppes))
   const voeux = useBudget((state) => (state.voeux))

   const totalDisponible = calculerDisponible(compte, depenses, enveloppes, voeux)

   return (
      <>
         <div>Dashboard</div>
         <p>Disponible: {Math.max(0, totalDisponible)}</p>
         {totalDisponible < 0 && <p>Il manque {-totalDisponible} €</p>}
      </>
   )
}