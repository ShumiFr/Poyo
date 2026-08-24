# Poyo — Backlog produit

> App de budget personnel (méthode enveloppes). Stack : React 19 + TypeScript, TanStack Router (file-based), Zustand, Zod, Vite, PWA, Vitest.
> Ce backlog traduit la maquette finale (Claude Design) en user stories. Le prototype de référence décrit : un compte central, un « disponible » **calculé**, un pavé numérique, un système de courses hebdomadaire, le « nouveau mois » et un historique automatique.

## Concept d'architecture clé 🔑

Le cœur de l'app est **un solde de compte central** (`compte`) et un **`disponible` dérivé (jamais stocké)** :

```
disponible = compte − charges non payées − réserve courses − total enveloppes − total vœux
```

Le code actuel utilise des stores séparés (`useRevenus`, `useDepenses`). La cible est **une source de vérité partagée** pour le compte et le disponible, car presque toutes les actions modifient ce compte commun.

## Format des stories

`En tant que [qui] · je veux [action] · afin de [bénéfice]` + critères d'acceptation (les cases qui prouvent que c'est « fini »).

**Priorités** : `SOCLE` (d'abord) · `V1` (MVP) · `V2` (plus tard).
**Statuts** : ✅ fait · 🔨 en cours · ⬜ à faire.

## Chemin conseillé (ordre de construction)

1. **Socle** (F1→F3) — store central + disponible calculé + formatage €
2. **Pavé numérique** (S1) — composant transversal réutilisé partout
3. **Une catégorie de bout en bout** : Enveloppes (E1→E3), la plus simple avec le nouveau modèle
4. **Historique** (H1/H2) en parallèle (journalisation automatique)
5. Les autres catégories (Rentrées, Dépenses, Vœux)
6. **Accueil** (A2/A5 puis le donut A1)
7. **Nouveau mois** (M1) en dernier — logique la plus délicate
8. **Persistance** (F5) : à brancher dès que le socle tient

---

## EPIC — Socle & état partagé

- **F1 · Un état central unique** — `SOCLE` ✅
  En tant que dev, je veux un store central (compte, charges, rentrées, enveloppes, vœux, journal) afin que tous les écrans lisent la même source de vérité.
   - [x] Un solde de compte (`compte`) sert de base à tous les calculs
   - [x] Chaque collection est typée et vit au même endroit
   - [x] Le solde et le « disponible » sont partagés entre écrans

- **F2 · Le « Disponible » est calculé, pas stocké** — `SOCLE` ✅
  En tant qu'utilisatrice, je veux voir en temps réel ce qu'il me reste afin de savoir combien je peux placer ou dépenser.
   - [x] `disponible = compte − charges non payées − réserve courses − enveloppes − vœux` (réserve courses à brancher avec D7)
   - [x] Toute action met le disponible à jour automatiquement (état dérivé, `calculerDisponible`)
   - [x] Le disponible affiché ne descend jamais sous 0 (`Math.max(0, …)` à l'affichage)
   - [x] Si le disponible réel est négatif, une alerte affiche le manque (fonction garde la valeur brute)

- **F3 · Formatage des montants en euros (FR)** — `SOCLE` ✅
  En tant qu'utilisatrice, je veux des montants lisibles (« 1 139 € ») afin de lire mes chiffres d'un coup d'œil.
   - [x] Une fonction unique `format(n)` (`src/lib/format.ts`) via `Intl.NumberFormat('fr-FR')`, « € » avec espace insécable
   - [x] Centimes affichés seulement s'il y en a (`Number.isInteger` → 0 ou 2 décimales)
   - [x] Utilisée dans le dashboard (à réutiliser partout au fil des écrans)

- **F4 · Navigation par onglets** — `SOCLE` ✅
  En tant qu'utilisatrice, je veux 6 onglets en bas afin de naviguer entre les écrans.
   - [x] Chaque onglet mène à sa route (TanStack Router)
   - [x] L'onglet actif est mis en avant

- **F5 · Persistance locale** — `V1` ⬜
  En tant qu'utilisatrice, je veux que mes données survivent au rechargement afin de ne pas tout ressaisir.
   - [ ] Middleware `persist` de Zustand (localStorage)
   - [ ] Recharger conserve compte, charges, enveloppes, vœux et historique

## EPIC — Accueil (vue d'ensemble)

- **A1 · Anneau de répartition (donut)** — `V2` ⬜
  En tant qu'utilisatrice, je veux voir mon argent réparti en anneau afin de comprendre ma situation d'un coup d'œil.
   - [ ] Chaque segment proportionnel à son montant
   - [ ] Centre = disponible « sur » le total du compte
   - [ ] Couleurs par catégorie

- **A2 · Légende détaillée** — `V1` ⬜
  En tant qu'utilisatrice, je veux la liste Disponible / Charges à venir / Enveloppes / Vœux avec montants afin de lire les totaux.
   - [ ] 4 lignes : pastille, libellé, sous-titre (nb d'éléments), montant
   - [ ] Montants issus des calculs dérivés (F2)

- **A3 · Déplier / replier une catégorie** — `V2` ⬜
  En tant qu'utilisatrice, je veux détailler ou regrouper une catégorie du donut afin de voir soit le total, soit chaque poste.
   - [ ] Bouton +/− par ligne extensible
   - [ ] Déplié = un segment par poste ; replié = un segment agrégé

- **A4 · Cliquer un segment pour naviguer** — `V2` ⬜
  En tant qu'utilisatrice, je veux cliquer une part afin d'ouvrir l'écran de cette catégorie.
   - [ ] charges → Dépenses, enveloppes → Enveloppes, etc.
   - [ ] Part « disponible » → entrée d'argent

- **A5 · Entrée d'argent rapide** — `V1` ⬜
  En tant qu'utilisatrice, je veux ajouter une somme à mon compte afin d'enregistrer une rentrée imprévue.
   - [ ] Le bouton ouvre le pavé numérique (S1)
   - [ ] Valider augmente le compte + crée une entrée d'historique

## EPIC — Rentrées (revenus)

- **R1 · Lister les rentrées en 2 sections** — `V1` 🔨
  En tant qu'utilisatrice, je veux mes revenus séparés en « Réguliers » et « Ponctuelles ».
   - [ ] Deux sections repliables, chacune avec son total
   - [ ] « Ponctuelles » n'apparaît que s'il y en a

- **R2 · Créer une rentrée** — `V1` ✅
  En tant qu'utilisatrice, je veux créer une rentrée (nom, type, montant).
   - [x] Formulaire nom / type / montant
   - [x] Ajoutée à la liste, non reçue par défaut

- **R3 · Éditer une rentrée** — `V1` ⬜
  En tant qu'utilisatrice, je veux modifier le nom et le montant d'une rentrée.
   - [ ] Cliquer le montant ouvre l'édition ; enregistrer met à jour

- **R4 · Marquer comme reçue** — `V1` 🔨
  En tant qu'utilisatrice, je veux marquer un revenu comme reçu afin qu'il s'ajoute à mon compte.
   - [ ] Montant ajouté au compte + date de réception
   - [ ] Entrée « Rentrée » dans l'historique
   - [ ] Carte en état « reçu » (✓)

- **R5 · Annuler une réception** — `V1` ⬜
  En tant qu'utilisatrice, je veux annuler un « reçu » afin de corriger.
   - [ ] Montant retiré du compte
   - [ ] Entrée « annulé » dans l'historique

- **R6 · Total reçu du mois** — `V2` ⬜
  En tant qu'utilisatrice, je veux voir le total déjà reçu ce mois.
   - [ ] En-tête « X € reçu » = somme des rentrées reçues

- **R7 · Supprimer une rentrée** — `V1` ✅
  En tant qu'utilisatrice, je veux supprimer une rentrée.
   - [x] Disparaît de la liste (filter par id)

## EPIC — Dépenses (charges)

- **D1 · Lister par famille** — `V1` 🔨
  En tant qu'utilisatrice, je veux mes charges rangées en sections (Régulières, Courses, Prévisionnel, Ponctuelles).
   - [ ] Sections repliables avec total
   - [ ] Les sections vides ne s'affichent pas

- **D2 · Créer une dépense** — `V1` ✅
  En tant qu'utilisatrice, je veux créer une dépense (nom, type, montant).
   - [x] Formulaire dans une modale ouverte depuis la page
   - [x] Ajoutée à la bonne section, non payée par défaut

- **D3 · Éditer le montant** — `V1` ⬜
  En tant qu'utilisatrice, je veux modifier le montant d'une charge.
   - [ ] Cliquer le montant ouvre l'édition ; enregistrer met à jour

- **D4 · Marquer comme payée** — `V1` ⬜
  En tant qu'utilisatrice, je veux marquer une charge comme payée afin qu'elle soit déduite du compte.
   - [ ] Montant retiré du compte + date
   - [ ] Entrée « Sortie » dans l'historique ; carte grisée
   - [ ] La charge sort du calcul « à venir »

- **D5 · Annuler un paiement** — `V1` ⬜
  En tant qu'utilisatrice, je veux annuler un paiement afin de corriger.
   - [ ] Montant rendu au compte
   - [ ] Entrée « paiement annulé » dans l'historique

- **D6 · Charge prévisionnelle ajustable** — `V2` ⬜
  En tant qu'utilisatrice, je veux un budget prévisionnel ajustable (± 10 €) puis « dépensé » afin de gérer un poste variable.
   - [ ] Boutons − / + modifient le montant prévu
   - [ ] « Dépensé ce mois » déduit du compte et journalise

- **D7 · Budget courses par semaine** — `V2` ⬜
  En tant qu'utilisatrice, je veux un budget de courses réparti par semaine afin de lisser mes dépenses alimentaires.
   - [ ] Nombre de semaines calculé selon le mois
   - [ ] Chaque semaine a un budget ajustable (± 5 €)
   - [ ] « Courses faites » déduit du compte + journalise (réversible)
   - [ ] Semaines non faites comptées dans le « à venir »

- **D8 · Total « à venir »** — `V1` ⬜
  En tant qu'utilisatrice, je veux voir le total des charges à payer.
   - [ ] En-tête = charges non payées + réserve courses

- **D9 · Supprimer une dépense** — `V1` ⬜
  En tant qu'utilisatrice, je veux supprimer une charge.
   - [ ] Disparaît de sa section (filter par id)

## EPIC — Enveloppes

> Mouvements plafonnés : on ne réserve pas plus que le disponible, on ne retire pas plus que le contenu. Chaque mouvement est journalisé.

- **E1 · Lister les enveloppes** — `V1` ⬜
  En tant qu'utilisatrice, je veux voir mes enveloppes (icône, couleur, montant).
   - [ ] Une carte par enveloppe ; en-tête « X € libre » (= disponible)

- **E2 · Ajouter dans une enveloppe** — `V1` ⬜
  En tant qu'utilisatrice, je veux mettre de l'argent dans une enveloppe afin de le réserver.
   - [ ] Pavé numérique ; montant plafonné au disponible
   - [ ] Entrée « mis de côté » dans l'historique

- **E3 · Retirer d'une enveloppe** — `V1` ⬜
  En tant qu'utilisatrice, je veux reprendre de l'argent d'une enveloppe afin de le rendre disponible.
   - [ ] Plafonné au contenu de l'enveloppe
   - [ ] Entrée « repris » dans l'historique

- **E4 · Créer une enveloppe** — `V2` ⬜
  En tant qu'utilisatrice, je veux créer une enveloppe (nom, couleur, icône).
   - [ ] Choix d'une couleur (palette) et d'une icône (bibliothèque)
   - [ ] Montant de départ optionnel, plafonné au disponible

- **E5 · Modifier le style d'une enveloppe** — `V2` ⬜
  En tant qu'utilisatrice, je veux changer nom, couleur ou icône.
   - [ ] Réutilise le sélecteur style/couleur/icône de la création

- **E6 · Dépenser directement depuis une enveloppe** — `V2` ⬜
  En tant qu'utilisatrice, je veux payer une dépense avec l'argent d'une enveloppe afin qu'il quitte l'enveloppe ET le compte sans repasser par le disponible.
   - [ ] Montant plafonné au contenu de l'enveloppe
   - [ ] Diminue à la fois le solde de l'enveloppe et le `compte`
   - [ ] N'augmente jamais le disponible (l'argent était déjà réservé)
   - [ ] Entrée « Sortie (enveloppe) » dans l'historique
   - [ ] Chaque carte enveloppe affiche son propre historique de paiements

## EPIC — Vœux (objectifs d'épargne)

- **V1 · Lister les vœux avec progression** — `V1` ⬜
  En tant qu'utilisatrice, je veux voir chaque projet avec sa barre de progression (X € sur Y €, %).
   - [ ] Barre remplie proportionnelle à `montant / cible`
   - [ ] Pourcentage plafonné à 100 %

- **V2 · Mettre de côté pour un vœu** — `V1` ⬜
  En tant qu'utilisatrice, je veux ajouter au vœu afin de faire avancer mon objectif.
   - [ ] Pavé numérique ; plafonné au disponible ; entrée « mis de côté »

- **V3 · Retirer d'un vœu** — `V1` ⬜
  En tant qu'utilisatrice, je veux reprendre de l'argent d'un vœu afin de le réaffecter.
   - [ ] Plafonné au montant épargné ; entrée « repris »

- **V4 · Créer un vœu** — `V2` ⬜
  En tant qu'utilisatrice, je veux créer un projet (nom, objectif).
   - [ ] Nom + objectif (> 0) requis ; commence à 0 € épargné

- **V5 · Marquer un vœu comme acheté (avec ajustement)** — `V2` ⬜
  En tant qu'utilisatrice, je veux valider l'achat une fois la cible atteinte afin que le montant sorte du compte.
   - [ ] Disponible seulement quand `montantActuel >= montantTotal`
   - [ ] Confirmation du montant réel (l'article a pu augmenter ou baisser) avant de décompter
   - [ ] Le montant réel est déduit du `compte` ; l'écart éventuel est rectifié (rendu au disponible ou repris)
   - [ ] Entrée « Achat (vœu) » dans l'historique ; le vœu passe « terminé »

## EPIC — Historique (journal)

> Le journal n'est pas saisi à la main : il se remplit tout seul à chaque action (story transversale).

- **H1 · Afficher le journal** — `V1` ⬜
  En tant qu'utilisatrice, je veux la liste de mes mouvements, plus récent en premier.
   - [ ] Chaque ligne : date, libellé, tag (Rentrée/Sortie/Mis de côté/Repris), montant coloré
   - [ ] Signe et couleur selon le type de mouvement

- **H2 · Journalisation automatique** — `V1` ⬜
  En tant que système, je veux qu'une entrée soit créée à chaque action d'argent.
   - [ ] Recevoir, payer, mettre de côté, retirer… ajoutent chacun une ligne
   - [ ] Une fonction unique `ajouterMouvement()` centralise l'écriture

## EPIC — Passage au nouveau mois

- **M1 · Démarrer un nouveau mois** — `V2` ⬜
  En tant qu'utilisatrice, je veux repartir sur un mois neuf afin de recommencer mon suivi.
   - [ ] Le mois affiché avance d'un cran
   - [ ] Charges et rentrées repassent « non payé / non reçu »
   - [ ] Les semaines de courses sont régénérées
   - [ ] Les soldes des enveloppes et vœux sont **conservés**

- **M2 · Afficher le mois courant** — `V1` ⬜
  En tant qu'utilisatrice, je veux voir « Mois Année » dans l'en-tête.
   - [ ] Libellé type « Juillet 2026 » dérivé de l'index du mois

## EPIC — Saisie (composants transversaux)

- **S1 · Pavé numérique réutilisable** — `V1` ✅
  En tant qu'utilisatrice, je veux saisir un montant avec un clavier chiffré afin de le faire vite sur mobile.
   - [x] Composant générique `PaveNumerique` piloté par props (branché sur l'entrée d'argent de l'accueil ; réutilisable enveloppes/vœux)
   - [x] Affiche le montant en cours ; bouton « valider » désactivé si invalide (`montant <= 0`)
   - [x] Reçoit `titre`, `sousTitre` et `onValider(montant)` (callback) en props
   - [x] Saisie décimale : virgule unique, 2 décimales max, conversion `,`→`.` centralisée

- **S2 · Feuille de formulaire réutilisable** — `V2` ⬜
  En tant qu'utilisatrice, je veux un formulaire cohérent pour créer/éditer.
   - [ ] Blocs optionnels : nom, choix de type, sélecteur couleur/icône, montant
   - [ ] Bouton « valider » désactivé tant que la saisie est invalide

---

## État du code au moment de la rédaction

- ✅ Routing TanStack file-based en place (`__root.tsx`, routes `/`, `/revenus`, `/depenses`, etc.)
- ✅ Store `useRevenus` : liste, ajouter, retirer, marquer reçu
- ✅ Écran Revenus + formulaire de création (`FormRevenu`)
- 🔨 Store `useDepenses` + écran Dépenses + `DepenseCard` + modale de création au niveau page
- ⬜ Tout le reste (voir stories ci-dessus)

**Prochaine étape logique** : le Socle (F1→F3), c'est-à-dire faire converger vers un compte central + disponible calculé, avant d'ajouter enveloppes/vœux qui en dépendent.
