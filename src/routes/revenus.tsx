import { createFileRoute } from '@tanstack/react-router'
import { useBudget } from '../store/useBudget'
import Form from '../components/FormRevenu'

export const Route = createFileRoute('/revenus')({
   component: RouteComponent,
})

function RouteComponent() {
   const revenus = useBudget((state) => state.revenus)
   const retirerRevenu = useBudget((state) => state.retirerRevenu)
   const marquerRecu = useBudget((state) => state.marquerRecu)

   function handleDelete(e: React.MouseEvent<HTMLButtonElement>) {
      e.preventDefault()

      const id = e.currentTarget.id

      retirerRevenu(id)
   }

   function handleRecu(e: React.MouseEvent<HTMLButtonElement>) {
      e.preventDefault()

      const id = e.currentTarget.id

      marquerRecu(id)
   }

   return <div>
      {revenus.map((revenu) => (
         <div key={revenu.id}>
            <h3>{revenu.nom}</h3>
            <p>{revenu.montant} €</p>
            <div>
               <button id={revenu.id} onClick={handleRecu}>Reçu</button>
            </div>
            <div>
               <button id={revenu.id} onClick={handleDelete}>Retirer</button>
            </div>
         </div>
      ))}
      <Form />
   </div>
}
