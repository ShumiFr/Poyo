import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useBudget, moisActif } from '../store/useBudget'
import VoeuCard from '../cartes/VoeuCard'
import DefiCard from '../cartes/DefiCard'
import Form from '../components/Form'
import { Modal } from '../components/Modal'
import { champsVoeu } from '../lib/champs'
import { CATALOGUE } from '../lib/defis'
import calculerDisponible from '../lib/calculs'
import format, { enNombre } from '../lib/format'

export const Route = createFileRoute('/souhaits')({
   component: RouteComponent,
})

function RouteComponent() {
   const compte = useBudget((state) => moisActif(state).compte)
   const depenses = useBudget((state) => moisActif(state).depenses)
   const enveloppes = useBudget((state) => moisActif(state).enveloppes)
   const voeux = useBudget((state) => moisActif(state).voeux)
   const courses = useBudget((state) => moisActif(state).courses)
   const previsionnels = useBudget((state) => moisActif(state).previsionnels)
   const ajouterVoeu = useBudget((state) => state.ajouterVoeu)
   const defis = useBudget((state) => state.defis)
   const ajouterDefi = useBudget((state) => state.ajouterDefi)

   const [creation, setCreation] = useState(false)
   const [catalogue, setCatalogue] = useState(false)

   const totalDisponible = calculerDisponible(compte, depenses, enveloppes, voeux, courses, previsionnels)
   const totalMisDeCote = voeux.reduce((s, v) => s + v.montantActuel, 0)

   return (
      <>
         <div className="screen-titre-row">
            <h2>Vœux</h2>
         </div>
         <div className="voeux-pilules">
            <span className="pilule pilule-accent">{format(Math.max(0, totalDisponible))} libres</span>
            <span className="pilule pilule-violet">{format(totalMisDeCote)} mis de côté</span>
         </div>

         {voeux.map((voeu) => (
            <VoeuCard key={voeu.id} voeu={voeu} disponible={totalDisponible} />
         ))}

         <button className="btn-ajout" onClick={() => setCreation(true)}><Plus size={18} /> Nouveau vœu</button>

         <div className="screen-titre-row" style={{ marginTop: 24 }}>
            <h2>Défis d'épargne</h2>
         </div>
         <p className="sous" style={{ margin: "-8px 0 16px" }}>Un jeu pour épargner : coche les cases au fur et à mesure.</p>

         {defis.map((defi) => <DefiCard key={defi.id} defi={defi} />)}

         <button className="btn-ajout" onClick={() => setCatalogue(true)}><Plus size={18} /> Nouveau défi</button>

         <Modal isOpen={catalogue} onClose={() => setCatalogue(false)}>
            <h2>Choisis un défi</h2>
            <p className="sous">Coche une case chaque fois que tu mets la somme de côté.</p>
            <ul className="catalogue">
               {CATALOGUE.map((modele) => (
                  <li key={modele.cle}>
                     <button
                        className="catalogue-item"
                        onClick={() => { ajouterDefi(modele.nom, modele.cases); setCatalogue(false) }}
                     >
                        <span className="catalogue-nom">{modele.nom}</span>
                        <span className="catalogue-desc">{modele.description}</span>
                     </button>
                  </li>
               ))}
            </ul>
         </Modal>

         <Modal isOpen={creation} onClose={() => setCreation(false)}>
            <h2>Nouveau vœu</h2>
            <p className="sous">Un projet à financer petit à petit</p>
            <Form
               champs={champsVoeu}
               valeursInitiales={{ nom: "", objectif: "" }}
               couleur="purple"
               estValide={(v) => v.nom.trim() !== "" && enNombre(v.objectif) > 0}
               onAnnuler={() => setCreation(false)}
               onValider={(v) => {
                  ajouterVoeu({ id: crypto.randomUUID(), nom: v.nom.trim(), montantTotal: enNombre(v.objectif), montantActuel: 0, estTermine: false })
                  setCreation(false)
               }}
            />
         </Modal>
      </>
   )
}
