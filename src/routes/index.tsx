import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute('/')({
   component: DashboardComponent,
})

function DashboardComponent() {
   return <div>Dashboard</div>
}