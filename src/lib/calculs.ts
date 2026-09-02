import type { Depense, Enveloppe, Previsionnel, Revenu, SemaineCourses, Voeu } from "../types";
import { reserveCourses } from "./courses";

// Toutes les données d'un mois dont on a besoin pour son récap (accueil + calendrier).
export interface DonneesMois {
   compte: number
   soldeReporte: number
   revenus: Revenu[]
   depenses: Depense[]
   enveloppes: Enveloppe[]
   voeux: Voeu[]
   courses: SemaineCourses[]
   previsionnels: Previsionnel[]
}

// Calcule les lignes du récap d'un mois. Sert à l'accueil et à un mois archivé.
export function calculerRecap(d: DonneesMois) {
   const revenusPercus = d.revenus.filter((r) => r.estRecu).reduce((s, r) => s + r.montant, 0)
   // Charges payées = charges cochées + courses faites + prévisionnels dépensés :
   // tout ce qui est déjà sorti du compte ce mois-ci.
   const coursesFaites = d.courses.filter((c) => c.faite).reduce((s, c) => s + c.budget, 0)
   const previsionnelDepense = d.previsionnels.filter((p) => p.estDepense).reduce((s, p) => s + p.montant, 0)
   const chargesPayees =
      d.depenses.filter((x) => x.estPayer).reduce((s, x) => s + x.montant, 0) + coursesFaites + previsionnelDepense
   const previsionnelPrevu = d.previsionnels.filter((p) => !p.estDepense).reduce((s, p) => s + p.montant, 0)
   const chargesAVenir = d.depenses.filter((x) => !x.estPayer).reduce((s, x) => s + x.montant, 0) + reserveCourses(d.courses) + previsionnelPrevu
   const totalEnveloppes = d.enveloppes.reduce((s, e) => s + e.montant, 0)
   const totalVoeux = d.voeux.reduce((s, v) => s + v.montantActuel, 0)

   // Écart entre le compte réel et sa reconstitution → le récap boucle toujours.
   const autresEntrees = d.compte - (d.soldeReporte + revenusPercus - chargesPayees)
   const revenusAffiches = revenusPercus + autresEntrees

   const reste = calculerDisponible(d.compte, d.depenses, d.enveloppes, d.voeux, d.courses, d.previsionnels)

   return { revenusAffiches, chargesPayees, chargesAVenir, totalEnveloppes, totalVoeux, reste }
}

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
