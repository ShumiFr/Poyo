import { create } from "zustand";
import type { Depense, Enveloppe, Flux, Revenu, Voeu } from "../types";

export interface BudgetStore {
   compte: number,
   revenus: Revenu[],
   depenses: Depense[],
   enveloppes: Enveloppe[],
   voeux: Voeu[],
   historique: Flux[]

   //Comptes
   ajouterAuCompte: (montant: number) => void

   //Revenus
   ajouterRevenu: (revenu: Revenu) => void
   retirerRevenu: (id: string) => void
   marquerRecu: (id: string) => void

   //Depenses
   ajouterDepense: (depense: Depense) => void

   //Enveloppes
   ajouterArgentEnveloppe: (id: string, montant: number) => void
   retirerArgentEnveloppe: (id: string, montant: number) => void
   /*retirerDepense: (id: string) => void
   marquerPayer: (id: string) => void

   //Enveloppes
   ajouterEnveloppe: (enveloppe: Enveloppe) => void
   retirerEnveloppe: (id: string) => void
   ajouterArgentEnveloppe: (id: string, montant: number) => void
   retirerArgentEnveloppe: (id: string, montant: number) => void

   //Voeux
   ajouterVoeu: (voeu: Voeu) => void
   retirerVoeu: (id: string) => void
   ajouterArgentVoeu: (id: string, montant: number) => void
   retirerArgentVoeu: (id: string, montant: number) => void
   */
}

export const useBudget = create<BudgetStore>((set) => ({
   compte: 0,
   revenus: [
      {
         id: "1",
         nom: "Salaire",
         montant: 1400,
         type: "regulier",
         estRecu: false
      }
   ],
   depenses: [
      {
         id: "1",
         nom: "Loyer",
         montant: 750,
         type: "regulier",
         estPayer: false
      }
   ],
   enveloppes: [
      {
         id: "1",
         nom: "Voiture",
         montant: 50.50,
         couleur: "blue",
         icone: "car"
      }
   ],
   voeux: [
      {
         id: "1",
         nom: "Steam Machine",
         montantTotal: 1400,
         montantActuel: 0,
         estTermine: false
      }
   ],
   historique: [
      {
         id: "1",
         date: new Date(),
         nom: "Loyer",
         montant: 750,
         type: "depense"
      }
   ],

   ajouterAuCompte: (montant) =>
      set((state) => ({ compte: state.compte + montant })),

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
            revenu.id === id
               ? { ...revenu, estRecu: !revenu.estRecu }
               : revenu
         )
      })),

   ajouterDepense: (depense) =>
      set((state) => ({
         depenses: [...state.depenses, depense]
      })),

   ajouterArgentEnveloppe: (id, montant) =>
      set((state) => ({
         enveloppes: state.enveloppes.map((enveloppe) =>
            enveloppe.id === id
               ? { ...enveloppe, montant: enveloppe.montant + montant }
               : enveloppe
         )
      })),

   retirerArgentEnveloppe: (id, montant) =>
      set((state) => ({
         enveloppes: state.enveloppes.map((enveloppe) =>
            enveloppe.id === id
               ? { ...enveloppe, montant: Math.max(0, enveloppe.montant - montant) }
               : enveloppe
         )
      }))
}))