import { create } from "zustand";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

interface AuthStore {
   session: Session | null;
   // true tant qu'on n'a pas encore récupéré la session au démarrage
   chargement: boolean;

   // Met en place la récupération de la session + l'écoute des changements.
   init: () => void;
   // Renvoient un message d'erreur (string) ou null si tout s'est bien passé.
   connexion: (email: string, motDePasse: string) => Promise<string | null>;
   inscription: (email: string, motDePasse: string, nom: string) => Promise<string | null>;
   deconnexion: () => Promise<void>;
}

export const useAuth = create<AuthStore>((set) => ({
   session: null,
   chargement: true,

   init: () => {
      // 1) session existante (si déjà connectée lors d'une visite précédente)
      supabase.auth.getSession().then(({ data }) => {
         set({ session: data.session, chargement: false });
      });
      // 2) on écoute les connexions / déconnexions pour garder l'état à jour
      supabase.auth.onAuthStateChange((_evenement, session) => {
         set({ session });
      });
   },

   connexion: async (email, motDePasse) => {
      const { error } = await supabase.auth.signInWithPassword({ email, password: motDePasse });
      return error ? error.message : null;
   },

   inscription: async (email, motDePasse, nom) => {
      // Le nom est rangé dans les métadonnées de l'utilisateur (user_metadata.nom).
      const { error } = await supabase.auth.signUp({
         email,
         password: motDePasse,
         options: { data: { nom } },
      });
      return error ? error.message : null;
   },

   deconnexion: async () => {
      await supabase.auth.signOut();
   },
}));
