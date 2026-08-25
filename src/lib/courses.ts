import type { SemaineCourses } from "../types"

export const BUDGET_SEMAINE_DEFAUT = 25

// Nombre de semaines du mois = nombre de blocs de 7 jours (4 ou 5).
export function nombreDeSemaines(mois: number, annee: number): number {
   const jours = new Date(annee, mois + 1, 0).getDate() // dernier jour du mois
   return Math.ceil(jours / 7)
}

// Génère les semaines du mois, toutes « non faites », au budget par défaut.
export function genererSemaines(mois: number, annee: number, budget = BUDGET_SEMAINE_DEFAUT): SemaineCourses[] {
   return Array.from({ length: nombreDeSemaines(mois, annee) }, () => ({ budget, faite: false }))
}

// Réserve courses = budget des semaines non encore faites (compte dans le « à venir »).
export function reserveCourses(courses: SemaineCourses[]): number {
   return courses.filter((s) => !s.faite).reduce((somme, s) => somme + s.budget, 0)
}
