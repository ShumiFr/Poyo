import { describe, it, expect } from "vitest";
import { progressionDefi, CATALOGUE } from "./defis";

describe("progressionDefi", () => {
   it("somme les cases cochées et calcule le pourcentage", () => {
      const p = progressionDefi({ cases: [1, 2, 3, 4], faites: [true, false, true, false] });
      expect(p.epargne).toBe(4);   // 1 + 3
      expect(p.total).toBe(10);
      expect(p.pct).toBe(40);
   });

   it("vaut 0 % quand rien n'est coché", () => {
      const p = progressionDefi({ cases: [5, 10], faites: [false, false] });
      expect(p.epargne).toBe(0);
      expect(p.pct).toBe(0);
   });
});

describe("catalogue", () => {
   it("le défi 52 semaines totalise 1378 € sur 52 cases", () => {
      const d = CATALOGUE.find((m) => m.cle === "52sem")!;
      expect(d.cases).toHaveLength(52);
      expect(d.cases.reduce((s, c) => s + c, 0)).toBe(1378);
   });
});
