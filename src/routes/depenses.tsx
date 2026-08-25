import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Plus } from 'lucide-react'
import DepenseCard from '../components/DepenseCard'
import SemaineCard from '../components/SemaineCard'
import PrevisionnelCard from '../components/PrevisionnelCard'
import FormDepense from '../components/FormDepense'
import FormEdition from '../components/FormEdition'
import { Modal } from '../components/Modal'
import { useBudget } from '../store/useBudget'
import format from '../lib/format'
import { reserveCourses } from '../lib/courses'
import type { Depense } from '../types'

export const Route = createFileRoute('/depenses')({
   component: RouteComponent,
})

function Section({ titre, liste }: { titre: string, liste: Depense[] }) {
   const [ouvert, setOuvert] = useState(true)
   const total = liste.reduce((somme, d) => somme + d.montant, 0)

   return (
      <div>
         <button className="section-header" onClick={() => setOuvert(!ouvert)}>
            <span>{titre}</span>
            <span className="total">{format(total)} {ouvert ? '▾' : '▸'}</span>
         </button>
         {ouvert && liste.map((depense) => (
            <DepenseCard key={depense.id} depense={depense} />
         ))}
      </div>
   )
}

function SectionCourses() {
   const courses = useBudget((state) => state.courses)
   const [ouvert, setOuvert] = useState(true)
   const total = courses.reduce((somme, s) => somme + s.budget, 0)

   return (
      <div>
         <button className="section-header" onClick={() => setOuvert(!ouvert)}>
            <span>Courses · {courses.length} semaines</span>
            <span className="total">{format(total)} {ouvert ? '▾' : '▸'}</span>
         </button>
         {ouvert && courses.map((semaine, i) => (
            <SemaineCard key={i} index={i} semaine={semaine} />
         ))}
      </div>
   )
}

function SectionPrevisionnel() {
   const previsionnels = useBudget((state) => state.previsionnels)
   const ajouterPrevisionnel = useBudget((state) => state.ajouterPrevisionnel)
   const [ouvert, setOuvert] = useState(true)
   const [creation, setCreation] = useState(false)
   const total = previsionnels.reduce((somme, p) => somme + p.montant, 0)

   return (
      <div>
         <button className="section-header" onClick={() => setOuvert(!ouvert)}>
            <span>Prévisionnel · ajustable</span>
            <span className="total">{format(total)} {ouvert ? '▾' : '▸'}</span>
         </button>
         {ouvert && (
            <>
               {previsionnels.map((p) => <PrevisionnelCard key={p.id} prev={p} />)}
               <button className="btn-ajout" onClick={() => setCreation(true)}><Plus size={18} /> Nouveau prévisionnel</button>
            </>
         )}

         <Modal isOpen={creation} onClose={() => setCreation(false)}>
            <h2>Nouveau prévisionnel</h2>
            <p className="sous">Un budget mensuel ajustable</p>
            <FormEdition
               nomInitial=""
               montantInitial={0}
               couleur="navy"
               onAnnuler={() => setCreation(false)}
               onEnregistrer={(nom, montant) => { ajouterPrevisionnel(nom, montant); setCreation(false) }}
            />
         </Modal>
      </div>
   )
}

function RouteComponent() {
   const depenses = useBudget((state) => state.depenses)
   const courses = useBudget((state) => state.courses)
   const previsionnels = useBudget((state) => state.previsionnels)
   const [creation, setCreation] = useState(false)

   const regulieres = depenses.filter((d) => d.type === "regulier")
   const ponctuelles = depenses.filter((d) => d.type === "occasionnel")
   // « À venir » = charges non payées + réserve courses + prévisionnel non dépensé
   const aVenir =
      depenses.filter((d) => !d.estPayer).reduce((somme, d) => somme + d.montant, 0)
      + reserveCourses(courses)
      + previsionnels.filter((p) => !p.estDepense).reduce((somme, p) => somme + p.montant, 0)

   return (
      <>
         <div className="screen-titre-row">
            <h2>Dépenses</h2>
            <span className="screen-resume neg">{format(aVenir)} à venir</span>
         </div>

         <Section titre="Régulières" liste={regulieres} />
         <SectionCourses />
         <SectionPrevisionnel />
         {ponctuelles.length > 0 && <Section titre="Ponctuelles" liste={ponctuelles} />}

         <button className="btn-ajout" onClick={() => setCreation(true)}><Plus size={18} /> Nouvelle dépense</button>

         <Modal isOpen={creation} onClose={() => setCreation(false)}>
            <h2>Nouvelle dépense</h2>
            <p className="sous">Une sortie d'argent</p>
            <FormDepense onFini={() => setCreation(false)} />
         </Modal>
      </>
   )
}
