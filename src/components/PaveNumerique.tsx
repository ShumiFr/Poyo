import { useState } from "react";

export default function PaveNumerique({ titre, sousTitre, onValider }: { titre: string, sousTitre: string, onValider: (montant: number) => void }) {
   const [value, setValue] = useState("")
   const numbers = ["1", "2", "3", "4", "5", "6", "7", "8", "9"]

   const montant = Number(value.replace(",", "."))
   const invalide = montant <= 0

   const handlePress = (digit: string) => {
      const decimales = value.split(",")[1]
      if (decimales && decimales.length >= 2) return
      setValue((prev) => prev + digit)
   }

   const handleVirgule = () => {
      if (!value.includes(",")) {
         setValue((prev) => prev + ",")
      }
   }

   const handleDelete = () => {
      setValue((prev) => prev.slice(0, -1))
   }


   return (
      <>
         <h2>{titre}</h2>
         <p>{sousTitre}</p>

         <div>
            <div>
               {value || 0}
            </div>
            <div>
               {numbers.map((number) => (
                  <button key={number} onClick={() => handlePress(number)}>
                     {number}
                  </button>
               ))}
               <button onClick={handleVirgule}>,</button>
               <button onClick={() => handlePress("0")}>0</button>
               <button onClick={handleDelete}>Del</button>
            </div>
         </div>

         <button disabled={invalide} onClick={() => onValider(montant)}>
            Valider
         </button>
      </>
   )
}