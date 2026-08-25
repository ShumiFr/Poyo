import { describe, it, expect } from "vitest"
import calculerDisponible from "./calculs"
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
})
