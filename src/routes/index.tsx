import { createFileRoute, Link } from "@tanstack/react-router";
import { calculerRecap } from "../lib/calculs";
import { useBudget, moisActif } from "../store/useBudget";
import format from "../lib/format";
import Donut from "../components/Donut";

export const Route = createFileRoute('/')({
   component: DashboardComponent,
})

function DashboardComponent() {
   // Toutes les données affichées viennent du mois sélectionné.
   const { compte, soldeReporte, revenus, depenses, enveloppes, voeux, courses, previsionnels } =
      useBudget(moisActif)

   // Montants dérivés (mêmes calculs que la vue d'un mois archivé)
   const { revenusAffiches, chargesPayees, chargesAVenir, totalEnveloppes, totalVoeux, reste } =
      calculerRecap({ compte, soldeReporte, revenus, depenses, enveloppes, voeux, courses, previsionnels })
   const restePositif = Math.max(0, reste)

   // Donut : le compte réparti en reste / charges à venir / enveloppes / vœux
   const totalRing = restePositif + chargesAVenir + totalEnveloppes + totalVoeux
   const segments = [
      { valeur: restePositif, couleur: "var(--accent)" },
      { valeur: chargesAVenir, couleur: "var(--rouge)" },
      { valeur: totalEnveloppes, couleur: "var(--teal)" },
      { valeur: totalVoeux, couleur: "var(--violet)" },
   ]

   return (
      <>
         <div className="card carte-donut">
            <Donut
               segments={segments}
               total={totalRing}
               centre={format(restePositif)}
               sousCentre={"sur " + format(compte)}
            />
            <div className="donut-legende">
               <span><span className="pastille" style={{ background: "var(--accent)" }} />Reste</span>
               <span><span className="pastille" style={{ background: "var(--rouge)" }} />Charges</span>
               <span><span className="pastille" style={{ background: "var(--teal)" }} />Enveloppes</span>
               <span><span className="pastille" style={{ background: "var(--violet)" }} />Vœux</span>
            </div>
         </div>

         <div className="card recap">
            <div className="recap-ligne">
               <span>Solde du mois dernier</span>
               <span>{format(soldeReporte)}</span>
            </div>
            <Link to="/revenus" className="recap-ligne revenu cliquable">
               <span>Revenus perçus</span>
               <span>+ {format(revenusAffiches)}</span>
            </Link>
            <Link to="/depenses" className="recap-ligne charge-payee cliquable">
               <span>Charges payées</span>
               <span>− {format(chargesPayees)}</span>
            </Link>
            <div className="recap-ligne sous-total">
               <span>Sur le compte</span>
               <span>{format(compte)}</span>
            </div>
            <Link to="/depenses" className="recap-ligne rouge cliquable">
               <span>Charges à venir</span>
               <span>− {format(chargesAVenir)}</span>
            </Link>
            <Link to="/enveloppes" className="recap-ligne rouge enveloppes cliquable">
               <span>Enveloppes</span>
               <span>− {format(totalEnveloppes)}</span>
            </Link>
            <Link to="/souhaits" className="recap-ligne rouge voeux cliquable">
               <span>Vœux</span>
               <span>− {format(totalVoeux)}</span>
            </Link>
            <div className="recap-ligne total">
               <span>Ce qu'il me reste</span>
               <span>{format(restePositif)}</span>
            </div>
            {reste < 0 && (
               <div className="recap-manque">Il manque {format(-reste)}</div>
            )}
         </div>
      </>
   )
}
