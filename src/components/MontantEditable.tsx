import format from '../lib/format'

// Montant souligné, cliquable pour ouvrir l'édition (dépenses, revenus…).
export default function MontantEditable({
   montant,
   couleur,
   onClick,
}: {
   montant: number
   couleur: string
   onClick: () => void
}) {
   return (
      <button className={"montant-edit text-" + couleur} onClick={onClick}>{format(montant)}</button>
   )
}
