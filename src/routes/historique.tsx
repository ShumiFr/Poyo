import { createFileRoute } from '@tanstack/react-router'
import { ArrowUp, ArrowDown, ArrowRight, ArrowLeft } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useBudget } from '../store/useBudget'
import format from '../lib/format'
import type { TypeAction } from '../types'

type Style = { tag: string; signe: string; ligne: string; montant: string; Icone: LucideIcon }

const affichage: Record<TypeAction, Style> = {
   revenu:           { tag: 'Rentrée',     signe: '+', ligne: 'f-green',  montant: 'text-green',  Icone: ArrowUp },
   depense:          { tag: 'Sortie',      signe: '−', ligne: 'f-red',    montant: 'text-red',    Icone: ArrowDown },
   enveloppeEntrant: { tag: 'Mis de côté', signe: '',  ligne: 'f-navy',   montant: 'text-teal',   Icone: ArrowRight },
   enveloppeSortant: { tag: 'Repris',      signe: '',  ligne: 'f-purple', montant: 'text-lilac',  Icone: ArrowLeft },
   voeuEntrant:      { tag: 'Mis de côté', signe: '',  ligne: 'f-navy',   montant: 'text-teal',   Icone: ArrowRight },
   voeuSortant:      { tag: 'Repris',      signe: '',  ligne: 'f-purple', montant: 'text-lilac',  Icone: ArrowLeft },
}

export const Route = createFileRoute('/historique')({
   component: RouteComponent,
})

function RouteComponent() {
   const historique = useBudget((state) => state.historique)

   return (
      <>
         <div className="screen-titre-row">
            <h2>Historique</h2>
         </div>
         <p className="sous" style={{ margin: "-8px 0 16px" }}>{historique.length} mouvements ce mois</p>

         {historique.map((flux) => {
            const s = affichage[flux.type]
            return (
               <div key={flux.id} className={"flux " + s.ligne}>
                  <span className={"flux-icone " + s.montant}><s.Icone size={16} /></span>
                  <div style={{ flex: 1 }}>
                     <div className="libelle">{flux.nom}</div>
                     <div className="sous">{new Date(flux.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} · {s.tag}</div>
                  </div>
                  <div className={"montant " + s.montant}>{s.signe} {format(flux.montant)}</div>
               </div>
            )
         })}
      </>
   )
}
