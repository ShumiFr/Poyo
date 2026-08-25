import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import calculerDisponible from "../lib/calculs";
import { useBudget } from "../store/useBudget";
import format from "../lib/format";
import { Modal } from "../components/Modal";
import PaveNumerique from "../components/PaveNumerique";
import Donut from "../components/Donut";

export const Route = createFileRoute('/')({
   component: DashboardComponent,
})

function DashboardComponent() {
   const compte = useBudget((state) => state.compte)
   const soldeReporte = useBudget((state) => state.soldeReporte)
   const depenses = useBudget((state) => state.depenses)
   const enveloppes = useBudget((state) => state.enveloppes)
   const voeux = useBudget((state) => state.voeux)
   const ajouterAuCompte = useBudget((state) => state.ajouterAuCompte)

   const [open, setOpen] = useState(false)

   const totalDisponible = calculerDisponible(compte, depenses, enveloppes, voeux)

   const chargesAVenir = depenses.filter((d) => !d.estPayer).reduce((s, d) => s + d.montant, 0)
   const chargesNonPayees = depenses.filter((d) => !d.estPayer).length
   const totalEnveloppes = enveloppes.reduce((s, e) => s + e.montant, 0)
   const totalVoeux = voeux.reduce((s, v) => s + v.montantActuel, 0)

   const dispoPositif = Math.max(0, totalDisponible)
   const totalCompte = dispoPositif + chargesAVenir + totalEnveloppes + totalVoeux
   const segments = [
      { valeur: dispoPositif, couleur: "var(--teal)" },
      { valeur: chargesAVenir, couleur: "var(--navy)" },
      { valeur: totalEnveloppes, couleur: "#4f7f96" },
      { valeur: totalVoeux, couleur: "var(--purple)" },
   ]

   return (
      <>
         <div className="card ligne-solde">
            <span className="libelle-col">Solde du mois dernier<div className="sous">Reporté en début de mois</div></span>
            <span className="valeur">{format(soldeReporte)}</span>
         </div>

         <div className="card carte-donut">
            <Donut
               segments={segments}
               total={totalCompte}
               centre={format(dispoPositif)}
               sousCentre={"sur " + format(totalCompte)}
            />
         </div>

         <div className="card">
            <ul className="legende">
               <li>
                  <span className="pastille bg-teal" />
                  <span className="libelle">Disponible<div className="sous">Libre, à placer ou à dépenser</div></span>
                  <span className="valeur">{format(Math.max(0, totalDisponible))}</span>
               </li>
               <li>
                  <span className="pastille bg-navy" />
                  <span className="libelle">Charges à venir<div className="sous">{chargesNonPayees} à prévoir</div></span>
                  <span className="valeur">{format(chargesAVenir)}</span>
               </li>
               <li>
                  <span className="pastille bg-steel" />
                  <span className="libelle">Enveloppes<div className="sous">{enveloppes.length} enveloppes</div></span>
                  <span className="valeur">{format(totalEnveloppes)}</span>
               </li>
               <li>
                  <span className="pastille bg-purple" />
                  <span className="libelle">Vœux<div className="sous">{voeux.length} projets</div></span>
                  <span className="valeur">{format(totalVoeux)}</span>
               </li>
            </ul>
         </div>

         {totalDisponible < 0 && <p className="screen-resume neg">Il manque {format(-totalDisponible)}</p>}

         <button className="btn btn-primary btn-full" onClick={() => setOpen(true)}>+ Entrée d'argent</button>

         <Modal isOpen={open} onClose={() => setOpen(false)}>
            <PaveNumerique
               titre="Entrée d'argent"
               sousTitre="Ajouté à ce qu'il reste"
               couleur="green"
               libelleValider="Ajouter"
               onAnnuler={() => setOpen(false)}
               onValider={(montant) => { ajouterAuCompte(montant); setOpen(false) }}
            />
         </Modal>
      </>
   )
}
