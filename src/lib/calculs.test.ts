import { describe, it, expect } from "vitest"
import calculerDisponible, { calculerRecap } from "./calculs"
import type { Depense, Enveloppe, Voeu } from "../types"

// Fabriques minimales pour des tests lisibles
const depense = (montant: number, estPayer = false): Depense =>
   ({ id: crypto.randomUUID(), nom: "x", montant, type: "regulier", estPayer })
const enveloppe = (montant: number): Enveloppe =>
   ({ id: crypto.randomUUID(), nom: "x", montant, couleur: "navy", icone: "car" })
const voeu = (montantActuel: number): Voeu =>
   ({ id: crypto.randomUUID(), nom: "x", montantTotal: 1000, montantActuel, estTermine: false })

describe("calculerDisponible", () => {
   it("vaut le compte quand il n'y a rien à déduire", () => {
      expect(calculerDisponible(1000, [], [], [])).toBe(1000)
   })

   it("soustrait les charges NON payées mais pas les payées", () => {
      const depenses = [depense(200, false), depense(300, true)]
      // 1000 − 200 (non payée) = 800 ; la charge payée est déjà sortie du compte
      expect(calculerDisponible(1000, depenses, [], [])).toBe(800)
   })

   it("soustrait le contenu des enveloppes et des vœux", () => {
      expect(calculerDisponible(1000, [], [enveloppe(150)], [voeu(50)])).toBe(800)
   })

   it("combine toutes les déductions", () => {
      const d = [depense(100), depense(400, true)]
      expect(calculerDisponible(1000, d, [enveloppe(200)], [voeu(100)])).toBe(600)
   })

   it("peut être négatif (le clamp à 0 est fait à l'affichage, pas ici)", () => {
      expect(calculerDisponible(100, [depense(500)], [], [])).toBe(-400)
   })

   it("soustrait la réserve courses (semaines non faites uniquement)", () => {
      const courses = [
         { budget: 25, faite: false },
         { budget: 25, faite: true },  // déjà faite → déjà sortie du compte
         { budget: 30, faite: false },
      ]
      // 1000 − (25 + 30) = 945
      expect(calculerDisponible(1000, [], [], [], courses)).toBe(945)
   })
})

describe("calculerRecap", () => {
   it("une semaine de courses faite compte en charges payées, sans raboter les revenus", () => {
      // Salaire 1000 reçu, une semaine de courses de 80 faite → compte = 1000 − 80 = 920
      const r = calculerRecap({
         compte: 920,
         soldeReporte: 0,
         revenus: [{ id: "r", nom: "Salaire", montant: 1000, type: "regulier", estRecu: true }],
         depenses: [],
         enveloppes: [],
         voeux: [],
         courses: [{ budget: 80, faite: true }],
         previsionnels: [],
      })
      expect(r.chargesPayees).toBe(80)       // les courses faites apparaissent en charges payées
      expect(r.revenusAffiches).toBe(1000)   // et les revenus perçus ne sont plus rabotés
   })

   it("un prévisionnel dépensé compte aussi en charges payées", () => {
      // Salaire 1000 reçu, un prévisionnel de 60 dépensé → compte = 940
      const r = calculerRecap({
         compte: 940,
         soldeReporte: 0,
         revenus: [{ id: "r", nom: "Salaire", montant: 1000, type: "regulier", estRecu: true }],
         depenses: [],
         enveloppes: [],
         voeux: [],
         courses: [],
         previsionnels: [{ id: "p", nom: "Loisirs", montant: 60, estDepense: true }],
      })
      expect(r.chargesPayees).toBe(60)
      expect(r.revenusAffiches).toBe(1000)
   })
})
