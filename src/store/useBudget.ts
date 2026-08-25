import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Depense, Enveloppe, Flux, Revenu, TypeAction, Voeu } from "../types";

export interface BudgetStore {
   compte: number,
   mois: number,
   annee: number,
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
   modifierRevenu: (id: string, nom: string, montant: number) => void

   //Depenses
   ajouterDepense: (depense: Depense) => void
   retirerDepense: (id: string) => void
   marquerPayer: (id: string) => void
   modifierDepense: (id: string, nom: string, montant: number) => void

   //Enveloppes
   ajouterEnveloppe: (enveloppe: Enveloppe) => void
   ajouterArgentEnveloppe: (id: string, montant: number) => void
   retirerArgentEnveloppe: (id: string, montant: number) => void

   //Voeux
   ajouterVoeu: (voeu: Voeu) => void
   ajouterArgentVoeu: (id: string, montant: number) => void
   retirerArgentVoeu: (id: string, montant: number) => void
}

export const useBudget = create<BudgetStore>()(persist((set, get) => ({
   compte: 0,
   mois: new Date().getMonth(),
   annee: new Date().getFullYear(),
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

   marquerRecu: (id) => {
      const revenu = get().revenus.find((r) => r.id === id)
      if (!revenu) return
      const devientRecu = !revenu.estRecu
      set((state) => ({
         revenus: state.revenus.map((r) =>
            r.id === id ? { ...r, estRecu: devientRecu } : r
         ),
         compte: devientRecu
            ? state.compte + revenu.montant
            : state.compte - revenu.montant,
      }))
      get().ajouterMouvement(
         devientRecu ? revenu.nom : "Annulation — " + revenu.nom,
         revenu.montant,
         devientRecu ? "revenu" : "depense"
      )
   },

   modifierRevenu: (id, nom, montant) =>
      set((state) => ({
         revenus: state.revenus.map((r) =>
            r.id === id ? { ...r, nom, montant } : r
         )
      })),

   ajouterDepense: (depense) =>
      set((state) => ({
         depenses: [...state.depenses, depense]
      })),

   retirerDepense: (id) =>
      set((state) => ({
         depenses: state.depenses.filter((depense) => depense.id !== id)
      })),

   modifierDepense: (id, nom, montant) =>
      set((state) => ({
         depenses: state.depenses.map((d) =>
            d.id === id ? { ...d, nom, montant } : d
         )
      })),

   marquerPayer: (id) => {
      const depense = get().depenses.find((d) => d.id === id)
      if (!depense) return
      const devientPayee = !depense.estPayer
      set((state) => ({
         depenses: state.depenses.map((d) =>
            d.id === id ? { ...d, estPayer: devientPayee } : d
         ),
         compte: devientPayee
            ? state.compte - depense.montant
            : state.compte + depense.montant,
      }))
      get().ajouterMouvement(
         devientPayee ? depense.nom : "Annulation — " + depense.nom,
         depense.montant,
         devientPayee ? "depense" : "revenu"
      )
   },

   ajouterEnveloppe: (enveloppe) =>
      set((state) => ({
         enveloppes: [...state.enveloppes, enveloppe]
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

   ajouterVoeu: (voeu) =>
      set((state) => ({
         voeux: [...state.voeux, voeu]
      })),

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
}), { name: "poyo-budget" }))