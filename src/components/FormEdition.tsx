import { useState } from 'react'
import Champ from './Champ'
import ActionsForm from './ActionsForm'
import { enNombre } from '../lib/format'

export default function FormEdition({
   nomInitial,
   montantInitial,
   onEnregistrer,
   onAnnuler,
   couleur = "green",
}: {
   nomInitial: string
   montantInitial: number
   onEnregistrer: (nom: string, montant: number) => void
   onAnnuler?: () => void
   couleur?: string
}) {
   const [nom, setNom] = useState(nomInitial)
   const [montant, setMontant] = useState(String(montantInitial))

   const valeur = enNombre(montant)
   const invalide = nom.trim() === '' || valeur <= 0

   return (
      <div>
         <Champ label="Nom" valeur={nom} onChange={setNom} />
         <Champ label="Montant" valeur={montant} onChange={setMontant} />

         <ActionsForm
            onAnnuler={() => onAnnuler?.()}
            onValider={() => onEnregistrer(nom.trim(), valeur)}
            couleur={couleur}
            libelle="Enregistrer"
            invalide={invalide}
         />
      </div>
   )
}
