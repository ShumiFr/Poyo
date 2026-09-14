import { describe, it, expect } from "vitest";
import { serieMensuelle, repartitionDepenses } from "./stats";
import type { MoisBudget } from "../types";

const mois = (patch: Partial<MoisBudget> = {}): MoisBudget => ({
   mois: 5, annee: 2026, soldeReporte: 0, compte: 0,
   revenus: [], depenses: [], enveloppes: [], voeux: [], courses: [], previsionnels: [],
   ...patch,
});

describe("serieMensuelle", () => {
   it("ne garde que les 6 mois les plus récents", () => {
      const liste = Array.from({ length: 9 }, (_, i) => mois({ mois: i }));
      const serie = serieMensuelle(liste);
      expect(serie).toHaveLength(6);
      expect(serie[0].mois).toBe(3);   // le 4e (les 3 premiers sont coupés)
      expect(serie[5].mois).toBe(8);
   });

   it("calcule revenus, dépenses, solde et épargne d'un mois", () => {
      // compte cohérent : 0 (report) + 1000 (reçu) − 300 (charge) − 80 (courses) = 620
      const m = mois({
         compte: 620,
         revenus: [{ id: "r", nom: "Salaire", montant: 1000, type: "regulier", estRecu: true }],
         depenses: [{ id: "d", nom: "Loyer", montant: 300, type: "regulier", estPayer: true }],
         courses: [{ budget: 80, faite: true }],
         enveloppes: [{ id: "e", nom: "Voiture", montant: 120, couleur: "navy", icone: "car" }],
         voeux: [{ id: "v", nom: "Vacances", montantTotal: 500, montantActuel: 150, estTermine: false }],
      });
      const [s] = serieMensuelle([m]);
      expect(s.revenus).toBe(1000);
      expect(s.depenses).toBe(380);   // 300 charge + 80 courses faites
      expect(s.solde).toBe(620);
      expect(s.epargne).toBe(270);    // 120 enveloppe + 150 vœu
   });
});

describe("repartitionDepenses", () => {
   it("ne compte que ce qui est réellement sorti (payé / fait / dépensé)", () => {
      const m = mois({
         depenses: [
            { id: "a", nom: "Loyer", montant: 300, type: "regulier", estPayer: true },
            { id: "b", nom: "EDF", montant: 90, type: "regulier", estPayer: false },   // non payée → ignorée
            { id: "c", nom: "Resto", montant: 40, type: "occasionnel", estPayer: true },
         ],
         courses: [{ budget: 80, faite: true }, { budget: 80, faite: false }],
         previsionnels: [{ id: "p", nom: "Loisirs", montant: 60, estDepense: true }],
      });
      const rep = repartitionDepenses(m);
      expect(rep.regulieres).toBe(300);
      expect(rep.ponctuelles).toBe(40);
      expect(rep.courses).toBe(80);       // seule la semaine faite
      expect(rep.previsionnel).toBe(60);
   });
});
