import { ChevronLeft, ChevronRight, FlaskConical } from "lucide-react";
import { useBudget } from "../store/useBudget";
import { libelleMois } from "../lib/format";

// Navigateur de mois : flèches précédent / suivant dans le header.
// La flèche « suivant » s'arrête au mois en cours (le dernier de la liste).
export default function Calendrier() {
   const moisListe = useBudget((state) => state.moisListe);
   const indexActif = useBudget((state) => state.indexActif);
   const moisPrecedent = useBudget((state) => state.moisPrecedent);
   const moisSuivant = useBudget((state) => state.moisSuivant);
   const basculerMoisTest = useBudget((state) => state.basculerMoisTest);

   const actif = moisListe[indexActif];
   const estPremier = indexActif === 0;
   const estDernier = indexActif === moisListe.length - 1;

   return (
      <div className="mois-nav">
         <button className="mois-fleche" onClick={moisPrecedent} disabled={estPremier} aria-label="Mois précédent">
            <ChevronLeft size={18} />
         </button>

         <span className="mois-label">
            {libelleMois(actif.mois, actif.annee)}
            {!estDernier && <span className="mois-passe">passé</span>}
         </span>

         <button className="mois-fleche" onClick={moisSuivant} disabled={estDernier} aria-label="Mois suivant">
            <ChevronRight size={18} />
         </button>

         {/* Développement seulement : ajoute/retire un mois d'exemple pour tester la navigation */}
         {import.meta.env.DEV && (
            <button className="mois-fleche" onClick={basculerMoisTest} aria-label="Mois de test">
               <FlaskConical size={16} />
            </button>
         )}
      </div>
   );
}
