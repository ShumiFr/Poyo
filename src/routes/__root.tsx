import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Clock, ArrowDown, FileText, Mail, Flag, PiggyBank, RefreshCw, User } from "lucide-react";
import { useBudget } from "../store/useBudget";
import { useAuth } from "../store/useAuth";
import { useSyncBudget } from "../lib/useSyncBudget";
import { AuthScreen } from "../components/AuthScreen";
import EcranVerrou from "../components/EcranVerrou";
import { Modal } from "../components/Modal";
import { libelleMois } from "../lib/format";

export const Route = createRootRoute({
   component: RootComponent,
});

const onglets = [
   { to: "/", label: "Accueil", Icone: Clock, exact: true, cle: "accueil" },
   { to: "/revenus", label: "Rentrées", Icone: ArrowDown, cle: "revenus" },
   { to: "/depenses", label: "Dépenses", Icone: FileText, cle: "depenses" },
   { to: "/enveloppes", label: "Enveloppes", Icone: Mail, cle: "enveloppes" },
   { to: "/souhaits", label: "Vœux", Icone: Flag, cle: "souhaits" },
   { to: "/comptes", label: "Comptes", Icone: PiggyBank, cle: "comptes" },
] as const;

function RootComponent() {
   const mois = useBudget((state) => state.mois);
   const annee = useBudget((state) => state.annee);
   const compte = useBudget((state) => state.compte);
   const nouveauMois = useBudget((state) => state.nouveauMois);
   const theme = useBudget((state) => state.theme);

   const session = useAuth((state) => state.session);
   const chargement = useAuth((state) => state.chargement);
   const codePin = useBudget((state) => state.codePin);

   // Charge/sauvegarde le budget depuis Supabase selon la session connectée.
   const budgetPret = useSyncBudget(session);

   // Verrou d'app : re-verrouillé à chaque changement de session et quand l'app
   // repasse en arrière-plan (retour = code redemandé).
   const [deverrouille, setDeverrouille] = useState(false);

   // On re-verrouille à un vrai changement de compte (pas à un simple refresh de token).
   useEffect(() => { setDeverrouille(false); }, [session?.user.id]);

   useEffect(() => {
      const auCache = () => { if (document.hidden) setDeverrouille(false); };
      document.addEventListener("visibilitychange", auCache);
      return () => document.removeEventListener("visibilitychange", auCache);
   }, []);

   // Récupère la session au démarrage et écoute les connexions/déconnexions.
   useEffect(() => {
      useAuth.getState().init();
   }, []);

   // Applique le thème (classe .dark sur <html>) à chaque changement.
   useEffect(() => {
      document.documentElement.classList.toggle("dark", theme === "sombre");
   }, [theme]);

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

   // Porte d'entrée : on attend la session, puis on montre l'auth ou l'app.
   if (chargement) {
      return <main className="auth-ecran"><p className="sous">Chargement…</p></main>;
   }
   if (!session) {
      return <AuthScreen />;
   }
   // Connecté mais budget pas encore chargé depuis la base.
   if (!budgetPret) {
      return <main className="auth-ecran"><p className="sous">Chargement de tes données…</p></main>;
   }
   // Un code est défini et l'app n'est pas encore déverrouillée : on demande le code.
   if (codePin && !deverrouille) {
      return <EcranVerrou onDeverrouille={() => setDeverrouille(true)} />;
   }

   return (
      <>
         <header className="app-header">
            <div>
               <div className="titre">{session.user.user_metadata?.nom || "Poyo"}</div>
               <div className="mois">{libelleMois(mois, annee)}</div>
            </div>
            <div className="app-actions">
               <Link to="/profil" className="btn-theme" aria-label="Profil">
                  <User size={18} />
               </Link>
               <button className="btn-mois" onClick={ouvrir}><RefreshCw size={16} /> Nouveau mois</button>
            </div>
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
                  className={"nav-" + item.cle}
                  activeOptions={"exact" in item ? { exact: true } : undefined}
                  activeProps={{ className: "actif" }}
               >
                  <item.Icone size={20} />
                  <span className="lib">{item.label}</span>
               </Link>
            ))}
         </nav>
      </>
   );
}
