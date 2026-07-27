import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/historique')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Historique</div>
}
