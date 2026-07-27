import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/enveloppes')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Enveloppes</div>
}
