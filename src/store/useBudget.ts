import { create } from "zustand";
import type { CompteEpargne, Depense, Enveloppe, Flux, Frequence, Previsionnel, Revenu, SemaineCourses, TypeAction, Voeu } from "../types";
import { genererSemaines } from "../lib/courses";

// Valeurs de départ d'un budget vierge (nouvel utilisateur, ou après déconnexion).
// Plus aucune donnée en dur : tout vient désormais de la base (Supabase).
function donneesInitiales() {
   const mois = new Date().getMonth();
   const annee = new Date().getFullYear();
   return {
      compte: 0,
      soldeReporte: 0,
      mois,
      annee,
      theme: "sombre" as const,
      revenus: [] as Revenu[],
      depenses: [] as Depense[],
      enveloppes: [] as Enveloppe[],
      voeux: [] as Voeu[],
      courses: genererSemaines(mois, annee),
      previsionnels: [] as Previsionnel[],
      historique: [] as Flux[],
      comptesEpargne: [] as CompteEpargne[],
      codePin: undefined as string | undefined,
   };
}

export interface BudgetStore {
   compte: number,
   soldeReporte: number,
   mois: number,
   annee: number,
   theme: 'sombre' | 'clair',
   revenus: Revenu[],
   depenses: Depense[],
   enveloppes: Enveloppe[],
   voeux: Voeu[],
   courses: SemaineCourses[],
   previsionnels: Previsionnel[],
   historique: Flux[]
   comptesEpargne: CompteEpargne[]
   codePin?: string   // empreinte (hachée) du code de verrouillage, ou absent si désactivé

   //Réinitialisation (déconnexion)
   reinitialiser: () => void

   //Thème
   basculerTheme: () => void

   //Mois
   nouveauMois: (soldeReel: number) => void

   //Courses (D7)
   ajusterSemaine: (index: number, delta: number) => void
   definirBudgetSemaine: (index: number, montant: number) => void
   basculerSemaineFaite: (index: number) => void

   //Prévisionnel (D6)
   ajouterPrevisionnel: (nom: string, montant: number) => void
   retirerPrevisionnel: (id: string) => void
   ajusterPrevisionnel: (id: string, delta: number) => void
   basculerPrevisionnelDepense: (id: string) => void

   //Historique
   ajouterMouvement: (nom: string, montant: number, type: TypeAction, refId?: string) => void

   //Comptes
   ajouterAuCompte: (montant: number) => void

   //Revenus
   ajouterRevenu: (revenu: Revenu) => void
   retirerRevenu: (id: string) => void
   marquerRecu: (id: string) => void
   modifierRevenu: (id: string, nom: string, montant: number) => void

   //Depenses
   ajouterDepense: (depense: Depense) => void
   retirerDepense: (id: string) => void
   marquerPayer: (id: string) => void
   modifierDepense: (id: string, nom: string, montant: number) => void
   // dépense immédiate : source = "compte" ou l'id d'une enveloppe
   depenserImmediat: (nom: string, montant: number, type: Frequence, source: string) => void

   //Enveloppes
   ajouterEnveloppe: (enveloppe: Enveloppe) => void
   modifierEnveloppe: (id: string, nom: string, couleur: string, icone: string) => void
   ajouterArgentEnveloppe: (id: string, montant: number) => void
   retirerArgentEnveloppe: (id: string, montant: number) => void
   depenserDepuisEnveloppe: (id: string, montant: number) => void

   //Comptes épargne (informatif, sans lien avec le budget)
   ajouterCompteEpargne: (nom: string, montant: number) => void
   modifierCompteEpargne: (id: string, nom: string, montant: number) => void
   retirerCompteEpargne: (id: string) => void

   //Verrou (code PIN)
   definirCodePin: (hash: string) => void
   retirerCodePin: () => void

   //Voeux
   ajouterVoeu: (voeu: Voeu) => void
   ajouterArgentVoeu: (id: string, montant: number) => void
   retirerArgentVoeu: (id: string, montant: number) => void
   acheterVoeu: (id: string, montantReel: number) => void
}

export const useBudget = create<BudgetStore>()((set, get) => ({
   ...donneesInitiales(),

   // Remet un budget vierge (on garde le thème, qui est une préférence d'affichage).
   reinitialiser: () => set((state) => ({ ...donneesInitiales(), theme: state.theme })),

   basculerTheme: () =>
      set((state) => ({ theme: state.theme === 'sombre' ? 'clair' : 'sombre' })),

   nouveauMois: (soldeReel) => {
      // Écart entre le solde réel confirmé et celui suivi par l'app.
      const ecart = soldeReel - get().compte
      if (ecart !== 0) {
         get().ajouterMouvement("Ajustement de solde", Math.abs(ecart), ecart > 0 ? "revenu" : "depense")
      }
      set((state) => {
         const nouveauMoisIndex = (state.mois + 1) % 12
         const nouvelleAnnee = state.mois === 11 ? state.annee + 1 : state.annee
         return {
            mois: nouveauMoisIndex,
            annee: nouvelleAnnee,
            // le solde réel confirmé devient le compte et le solde reporté du nouveau mois
            compte: soldeReel,
            soldeReporte: soldeReel,
            // les charges et revenus repassent à payer / recevoir
            depenses: state.depenses.map((d) => ({ ...d, estPayer: false })),
            revenus: state.revenus.map((r) => ({ ...r, estRecu: false })),
            // les semaines de courses sont régénérées pour le nouveau mois
            courses: genererSemaines(nouveauMoisIndex, nouvelleAnnee),
            // les budgets prévisionnels repassent « non dépensés » (montant conservé)
            previsionnels: state.previsionnels.map((p) => ({ ...p, estDepense: false })),
            // enveloppes, vœux et historique sont conservés
         }
      })
   },

   ajusterSemaine: (index, delta) =>
      set((state) => ({
         courses: state.courses.map((s, i) =>
            i === index ? { ...s, budget: Math.max(0, s.budget + delta) } : s
         )
      })),

   definirBudgetSemaine: (index, montant) =>
      set((state) => ({
         courses: state.courses.map((s, i) =>
            i === index ? { ...s, budget: Math.max(0, montant) } : s
         )
      })),

   basculerSemaineFaite: (index) => {
      const semaine = get().courses[index]
      if (!semaine) return
      const devientFaite = !semaine.faite
      set((state) => ({
         courses: state.courses.map((s, i) =>
            i === index ? { ...s, faite: devientFaite } : s
         ),
         compte: devientFaite ? state.compte - semaine.budget : state.compte + semaine.budget,
      }))
      get().ajouterMouvement(
         devientFaite ? "Courses semaine " + (index + 1) : "Annulation — Courses semaine " + (index + 1),
         semaine.budget,
         devientFaite ? "depense" : "revenu"
      )
   },

   ajouterPrevisionnel: (nom, montant) =>
      set((state) => ({
         previsionnels: [...state.previsionnels, { id: crypto.randomUUID(), nom, montant, estDepense: false }]
      })),

   retirerPrevisionnel: (id) =>
      set((state) => ({
         previsionnels: state.previsionnels.filter((p) => p.id !== id)
      })),

   ajusterPrevisionnel: (id, delta) =>
      set((state) => ({
         previsionnels: state.previsionnels.map((p) =>
            p.id === id ? { ...p, montant: Math.max(0, p.montant + delta) } : p
         )
      })),

   basculerPrevisionnelDepense: (id) => {
      const prev = get().previsionnels.find((p) => p.id === id)
      if (!prev) return
      const devientDepense = !prev.estDepense
      set((state) => ({
         previsionnels: state.previsionnels.map((p) =>
            p.id === id ? { ...p, estDepense: devientDepense } : p
         ),
         compte: devientDepense ? state.compte - prev.montant : state.compte + prev.montant,
      }))
      get().ajouterMouvement(
         devientDepense ? prev.nom : "Annulation — " + prev.nom,
         prev.montant,
         devientDepense ? "depense" : "revenu"
      )
   },

   ajouterMouvement: (nom, montant, type, refId) =>
      set((state) => ({
         historique: [
            { id: crypto.randomUUID(), date: new Date(), nom, montant, type, refId },
            ...state.historique,
         ]
      })),

   ajouterAuCompte: (montant) => {
      set((state) => ({ compte: state.compte + montant }))
      get().ajouterMouvement("Entrée d'argent", montant, "revenu")
   },

   ajouterRevenu: (revenu) =>
      set((state) => ({
         revenus: [...state.revenus, revenu]
      })),

   retirerRevenu: (id) =>
      set((state) => ({
         revenus: state.revenus.filter((revenu) => revenu.id !== id)
      })),

   marquerRecu: (id) => {
      const revenu = get().revenus.find((r) => r.id === id)
      if (!revenu) return
      const devientRecu = !revenu.estRecu
      set((state) => ({
         revenus: state.revenus.map((r) =>
            r.id === id
               ? { ...r, estRecu: devientRecu, dateRecu: devientRecu ? new Date().toISOString() : undefined }
               : r
         ),
         compte: devientRecu
            ? state.compte + revenu.montant
            : state.compte - revenu.montant,
      }))
      get().ajouterMouvement(
         devientRecu ? revenu.nom : "Annulation — " + revenu.nom,
         revenu.montant,
         devientRecu ? "revenu" : "depense"
      )
   },

   modifierRevenu: (id, nom, montant) =>
      set((state) => ({
         revenus: state.revenus.map((r) =>
            r.id === id ? { ...r, nom, montant } : r
         )
      })),

   ajouterDepense: (depense) =>
      set((state) => ({
         depenses: [...state.depenses, depense]
      })),

   retirerDepense: (id) =>
      set((state) => ({
         depenses: state.depenses.filter((depense) => depense.id !== id)
      })),

   modifierDepense: (id, nom, montant) =>
      set((state) => ({
         depenses: state.depenses.map((d) =>
            d.id === id ? { ...d, nom, montant } : d
         )
      })),

   depenserImmediat: (nom, montant, type, source) => {
      // On garde une trace sous forme de dépense déjà payée (grisée)
      const depense: Depense = { id: crypto.randomUUID(), nom, montant, type, estPayer: true }
      set((state) => ({ depenses: [...state.depenses, depense] }))
      if (source === "compte") {
         set((state) => ({ compte: state.compte - montant }))
         get().ajouterMouvement(nom, montant, "depense")
      } else {
         // source = id d'une enveloppe : l'argent sort de l'enveloppe ET du compte
         get().depenserDepuisEnveloppe(source, montant)
      }
   },

   marquerPayer: (id) => {
      const depense = get().depenses.find((d) => d.id === id)
      if (!depense) return
      const devientPayee = !depense.estPayer
      set((state) => ({
         depenses: state.depenses.map((d) =>
            d.id === id ? { ...d, estPayer: devientPayee } : d
         ),
         compte: devientPayee
            ? state.compte - depense.montant
            : state.compte + depense.montant,
      }))
      get().ajouterMouvement(
         devientPayee ? depense.nom : "Annulation — " + depense.nom,
         depense.montant,
         devientPayee ? "depense" : "revenu"
      )
   },

   ajouterEnveloppe: (enveloppe) =>
      set((state) => ({
         enveloppes: [...state.enveloppes, enveloppe]
      })),

   modifierEnveloppe: (id, nom, couleur, icone) =>
      set((state) => ({
         enveloppes: state.enveloppes.map((e) =>
            e.id === id ? { ...e, nom, couleur, icone } : e
         )
      })),

   ajouterArgentEnveloppe: (id, montant) => {
      set((state) => ({
         enveloppes: state.enveloppes.map((enveloppe) =>
            enveloppe.id === id
               ? { ...enveloppe, montant: enveloppe.montant + montant }
               : enveloppe
         )
      }))
      const enveloppe = get().enveloppes.find((e) => e.id === id)
      get().ajouterMouvement(enveloppe?.nom ?? "Enveloppe", montant, "enveloppeEntrant", id)
   },

   retirerArgentEnveloppe: (id, montant) => {
      set((state) => ({
         enveloppes: state.enveloppes.map((enveloppe) =>
            enveloppe.id === id
               ? { ...enveloppe, montant: Math.max(0, enveloppe.montant - montant) }
               : enveloppe
         )
      }))
      const enveloppe = get().enveloppes.find((e) => e.id === id)
      get().ajouterMouvement(enveloppe?.nom ?? "Enveloppe", montant, "enveloppeSortant", id)
   },

   depenserDepuisEnveloppe: (id, montant) => {
      const enveloppe = get().enveloppes.find((e) => e.id === id)
      if (!enveloppe) return
      // On ne dépense jamais plus que le contenu de l'enveloppe.
      const sortie = Math.min(montant, enveloppe.montant)
      set((state) => ({
         // l'argent quitte l'enveloppe ET le compte (le disponible ne bouge pas)
         compte: state.compte - sortie,
         enveloppes: state.enveloppes.map((e) =>
            e.id === id ? { ...e, montant: e.montant - sortie } : e
         ),
      }))
      get().ajouterMouvement(enveloppe.nom, sortie, "depense", id)
   },

   ajouterCompteEpargne: (nom, montant) =>
      set((state) => ({
         comptesEpargne: [...state.comptesEpargne, { id: crypto.randomUUID(), nom, montant }]
      })),

   modifierCompteEpargne: (id, nom, montant) =>
      set((state) => ({
         comptesEpargne: state.comptesEpargne.map((c) =>
            c.id === id ? { ...c, nom, montant } : c
         )
      })),

   retirerCompteEpargne: (id) =>
      set((state) => ({
         comptesEpargne: state.comptesEpargne.filter((c) => c.id !== id)
      })),

   definirCodePin: (hash) => set({ codePin: hash }),
   retirerCodePin: () => set({ codePin: undefined }),

   ajouterVoeu: (voeu) =>
      set((state) => ({
         voeux: [...state.voeux, voeu]
      })),

   ajouterArgentVoeu: (id, montant) => {
      set((state) => ({
         voeux: state.voeux.map((voeu) =>
            voeu.id === id
               ? { ...voeu, montantActuel: voeu.montantActuel + montant }
               : voeu
         )
      }))
      const voeu = get().voeux.find((v) => v.id === id)
      get().ajouterMouvement(voeu?.nom ?? "Vœu", montant, "voeuEntrant", id)
   },

   retirerArgentVoeu: (id, montant) => {
      set((state) => ({
         voeux: state.voeux.map((voeu) =>
            voeu.id === id
               ? { ...voeu, montantActuel: Math.max(0, voeu.montantActuel - montant) }
               : voeu
         )
      }))
      const voeu = get().voeux.find((v) => v.id === id)
      get().ajouterMouvement(voeu?.nom ?? "Vœu", montant, "voeuSortant", id)
   },

   acheterVoeu: (id, montantReel) => {
      const voeu = get().voeux.find((v) => v.id === id)
      if (!voeu) return
      set((state) => ({
         // le montant réel sort du compte ; l'écart avec l'épargne se rectifie tout seul via le disponible
         compte: state.compte - montantReel,
         voeux: state.voeux.map((v) =>
            v.id === id ? { ...v, montantActuel: 0, estTermine: true } : v
         ),
      }))
      get().ajouterMouvement("Achat — " + voeu.nom, montantReel, "depense", id)
   }
}))