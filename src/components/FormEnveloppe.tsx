import { useState } from 'react'
import { useBudget } from '../store/useBudget'
import { COULEURS, CLES_ICONES, ICONES } from '../lib/styleEnveloppe'
import type { Enveloppe } from '../types'

export default function FormEnveloppe({ disponible, onFini }: { disponible: number, onFini?: () => void }) {
   const ajouterEnveloppe = useBudget((state) => state.ajouterEnveloppe)

   const [nom, setNom] = useState('')
   const [couleur, setCouleur] = useState(COULEURS[0])
   const [icone, setIcone] = useState(CLES_ICONES[0])
   const [montant, setMontant] = useState('')

   const invalide = nom.trim() === ''

   function creer() {
      // Montant de départ optionnel, plafonné au disponible.
      const depart = Math.min(Math.max(0, Number(montant.replace(',', '.')) || 0), Math.max(0, disponible))
      const enveloppe: Enveloppe = {
         id: crypto.randomUUID(),
         nom: nom.trim(),
         montant: depart,
         couleur,
         icone,
      }
      ajouterEnveloppe(enveloppe)
      onFini?.()
   }

   return (
      <div>
         <div className="champ">
            <label>Nom</label>
            <input value={nom} placeholder="Ex. Vacances" onChange={(e) => setNom(e.target.value)} />
         </div>

         <div className="champ">
            <label>Couleur</label>
            <div className="palette">
               {COULEURS.map((c) => (
                  <button
                     key={c}
                     type="button"
                     className={"pastille-choix bg-" + c + (c === couleur ? " actif" : "")}
                     onClick={() => setCouleur(c)}
                     aria-label={c}
                  />
               ))}
            </div>
         </div>

         <div className="champ">
            <label>Icône</label>
            <div className="grille-icones">
               {CLES_ICONES.map((cle) => {
                  const Icone = ICONES[cle]
                  return (
                     <button
                        key={cle}
                        type="button"
                        className={"icone-choix" + (cle === icone ? " actif text-" + couleur : "")}
                        onClick={() => setIcone(cle)}
                     >
                        <Icone size={20} />
                     </button>
                  )
               })}
            </div>
         </div>

         <div className="champ">
            <label>Montant de départ (optionnel)</label>
            <input value={montant} placeholder="0" onChange={(e) => setMontant(e.target.value)} />
         </div>

         <div className="form-actions">
            <button className="btn" type="button" onClick={() => onFini?.()}>Annuler</button>
            <button className={"btn bg-" + couleur} type="button" disabled={invalide} onClick={creer}>Créer</button>
         </div>
      </div>
   )
}
