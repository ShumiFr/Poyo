import type { Depense } from "../types";

export type StatutEcheance = "enRetard" | "bientot" | "aVenir";

// Où en est une échéance par rapport à aujourd'hui (dans le mois en cours).
// - enRetard : le jour est déjà passé
// - bientot  : c'est dans les `fenetre` prochains jours
// - aVenir   : plus loin dans le mois
export function statutEcheance(jour: number, aujourdhui = new Date(), fenetre = 5): StatutEcheance {
   const jourActuel = aujourdhui.getDate();
   if (jour < jourActuel) return "enRetard";
   if (jour - jourActuel <= fenetre) return "bientot";
   return "aVenir";
}

// Les charges régulières non payées qui ont une échéance, à surveiller (mois en cours).
export function facturesASurveiller(depenses: Depense[], aujourdhui = new Date()) {
   const aRegler = depenses.filter(
      (d) => d.type === "regulier" && !d.estPayer && d.jourEcheance !== undefined
   );
   const enRetard = aRegler.filter((d) => statutEcheance(d.jourEcheance!, aujourdhui) === "enRetard");
   const bientot = aRegler.filter((d) => statutEcheance(d.jourEcheance!, aujourdhui) === "bientot");
   return { enRetard, bientot };
}
