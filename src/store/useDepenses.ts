import { create } from "zustand";
import type { Depense } from "../types";

interface DepensesStore {
   depenses: Depense[]
   ajouterDepense: (depense: Depense) => void
   //modifierDepense: (id: string) => void
   //retirerDepense: (id: string) => void
   //marquerPayer: (id: string) => void
}

export const useDepenses = create<DepensesStore>((set) => ({
   depenses: [
      {
         id: "1",
         nom: "Loyer",
         montant: 750,
         type: "regulier",
         estPayer: false
      }
   ],

   ajouterDepense: (depense) =>
      set((state) => ({
         depenses: [...state.depenses, depense]
      }))
}))