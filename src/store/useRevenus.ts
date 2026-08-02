import type { Revenu } from "../types";
import { create } from "zustand";

interface RevenusStore {
   revenus: Revenu[]
   ajouterRevenu: (revenu: Revenu) => void
   //modifierRevenu: (rid: string) => void
   retirerRevenu: (id: string) => void
   marquerRecu: (id: string) => void
}

export const useRevenus = create<RevenusStore>((set) => ({
   revenus: [
      {
         id: "1",
         nom: "Salaire",
         montant: 1400,
         type: "regulier",
         estRecu: false
      }
   ],

   ajouterRevenu: (revenu) =>
      set((state) => ({
         revenus: [...state.revenus, revenu]
      })),

   retirerRevenu: (id) =>
      set((state) => ({
         revenus: state.revenus.filter((revenu) => revenu.id !== id)
      })),

   marquerRecu: (id) =>
      set((state) => ({
         revenus: state.revenus.map((revenu) =>
            revenu.id === id ? { ...revenu, estRecu: !revenu.estRecu } : revenu
         )
      }))
}))