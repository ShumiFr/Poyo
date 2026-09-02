import { supabase } from "./supabase";
import { useBudget } from "../store/useBudget";
import type { MoisBudget } from "../types";

// Convertit un budget de l'ancien format (un seul mois « à plat ») vers le
// nouveau (une liste de mois). Les données déjà au nouveau format passent tel quel.
function normaliserBudget(data: Record<string, unknown>): Record<string, unknown> {
   if (Array.isArray(data.moisListe)) return data;   // déjà au nouveau format

   const moisCourant: MoisBudget = {
      mois: (data.mois as number) ?? new Date().getMonth(),
      annee: (data.annee as number) ?? new Date().getFullYear(),
      soldeReporte: (data.soldeReporte as number) ?? 0,
      compte: (data.compte as number) ?? 0,
      revenus: (data.revenus as MoisBudget["revenus"]) ?? [],
      depenses: (data.depenses as MoisBudget["depenses"]) ?? [],
      enveloppes: (data.enveloppes as MoisBudget["enveloppes"]) ?? [],
      voeux: (data.voeux as MoisBudget["voeux"]) ?? [],
      courses: (data.courses as MoisBudget["courses"]) ?? [],
      previsionnels: (data.previsionnels as MoisBudget["previsionnels"]) ?? [],
   };

   // Les anciennes « archives » étaient rangées du plus récent au plus ancien :
   // on les remet du plus ancien au plus récent, puis on ajoute le mois courant à la fin.
   const anciennesArchives = Array.isArray(data.archives) ? [...(data.archives as MoisBudget[])].reverse() : [];
   const moisListe = [...anciennesArchives, moisCourant];

   return {
      moisListe,
      indexActif: moisListe.length - 1,
      theme: data.theme ?? "sombre",
      historique: data.historique ?? [],
      comptesEpargne: data.comptesEpargne ?? [],
      codePin: data.codePin,
   };
}

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
      useBudget.setState(normaliserBudget(data.data));
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
