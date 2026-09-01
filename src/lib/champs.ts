import type { ChampConfig } from "../components/Form"
import type { Enveloppe } from "../types"
import format from "./format"

// Édition simple (nom + montant) : revenu, dépense, prévisionnel…
export const champsNomMontant: ChampConfig[] = [
   { type: "texte", cle: "nom", label: "Nom" },
   { type: "montant", cle: "montant", label: "Montant" },
]

export const champsRevenu: ChampConfig[] = [
   { type: "texte", cle: "nom", label: "Nom", placeholder: "Ex. Prime" },
   { type: "type", cle: "type" },
   { type: "montant", cle: "montant", label: "Montant", placeholder: "0" },
]

export function champsDepense(enveloppes: Enveloppe[]): ChampConfig[] {
   return [
      { type: "texte", cle: "nom", label: "Nom", placeholder: "Ex. Salle de sport" },
      { type: "type", cle: "type", rouge: true },
      { type: "montant", cle: "montant", label: "Montant", placeholder: "0" },
      {
         type: "select", cle: "source", label: "Payer depuis", options: [
            { valeur: "plus-tard", libelle: "Plus tard (charge à pointer)" },
            { valeur: "compte", libelle: "Le compte (maintenant)" },
            ...enveloppes.map((e) => ({ valeur: e.id, libelle: "Enveloppe " + e.nom + " · " + format(e.montant) })),
         ]
      },
   ]
}

export const champsVoeu: ChampConfig[] = [
   { type: "texte", cle: "nom", label: "Nom", placeholder: "Ex. Nouveau vélo" },
   { type: "montant", cle: "objectif", label: "Objectif", placeholder: "0" },
]

export function champsEnveloppe(edition: boolean): ChampConfig[] {
   const champs: ChampConfig[] = [
      { type: "texte", cle: "nom", label: "Nom", placeholder: "Ex. Vacances" },
      { type: "couleur", cle: "couleur" },
      { type: "icone", cle: "icone" },
   ]
   // Le montant de départ ne se saisit qu'à la création.
   if (!edition) champs.push({ type: "montant", cle: "montant", label: "Montant de départ (optionnel)", placeholder: "0" })
   return champs
}
