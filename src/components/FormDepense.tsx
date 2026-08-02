import { useState } from "react";
import type { Depense } from "../types";
import { useDepenses } from "../store/useDepenses";

export default function FormDepense() {
   const [nom, setNom] = useState("")
   const [montant, setMontant] = useState(0)
   const [type, setType] = useState<'regulier' | 'occasionnel'>('regulier')
   const ajouterDepense = useDepenses((state) => state.ajouterDepense)

   function createDepense() {
      const depense: Depense = {
         id: crypto.randomUUID(),
         nom: nom,
         montant: montant,
         type: type,
         estPayer: false
      }
      ajouterDepense(depense)
   }

   return (
      <form onSubmit={(e) => { e.preventDefault(); createDepense(); }}>
         <div>
            <label>Nom</label>
            <input value={nom} placeholder="Ex. Loyer" onChange={(e) => setNom(e.target.value)} />
         </div>
         <div>
            <label>Type</label>
            <button
               value={type}
               type="button"
               onClick={() => setType("regulier")}
               style={{
                  background: type === "regulier" ? "#a72b2b" : "white",
                  color: type === "regulier" ? "white" : "black",
               }}
            >
               Permanente
            </button>
            <button
               value={type}
               type="button"
               onClick={() => setType("occasionnel")}
               style={{
                  background: type === "occasionnel" ? "#a72b2b" : "white",
                  color: type === "occasionnel" ? "white" : "black",
               }}
            >
               Occasionelle
            </button>
         </div>
         <div>
            <label>Montant</label>
            <input value={montant} placeholder="0" onChange={(e) => setMontant(Number(e.target.value))} />
         </div>
         <div>
            <button type="button">Annuler</button>
            <button type="submit">Créer</button>
         </div>
      </form >
   )
}