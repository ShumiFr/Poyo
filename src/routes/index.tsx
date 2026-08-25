import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import calculerDisponible from "../lib/calculs";
import { reserveCourses } from "../lib/courses";
import { COULEURS_HEX } from "../lib/styleEnveloppe";
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
   const revenus = useBudget((state) => state.revenus)
   const depenses = useBudget((state) => state.depenses)
   const enveloppes = useBudget((state) => state.enveloppes)
   const voeux = useBudget((state) => state.voeux)
   const courses = useBudget((state) => state.courses)
   const previsionnels = useBudget((state) => state.previsionnels)
   const ajouterAuCompte = useBudget((state) => state.ajouterAuCompte)

   const navigate = useNavigate()
   const [open, setOpen] = useState(false)
   const [envDepliees, setEnvDepliees] = useState(false)

   // Montants dérivés
   const revenusPercus = revenus.filter((r) => r.estRecu).reduce((s, r) => s + r.montant, 0)
   const chargesPayees = depenses.filter((d) => d.estPayer).reduce((s, d) => s + d.montant, 0)
   const previsionnelPrevu = previsionnels.filter((p) => !p.estDepense).reduce((s, p) => s + p.montant, 0)
   const chargesAVenir = depenses.filter((d) => !d.estPayer).reduce((s, d) => s + d.montant, 0) + reserveCourses(courses) + previsionnelPrevu
   const totalEnveloppes = enveloppes.reduce((s, e) => s + e.montant, 0)
   const totalVoeux = voeux.reduce((s, v) => s + v.montantActuel, 0)

   // Écart entre le compte réel et sa reconstitution (entrées rapides / ajustements) → le récap boucle toujours
   const autresEntrees = compte - (soldeReporte + revenusPercus - chargesPayees)

   // Ce qu'il reste = compte − charges à venir − réserve courses − prévisionnel − enveloppes − vœux
   const reste = calculerDisponible(compte, depenses, enveloppes, voeux, courses, previsionnels)
   const restePositif = Math.max(0, reste)

   // Donut : le compte réparti en reste / charges à venir / enveloppes / vœux
   const totalRing = restePositif + chargesAVenir + totalEnveloppes + totalVoeux
   const versEnveloppes = () => navigate({ to: "/enveloppes" })
   // Enveloppes : soit un segment agrégé, soit un segment par enveloppe (déplié)
   const segmentsEnveloppes = envDepliees
      ? enveloppes.map((e) => ({ valeur: e.montant, couleur: COULEURS_HEX[e.couleur] ?? "#4f7f96", onClick: versEnveloppes }))
      : [{ valeur: totalEnveloppes, couleur: "#4f7f96", onClick: versEnveloppes }]

   const segments = [
      { valeur: restePositif, couleur: "var(--teal)", onClick: () => setOpen(true) },
      { valeur: chargesAVenir, couleur: "var(--navy)", onClick: () => navigate({ to: "/depenses" }) },
      ...segmentsEnveloppes,
      { valeur: totalVoeux, couleur: "var(--purple)", onClick: () => navigate({ to: "/souhaits" }) },
   ]

   return (
      <>
         <div className="card carte-donut">
            <Donut
               segments={segments}
               total={totalRing}
               centre={format(restePositif)}
               sousCentre={"sur " + format(compte)}
               onCentre={() => setOpen(true)}
            />
         </div>

         <div className="card recap">
            <div className="recap-ligne">
               <span>Solde du mois dernier</span>
               <span>{format(soldeReporte)}</span>
            </div>
            <div className="recap-ligne">
               <span>Revenus perçus</span>
               <span className="text-green">+ {format(revenusPercus)}</span>
            </div>
            <div className="recap-ligne">
               <span>Charges payées</span>
               <span className="text-red">− {format(chargesPayees)}</span>
            </div>
            {autresEntrees !== 0 && (
               <div className="recap-ligne">
                  <span>Autres entrées</span>
                  <span className={autresEntrees > 0 ? "text-green" : "text-red"}>
                     {autresEntrees > 0 ? "+ " : "− "}{format(Math.abs(autresEntrees))}
                  </span>
               </div>
            )}
            <div className="recap-ligne sous-total">
               <span>Sur le compte</span>
               <span>{format(compte)}</span>
            </div>
            <div className="recap-ligne">
               <span>Charges à venir</span>
               <span className="text-red">− {format(chargesAVenir)}</span>
            </div>
            <div className="recap-ligne">
               <span>
                  Enveloppes
                  {enveloppes.length > 0 && (
                     <button className="recap-toggle" onClick={() => setEnvDepliees(!envDepliees)}>
                        {envDepliees ? "−" : "+"}
                     </button>
                  )}
               </span>
               <span className="text-red">− {format(totalEnveloppes)}</span>
            </div>
            <div className="recap-ligne">
               <span>Vœux</span>
               <span className="text-red">− {format(totalVoeux)}</span>
            </div>
            <div className="recap-ligne total">
               <span>Ce qu'il me reste</span>
               <span className="text-teal">{format(restePositif)}</span>
            </div>
            {reste < 0 && (
               <div className="recap-manque">Il manque {format(-reste)}</div>
            )}
         </div>

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
