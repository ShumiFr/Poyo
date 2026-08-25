import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { useState } from "react";
import { Clock, ArrowDown, FileText, Mail, Flag, AlignLeft, RefreshCw } from "lucide-react";
import { useBudget } from "../store/useBudget";
import { Modal } from "../components/Modal";
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
   const compte = useBudget((state) => state.compte);
   const nouveauMois = useBudget((state) => state.nouveauMois);

   const [confirme, setConfirme] = useState(false);
   const [solde, setSolde] = useState("");

   const moisSuivant = libelleMois((mois + 1) % 12, mois === 11 ? annee + 1 : annee);
   const soldeValide = Number(solde.replace(",", "."));

   function ouvrir() {
      setSolde(String(compte));   // pré-rempli avec le solde suivi par l'app
      setConfirme(true);
   }

   function demarrer() {
      nouveauMois(soldeValide);
      setConfirme(false);
   }

   return (
      <>
         <header className="app-header">
            <div>
               <div className="titre">Poyo</div>
               <div className="mois">{libelleMois(mois, annee)}</div>
            </div>
            <button className="btn-mois" onClick={ouvrir}><RefreshCw size={16} /> Nouveau mois</button>
         </header>

         <Modal isOpen={confirme} onClose={() => setConfirme(false)}>
            <h2>Démarrer {moisSuivant} ?</h2>
            <p className="sous">Confirme ton solde réel en fin de mois. Un écart sera journalisé en ajustement.</p>
            <div className="champ">
               <label>Solde de fin de mois</label>
               <input value={solde} onChange={(e) => setSolde(e.target.value)} />
            </div>
            <p className="sous">Charges et revenus repassent à payer / recevoir. Enveloppes et vœux conservés.</p>
            <div className="pave-actions">
               <button className="btn" onClick={() => setConfirme(false)}>Annuler</button>
               <button className="btn btn-primary" onClick={demarrer}>Démarrer</button>
            </div>
         </Modal>

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
