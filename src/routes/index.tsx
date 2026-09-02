import { createFileRoute, Link } from "@tanstack/react-router";
import calculerDisponible from "../lib/calculs";
import { reserveCourses } from "../lib/courses";
import { useBudget } from "../store/useBudget";
import format from "../lib/format";
import Donut from "../components/Donut";

export const Route = createFileRoute('/')({
   component: DashboardComponent,
})

function DashboardComponent() {
   const compte = useBudget((state) => state.compte)
   const soldeReporte = useBudget((state) => state.soldeReporte)
   const revenus = useBudget((state) => state.revenus)
   const depenses = useBudget((state) => state.depenses)
   const enveloppes = useBudget((state) => state.enveloppes)
   const voeux = useBudget((state) => state.voeux)
   const courses = useBudget((state) => state.courses)
   const previsionnels = useBudget((state) => state.previsionnels)

   // Montants dérivés
   const revenusPercus = revenus.filter((r) => r.estRecu).reduce((s, r) => s + r.montant, 0)
   const chargesPayees = depenses.filter((d) => d.estPayer).reduce((s, d) => s + d.montant, 0)
   const previsionnelPrevu = previsionnels.filter((p) => !p.estDepense).reduce((s, p) => s + p.montant, 0)
   const chargesAVenir = depenses.filter((d) => !d.estPayer).reduce((s, d) => s + d.montant, 0) + reserveCourses(courses) + previsionnelPrevu
   const totalEnveloppes = enveloppes.reduce((s, e) => s + e.montant, 0)
   const totalVoeux = voeux.reduce((s, v) => s + v.montantActuel, 0)

   // Écart entre le compte réel et sa reconstitution (entrées rapides / ajustements) → le récap boucle toujours
   const autresEntrees = compte - (soldeReporte + revenusPercus - chargesPayees)
   // On regroupe tout ce qui rentre sur une seule ligne « Revenus perçus »
   const revenusAffiches = revenusPercus + autresEntrees

   // Ce qu'il reste = compte − charges à venir − réserve courses − prévisionnel − enveloppes − vœux
   const reste = calculerDisponible(compte, depenses, enveloppes, voeux, courses, previsionnels)
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
