import type { MoisBudget } from "../types";
import { calculerRecap } from "./calculs";

// Les chiffres d'un mois pour les graphiques.
export interface StatMois {
   mois: number;
   annee: number;
   revenus: number;   // revenus perçus ce mois
   depenses: number;  // tout ce qui est sorti du compte ce mois (charges payées + courses + prévisionnels)
   solde: number;     // solde du compte en fin de mois
   epargne: number;   // total mis de côté (enveloppes + vœux)
}

// Transforme la liste des mois en une série de chiffres prête à tracer.
// On garde au plus `limite` mois, les plus récents (à droite du graphique).
export function serieMensuelle(moisListe: MoisBudget[], limite = 6): StatMois[] {
   const recents = moisListe.slice(-limite);
   return recents.map((m) => {
      const recap = calculerRecap(m);
      const epargne =
         m.enveloppes.reduce((s, e) => s + e.montant, 0) +
         m.voeux.reduce((s, v) => s + v.montantActuel, 0);
      return {
         mois: m.mois,
         annee: m.annee,
         revenus: recap.revenusAffiches,
         depenses: recap.chargesPayees,
         solde: m.compte,
         epargne,
      };
   });
}

// Répartition des dépenses d'un mois par famille (pour le détail « où part l'argent »).
export function repartitionDepenses(m: MoisBudget) {
   const regulieres = m.depenses
      .filter((d) => d.type === "regulier" && d.estPayer)
      .reduce((s, d) => s + d.montant, 0);
   const ponctuelles = m.depenses
      .filter((d) => d.type === "occasionnel" && d.estPayer)
      .reduce((s, d) => s + d.montant, 0);
   const courses = m.courses.filter((c) => c.faite).reduce((s, c) => s + c.budget, 0);
   const previsionnel = m.previsionnels.filter((p) => p.estDepense).reduce((s, p) => s + p.montant, 0);
   return { regulieres, courses, ponctuelles, previsionnel };
}
