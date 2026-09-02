import { useState } from 'react'
import { Modal } from './Modal'
import format from '../lib/format'
import type { Enveloppe } from '../types'

// Choix de la source d'une dépense ponctuelle : le compte, ou une enveloppe
// (choisie dans une petite modale). La valeur vaut "compte" ou l'id d'une enveloppe.
export default function SourceDepense({
   valeur,
   enveloppes,
   onChange,
}: {
   valeur: string
   enveloppes: Enveloppe[]
   onChange: (v: string) => void
}) {
   const [ouvert, setOuvert] = useState(false)
   const enveloppeChoisie = enveloppes.find((e) => e.id === valeur)

   return (
      <div className="champ">
         <label>Payer depuis</label>
         <div className="type-toggle rouge">
            <button
               type="button"
               className={valeur === "compte" ? "actif" : ""}
               onClick={() => onChange("compte")}
            >
               Le compte
            </button>
            <button
               type="button"
               className={enveloppeChoisie ? "actif" : ""}
               onClick={() => setOuvert(true)}
            >
               {enveloppeChoisie ? enveloppeChoisie.nom : "Une enveloppe"}
            </button>
         </div>

         <Modal isOpen={ouvert} onClose={() => setOuvert(false)}>
            <h2>Choisir une enveloppe</h2>
            {enveloppes.length === 0 ? (
               <p className="sous">Aucune enveloppe pour l'instant.</p>
            ) : (
               <ul className="liste-enveloppes">
                  {enveloppes.map((e) => (
                     <li key={e.id}>
                        <button type="button" onClick={() => { onChange(e.id); setOuvert(false) }}>
                           <span>{e.nom}</span>
                           <span className="montant">{format(e.montant)}</span>
                        </button>
                     </li>
                  ))}
               </ul>
            )}
         </Modal>
      </div>
   )
}
