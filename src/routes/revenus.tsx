import { createFileRoute } from '@tanstack/react-router'
import { useRevenus } from '../store/useRevenus'
import Form from '../components/Form'

export const Route = createFileRoute('/revenus')({
   component: RouteComponent,
})

function RouteComponent() {
   const revenus = useRevenus((state) => state.revenus)
   const retirerRevenu = useRevenus((state) => state.retirerRevenu)
   const marquerRecu = useRevenus((state) => state.marquerRecu)

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
