import { useState, type CSSProperties } from 'react'
import Champ from './Champ'
import ChoixType from './ChoixType'
import ActionsForm from './ActionsForm'
import SourceDepense from './SourceDepense'
import { COULEURS, CLES_ICONES, ICONES } from '../lib/styleEnveloppe'
import type { Enveloppe, Frequence } from '../types'

// Description d'un champ. C'est la config qui change d'un formulaire à l'autre.
export type ChampConfig =
   | { type: 'texte' | 'montant'; cle: string; label: string; placeholder?: string }
   | { type: 'type'; cle: string; rouge?: boolean }
   | { type: 'select'; cle: string; label: string; options: { valeur: string; libelle: string }[] }
   | { type: 'source'; cle: string; enveloppes: Enveloppe[] }
   | { type: 'couleur'; cle: string }
   | { type: 'icone'; cle: string }

export type Valeurs = Record<string, string>

export default function Form({
   champs,
   valeursInitiales,
   couleur = 'green',
   libelle = 'Créer',
   estValide,
   onValider,
   onAnnuler,
}: {
   champs: ChampConfig[]
   valeursInitiales: Valeurs
   couleur?: string
   libelle?: string
   estValide: (valeurs: Valeurs) => boolean
   onValider: (valeurs: Valeurs) => void
   onAnnuler: () => void
}) {
   const [valeurs, setValeurs] = useState<Valeurs>(valeursInitiales)
   const set = (cle: string, valeur: string) => setValeurs((prev) => ({ ...prev, [cle]: valeur }))

   // Si le formulaire a un champ couleur, le bouton "valider" prend cette couleur.
   const couleurActive = valeurs['couleur'] ?? couleur

   return (
      <div style={{ ['--focus-couleur']: `var(--cat-${couleurActive})` } as CSSProperties}>
         {champs.map((champ) => {
            if (champ.type === 'texte' || champ.type === 'montant') {
               return (
                  <Champ
                     key={champ.cle}
                     label={champ.label}
                     valeur={valeurs[champ.cle] ?? ''}
                     placeholder={champ.placeholder}
                     onChange={(v) => set(champ.cle, v)}
                  />
               )
            }

            if (champ.type === 'type') {
               return (
                  <ChoixType
                     key={champ.cle}
                     type={valeurs[champ.cle] as Frequence}
                     onChange={(t) => set(champ.cle, t)}
                     rouge={champ.rouge}
                  />
               )
            }

            if (champ.type === 'select') {
               return (
                  <div key={champ.cle} className="champ">
                     <label>{champ.label}</label>
                     <select value={valeurs[champ.cle]} onChange={(e) => set(champ.cle, e.target.value)}>
                        {champ.options.map((o) => <option key={o.valeur} value={o.valeur}>{o.libelle}</option>)}
                     </select>
                  </div>
               )
            }

            if (champ.type === 'source') {
               // Seules les dépenses ponctuelles (déjà payées) ont une source.
               if (valeurs['type'] !== 'occasionnel') return null
               return (
                  <SourceDepense
                     key={champ.cle}
                     valeur={valeurs[champ.cle] ?? ''}
                     enveloppes={champ.enveloppes}
                     onChange={(v) => set(champ.cle, v)}
                  />
               )
            }

            if (champ.type === 'couleur') {
               return (
                  <div key={champ.cle} className="champ">
                     <label>Couleur</label>
                     <div className="palette">
                        {COULEURS.map((c) => (
                           <button
                              key={c}
                              type="button"
                              className={"pastille-choix bg-" + c + (c === valeurs[champ.cle] ? " actif" : "")}
                              onClick={() => set(champ.cle, c)}
                              aria-label={c}
                           />
                        ))}
                     </div>
                  </div>
               )
            }

            if (champ.type === 'icone') {
               return (
                  <div key={champ.cle} className="champ">
                     <label>Icône</label>
                     <div className="grille-icones">
                        {CLES_ICONES.map((cle) => {
                           const Icone = ICONES[cle]
                           return (
                              <button
                                 key={cle}
                                 type="button"
                                 className={"icone-choix" + (cle === valeurs[champ.cle] ? " actif text-" + couleurActive : "")}
                                 onClick={() => set(champ.cle, cle)}
                              >
                                 <Icone size={20} />
                              </button>
                           )
                        })}
                     </div>
                  </div>
               )
            }

            return null
         })}

         <ActionsForm
            onAnnuler={onAnnuler}
            onValider={() => onValider(valeurs)}
            couleur={couleurActive}
            libelle={libelle}
            invalide={!estValide(valeurs)}
         />
      </div>
   )
}
