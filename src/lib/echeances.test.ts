import { describe, it, expect } from "vitest";
import { statutEcheance, facturesASurveiller } from "./echeances";
import type { Depense } from "../types";

// On fige « aujourd'hui » au 10 du mois pour des tests stables.
const le10 = new Date(2026, 8, 10);

const charge = (jour: number | undefined, estPayer = false): Depense => ({
   id: crypto.randomUUID(), nom: "x", montant: 50, type: "regulier", estPayer, jourEcheance: jour,
});

describe("statutEcheance", () => {
   it("est en retard quand le jour est déjà passé", () => {
      expect(statutEcheance(5, le10)).toBe("enRetard");
   });
   it("est bientôt dans les 5 jours (aujourd'hui inclus)", () => {
      expect(statutEcheance(10, le10)).toBe("bientot");
      expect(statutEcheance(12, le10)).toBe("bientot");
   });
   it("est à venir au-delà de la fenêtre", () => {
      expect(statutEcheance(20, le10)).toBe("aVenir");
   });
});

describe("facturesASurveiller", () => {
   it("ne garde que les charges régulières non payées avec échéance, réparties", () => {
      const depenses: Depense[] = [
         charge(5),                 // en retard
         charge(12),                // bientôt
         charge(25),                // à venir → ignorée
         charge(3, true),           // payée → ignorée
         charge(undefined),         // sans échéance → ignorée
         { id: "p", nom: "Resto", montant: 20, type: "occasionnel", estPayer: true }, // ponctuelle → ignorée
      ];
      const { enRetard, bientot } = facturesASurveiller(depenses, le10);
      expect(enRetard).toHaveLength(1);
      expect(bientot).toHaveLength(1);
      expect(enRetard[0].jourEcheance).toBe(5);
      expect(bientot[0].jourEcheance).toBe(12);
   });
});
