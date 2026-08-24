import { createFileRoute } from "@tanstack/react-router";
import calculerDisponible from "../lib/calculs";
import { useBudget } from "../store/useBudget";
import format, { libelleMois } from "../lib/format";
import { useState } from "react";
import { Modal } from "../components/Modal";
import PaveNumerique from "../components/PaveNumerique";

export const Route = createFileRoute('/')({
   component: DashboardComponent,
})

function DashboardComponent() {
   const compte = useBudget((state) => state.compte)
   const mois = useBudget((state) => state.mois)
   const annee = useBudget((state) => state.annee)
   const depenses = useBudget((state) => state.depenses)
   const enveloppes = useBudget((state) => state.enveloppes)
   const voeux = useBudget((state) => state.voeux)
   const ajouterAuCompte = useBudget((state) => state.ajouterAuCompte)

   const [open, setOpen] = useState(false)

   const totalDisponible = calculerDisponible(compte, depenses, enveloppes, voeux)

   // A2 — montants dérivés de chaque catégorie
   const chargesAVenir = depenses.filter((d) => !d.estPayer).reduce((s, d) => s + d.montant, 0)
   const totalEnveloppes = enveloppes.reduce((s, e) => s + e.montant, 0)
   const totalVoeux = voeux.reduce((s, v) => s + v.montantActuel, 0)

   const chargesNonPayees = depenses.filter((d) => !d.estPayer).length

   return (
      <>
         <h2>{libelleMois(mois, annee)}</h2>

         <p>Disponible : {format(Math.max(0, totalDisponible))}</p>
         {totalDisponible < 0 && <p>Il manque {format(-totalDisponible)}</p>}

         {/* A2 — légende détaillée */}
         <ul>
            <li>
               <span>🟢 Disponible</span>
               <span>{format(Math.max(0, totalDisponible))}</span>
            </li>
            <li>
               <span>🔴 Charges à venir ({chargesNonPayees})</span>
               <span>{format(chargesAVenir)}</span>
            </li>
            <li>
               <span>🔵 Enveloppes ({enveloppes.length})</span>
               <span>{format(totalEnveloppes)}</span>
            </li>
            <li>
               <span>🟣 Vœux ({voeux.length})</span>
               <span>{format(totalVoeux)}</span>
            </li>
         </ul>

         <button onClick={() => setOpen(true)}>+ Ajouter de l'argent</button>

         <Modal isOpen={open} onClose={() => setOpen(false)}>
            <PaveNumerique
               titre="Ajouter de l'argent"
               sousTitre="Entrée sur le compte"
               onValider={(montant) => { ajouterAuCompte(montant); setOpen(false) }}
            />
         </Modal>
      </>
   )
}
