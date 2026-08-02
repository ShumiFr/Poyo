import type { Depense, Enveloppe, Voeu } from "../types";

export default function calculerDisponible(compte: number, depenses: Depense[], enveloppes: Enveloppe[], voeux: Voeu[]) {
   const totalDepenses = depenses.filter(d => !d.estPayer).reduce((somme, d) => somme + d.montant, 0)
   const totalEnveloppes = enveloppes.reduce((somme, e) => somme + e.montant, 0)
   const totalVoeux = voeux.reduce((somme, v) => somme + v.montantActuel, 0)

   const total = compte - totalDepenses - totalEnveloppes - totalVoeux

   return total
}
