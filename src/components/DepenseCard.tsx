import { useBudget } from '../store/useBudget'
import format from '../lib/format'
import type { Depense } from '../types'

export default function DepenseCard({ depense }: { depense: Depense }) {
   const marquerPayer = useBudget((state) => state.marquerPayer)

   return (
      <div id={depense.id} className={depense.estPayer ? "card payee" : "card"}>
         <div>
            <h3 className="h3">{depense.nom}</h3>
            {depense.type === "regulier" ? <p>{format(depense.montant)} / mois</p> : <p>Occasionnel</p>}
         </div>
         <h3 className="h3-depense">{format(depense.montant)}</h3>
         <button onClick={() => marquerPayer(depense.id)}>
            {depense.estPayer ? "Payé ✓" : "Payer"}
         </button>
      </div>
   )
}
