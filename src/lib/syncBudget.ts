import { supabase } from "./supabase";
import { useBudget } from "../store/useBudget";

// On ne garde que les données du store (pas les fonctions) pour les envoyer en base.
function extraireDonnees() {
   const etat = useBudget.getState() as unknown as Record<string, unknown>;
   const donnees: Record<string, unknown> = {};
   for (const [cle, valeur] of Object.entries(etat)) {
      if (typeof valeur !== "function") donnees[cle] = valeur;
   }
   return donnees;
}

// Charge le budget de l'utilisateur depuis Supabase et remplit le store.
// S'il n'a pas encore de ligne (1re connexion), on la crée à partir de l'état vierge.
export async function chargerBudget(userId: string) {
   const { data, error } = await supabase
      .from("budgets")
      .select("data")
      .eq("user_id", userId)
      .maybeSingle();

   if (error) throw error;

   if (data && data.data && Object.keys(data.data).length > 0) {
      useBudget.setState(data.data);
   } else {
      await sauvegarderBudget(userId);
   }
}

// Sauvegarde l'état courant du store dans la ligne de l'utilisateur (insert ou update).
export async function sauvegarderBudget(userId: string) {
   const { error } = await supabase.from("budgets").upsert({
      user_id: userId,
      data: extraireDonnees(),
      updated_at: new Date().toISOString(),
   });
   if (error) console.error("Sauvegarde du budget échouée :", error.message);
}
