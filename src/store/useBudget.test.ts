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
      courses: [],
      previsionnels: [],
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

describe("dépenser depuis une enveloppe (E6)", () => {
   it("baisse l'enveloppe ET le compte, sans toucher au disponible", () => {
      useBudget.setState({ compte: 500, enveloppes: [enveloppe(100)] })
      // disponible avant = 500 − 100 (enveloppe) = 400
      useBudget.getState().depenserDepuisEnveloppe("e1", 30)

      const s = useBudget.getState()
      expect(s.compte).toBe(470)
      expect(s.enveloppes[0].montant).toBe(70)
      // disponible après = 470 − 70 = 400 : inchangé
      expect(s.compte - s.enveloppes[0].montant).toBe(400)
      expect(s.historique[0]).toMatchObject({ montant: 30, type: "depense", refId: "e1" })
   })

   it("est plafonné au contenu de l'enveloppe", () => {
      useBudget.setState({ compte: 500, enveloppes: [enveloppe(100)] })
      useBudget.getState().depenserDepuisEnveloppe("e1", 250) // plus que le contenu

      const s = useBudget.getState()
      expect(s.enveloppes[0].montant).toBe(0)
      expect(s.compte).toBe(400) // seulement 100 dépensés
   })
})

describe("dépense immédiate (page Dépenses)", () => {
   it("depuis le compte : déduit le compte et laisse une charge payée", () => {
      useBudget.setState({ compte: 500 })
      useBudget.getState().depenserImmediat("Dentiste", 60, "occasionnel", "compte")

      const s = useBudget.getState()
      expect(s.compte).toBe(440)
      expect(s.depenses[0]).toMatchObject({ nom: "Dentiste", montant: 60, estPayer: true })
      expect(s.historique[0]).toMatchObject({ montant: 60, type: "depense" })
   })

   it("depuis une enveloppe : sort de l'enveloppe ET du compte", () => {
      useBudget.setState({ compte: 500, enveloppes: [enveloppe(100)] })
      useBudget.getState().depenserImmediat("Plein essence", 40, "occasionnel", "e1")

      const s = useBudget.getState()
      expect(s.compte).toBe(460)
      expect(s.enveloppes[0].montant).toBe(60)
      expect(s.depenses[0]).toMatchObject({ montant: 40, estPayer: true })
   })
})

describe("courses (D7)", () => {
   it("cocher « courses faites » déduit le budget du compte et journalise", () => {
      useBudget.setState({ compte: 500, courses: [{ budget: 25, faite: false }] })
      useBudget.getState().basculerSemaineFaite(0)

      const s = useBudget.getState()
      expect(s.compte).toBe(475)
      expect(s.courses[0].faite).toBe(true)
      expect(s.historique[0]).toMatchObject({ montant: 25, type: "depense" })
   })

   it("décocher rend l'argent au compte (réversible)", () => {
      useBudget.setState({ compte: 475, courses: [{ budget: 25, faite: true }] })
      useBudget.getState().basculerSemaineFaite(0)
      expect(useBudget.getState().compte).toBe(500)
      expect(useBudget.getState().courses[0].faite).toBe(false)
   })

   it("ajuster le budget ne descend jamais sous 0", () => {
      useBudget.setState({ courses: [{ budget: 5, faite: false }] })
      useBudget.getState().ajusterSemaine(0, -5)
      expect(useBudget.getState().courses[0].budget).toBe(0)
      useBudget.getState().ajusterSemaine(0, -5)
      expect(useBudget.getState().courses[0].budget).toBe(0)
   })
})

describe("prévisionnel (D6)", () => {
   it("« dépensé ce mois » déduit le budget du compte et journalise", () => {
      useBudget.setState({ compte: 500, previsionnels: [{ id: "p1", nom: "Loisirs", montant: 60, estDepense: false }] })
      useBudget.getState().basculerPrevisionnelDepense("p1")

      const s = useBudget.getState()
      expect(s.compte).toBe(440)
      expect(s.previsionnels[0].estDepense).toBe(true)
      expect(s.historique[0]).toMatchObject({ montant: 60, type: "depense" })
   })

   it("ajuster le budget ne descend jamais sous 0", () => {
      useBudget.setState({ previsionnels: [{ id: "p1", nom: "Loisirs", montant: 10, estDepense: false }] })
      useBudget.getState().ajusterPrevisionnel("p1", -10)
      useBudget.getState().ajusterPrevisionnel("p1", -10)
      expect(useBudget.getState().previsionnels[0].montant).toBe(0)
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
