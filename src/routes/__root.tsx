import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { Clock, ArrowDown, FileText, Mail, Flag, AlignLeft, RefreshCw } from "lucide-react";
import { useBudget } from "../store/useBudget";
import { libelleMois } from "../lib/format";

export const Route = createRootRoute({
   component: RootComponent,
});

const onglets = [
   { to: "/", label: "Accueil", Icone: Clock, exact: true },
   { to: "/revenus", label: "Rentrées", Icone: ArrowDown },
   { to: "/depenses", label: "Dépenses", Icone: FileText },
   { to: "/enveloppes", label: "Enveloppes", Icone: Mail },
   { to: "/souhaits", label: "Vœux", Icone: Flag },
   { to: "/historique", label: "Historique", Icone: AlignLeft },
] as const;

function RootComponent() {
   const mois = useBudget((state) => state.mois);
   const annee = useBudget((state) => state.annee);

   return (
      <>
         <header className="app-header">
            <div>
               <div className="titre">Poyo</div>
               <div className="mois">{libelleMois(mois, annee)}</div>
            </div>
            {/* Nouveau mois : sera branché avec la story M1 */}
            <button className="btn-mois"><RefreshCw size={16} /> Nouveau mois</button>
         </header>

         <main className="screen">
            <Outlet />
         </main>

         <nav className="bottom-nav">
            {onglets.map((item) => (
               <Link
                  key={item.to}
                  to={item.to}
                  activeOptions={"exact" in item ? { exact: true } : undefined}
                  activeProps={{ className: "actif" }}
               >
                  <item.Icone size={20} />
                  {item.label}
               </Link>
            ))}
         </nav>
      </>
   );
}
