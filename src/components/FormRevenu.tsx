import { useState } from "react";
import { useBudget } from "../store/useBudget";
import type { Revenu } from "../types";

export default function FormRevenu({ onFini }: { onFini?: () => void }) {
   const [nom, setNom] = useState("")
   const [montant, setMontant] = useState("")
   const [type, setType] = useState<'regulier' | 'occasionnel'>('regulier')
   const ajouterRevenu = useBudget((state) => state.ajouterRevenu)

   const valeur = Number(montant.replace(",", "."))
   const invalide = nom.trim() === "" || valeur <= 0

   function creer() {
      const revenu: Revenu = {
         id: crypto.randomUUID(),
         nom: nom.trim(),
         montant: valeur,
         type,
         estRecu: false,
      }
      ajouterRevenu(revenu)
      onFini?.()
   }

   return (
      <div>
         <div className="champ">
            <label>Nom</label>
            <input value={nom} placeholder="Ex. Prime" onChange={(e) => setNom(e.target.value)} />
         </div>

         <div className="champ">
            <label>Type</label>
            <div className="type-toggle">
               <button type="button" className={type === "regulier" ? "actif" : ""} onClick={() => setType("regulier")}>Permanente</button>
               <button type="button" className={type === "occasionnel" ? "actif" : ""} onClick={() => setType("occasionnel")}>Ponctuelle</button>
            </div>
         </div>

         <div className="champ">
            <label>Montant</label>
            <input value={montant} placeholder="0" onChange={(e) => setMontant(e.target.value)} />
         </div>

         <div className="form-actions">
            <button className="btn" type="button" onClick={() => onFini?.()}>Annuler</button>
            <button className="btn btn-green" type="button" disabled={invalide} onClick={creer}>Créer</button>
         </div>
      </div>
   )
}
