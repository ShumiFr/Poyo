import { createRootRoute, Link, Outlet } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <>
      <nav style={{ display: "flex", gap: "1rem", padding: "1rem" }}>
        <Link to="/">Accueil</Link>
        <Link to="/revenus">Revenus</Link>
        <Link to="/depenses">Depenses</Link>
        <Link to="/enveloppes">Enveloppes</Link>
        <Link to="/souhaits">Souhaits</Link>
        <Link to="/historique">Historique</Link>
      </nav>

      <Outlet />
    </>
  );
}
