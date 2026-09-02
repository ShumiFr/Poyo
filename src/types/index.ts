export type Frequence = 'regulier' | 'occasionnel'

export type TypeAction = 'depense' | 'revenu' | 'enveloppeEntrant' | 'enveloppeSortant' | 'voeuEntrant' | 'voeuSortant'

export interface Revenu {
   id: string
   nom: string
   montant: number
   type: Frequence
   estRecu: boolean
   dateRecu?: string   // date de réception (ISO), remplie quand on marque « reçu »
}

export interface Depense {
   id: string
   nom: string
   montant: number
   type: Frequence
   estPayer: boolean
}

export interface Enveloppe {
   id: string
   nom: string
   montant: number
   couleur: string
   icone: string
}

export interface Voeu {
   id: string
   nom: string,
   montantTotal: number
   montantActuel: number
   estTermine: boolean
}

export interface SemaineCourses {
   budget: number
   faite: boolean
}

// Compte épargne : purement informatif, sans lien avec les calculs du budget.
export interface CompteEpargne {
   id: string
   nom: string
   montant: number
}

export interface Previsionnel {
   id: string
   nom: string
   montant: number
   estDepense: boolean
}

export interface Flux {
   id: string
   date: Date
   nom: string
   montant: number
   type: TypeAction
   refId?: string   // enveloppe/vœu concerné, pour un historique par carte
}