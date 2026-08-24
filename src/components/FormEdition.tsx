import { useState } from 'react'

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

   const valeur = Number(montant.replace(',', '.'))
   const invalide = nom.trim() === '' || valeur <= 0

   return (
      <div>
         <div className="champ">
            <label>Nom</label>
            <input value={nom} onChange={(e) => setNom(e.target.value)} />
         </div>

         <div className="champ">
            <label>Montant</label>
            <input value={montant} onChange={(e) => setMontant(e.target.value)} />
         </div>

         <div className="form-actions">
            {onAnnuler && <button className="btn" onClick={onAnnuler}>Annuler</button>}
            <button className={"btn bg-" + couleur} disabled={invalide} onClick={() => onEnregistrer(nom.trim(), valeur)}>
               Enregistrer
            </button>
         </div>
      </div>
   )
}
