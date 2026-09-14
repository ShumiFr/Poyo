import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Plus, CalendarClock } from 'lucide-react'
import DepenseCard from '../cartes/DepenseCard'
import SemaineCard from '../cartes/SemaineCard'
import PrevisionnelCard from '../cartes/PrevisionnelCard'
import Section from '../components/Section'
import Form from '../components/Form'
import { Modal } from '../components/Modal'
import { useBudget, moisActif } from '../store/useBudget'
import { champsDepense } from '../lib/champs'
import { reserveCourses } from '../lib/courses'
import { facturesASurveiller } from '../lib/echeances'
import format, { enNombre } from '../lib/format'
import type { Depense, Frequence } from '../types'

export const Route = createFileRoute('/depenses')({
   component: RouteComponent,
})

function SectionPrevisionnel() {
   const previsionnels = useBudget((state) => moisActif(state).previsionnels)
   const total = previsionnels.reduce((somme, p) => somme + p.montant, 0)

   // Les prévisionnels se créent désormais depuis « Nouvelle dépense » (source = Prévisionnel).
   if (previsionnels.length === 0) return null

   return (
      <Section titre="Prévisionnel · ajustable" total={total} couleur="var(--cat-navy)">
         {previsionnels.map((p) => <PrevisionnelCard key={p.id} prev={p} />)}
      </Section>
   )
}

function RouteComponent() {
   const depenses = useBudget((state) => moisActif(state).depenses)
   const courses = useBudget((state) => moisActif(state).courses)
   const previsionnels = useBudget((state) => moisActif(state).previsionnels)
   const enveloppes = useBudget((state) => moisActif(state).enveloppes)
   const ajouterDepense = useBudget((state) => state.ajouterDepense)
   const depenserImmediat = useBudget((state) => state.depenserImmediat)
   const moisAffiche = useBudget(moisActif)
   const estDernier = useBudget((state) => state.indexActif === state.moisListe.length - 1)
   const [creation, setCreation] = useState(false)

   // Le mois affiché est-il le vrai mois d'aujourd'hui ? (les échéances « en retard »
   // n'ont de sens que pour le mois en cours)
   const maintenant = new Date()
   const estMoisReel = estDernier && moisAffiche.mois === maintenant.getMonth() && moisAffiche.annee === maintenant.getFullYear()
   const surveil = facturesASurveiller(depenses, maintenant)

   const regulieres = depenses.filter((d) => d.type === "regulier")
   const ponctuelles = depenses.filter((d) => d.type === "occasionnel")
   const total = (liste: Depense[]) => liste.reduce((s, d) => s + d.montant, 0)
   const totalCourses = courses.reduce((s, c) => s + c.budget, 0)

   // « À venir » = charges non payées + réserve courses + prévisionnel non dépensé
   const aVenir =
      total(depenses.filter((d) => !d.estPayer))
      + reserveCourses(courses)
      + previsionnels.filter((p) => !p.estDepense).reduce((s, p) => s + p.montant, 0)

   return (
      <>
         <div className="screen-titre-row">
            <h2>Dépenses</h2>
            <span className="screen-resume neg">{format(aVenir)} à venir</span>
         </div>

         {estMoisReel && (surveil.enRetard.length > 0 || surveil.bientot.length > 0) && (
            <div className={"facture-alerte " + (surveil.enRetard.length > 0 ? "retard" : "bientot")}>
               <CalendarClock size={18} />
               <span>
                  {surveil.enRetard.length > 0
                     ? `${surveil.enRetard.length} facture${surveil.enRetard.length > 1 ? "s" : ""} en retard`
                     : `${surveil.bientot.length} facture${surveil.bientot.length > 1 ? "s" : ""} à payer bientôt`}
                  {surveil.enRetard.length > 0 && surveil.bientot.length > 0 && ` · ${surveil.bientot.length} bientôt`}
               </span>
            </div>
         )}

         <Section titre="Régulières" total={total(regulieres)} couleur="var(--rouge)">
            {regulieres.map((depense) => <DepenseCard key={depense.id} depense={depense} estMoisReel={estMoisReel} />)}
         </Section>

         <Section titre={"Courses · " + courses.length + " semaines"} total={totalCourses} couleur="var(--teal)">
            {courses.map((semaine, i) => <SemaineCard key={i} index={i} semaine={semaine} />)}
         </Section>

         <SectionPrevisionnel />

         {ponctuelles.length > 0 && (
            <Section titre="Ponctuelles" total={total(ponctuelles)} couleur="var(--rouge)">
               {ponctuelles.map((depense) => <DepenseCard key={depense.id} depense={depense} estMoisReel={estMoisReel} />)}
            </Section>
         )}

         <button className="btn-ajout" onClick={() => setCreation(true)}><Plus size={18} /> Nouvelle dépense</button>

         <Modal isOpen={creation} onClose={() => setCreation(false)}>
            <h2>Nouvelle dépense</h2>
            <p className="sous">Une sortie d'argent</p>
            <Form
               champs={champsDepense(enveloppes)}
               valeursInitiales={{ nom: "", type: "regulier", montant: "", source: "compte", jourEcheance: "" }}
               couleur="red"
               estValide={(v) =>
                  v.nom.trim() !== "" && enNombre(v.montant) > 0 &&
                  (v.type !== "occasionnel" || v.source === "compte" || enveloppes.some((e) => e.id === v.source))
               }
               onAnnuler={() => setCreation(false)}
               onValider={(v) => {
                  const montant = enNombre(v.montant)
                  const type = v.type as Frequence
                  if (type === "occasionnel") {
                     // Ponctuelle = déjà payée : depuis le compte ou une enveloppe.
                     depenserImmediat(v.nom.trim(), montant, type, v.source)
                  } else {
                     // Permanente = charge à venir à pointer plus tard, avec échéance éventuelle.
                     const jourEcheance = v.jourEcheance ? Number(v.jourEcheance) : undefined
                     ajouterDepense({ id: crypto.randomUUID(), nom: v.nom.trim(), montant, type, estPayer: false, jourEcheance })
                  }
                  setCreation(false)
               }}
            />
         </Modal>
      </>
   )
}
