import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/revenus')({
   component: RouteComponent,
})

function RouteComponent() {
   return <div>Revenus</div>
}
