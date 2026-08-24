import { create } from "zustand";
import type { Depense, Enveloppe, Flux, Revenu, TypeAction, Voeu } from "../types";

export interface BudgetStore {
   compte: number,
   revenus: Revenu[],
   depenses: Depense[],
   enveloppes: Enveloppe[],
   voeux: Voeu[],
   historique: Flux[]

   //Historique
   ajouterMouvement: (nom: string, montant: number, type: TypeAction) => void

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

   //Voeux
   ajouterArgentVoeu: (id: string, montant: number) => void
   retirerArgentVoeu: (id: string, montant: number) => void
   /*retirerDepense: (id: string) => void
   marquerPayer: (id: string) => void

   //Enveloppes
   ajouterEnveloppe: (enveloppe: Enveloppe) => void
   retirerEnveloppe: (id: string) => void

   //Voeux
   ajouterVoeu: (voeu: Voeu) => void
   retirerVoeu: (id: string) => void
   */
}

export const useBudget = create<BudgetStore>((set, get) => ({
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

   ajouterMouvement: (nom, montant, type) =>
      set((state) => ({
         historique: [
            { id: crypto.randomUUID(), date: new Date(), nom, montant, type },
            ...state.historique,
         ]
      })),

   ajouterAuCompte: (montant) => {
      set((state) => ({ compte: state.compte + montant }))
      get().ajouterMouvement("Entrée d'argent", montant, "revenu")
   },

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

   ajouterArgentEnveloppe: (id, montant) => {
      set((state) => ({
         enveloppes: state.enveloppes.map((enveloppe) =>
            enveloppe.id === id
               ? { ...enveloppe, montant: enveloppe.montant + montant }
               : enveloppe
         )
      }))
      const enveloppe = get().enveloppes.find((e) => e.id === id)
      get().ajouterMouvement(enveloppe?.nom ?? "Enveloppe", montant, "enveloppeEntrant")
   },

   retirerArgentEnveloppe: (id, montant) => {
      set((state) => ({
         enveloppes: state.enveloppes.map((enveloppe) =>
            enveloppe.id === id
               ? { ...enveloppe, montant: Math.max(0, enveloppe.montant - montant) }
               : enveloppe
         )
      }))
      const enveloppe = get().enveloppes.find((e) => e.id === id)
      get().ajouterMouvement(enveloppe?.nom ?? "Enveloppe", montant, "enveloppeSortant")
   },

   ajouterArgentVoeu: (id, montant) => {
      set((state) => ({
         voeux: state.voeux.map((voeu) =>
            voeu.id === id
               ? { ...voeu, montantActuel: voeu.montantActuel + montant }
               : voeu
         )
      }))
      const voeu = get().voeux.find((v) => v.id === id)
      get().ajouterMouvement(voeu?.nom ?? "Vœu", montant, "voeuEntrant")
   },

   retirerArgentVoeu: (id, montant) => {
      set((state) => ({
         voeux: state.voeux.map((voeu) =>
            voeu.id === id
               ? { ...voeu, montantActuel: Math.max(0, voeu.montantActuel - montant) }
               : voeu
         )
      }))
      const voeu = get().voeux.find((v) => v.id === id)
      get().ajouterMouvement(voeu?.nom ?? "Vœu", montant, "voeuSortant")
   }
}))