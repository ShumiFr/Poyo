import { create } from "zustand";
import type { CompteEpargne, Depense, Enveloppe, Flux, Frequence, MoisBudget, Revenu, TypeAction, Voeu } from "../types";
import { genererSemaines } from "../lib/courses";

// Un mois vierge (pour un nouvel utilisateur ou un tout nouveau mois).
function moisVierge(date = new Date()): MoisBudget {
   const mois = date.getMonth();
   const annee = date.getFullYear();
   return {
      mois,
      annee,
      soldeReporte: 0,
      compte: 0,
      revenus: [],
      depenses: [],
      enveloppes: [],
      voeux: [],
      courses: genererSemaines(mois, annee),
      previsionnels: [],
   };
}

// Valeurs de départ d'un budget vierge (nouvel utilisateur, ou après déconnexion).
// Le budget est une LISTE de mois + l'index du mois affiché. Le reste est global.
function donneesInitiales() {
   return {
      moisListe: [moisVierge()] as MoisBudget[],
      indexActif: 0,
      theme: "sombre" as const,
      historique: [] as Flux[],
      comptesEpargne: [] as CompteEpargne[],
      codePin: undefined as string | undefined,
   };
}

// Le mois actuellement affiché (celui que toutes les pages lisent).
export function moisActif(state: BudgetStore): MoisBudget {
   return state.moisListe[state.indexActif];
}

// Calcule, pour chaque élément (enveloppe ou vœu) présent avant ET après,
// de combien son solde a bougé. Sert à reporter l'écart sur les mois suivants.
function deltasParId<T extends { id: string }>(
   avant: T[],
   apres: T[],
   valeur: (x: T) => number,
): Record<string, number> {
   const deltas: Record<string, number> = {};
   for (const a of apres) {
      const av = avant.find((x) => x.id === a.id);
      if (av) {
         const delta = valeur(a) - valeur(av);
         if (delta !== 0) deltas[a.id] = delta;
      }
   }
   return deltas;
}

// Applique un changement au mois affiché, PUIS répercute l'écart de solde sur
// tous les mois suivants (effet domino). Si on modifie le mois en cours (le
// dernier), il n'y a aucun mois après : rien ne se propage.
function majActif(state: BudgetStore, patch: Partial<MoisBudget>) {
   const idx = state.indexActif;
   const ancien = state.moisListe[idx];
   const nouveau = { ...ancien, ...patch };

   // Écarts de solde qui se reportent d'un mois sur l'autre.
   const dCompte = nouveau.compte - ancien.compte;
   const dEnv = deltasParId(ancien.enveloppes, nouveau.enveloppes, (e) => e.montant);
   const dVoeu = deltasParId(ancien.voeux, nouveau.voeux, (v) => v.montantActuel);

   const moisListe = state.moisListe.map((m, i) => {
      if (i < idx) return m;         // mois plus anciens : inchangés
      if (i === idx) return nouveau; // le mois modifié
      // mois suivants : on décale leurs soldes du même écart
      return {
         ...m,
         soldeReporte: m.soldeReporte + dCompte,
         compte: m.compte + dCompte,
         enveloppes: m.enveloppes.map((e) => e.id in dEnv ? { ...e, montant: e.montant + dEnv[e.id] } : e),
         voeux: m.voeux.map((v) => v.id in dVoeu ? { ...v, montantActuel: v.montantActuel + dVoeu[v.id] } : v),
      };
   });

   return { moisListe };
}

export interface BudgetStore {
   moisListe: MoisBudget[]      // tous les mois, du plus ancien au plus récent
   indexActif: number           // le mois affiché (le dernier = le mois en cours)
   theme: 'sombre' | 'clair'
   historique: Flux[]
   comptesEpargne: CompteEpargne[]
   codePin?: string   // empreinte (hachée) du code de verrouillage, ou absent si désactivé

   //Réinitialisation (déconnexion)
   reinitialiser: () => void

   //Thème
   basculerTheme: () => void

   //Navigation entre les mois (calendrier)
   moisPrecedent: () => void
   moisSuivant: () => void
   allerAuMois: (mois: number, annee: number) => void   // saut direct depuis le sélecteur

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

   // On recule dans le temps. Si on est déjà au tout premier mois de la liste,
   // on crée un mois vierge juste avant (tout à 0 : à cette époque, rien n'existait).
   moisPrecedent: () =>
      set((state) => {
         if (state.indexActif > 0) return { indexActif: state.indexActif - 1 };
         const premier = state.moisListe[0];
         const moisIndex = (premier.mois + 11) % 12;
         const annee = premier.mois === 0 ? premier.annee - 1 : premier.annee;
         const vide: MoisBudget = {
            mois: moisIndex, annee,
            soldeReporte: 0, compte: 0,
            revenus: [], depenses: [], enveloppes: [], voeux: [], courses: [], previsionnels: [],
         };
         return { moisListe: [vide, ...state.moisListe], indexActif: 0 };
      }),

   // On avance, mais jamais au-delà du mois en cours (le dernier de la liste).
   moisSuivant: () =>
      set((state) => ({ indexActif: Math.min(state.moisListe.length - 1, state.indexActif + 1) })),

   // Saut direct à un mois/année (depuis le sélecteur). S'il est avant le premier
   // mois de la liste, on comble le trou avec des mois vierges pour rester continu.
   // On ne va jamais après le mois en cours (le sélecteur l'interdit déjà).
   allerAuMois: (mois, annee) =>
      set((state) => {
         const cle = (m: MoisBudget) => m.annee * 12 + m.mois;
         const cible = annee * 12 + mois;

         const idx = state.moisListe.findIndex((m) => cle(m) === cible);
         if (idx !== -1) return { indexActif: idx };   // le mois existe déjà

         const premier = state.moisListe[0];
         if (cible >= cle(premier)) return {};   // pas trouvé mais pas avant le début : on ne touche à rien

         // On crée tous les mois vierges manquants, de la cible jusqu'au premier existant.
         const vides: MoisBudget[] = [];
         for (let k = cible; k < cle(premier); k++) {
            vides.push({
               mois: ((k % 12) + 12) % 12,
               annee: Math.floor(k / 12),
               soldeReporte: 0, compte: 0,
               revenus: [], depenses: [], enveloppes: [], voeux: [], courses: [], previsionnels: [],
            });
         }
         return { moisListe: [...vides, ...state.moisListe], indexActif: 0 };
      }),

   nouveauMois: (soldeReel) => {
      // On clôture toujours le mois en cours (le dernier de la liste).
      const dernier = get().moisListe[get().moisListe.length - 1];
      const ecart = soldeReel - dernier.compte;
      if (ecart !== 0) {
         get().ajouterMouvement("Ajustement de solde", Math.abs(ecart), ecart > 0 ? "revenu" : "depense");
      }
      set((state) => {
         const ancien = state.moisListe[state.moisListe.length - 1];
         const moisIndex = (ancien.mois + 1) % 12;
         const annee = ancien.mois === 11 ? ancien.annee + 1 : ancien.annee;

         const nouveau: MoisBudget = {
            mois: moisIndex,
            annee,
            // le solde réel confirmé devient le compte et le solde reporté du nouveau mois
            soldeReporte: soldeReel,
            compte: soldeReel,
            // les charges et revenus repassent à payer / recevoir
            revenus: ancien.revenus.map((r) => ({ ...r, estRecu: false })),
            depenses: ancien.depenses.map((d) => ({ ...d, estPayer: false })),
            // enveloppes et vœux sont conservés (leur épargne se cumule)
            enveloppes: ancien.enveloppes,
            voeux: ancien.voeux,
            // les semaines de courses sont régénérées pour le nouveau mois
            courses: genererSemaines(moisIndex, annee),
            // les budgets prévisionnels repassent « non dépensés » (montant conservé)
            previsionnels: ancien.previsionnels.map((p) => ({ ...p, estDepense: false })),
         };

         const moisListe = [...state.moisListe, nouveau];
         return { moisListe, indexActif: moisListe.length - 1 };
      });
   },

   ajusterSemaine: (index, delta) =>
      set((state) => majActif(state, {
         courses: moisActif(state).courses.map((s, i) =>
            i === index ? { ...s, budget: Math.max(0, s.budget + delta) } : s
         )
      })),

   definirBudgetSemaine: (index, montant) =>
      set((state) => majActif(state, {
         courses: moisActif(state).courses.map((s, i) =>
            i === index ? { ...s, budget: Math.max(0, montant) } : s
         )
      })),

   basculerSemaineFaite: (index) => {
      const semaine = moisActif(get()).courses[index];
      if (!semaine) return;
      const devientFaite = !semaine.faite;
      set((state) => {
         const a = moisActif(state);
         return majActif(state, {
            courses: a.courses.map((s, i) => i === index ? { ...s, faite: devientFaite } : s),
            compte: devientFaite ? a.compte - semaine.budget : a.compte + semaine.budget,
         });
      });
      get().ajouterMouvement(
         devientFaite ? "Courses semaine " + (index + 1) : "Annulation — Courses semaine " + (index + 1),
         semaine.budget,
         devientFaite ? "depense" : "revenu"
      );
   },

   ajouterPrevisionnel: (nom, montant) =>
      set((state) => majActif(state, {
         previsionnels: [...moisActif(state).previsionnels, { id: crypto.randomUUID(), nom, montant, estDepense: false }]
      })),

   retirerPrevisionnel: (id) =>
      set((state) => majActif(state, {
         previsionnels: moisActif(state).previsionnels.filter((p) => p.id !== id)
      })),

   ajusterPrevisionnel: (id, delta) =>
      set((state) => majActif(state, {
         previsionnels: moisActif(state).previsionnels.map((p) =>
            p.id === id ? { ...p, montant: Math.max(0, p.montant + delta) } : p
         )
      })),

   basculerPrevisionnelDepense: (id) => {
      const prev = moisActif(get()).previsionnels.find((p) => p.id === id);
      if (!prev) return;
      const devientDepense = !prev.estDepense;
      set((state) => {
         const a = moisActif(state);
         return majActif(state, {
            previsionnels: a.previsionnels.map((p) => p.id === id ? { ...p, estDepense: devientDepense } : p),
            compte: devientDepense ? a.compte - prev.montant : a.compte + prev.montant,
         });
      });
      get().ajouterMouvement(
         devientDepense ? prev.nom : "Annulation — " + prev.nom,
         prev.montant,
         devientDepense ? "depense" : "revenu"
      );
   },

   ajouterMouvement: (nom, montant, type, refId) =>
      set((state) => ({
         historique: [
            { id: crypto.randomUUID(), date: new Date(), nom, montant, type, refId },
            ...state.historique,
         ]
      })),

   ajouterAuCompte: (montant) => {
      set((state) => majActif(state, { compte: moisActif(state).compte + montant }));
      get().ajouterMouvement("Entrée d'argent", montant, "revenu");
   },

   ajouterRevenu: (revenu) =>
      set((state) => {
         const idx = state.indexActif;
         const moisListe = state.moisListe.map((m, i) => {
            if (i < idx) return m;
            if (i === idx) return { ...m, revenus: [...m.revenus, revenu] };
            // Mois suivants : un revenu régulier se reporte, sauf si un même nom existe déjà.
            if (revenu.type !== "regulier") return m;
            if (m.revenus.some((r) => r.nom === revenu.nom)) return m;
            return { ...m, revenus: [...m.revenus, { ...revenu, id: crypto.randomUUID(), estRecu: false, dateRecu: undefined }] };
         });
         return { moisListe };
      }),

   retirerRevenu: (id) =>
      set((state) => majActif(state, {
         revenus: moisActif(state).revenus.filter((revenu) => revenu.id !== id)
      })),

   marquerRecu: (id) => {
      const revenu = moisActif(get()).revenus.find((r) => r.id === id);
      if (!revenu) return;
      const devientRecu = !revenu.estRecu;
      set((state) => {
         const a = moisActif(state);
         return majActif(state, {
            revenus: a.revenus.map((r) =>
               r.id === id
                  ? { ...r, estRecu: devientRecu, dateRecu: devientRecu ? new Date().toISOString() : undefined }
                  : r
            ),
            compte: devientRecu ? a.compte + revenu.montant : a.compte - revenu.montant,
         });
      });
      get().ajouterMouvement(
         devientRecu ? revenu.nom : "Annulation — " + revenu.nom,
         revenu.montant,
         devientRecu ? "revenu" : "depense"
      );
   },

   modifierRevenu: (id, nom, montant) =>
      set((state) => majActif(state, {
         revenus: moisActif(state).revenus.map((r) => r.id === id ? { ...r, nom, montant } : r)
      })),

   ajouterDepense: (depense) =>
      set((state) => {
         const idx = state.indexActif;
         const moisListe = state.moisListe.map((m, i) => {
            if (i < idx) return m;
            if (i === idx) return { ...m, depenses: [...m.depenses, depense] };
            // Mois suivants : une charge régulière se reporte, sauf si un même nom existe déjà.
            if (depense.type !== "regulier") return m;
            if (m.depenses.some((d) => d.nom === depense.nom)) return m;
            return { ...m, depenses: [...m.depenses, { ...depense, id: crypto.randomUUID(), estPayer: false }] };
         });
         return { moisListe };
      }),

   retirerDepense: (id) =>
      set((state) => majActif(state, {
         depenses: moisActif(state).depenses.filter((depense) => depense.id !== id)
      })),

   modifierDepense: (id, nom, montant) =>
      set((state) => majActif(state, {
         depenses: moisActif(state).depenses.map((d) => d.id === id ? { ...d, nom, montant } : d)
      })),

   depenserImmediat: (nom, montant, type, source) => {
      // On garde une trace sous forme de dépense déjà payée (grisée)
      const depense: Depense = { id: crypto.randomUUID(), nom, montant, type, estPayer: true };
      set((state) => majActif(state, { depenses: [...moisActif(state).depenses, depense] }));
      if (source === "compte") {
         set((state) => majActif(state, { compte: moisActif(state).compte - montant }));
         get().ajouterMouvement(nom, montant, "depense");
      } else {
         // source = id d'une enveloppe : l'argent sort de l'enveloppe ET du compte
         get().depenserDepuisEnveloppe(source, montant);
      }
   },

   marquerPayer: (id) => {
      const depense = moisActif(get()).depenses.find((d) => d.id === id);
      if (!depense) return;
      const devientPayee = !depense.estPayer;
      set((state) => {
         const a = moisActif(state);
         return majActif(state, {
            depenses: a.depenses.map((d) => d.id === id ? { ...d, estPayer: devientPayee } : d),
            compte: devientPayee ? a.compte - depense.montant : a.compte + depense.montant,
         });
      });
      get().ajouterMouvement(
         devientPayee ? depense.nom : "Annulation — " + depense.nom,
         depense.montant,
         devientPayee ? "depense" : "revenu"
      );
   },

   ajouterEnveloppe: (enveloppe) =>
      set((state) => majActif(state, {
         enveloppes: [...moisActif(state).enveloppes, enveloppe]
      })),

   modifierEnveloppe: (id, nom, couleur, icone) =>
      set((state) => majActif(state, {
         enveloppes: moisActif(state).enveloppes.map((e) => e.id === id ? { ...e, nom, couleur, icone } : e)
      })),

   ajouterArgentEnveloppe: (id, montant) => {
      set((state) => majActif(state, {
         enveloppes: moisActif(state).enveloppes.map((enveloppe) =>
            enveloppe.id === id ? { ...enveloppe, montant: enveloppe.montant + montant } : enveloppe
         )
      }));
      const enveloppe = moisActif(get()).enveloppes.find((e) => e.id === id);
      get().ajouterMouvement(enveloppe?.nom ?? "Enveloppe", montant, "enveloppeEntrant", id);
   },

   retirerArgentEnveloppe: (id, montant) => {
      set((state) => majActif(state, {
         enveloppes: moisActif(state).enveloppes.map((enveloppe) =>
            enveloppe.id === id ? { ...enveloppe, montant: Math.max(0, enveloppe.montant - montant) } : enveloppe
         )
      }));
      const enveloppe = moisActif(get()).enveloppes.find((e) => e.id === id);
      get().ajouterMouvement(enveloppe?.nom ?? "Enveloppe", montant, "enveloppeSortant", id);
   },

   depenserDepuisEnveloppe: (id, montant) => {
      const enveloppe = moisActif(get()).enveloppes.find((e) => e.id === id);
      if (!enveloppe) return;
      // On ne dépense jamais plus que le contenu de l'enveloppe.
      const sortie = Math.min(montant, enveloppe.montant);
      set((state) => {
         const a = moisActif(state);
         return majActif(state, {
            // l'argent quitte l'enveloppe ET le compte (le disponible ne bouge pas)
            compte: a.compte - sortie,
            enveloppes: a.enveloppes.map((e) => e.id === id ? { ...e, montant: e.montant - sortie } : e),
         });
      });
      get().ajouterMouvement(enveloppe.nom, sortie, "depense", id);
   },

   ajouterCompteEpargne: (nom, montant) =>
      set((state) => ({
         comptesEpargne: [...state.comptesEpargne, { id: crypto.randomUUID(), nom, montant }]
      })),

   modifierCompteEpargne: (id, nom, montant) =>
      set((state) => ({
         comptesEpargne: state.comptesEpargne.map((c) => c.id === id ? { ...c, nom, montant } : c)
      })),

   retirerCompteEpargne: (id) =>
      set((state) => ({
         comptesEpargne: state.comptesEpargne.filter((c) => c.id !== id)
      })),

   definirCodePin: (hash) => set({ codePin: hash }),
   retirerCodePin: () => set({ codePin: undefined }),

   ajouterVoeu: (voeu) =>
      set((state) => majActif(state, {
         voeux: [...moisActif(state).voeux, voeu]
      })),

   ajouterArgentVoeu: (id, montant) => {
      set((state) => majActif(state, {
         voeux: moisActif(state).voeux.map((voeu) =>
            voeu.id === id ? { ...voeu, montantActuel: voeu.montantActuel + montant } : voeu
         )
      }));
      const voeu = moisActif(get()).voeux.find((v) => v.id === id);
      get().ajouterMouvement(voeu?.nom ?? "Vœu", montant, "voeuEntrant", id);
   },

   retirerArgentVoeu: (id, montant) => {
      set((state) => majActif(state, {
         voeux: moisActif(state).voeux.map((voeu) =>
            voeu.id === id ? { ...voeu, montantActuel: Math.max(0, voeu.montantActuel - montant) } : voeu
         )
      }));
      const voeu = moisActif(get()).voeux.find((v) => v.id === id);
      get().ajouterMouvement(voeu?.nom ?? "Vœu", montant, "voeuSortant", id);
   },

   acheterVoeu: (id, montantReel) => {
      const voeu = moisActif(get()).voeux.find((v) => v.id === id);
      if (!voeu) return;
      set((state) => {
         const a = moisActif(state);
         return majActif(state, {
            // le montant réel sort du compte ; l'écart avec l'épargne se rectifie via le disponible
            compte: a.compte - montantReel,
            voeux: a.voeux.map((v) => v.id === id ? { ...v, montantActuel: 0, estTermine: true } : v),
         });
      });
      get().ajouterMouvement("Achat — " + voeu.nom, montantReel, "depense", id);
   }
}));
