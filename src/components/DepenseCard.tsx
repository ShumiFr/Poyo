import format from '../lib/format'
import type { Depense } from '../types'

export default function DepenseCard({ depense }: { depense: Depense }) {
   return (
      <div id={depense.id} className="card">
         <div>
            <h3 className="h3">{depense.nom}</h3>
            {depense.type ? <p>{depense.montant} € / mois</p> : <p>Occasionnel</p>}
         </div>
         <h3 className="h3-depense">{format(depense.montant)}</h3>
      </div>
   )
}
