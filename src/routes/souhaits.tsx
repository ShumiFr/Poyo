import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/souhaits')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Souhaits</div>
}
