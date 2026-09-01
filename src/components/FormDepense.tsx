import { useState } from "react";
import type { Depense } from "../types";
import { useBudget } from "../store/useBudget";
import Champ from "./Champ";
import ChoixType from "./ChoixType";
import ActionsForm from "./ActionsForm";
import format, { enNombre } from "../lib/format";

export default function FormDepense({ onFini }: { onFini?: () => void }) {
   const ajouterDepense = useBudget((state) => state.ajouterDepense)
   const depenserImmediat = useBudget((state) => state.depenserImmediat)
   const enveloppes = useBudget((state) => state.enveloppes)

   const [nom, setNom] = useState("")
   const [montant, setMontant] = useState("")
   const [type, setType] = useState<'regulier' | 'occasionnel'>('regulier')
   const [source, setSource] = useState("plus-tard")   // "plus-tard" | "compte" | id d'enveloppe

   const valeur = enNombre(montant)
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
         <Champ label="Nom" valeur={nom} placeholder="Ex. Salle de sport" onChange={setNom} />
         <ChoixType type={type} onChange={setType} rouge />
         <Champ label="Montant" valeur={montant} placeholder="0" onChange={setMontant} />

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

         <ActionsForm onAnnuler={() => onFini?.()} onValider={creer} couleur="red" invalide={invalide} />
      </div>
   )
}
