import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useBudget } from '../store/useBudget'
import Form from '../components/Form'
import MontantEditable from '../components/MontantEditable'
import DetteCard from '../cartes/DetteCard'
import { Modal } from '../components/Modal'
import { champsNomMontant } from '../lib/champs'
import format, { enNombre } from '../lib/format'
import type { CompteEpargne } from '../types'

export const Route = createFileRoute('/comptes')({
   component: RouteComponent,
})

function RouteComponent() {
   const comptesEpargne = useBudget((s) => s.comptesEpargne)
   const ajouter = useBudget((s) => s.ajouterCompteEpargne)
   const modifier = useBudget((s) => s.modifierCompteEpargne)
   const retirer = useBudget((s) => s.retirerCompteEpargne)

   const dettes = useBudget((s) => s.dettes)
   const ajouterDette = useBudget((s) => s.ajouterDette)

   const [creation, setCreation] = useState(false)
   const [creationDette, setCreationDette] = useState(false)
   const [enEdition, setEnEdition] = useState<CompteEpargne | null>(null)

   const total = comptesEpargne.reduce((s, c) => s + c.montant, 0)
   const resteDette = dettes.reduce((s, d) => s + Math.max(0, d.montantTotal - d.montantRembourse), 0)

   return (
      <>
         <div className="screen-titre-row">
            <h2>Comptes</h2>
            <span className="screen-resume info">{format(total)} épargné</span>
         </div>
         <p className="sous" style={{ margin: "-8px 0 16px" }}>Tes comptes épargne — pour info, sans impact sur le budget.</p>

         {comptesEpargne.map((compte) => (
            <div key={compte.id} className="card">
               <div className="carte-tete">
                  <span className="libelle-col"><h3>{compte.nom}</h3></span>
                  <MontantEditable montant={compte.montant} couleur="navy" onClick={() => setEnEdition(compte)} />
                  <button className="carre" onClick={() => retirer(compte.id)} aria-label="Supprimer">
                     <Trash2 size={16} />
                  </button>
               </div>
            </div>
         ))}

         <button className="btn-ajout" onClick={() => setCreation(true)}><Plus size={18} /> Nouveau compte</button>

         <div className="screen-titre-row" style={{ marginTop: 24 }}>
            <h2>Dettes</h2>
            {dettes.length > 0 && <span className="screen-resume neg">{format(resteDette)} à rembourser</span>}
         </div>
         <p className="sous" style={{ margin: "-8px 0 16px" }}>Suis le remboursement de tes crédits — pour info, sans impact sur le budget.</p>

         {dettes.map((dette) => <DetteCard key={dette.id} dette={dette} />)}

         <button className="btn-ajout" onClick={() => setCreationDette(true)}><Plus size={18} /> Nouvelle dette</button>

         <Modal isOpen={creationDette} onClose={() => setCreationDette(false)}>
            <h2>Nouvelle dette</h2>
            <p className="sous">Un crédit à rembourser (prêt, découvert…)</p>
            <Form
               champs={champsNomMontant}
               valeursInitiales={{ nom: "", montant: "" }}
               couleur="navy"
               estValide={(v) => v.nom.trim() !== "" && enNombre(v.montant) > 0}
               onAnnuler={() => setCreationDette(false)}
               onValider={(v) => { ajouterDette(v.nom.trim(), enNombre(v.montant)); setCreationDette(false) }}
            />
         </Modal>

         <Modal isOpen={creation} onClose={() => setCreation(false)}>
            <h2>Nouveau compte</h2>
            <p className="sous">Un compte épargne (livret, PEL…)</p>
            <Form
               champs={champsNomMontant}
               valeursInitiales={{ nom: "", montant: "" }}
               couleur="navy"
               estValide={(v) => v.nom.trim() !== "" && enNombre(v.montant) >= 0}
               onAnnuler={() => setCreation(false)}
               onValider={(v) => { ajouter(v.nom.trim(), enNombre(v.montant)); setCreation(false) }}
            />
         </Modal>

         <Modal isOpen={enEdition !== null} onClose={() => setEnEdition(null)}>
            {enEdition && (
               <>
                  <h2>Modifier · {enEdition.nom}</h2>
                  <p className="sous">Nom et montant du compte</p>
                  <Form
                     champs={champsNomMontant}
                     valeursInitiales={{ nom: enEdition.nom, montant: String(enEdition.montant) }}
                     couleur="navy"
                     libelle="Enregistrer"
                     estValide={(v) => v.nom.trim() !== "" && enNombre(v.montant) >= 0}
                     onAnnuler={() => setEnEdition(null)}
                     onValider={(v) => { modifier(enEdition.id, v.nom.trim(), enNombre(v.montant)); setEnEdition(null) }}
                  />
               </>
            )}
         </Modal>
      </>
   )
}
