import { useState } from 'react'
import { useBudget } from '../store/useBudget'
import Champ from './Champ'
import ActionsForm from './ActionsForm'
import { enNombre } from '../lib/format'
import type { Voeu } from '../types'

export default function FormVoeu({ onFini }: { onFini?: () => void }) {
   const ajouterVoeu = useBudget((state) => state.ajouterVoeu)

   const [nom, setNom] = useState('')
   const [objectif, setObjectif] = useState('')

   const cible = enNombre(objectif)
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
         <Champ label="Nom" valeur={nom} placeholder="Ex. Nouveau vélo" onChange={setNom} />
         <Champ label="Objectif" valeur={objectif} placeholder="0" onChange={setObjectif} />

         <ActionsForm onAnnuler={() => onFini?.()} onValider={creer} couleur="purple" invalide={invalide} />
      </div>
   )
}
