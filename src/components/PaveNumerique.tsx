import { useState } from "react";
import { Delete } from "lucide-react";
import { enNombre } from "../lib/format";

export default function PaveNumerique({
   titre,
   sousTitre,
   onValider,
   onAnnuler,
   libelleValider = "Valider",
   couleur = "green",
}: {
   titre: string
   sousTitre: string
   onValider: (montant: number) => void
   onAnnuler?: () => void
   libelleValider?: string
   couleur?: string
}) {
   const [value, setValue] = useState("")

   const montant = enNombre(value)
   const invalide = montant <= 0

   const numbers = ["1", "2", "3", "4", "5", "6", "7", "8", "9"]

   const handlePress = (digit: string) => {
      const decimales = value.split(",")[1]
      if (decimales && decimales.length >= 2) return
      setValue((prev) => prev + digit)
   }

   const handleVirgule = () => {
      if (!value.includes(",")) setValue((prev) => prev + ",")
   }

   const handleDelete = () => setValue((prev) => prev.slice(0, -1))

   return (
      <>
         <h2>{titre}</h2>
         <p className="sous">{sousTitre}</p>

         <div className={"pave-montant text-" + couleur}>{value || 0} €</div>

         <div className="pave-grid">
            {numbers.map((number) => (
               <button key={number} onClick={() => handlePress(number)}>{number}</button>
            ))}
            <button onClick={handleVirgule}>,</button>
            <button onClick={() => handlePress("0")}>0</button>
            <button onClick={handleDelete} aria-label="Effacer"><Delete size={20} /></button>
         </div>

         <div className="pave-actions">
            {onAnnuler && <button className="btn" onClick={onAnnuler}>Annuler</button>}
            <button
               className={"btn bg-" + couleur}
               disabled={invalide}
               onClick={() => onValider(montant)}
            >
               {libelleValider}
            </button>
         </div>
      </>
   )
}
