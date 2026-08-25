export type Frequence = 'regulier' | 'occasionnel'

export type TypeAction = 'depense' | 'revenu' | 'enveloppeEntrant' | 'enveloppeSortant' | 'voeuEntrant' | 'voeuSortant'

export interface Revenu {
   id: string
   nom: string
   montant: number
   type: Frequence
   estRecu: boolean
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

export interface Flux {
   id: string
   date: Date
   nom: string
   montant: number
   type: TypeAction
   refId?: string   // enveloppe/vœu concerné, pour un historique par carte
}