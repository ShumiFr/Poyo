import type { Frequence } from "../types"

export default function ChoixType({
   type,
   onChange,
   rouge,
}: {
   type: Frequence
   onChange: (type: Frequence) => void
   rouge?: boolean
}) {
   return (
      <div className="champ">
         <label>Type</label>
         <div className={rouge ? "type-toggle rouge" : "type-toggle"}>
            <button type="button" className={type === "regulier" ? "actif" : ""} onClick={() => onChange("regulier")}>Permanente</button>
            <button type="button" className={type === "occasionnel" ? "actif" : ""} onClick={() => onChange("occasionnel")}>Ponctuelle</button>
         </div>
      </div>
   )
}
