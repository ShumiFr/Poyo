import { useState } from "react";
import type { Depense } from "../types";
import { useBudget } from "../store/useBudget";
import format from "../lib/format";

export default function FormDepense({ onFini }: { onFini?: () => void }) {
   const ajouterDepense = useBudget((state) => state.ajouterDepense)
   const depenserImmediat = useBudget((state) => state.depenserImmediat)
   const enveloppes = useBudget((state) => state.enveloppes)

   const [nom, setNom] = useState("")
   const [montant, setMontant] = useState("")
   const [type, setType] = useState<'regulier' | 'occasionnel'>('regulier')
   const [source, setSource] = useState("plus-tard")   // "plus-tard" | "compte" | id d'enveloppe

   const valeur = Number(montant.replace(",", "."))
   const invalide = nom.trim() === "" || valeur <= 0

   function creer() {
      if (source === "plus-tard") {
         const depense: Depense = { id: crypto.randomUUID(), nom: nom.trim(), montant: valeur, type, estPayer: false }
         ajouterDepense(depense)
      } else {
         depenserImmediat(nom.trim(), valeur, type, source)
      }
      onFini?.()
   }

   return (
      <div>
         <div className="champ">
            <label>Nom</label>
            <input value={nom} placeholder="Ex. Salle de sport" onChange={(e) => setNom(e.target.value)} />
         </div>

         <div className="champ">
            <label>Type</label>
            <div className="type-toggle rouge">
               <button type="button" className={type === "regulier" ? "actif" : ""} onClick={() => setType("regulier")}>Permanente</button>
               <button type="button" className={type === "occasionnel" ? "actif" : ""} onClick={() => setType("occasionnel")}>Ponctuelle</button>
            </div>
         </div>

         <div className="champ">
            <label>Montant</label>
            <input value={montant} placeholder="0" onChange={(e) => setMontant(e.target.value)} />
         </div>

         <div className="champ">
            <label>Payer depuis</label>
            <select value={source} onChange={(e) => setSource(e.target.value)}>
               <option value="plus-tard">Plus tard (charge à pointer)</option>
               <option value="compte">Le compte (maintenant)</option>
               {enveloppes.map((e) => (
                  <option key={e.id} value={e.id}>Enveloppe {e.nom} · {format(e.montant)}</option>
               ))}
            </select>
         </div>

         <div className="form-actions">
            <button className="btn" type="button" onClick={() => onFini?.()}>Annuler</button>
            <button className="btn btn-red" type="button" disabled={invalide} onClick={creer}>Créer</button>
         </div>
      </div>
   )
}
