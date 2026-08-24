import { createFileRoute } from '@tanstack/react-router'
import { useBudget } from '../store/useBudget'
import format from '../lib/format'
import type { TypeAction } from '../types'

// Pour chaque type de mouvement : le libellé du tag, le signe et la couleur.
const affichage: Record<TypeAction, { tag: string; signe: string; couleur: string }> = {
   revenu: { tag: 'Rentrée', signe: '+', couleur: 'text-green' },
   depense: { tag: 'Sortie', signe: '−', couleur: 'text-red' },
   enveloppeEntrant: { tag: 'Mis de côté', signe: '−', couleur: 'text-orange' },
   enveloppeSortant: { tag: 'Repris', signe: '+', couleur: 'text-green' },
   voeuEntrant: { tag: 'Mis de côté', signe: '−', couleur: 'text-orange' },
   voeuSortant: { tag: 'Repris', signe: '+', couleur: 'text-green' },
}

export const Route = createFileRoute('/historique')({
   component: RouteComponent,
})

function RouteComponent() {
   const historique = useBudget((state) => state.historique)

   return (
      <>
         <h2>Historique</h2>
         {historique.map((flux) => {
            const style = affichage[flux.type]
            return (
               <div key={flux.id} className="card">
                  <div>
                     <h3 className="h3">{flux.nom}</h3>
                     <p>{style.tag} · {new Date(flux.date).toLocaleDateString('fr-FR')}</p>
                  </div>
                  <h3 className={style.couleur}>{style.signe} {format(flux.montant)}</h3>
               </div>
            )
         })}
      </>
   )
}
