export interface Revenu {
   id: string
   nom: string
   montant: number
   type: 'regulier' | 'ponctuel'
   estRecu: boolean
}

export interface Depense {
   id: string
   nom: string
   montant: number
   type: 'regulier' | 'ponctuel'
   estPaye: boolean
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

export interface Flux {
   id: string
   date: Date
   nom: string
   montant: number
   type: 'depense' | 'revenu' | 'enveloppeEntrant' | 'enveloppeSortant' | 'voeuEntrant' | 'voeuSortant'
}