import { Check, Plus } from 'lucide-react'

// Carré Check (fait/reçu) ou Plus (à faire) — payer une charge, marquer un revenu reçu…
export default function BoutonBascule({
   actif,
   couleur,
   onClick,
   label,
}: {
   actif: boolean
   couleur: string
   onClick: () => void
   label: string
}) {
   return (
      <button className={"carre bg-" + couleur} onClick={onClick} aria-label={label}>
         {actif ? <Check size={18} /> : <Plus size={18} />}
      </button>
   )
}
