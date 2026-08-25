import type { Depense, Enveloppe, Previsionnel, SemaineCourses, Voeu } from "../types";
import { reserveCourses } from "./courses";

export default function calculerDisponible(
   compte: number,
   depenses: Depense[],
   enveloppes: Enveloppe[],
   voeux: Voeu[],
   courses: SemaineCourses[] = [],
   previsionnels: Previsionnel[] = [],
) {
   const totalDepenses = depenses.filter(d => !d.estPayer).reduce((somme, d) => somme + d.montant, 0)
   const totalEnveloppes = enveloppes.reduce((somme, e) => somme + e.montant, 0)
   const totalVoeux = voeux.reduce((somme, v) => somme + v.montantActuel, 0)
   const totalPrevu = previsionnels.filter(p => !p.estDepense).reduce((somme, p) => somme + p.montant, 0)

   return compte - totalDepenses - reserveCourses(courses) - totalPrevu - totalEnveloppes - totalVoeux
}
