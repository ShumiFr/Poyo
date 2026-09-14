import { create } from "zustand";

// Réglages d'interface (pas des données de budget). Pour l'instant : le tutoriel.
const CLE_TUTO = "poyo-tutoriel-vu";

// A-t-on déjà vu le tutoriel sur cet appareil ? (localStorage peut échouer en
// navigation privée → on considère alors qu'il est vu pour ne pas gêner.)
export function tutorielDejaVu(): boolean {
   try {
      return localStorage.getItem(CLE_TUTO) === "1";
   } catch {
      return true;
   }
}

interface UIStore {
   tutorielOuvert: boolean;
   ouvrirTutoriel: () => void;
   fermerTutoriel: () => void;
}

export const useUI = create<UIStore>()((set) => ({
   tutorielOuvert: false,
   ouvrirTutoriel: () => set({ tutorielOuvert: true }),
   fermerTutoriel: () => {
      try {
         localStorage.setItem(CLE_TUTO, "1");
      } catch {
         // pas grave : le tutoriel se reproposera à la prochaine ouverture
      }
      set({ tutorielOuvert: false });
   },
}));
