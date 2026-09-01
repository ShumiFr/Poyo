import { useState } from "react";
import { useBudget } from "../store/useBudget";
import Champ from "./Champ";
import ChoixType from "./ChoixType";
import ActionsForm from "./ActionsForm";
import { enNombre } from "../lib/format";
import type { Revenu } from "../types";

export default function FormRevenu({ onFini }: { onFini?: () => void }) {
   const [nom, setNom] = useState("")
   const [montant, setMontant] = useState("")
   const [type, setType] = useState<'regulier' | 'occasionnel'>('regulier')
   const ajouterRevenu = useBudget((state) => state.ajouterRevenu)

   const valeur = enNombre(montant)
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
         <Champ label="Nom" valeur={nom} placeholder="Ex. Prime" onChange={setNom} />
         <ChoixType type={type} onChange={setType} />
         <Champ label="Montant" valeur={montant} placeholder="0" onChange={setMontant} />

         <ActionsForm onAnnuler={() => onFini?.()} onValider={creer} couleur="green" invalide={invalide} />
      </div>
   )
}
