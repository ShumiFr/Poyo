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
   enveloppeEntrant: { tag: 'Mis de côté', signe: '',  ligne: 'f-navy',   montant: 'text-navy',   Icone: ArrowRight },
   enveloppeSortant: { tag: 'Repris',      signe: '',  ligne: 'f-purple', montant: 'text-purple', Icone: ArrowLeft },
   voeuEntrant:      { tag: 'Mis de côté', signe: '',  ligne: 'f-navy',   montant: 'text-navy',   Icone: ArrowRight },
   voeuSortant:      { tag: 'Repris',      signe: '',  ligne: 'f-purple', montant: 'text-purple', Icone: ArrowLeft },
}

export const Route = createFileRoute('/historique')({
   component: RouteComponent,
})

function RouteComponent() {
   const historique = useBudget((state) => state.historique)

   return (
      <>
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
