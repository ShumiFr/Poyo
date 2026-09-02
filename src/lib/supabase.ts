import { createClient } from "@supabase/supabase-js";

// Les clés viennent du fichier .env (VITE_… = injectées par Vite au build).
const url = import.meta.env.VITE_SUPABASE_URL as string;
const cleAnon = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!url || !cleAnon) {
   throw new Error(
      "Clés Supabase manquantes : vérifie VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY dans .env"
   );
}

// Un seul client partagé dans toute l'app. Il garde la session connectée
// dans le localStorage tout seul (donc on reste connecté après un refresh).
export const supabase = createClient(url, cleAnon);
