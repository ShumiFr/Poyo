import { useState } from 'react'

export default function FormEdition({
   nomInitial,
   montantInitial,
   onEnregistrer,
}: {
   nomInitial: string
   montantInitial: number
   onEnregistrer: (nom: string, montant: number) => void
}) {
   const [nom, setNom] = useState(nomInitial)
   const [montant, setMontant] = useState(String(montantInitial))

   const valeur = Number(montant.replace(',', '.'))
   const invalide = nom.trim() === '' || valeur <= 0

   return (
      <div>
         <label>Nom</label>
         <input value={nom} onChange={(e) => setNom(e.target.value)} />

         <label>Montant</label>
         <input value={montant} onChange={(e) => setMontant(e.target.value)} />

         <button disabled={invalide} onClick={() => onEnregistrer(nom.trim(), valeur)}>
            Enregistrer
         </button>
      </div>
   )
}
