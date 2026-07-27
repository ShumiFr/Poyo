import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/depenses')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Depenses</div>
}
