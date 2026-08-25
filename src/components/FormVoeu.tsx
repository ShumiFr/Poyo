import { useState } from 'react'
import { useBudget } from '../store/useBudget'
import type { Voeu } from '../types'

export default function FormVoeu({ onFini }: { onFini?: () => void }) {
   const ajouterVoeu = useBudget((state) => state.ajouterVoeu)

   const [nom, setNom] = useState('')
   const [objectif, setObjectif] = useState('')

   const cible = Number(objectif.replace(',', '.'))
   const invalide = nom.trim() === '' || cible <= 0

   function creer() {
      const voeu: Voeu = {
         id: crypto.randomUUID(),
         nom: nom.trim(),
         montantTotal: cible,
         montantActuel: 0,
         estTermine: false,
      }
      ajouterVoeu(voeu)
      onFini?.()
   }

   return (
      <div>
         <div className="champ">
            <label>Nom</label>
            <input value={nom} placeholder="Ex. Nouveau vélo" onChange={(e) => setNom(e.target.value)} />
         </div>

         <div className="champ">
            <label>Objectif</label>
            <input value={objectif} placeholder="0" onChange={(e) => setObjectif(e.target.value)} />
         </div>

         <div className="form-actions">
            <button className="btn" type="button" onClick={() => onFini?.()}>Annuler</button>
            <button className="btn bg-purple" type="button" disabled={invalide} onClick={creer}>Créer</button>
         </div>
      </div>
   )
}
