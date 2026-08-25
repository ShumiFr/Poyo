import { describe, it, expect, beforeEach } from "vitest"
import { useBudget } from "./useBudget"
import type { Depense, Revenu, Enveloppe } from "../types"

const revenu = (montant: number): Revenu =>
   ({ id: "r1", nom: "Salaire", montant, type: "regulier", estRecu: false })
const depense = (montant: number): Depense =>
   ({ id: "d1", nom: "Loyer", montant, type: "regulier", estPayer: false })
const enveloppe = (montant: number): Enveloppe =>
   ({ id: "e1", nom: "Voiture", montant, couleur: "navy", icone: "car" })

// On repart d'un état propre avant chaque test
beforeEach(() => {
   useBudget.setState({
      compte: 0,
      soldeReporte: 0,
      mois: 5,
      annee: 2026,
      revenus: [],
      depenses: [],
      enveloppes: [],
      voeux: [],
      historique: [],
   })
})

describe("marquerRecu (R4/R5)", () => {
   it("ajoute le revenu au compte et journalise une Rentrée", () => {
      useBudget.setState({ revenus: [revenu(1400)] })
      useBudget.getState().marquerRecu("r1")

      const s = useBudget.getState()
      expect(s.compte).toBe(1400)
      expect(s.revenus[0].estRecu).toBe(true)
      expect(s.historique[0]).toMatchObject({ montant: 1400, type: "revenu" })
   })

   it("re-cliquer annule : retire du compte et journalise l'inverse", () => {
      useBudget.setState({ revenus: [{ ...revenu(1400), estRecu: true }], compte: 1400 })
      useBudget.getState().marquerRecu("r1")

      const s = useBudget.getState()
      expect(s.compte).toBe(0)
      expect(s.revenus[0].estRecu).toBe(false)
      expect(s.historique[0].type).toBe("depense")
   })
})

describe("marquerPayer (D4)", () => {
   it("retire la charge du compte et journalise une Sortie", () => {
      useBudget.setState({ depenses: [depense(750)], compte: 1000 })
      useBudget.getState().marquerPayer("d1")

      const s = useBudget.getState()
      expect(s.compte).toBe(250)
      expect(s.depenses[0].estPayer).toBe(true)
      expect(s.historique[0]).toMatchObject({ montant: 750, type: "depense" })
   })
})

describe("enveloppes (E2/E3)", () => {
   it("retirer est plafonné au contenu (jamais négatif)", () => {
      useBudget.setState({ enveloppes: [enveloppe(50)] })
      useBudget.getState().retirerArgentEnveloppe("e1", 80)
      expect(useBudget.getState().enveloppes[0].montant).toBe(0)
   })
})

describe("nouveauMois (M1)", () => {
   it("avance le mois, reporte le solde réel et journalise l'écart", () => {
      useBudget.setState({
         compte: 500,
         soldeReporte: 0,
         mois: 5,
         annee: 2026,
         revenus: [{ ...revenu(1400), estRecu: true }],
         depenses: [{ ...depense(750), estPayer: true }],
      })

      useBudget.getState().nouveauMois(600) // solde réel corrigé à 600 (+100 d'écart)

      const s = useBudget.getState()
      expect(s.mois).toBe(6)
      expect(s.compte).toBe(600)
      expect(s.soldeReporte).toBe(600)
      expect(s.revenus[0].estRecu).toBe(false)   // remis à recevoir
      expect(s.depenses[0].estPayer).toBe(false) // remis à payer
      expect(s.historique[0]).toMatchObject({ montant: 100, type: "revenu" })
   })

   it("bascule d'année après décembre", () => {
      useBudget.setState({ mois: 11, annee: 2026, compte: 0 })
      useBudget.getState().nouveauMois(0)

      const s = useBudget.getState()
      expect(s.mois).toBe(0)
      expect(s.annee).toBe(2027)
   })
})
