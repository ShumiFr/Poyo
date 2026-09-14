import type { Defi } from "../types";

// Un modèle de défi proposé dans le catalogue.
export interface ModeleDefi {
   cle: string;
   nom: string;
   description: string;
   cases: number[];
}

// Suite d'entiers 1..n (ou n..1 si on la retourne).
const suite = (n: number) => Array.from({ length: n }, (_, i) => i + 1);

// Le catalogue de défis proposés à l'utilisatrice.
export const CATALOGUE: ModeleDefi[] = [
   { cle: "52sem", nom: "Défi 52 semaines", description: "1 € la 1ʳᵉ semaine, 2 € la 2ᵉ… jusqu'à 52 €. Total 1 378 €.", cases: suite(52) },
   { cle: "52sem-inv", nom: "52 semaines inversé", description: "On commence fort : 52 €, puis 51 €… Total 1 378 €.", cases: [...suite(52)].reverse() },
   { cle: "30jours", nom: "Défi 30 jours", description: "De 1 € à 30 € en un mois. Total 465 €.", cases: suite(30) },
   { cle: "100cases", nom: "100 cases", description: "De 1 € à 100 €, à cocher dans l'ordre que tu veux. Total 5 050 €.", cases: suite(100) },
];

// Progression d'un défi : combien est déjà épargné, sur combien, en %.
export function progressionDefi(defi: Pick<Defi, "cases" | "faites">) {
   const total = defi.cases.reduce((s, c) => s + c, 0);
   const epargne = defi.cases.reduce((s, c, i) => (defi.faites[i] ? s + c : s), 0);
   const pct = total > 0 ? Math.min(100, (epargne / total) * 100) : 0;
   return { epargne, total, pct };
}
