import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Plus } from 'lucide-react'
import DepenseCard from '../cartes/DepenseCard'
import SemaineCard from '../cartes/SemaineCard'
import PrevisionnelCard from '../cartes/PrevisionnelCard'
import Section from '../components/Section'
import Form from '../components/Form'
import { Modal } from '../components/Modal'
import { useBudget } from '../store/useBudget'
import { champsDepense } from '../lib/champs'
import { reserveCourses } from '../lib/courses'
import format, { enNombre } from '../lib/format'
import type { Depense, Frequence } from '../types'

export const Route = createFileRoute('/depenses')({
   component: RouteComponent,
})

function SectionPrevisionnel() {
   const previsionnels = useBudget((state) => state.previsionnels)
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
   const depenses = useBudget((state) => state.depenses)
   const courses = useBudget((state) => state.courses)
   const previsionnels = useBudget((state) => state.previsionnels)
   const enveloppes = useBudget((state) => state.enveloppes)
   const ajouterDepense = useBudget((state) => state.ajouterDepense)
   const depenserImmediat = useBudget((state) => state.depenserImmediat)
   const [creation, setCreation] = useState(false)

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

         <Section titre="Régulières" total={total(regulieres)} couleur="var(--rouge)">
            {regulieres.map((depense) => <DepenseCard key={depense.id} depense={depense} />)}
         </Section>

         <Section titre={"Courses · " + courses.length + " semaines"} total={totalCourses} couleur="var(--teal)">
            {courses.map((semaine, i) => <SemaineCard key={i} index={i} semaine={semaine} />)}
         </Section>

         <SectionPrevisionnel />

         {ponctuelles.length > 0 && (
            <Section titre="Ponctuelles" total={total(ponctuelles)} couleur="var(--rouge)">
               {ponctuelles.map((depense) => <DepenseCard key={depense.id} depense={depense} />)}
            </Section>
         )}

         <button className="btn-ajout" onClick={() => setCreation(true)}><Plus size={18} /> Nouvelle dépense</button>

         <Modal isOpen={creation} onClose={() => setCreation(false)}>
            <h2>Nouvelle dépense</h2>
            <p className="sous">Une sortie d'argent</p>
            <Form
               champs={champsDepense(enveloppes)}
               valeursInitiales={{ nom: "", type: "regulier", montant: "", source: "compte" }}
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
                     // Permanente = charge à venir à pointer plus tard.
                     ajouterDepense({ id: crypto.randomUUID(), nom: v.nom.trim(), montant, type, estPayer: false })
                  }
                  setCreation(false)
               }}
            />
         </Modal>
      </>
   )
}
