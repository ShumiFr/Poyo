import { createFileRoute } from '@tanstack/react-router'
import { useRevenus } from '../store/useRevenus'
import Form from '../components/Form'

export const Route = createFileRoute('/revenus')({
   component: RouteComponent,
})

function RouteComponent() {
   const revenus = useRevenus((state) => state.revenus)

   return <div>
      {revenus.map((revenu) => (
         <div key={revenu.id}>
            <h3>{revenu.nom}</h3>
            <p>{revenu.montant} €</p>
         </div>
      ))}
      <Form />
   </div>
}
