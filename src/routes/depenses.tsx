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
import { champsDepense, champsNomMontant } from '../lib/champs'
import { reserveCourses } from '../lib/courses'
import format, { enNombre } from '../lib/format'
import type { Depense, Frequence } from '../types'

export const Route = createFileRoute('/depenses')({
   component: RouteComponent,
})

function SectionPrevisionnel() {
   const previsionnels = useBudget((state) => state.previsionnels)
   const ajouterPrevisionnel = useBudget((state) => state.ajouterPrevisionnel)
   const [creation, setCreation] = useState(false)
   const total = previsionnels.reduce((somme, p) => somme + p.montant, 0)

   return (
      <Section titre="Prévisionnel · ajustable" total={total}>
         {previsionnels.map((p) => <PrevisionnelCard key={p.id} prev={p} />)}
         <button className="btn-ajout" onClick={() => setCreation(true)}><Plus size={18} /> Nouveau prévisionnel</button>

         <Modal isOpen={creation} onClose={() => setCreation(false)}>
            <h2>Nouveau prévisionnel</h2>
            <p className="sous">Un budget mensuel ajustable</p>
            <Form
               champs={champsNomMontant}
               valeursInitiales={{ nom: "", montant: "" }}
               couleur="navy"
               estValide={(v) => v.nom.trim() !== "" && enNombre(v.montant) > 0}
               onAnnuler={() => setCreation(false)}
               onValider={(v) => { ajouterPrevisionnel(v.nom.trim(), enNombre(v.montant)); setCreation(false) }}
            />
         </Modal>
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

         <Section titre="Régulières" total={total(regulieres)}>
            {regulieres.map((depense) => <DepenseCard key={depense.id} depense={depense} />)}
         </Section>

         <Section titre={"Courses · " + courses.length + " semaines"} total={totalCourses}>
            {courses.map((semaine, i) => <SemaineCard key={i} index={i} semaine={semaine} />)}
         </Section>

         <SectionPrevisionnel />

         {ponctuelles.length > 0 && (
            <Section titre="Ponctuelles" total={total(ponctuelles)}>
               {ponctuelles.map((depense) => <DepenseCard key={depense.id} depense={depense} />)}
            </Section>
         )}

         <button className="btn-ajout" onClick={() => setCreation(true)}><Plus size={18} /> Nouvelle dépense</button>

         <Modal isOpen={creation} onClose={() => setCreation(false)}>
            <h2>Nouvelle dépense</h2>
            <p className="sous">Une sortie d'argent</p>
            <Form
               champs={champsDepense(enveloppes)}
               valeursInitiales={{ nom: "", type: "regulier", montant: "", source: "plus-tard" }}
               couleur="red"
               estValide={(v) => v.nom.trim() !== "" && enNombre(v.montant) > 0}
               onAnnuler={() => setCreation(false)}
               onValider={(v) => {
                  const montant = enNombre(v.montant)
                  if (v.source === "plus-tard") {
                     ajouterDepense({ id: crypto.randomUUID(), nom: v.nom.trim(), montant, type: v.type as Frequence, estPayer: false })
                  } else {
                     depenserImmediat(v.nom.trim(), montant, v.type as Frequence, v.source)
                  }
                  setCreation(false)
               }}
            />
         </Modal>
      </>
   )
}
