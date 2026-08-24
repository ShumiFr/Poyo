import { createFileRoute } from "@tanstack/react-router";
import calculerDisponible from "../lib/calculs";
import { useBudget } from "../store/useBudget";
import format from "../lib/format";
import { useState } from "react";
import { Modal } from "../components/Modal";
import PaveNumerique from "../components/PaveNumerique";

export const Route = createFileRoute('/')({
   component: DashboardComponent,
})

function DashboardComponent() {
   const compte = useBudget((state) => (state.compte))
   const depenses = useBudget((state) => (state.depenses))
   const enveloppes = useBudget((state) => (state.enveloppes))
   const voeux = useBudget((state) => (state.voeux))
   const ajouterAuCompte = useBudget((state) => (state.ajouterAuCompte))

   const [open, setOpen] = useState(false)

   const totalDisponible = calculerDisponible(compte, depenses, enveloppes, voeux)

   return (
      <>
         <div>Dashboard</div>
         <p>Disponible: {format(Math.max(0, totalDisponible))}</p>
         {totalDisponible < 0 && <p>Il manque {format(-totalDisponible)}</p>}

         <button onClick={() => setOpen(true)}>+</button>

         <Modal isOpen={open} onClose={() => setOpen(false)}>
            <PaveNumerique titre="Ajouter de l'argent" sousTitre="Entrée sur le compte" onValider={(montant) => { ajouterAuCompte(montant); setOpen(false) }} />
         </Modal>
      </>
   )
}