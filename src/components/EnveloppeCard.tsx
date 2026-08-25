import { useState } from 'react'
import { Clock, Pencil } from 'lucide-react'
import { useBudget } from '../store/useBudget'
import { Modal } from './Modal'
import PaveNumerique from './PaveNumerique'
import FormEnveloppe from './FormEnveloppe'
import format from '../lib/format'
import { ICONES } from '../lib/styleEnveloppe'
import type { Enveloppe, TypeAction } from '../types'

const tags: Partial<Record<TypeAction, string>> = {
   enveloppeEntrant: "Mis de côté",
   enveloppeSortant: "Repris",
   depense: "Dépensé",
}

export default function EnveloppeCard({ enveloppe, disponible }: { enveloppe: Enveloppe, disponible: number }) {
   const ajouterArgent = useBudget((state) => state.ajouterArgentEnveloppe)
   const retirerArgent = useBudget((state) => state.retirerArgentEnveloppe)
   const depenser = useBudget((state) => state.depenserDepuisEnveloppe)
   const historique = useBudget((state) => state.historique)

   const [ouvert, setOuvert] = useState(false)
   const [ouvertRetrait, setOuvertRetrait] = useState(false)
   const [ouvertDepense, setOuvertDepense] = useState(false)
   const [ouvertHisto, setOuvertHisto] = useState(false)
   const [ouvertEdit, setOuvertEdit] = useState(false)
   const [montantEnAttente, setMontantEnAttente] = useState<number | null>(null)

   const mouvements = historique.filter((f) => f.refId === enveloppe.id)

   function handleValider(montant: number) {
      setOuvert(false)
      if (montant <= disponible) ajouterArgent(enveloppe.id, montant)
      else setMontantEnAttente(montant)
   }

   function confirmerDepassement() {
      if (montantEnAttente !== null) ajouterArgent(enveloppe.id, montantEnAttente)
      setMontantEnAttente(null)
   }

   function handleRetrait(montant: number) {
      retirerArgent(enveloppe.id, montant)
      setOuvertRetrait(false)
   }

   function handleDepense(montant: number) {
      depenser(enveloppe.id, montant)
      setOuvertDepense(false)
   }

   const Icone = ICONES[enveloppe.icone] ?? ICONES["shopping-cart"]

   return (
      <div className="card">
         <div className="carte-tete">
            <span className={"icone-box text-" + enveloppe.couleur}><Icone size={20} /></span>
            <h3 style={{ flex: 1 }}>{enveloppe.nom}</h3>
            <span className={"montant text-" + enveloppe.couleur}>{format(enveloppe.montant)}</span>
            <button className="carre-mini" onClick={() => setOuvertHisto(true)} aria-label="Historique"><Clock size={15} /></button>
            <button className="carre-mini" onClick={() => setOuvertEdit(true)} aria-label="Modifier"><Pencil size={15} /></button>
         </div>

         <div className="carte-actions">
            <button className="btn" onClick={() => setOuvertRetrait(true)}>Retirer</button>
            <button className="btn btn-red" onClick={() => setOuvertDepense(true)}>Dépenser</button>
            <button className={"btn bg-" + enveloppe.couleur} onClick={() => setOuvert(true)}>Ajouter</button>
         </div>

         <Modal isOpen={ouvert} onClose={() => setOuvert(false)}>
            <PaveNumerique
               titre={"Ajouter · " + enveloppe.nom}
               sousTitre={"Disponible : " + format(disponible)}
               couleur={enveloppe.couleur}
               libelleValider="Ajouter"
               onAnnuler={() => setOuvert(false)}
               onValider={handleValider}
            />
         </Modal>

         <Modal isOpen={ouvertRetrait} onClose={() => setOuvertRetrait(false)}>
            <PaveNumerique
               titre={"Retirer · " + enveloppe.nom}
               sousTitre={"Dans l'enveloppe : " + format(enveloppe.montant)}
               couleur={enveloppe.couleur}
               libelleValider="Retirer"
               onAnnuler={() => setOuvertRetrait(false)}
               onValider={handleRetrait}
            />
         </Modal>

         <Modal isOpen={ouvertDepense} onClose={() => setOuvertDepense(false)}>
            <PaveNumerique
               titre={"Dépenser · " + enveloppe.nom}
               sousTitre={"Dans l'enveloppe : " + format(enveloppe.montant)}
               couleur="red"
               libelleValider="Dépenser"
               onAnnuler={() => setOuvertDepense(false)}
               onValider={handleDepense}
            />
         </Modal>

         <Modal isOpen={ouvertHisto} onClose={() => setOuvertHisto(false)}>
            <h2>Historique · {enveloppe.nom}</h2>
            <p className="sous">Mouvements de cette enveloppe</p>
            {mouvements.length === 0 && <p className="sous">Aucun mouvement pour l'instant.</p>}
            {mouvements.map((f) => (
               <div key={f.id} className="recap-ligne">
                  <span>{tags[f.type] ?? "Mouvement"}<div className="sous">{new Date(f.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</div></span>
                  <span className={f.type === "depense" || f.type === "enveloppeSortant" ? "text-red" : "text-green"}>{format(f.montant)}</span>
               </div>
            ))}
         </Modal>

         <Modal isOpen={ouvertEdit} onClose={() => setOuvertEdit(false)}>
            <h2>Modifier · {enveloppe.nom}</h2>
            <p className="sous">Change le nom, la couleur ou l'icône</p>
            <FormEnveloppe disponible={disponible} enveloppe={enveloppe} onFini={() => setOuvertEdit(false)} />
         </Modal>

         <Modal isOpen={montantEnAttente !== null} onClose={() => setMontantEnAttente(null)}>
            <h2>Dépassement du disponible</h2>
            <p className="sous">Vérifie avant de placer</p>
            <ul className="legende">
               <li><span className="libelle">Disponible sur le compte</span><span className="valeur">{format(disponible)}</span></li>
               <li><span className="libelle">Montant à placer</span><span className="valeur text-red">{format(montantEnAttente ?? 0)}</span></li>
            </ul>
            <div className="pave-actions">
               <button className="btn" onClick={() => setMontantEnAttente(null)}>Annuler</button>
               <button className="btn btn-primary" onClick={confirmerDepassement}>Valider</button>
            </div>
         </Modal>
      </div>
   )
}
