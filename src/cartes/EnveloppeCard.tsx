import { useState } from 'react'
import { useBudget } from '../store/useBudget'
import { Modal } from '../components/Modal'
import ModalePave from '../components/ModalePave'
import ConfirmationDepassement from '../components/ConfirmationDepassement'
import Form from '../components/Form'
import { champsEnveloppe } from '../lib/champs'
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
   const modifierEnveloppe = useBudget((state) => state.modifierEnveloppe)
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
   const dernier = mouvements[0]
   const sousTitre = dernier
      ? "Dernier mouvement " + new Date(dernier.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
      : "Aucun mouvement"

   return (
      <div className="card">
         <button className="carte-tete carte-tete-btn" onClick={() => setOuvertHisto(true)}>
            <span className={"icone-box text-" + enveloppe.couleur}><Icone size={20} /></span>
            <span className="libelle-col">
               <h3>{enveloppe.nom}</h3>
               <div className="sous">{sousTitre}</div>
            </span>
            <span className={"montant text-" + enveloppe.couleur}>{format(enveloppe.montant)}</span>
         </button>

         <div className="carte-actions">
            <button className="btn" onClick={() => setOuvertRetrait(true)}>Retirer</button>
            <button className={"btn btn-tinte text-" + enveloppe.couleur} onClick={() => setOuvertDepense(true)}>Dépenser</button>
            <button className={"btn bg-" + enveloppe.couleur} onClick={() => setOuvert(true)}>Ajouter</button>
         </div>

         <ModalePave
            ouvert={ouvert}
            onFermer={() => setOuvert(false)}
            titre={"Ajouter · " + enveloppe.nom}
            sousTitre={"Disponible : " + format(disponible)}
            couleur={enveloppe.couleur}
            libelleValider="Ajouter"
            onValider={handleValider}
         />

         <ModalePave
            ouvert={ouvertRetrait}
            onFermer={() => setOuvertRetrait(false)}
            titre={"Retirer · " + enveloppe.nom}
            sousTitre={"Dans l'enveloppe : " + format(enveloppe.montant)}
            couleur={enveloppe.couleur}
            libelleValider="Retirer"
            onValider={handleRetrait}
         />

         <ModalePave
            ouvert={ouvertDepense}
            onFermer={() => setOuvertDepense(false)}
            titre={"Dépenser · " + enveloppe.nom}
            sousTitre={"Dans l'enveloppe : " + format(enveloppe.montant)}
            couleur="red"
            libelleValider="Dépenser"
            onValider={handleDepense}
         />

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
            <button className="btn btn-full" style={{ marginTop: 16 }} onClick={() => { setOuvertHisto(false); setOuvertEdit(true) }}>Modifier l'enveloppe</button>
         </Modal>

         <Modal isOpen={ouvertEdit} onClose={() => setOuvertEdit(false)}>
            <h2>Modifier · {enveloppe.nom}</h2>
            <p className="sous">Change le nom, la couleur ou l'icône</p>
            <Form
               champs={champsEnveloppe(true)}
               valeursInitiales={{ nom: enveloppe.nom, couleur: enveloppe.couleur, icone: enveloppe.icone }}
               couleur={enveloppe.couleur}
               libelle="Enregistrer"
               estValide={(v) => v.nom.trim() !== ""}
               onAnnuler={() => setOuvertEdit(false)}
               onValider={(v) => { modifierEnveloppe(enveloppe.id, v.nom.trim(), v.couleur, v.icone); setOuvertEdit(false) }}
            />
         </Modal>

         <ConfirmationDepassement
            montant={montantEnAttente}
            disponible={disponible}
            couleur={enveloppe.couleur}
            onAnnuler={() => setMontantEnAttente(null)}
            onValider={confirmerDepassement}
         />
      </div>
   )
}
