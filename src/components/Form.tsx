import { useState } from "react";
import { useRevenus } from "../store/useRevenus";
import type { Revenu } from "../types";

export default function Form() {
   const [nom, setNom] = useState("")
   const [montant, setMontant] = useState(0)
   const [type, setType] = useState<'regulier' | 'occasionnel'>('regulier')
   const ajouterRevenu = useRevenus((state) => state.ajouterRevenu)

   function createRevenu() {
      const revenu: Revenu = {
         id: crypto.randomUUID(),
         nom: nom,
         montant: montant,
         type: type,
         estRecu: false
      }
      ajouterRevenu(revenu)
   }

   return (
      <form onSubmit={(e) => { e.preventDefault(); createRevenu(); }}>
         <div>
            <label>Nom</label>
            <input value={nom} placeholder="Ex. Salaire" onChange={(e) => setNom(e.target.value)} />
         </div>
         <div>
            <label>Type</label>
            <button
               value={type}
               type="button"
               onClick={() => setType("regulier")}
               style={{
                  background: type === "regulier" ? "#2f9e6f" : "white",
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
                  background: type === "occasionnel" ? "#2f9e6f" : "white",
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