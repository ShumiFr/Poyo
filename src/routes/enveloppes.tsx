import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useBudget } from '../store/useBudget'
import EnveloppeCard from '../cartes/EnveloppeCard'
import Form from '../components/Form'
import { Modal } from '../components/Modal'
import { champsEnveloppe } from '../lib/champs'
import { COULEURS, CLES_ICONES } from '../lib/styleEnveloppe'
import calculerDisponible from '../lib/calculs'
import format, { enNombre } from '../lib/format'

export const Route = createFileRoute('/enveloppes')({
   component: RouteComponent,
})

function RouteComponent() {
   const compte = useBudget((state) => state.compte)
   const depenses = useBudget((state) => state.depenses)
   const voeux = useBudget((state) => state.voeux)
   const enveloppes = useBudget((state) => state.enveloppes)
   const courses = useBudget((state) => state.courses)
   const previsionnels = useBudget((state) => state.previsionnels)
   const ajouterEnveloppe = useBudget((state) => state.ajouterEnveloppe)

   const [creation, setCreation] = useState(false)

   const totalDisponible = calculerDisponible(compte, depenses, enveloppes, voeux, courses, previsionnels)

   return (
      <>
         <div className="screen-titre-row">
            <h2>Enveloppes</h2>
            <span className="screen-resume info">{format(Math.max(0, totalDisponible))} libre</span>
         </div>

         {enveloppes.map((enveloppe) => (
            <EnveloppeCard key={enveloppe.id} enveloppe={enveloppe} disponible={totalDisponible} />
         ))}

         <button className="btn-ajout" onClick={() => setCreation(true)}><Plus size={18} /> Nouvelle enveloppe</button>

         <Modal isOpen={creation} onClose={() => setCreation(false)}>
            <h2>Nouvelle enveloppe</h2>
            <p className="sous">Choisis son style</p>
            <Form
               champs={champsEnveloppe(false)}
               valeursInitiales={{ nom: "", couleur: COULEURS[0], icone: CLES_ICONES[0], montant: "" }}
               couleur={COULEURS[0]}
               estValide={(v) => v.nom.trim() !== ""}
               onAnnuler={() => setCreation(false)}
               onValider={(v) => {
                  // Montant de départ optionnel, plafonné au disponible.
                  const depart = Math.min(Math.max(0, enNombre(v.montant) || 0), Math.max(0, totalDisponible))
                  ajouterEnveloppe({ id: crypto.randomUUID(), nom: v.nom.trim(), montant: depart, couleur: v.couleur, icone: v.icone })
                  setCreation(false)
               }}
            />
         </Modal>
      </>
   )
}
