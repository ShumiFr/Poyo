import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { useBudget } from "../store/useBudget";
import { chargerBudget, sauvegarderBudget } from "./syncBudget";

// Branche le store sur Supabase pour la session donnée.
// Renvoie `pret` = true une fois les données chargées (pour éviter d'afficher
// un budget vide pendant le chargement).
export function useSyncBudget(session: Session | null) {
   const [pret, setPret] = useState(false);

   useEffect(() => {
      // Déconnecté : on repart d'un budget vierge (pas de fuite entre comptes).
      if (!session) {
         useBudget.getState().reinitialiser();
         setPret(false);
         return;
      }

      const userId = session.user.id;
      let annule = false;
      let minuteur: ReturnType<typeof setTimeout> | undefined;
      let desabonner: (() => void) | undefined;

      setPret(false);
      chargerBudget(userId)
         .then(() => {
            if (annule) return;
            setPret(true);
            // À chaque changement du store, on sauvegarde (après une petite pause).
            desabonner = useBudget.subscribe(() => {
               clearTimeout(minuteur);
               minuteur = setTimeout(() => sauvegarderBudget(userId), 800);
            });
         })
         .catch((e) => {
            console.error("Chargement du budget échoué :", e);
            if (!annule) setPret(true); // on laisse quand même entrer dans l'app
         });

      return () => {
         annule = true;
         clearTimeout(minuteur);
         desabonner?.();
      };
   }, [session]);

   return pret;
}
