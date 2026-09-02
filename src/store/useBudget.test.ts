import { describe, it, expect, beforeEach } from "vitest"
import { useBudget } from "./useBudget"
import type { Depense, MoisBudget, Revenu, Enveloppe } from "../types"

const revenu = (montant: number): Revenu =>
   ({ id: "r1", nom: "Salaire", montant, type: "regulier", estRecu: false })
const depense = (montant: number): Depense =>
   ({ id: "d1", nom: "Loyer", montant, type: "regulier", estPayer: false })
const enveloppe = (montant: number): Enveloppe =>
   ({ id: "e1", nom: "Voiture", montant, couleur: "navy", icone: "car" })

// Un mois complet, avec la possibilité de changer quelques champs.
const moisBase = (patch: Partial<MoisBudget> = {}): MoisBudget => ({
   mois: 5, annee: 2026, soldeReporte: 0, compte: 0,
   revenus: [], depenses: [], enveloppes: [], voeux: [], courses: [], previsionnels: [],
   ...patch,
})

// Pose un seul mois affiché (le plus courant des cas de test).
function poser(patch: Partial<MoisBudget> = {}) {
   useBudget.setState({ moisListe: [moisBase(patch)], indexActif: 0, historique: [] })
}

// Le mois actuellement affiché.
const actif = () => {
   const s = useBudget.getState()
   return s.moisListe[s.indexActif]
}

beforeEach(() => poser())

describe("marquerRecu (R4/R5)", () => {
   it("ajoute le revenu au compte et journalise une Rentrée", () => {
      poser({ revenus: [revenu(1400)] })
      useBudget.getState().marquerRecu("r1")

      expect(actif().compte).toBe(1400)
      expect(actif().revenus[0].estRecu).toBe(true)
      expect(useBudget.getState().historique[0]).toMatchObject({ montant: 1400, type: "revenu" })
   })

   it("re-cliquer annule : retire du compte et journalise l'inverse", () => {
      poser({ revenus: [{ ...revenu(1400), estRecu: true }], compte: 1400 })
      useBudget.getState().marquerRecu("r1")

      expect(actif().compte).toBe(0)
      expect(actif().revenus[0].estRecu).toBe(false)
      expect(useBudget.getState().historique[0].type).toBe("depense")
   })
})

describe("marquerPayer (D4)", () => {
   it("retire la charge du compte et journalise une Sortie", () => {
      poser({ depenses: [depense(750)], compte: 1000 })
      useBudget.getState().marquerPayer("d1")

      expect(actif().compte).toBe(250)
      expect(actif().depenses[0].estPayer).toBe(true)
      expect(useBudget.getState().historique[0]).toMatchObject({ montant: 750, type: "depense" })
   })
})

describe("enveloppes (E2/E3)", () => {
   it("retirer est plafonné au contenu (jamais négatif)", () => {
      poser({ enveloppes: [enveloppe(50)] })
      useBudget.getState().retirerArgentEnveloppe("e1", 80)
      expect(actif().enveloppes[0].montant).toBe(0)
   })

   it("supprimer une enveloppe la retire sans toucher au compte", () => {
      poser({ compte: 500, enveloppes: [enveloppe(120)] })
      useBudget.getState().retirerEnveloppe("e1")
      expect(actif().enveloppes).toHaveLength(0)
      expect(actif().compte).toBe(500)   // l'argent réservé revient au disponible, compte inchangé
   })
})

describe("vœux — suppression", () => {
   it("supprimer un vœu le retire sans toucher au compte", () => {
      poser({ compte: 500, voeux: [{ id: "v1", nom: "Casque", montantTotal: 180, montantActuel: 150, estTermine: false }] })
      useBudget.getState().retirerVoeu("v1")
      expect(actif().voeux).toHaveLength(0)
      expect(actif().compte).toBe(500)
   })
})

describe("dépenser depuis une enveloppe (E6)", () => {
   it("baisse l'enveloppe ET le compte, sans toucher au disponible", () => {
      poser({ compte: 500, enveloppes: [enveloppe(100)] })
      // disponible avant = 500 − 100 (enveloppe) = 400
      useBudget.getState().depenserDepuisEnveloppe("e1", 30)

      expect(actif().compte).toBe(470)
      expect(actif().enveloppes[0].montant).toBe(70)
      // disponible après = 470 − 70 = 400 : inchangé
      expect(actif().compte - actif().enveloppes[0].montant).toBe(400)
      expect(useBudget.getState().historique[0]).toMatchObject({ montant: 30, type: "depense", refId: "e1" })
   })

   it("est plafonné au contenu de l'enveloppe", () => {
      poser({ compte: 500, enveloppes: [enveloppe(100)] })
      useBudget.getState().depenserDepuisEnveloppe("e1", 250) // plus que le contenu

      expect(actif().enveloppes[0].montant).toBe(0)
      expect(actif().compte).toBe(400) // seulement 100 dépensés
   })
})

describe("dépense immédiate (page Dépenses)", () => {
   it("depuis le compte : déduit le compte et laisse une charge payée", () => {
      poser({ compte: 500 })
      useBudget.getState().depenserImmediat("Dentiste", 60, "occasionnel", "compte")

      expect(actif().compte).toBe(440)
      expect(actif().depenses[0]).toMatchObject({ nom: "Dentiste", montant: 60, estPayer: true })
      expect(useBudget.getState().historique[0]).toMatchObject({ montant: 60, type: "depense" })
   })

   it("depuis une enveloppe : sort de l'enveloppe ET du compte", () => {
      poser({ compte: 500, enveloppes: [enveloppe(100)] })
      useBudget.getState().depenserImmediat("Plein essence", 40, "occasionnel", "e1")

      expect(actif().compte).toBe(460)
      expect(actif().enveloppes[0].montant).toBe(60)
      expect(actif().depenses[0]).toMatchObject({ montant: 40, estPayer: true })
   })
})

describe("courses (D7)", () => {
   it("cocher « courses faites » déduit le budget du compte et journalise", () => {
      poser({ compte: 500, courses: [{ budget: 25, faite: false }] })
      useBudget.getState().basculerSemaineFaite(0)

      expect(actif().compte).toBe(475)
      expect(actif().courses[0].faite).toBe(true)
      expect(useBudget.getState().historique[0]).toMatchObject({ montant: 25, type: "depense" })
   })

   it("décocher rend l'argent au compte (réversible)", () => {
      poser({ compte: 475, courses: [{ budget: 25, faite: true }] })
      useBudget.getState().basculerSemaineFaite(0)
      expect(actif().compte).toBe(500)
      expect(actif().courses[0].faite).toBe(false)
   })

   it("ajuster le budget ne descend jamais sous 0", () => {
      poser({ courses: [{ budget: 5, faite: false }] })
      useBudget.getState().ajusterSemaine(0, -5)
      expect(actif().courses[0].budget).toBe(0)
      useBudget.getState().ajusterSemaine(0, -5)
      expect(actif().courses[0].budget).toBe(0)
   })

   it("définir un montant exact remplace le budget de la semaine", () => {
      poser({ courses: [{ budget: 25, faite: false }] })
      useBudget.getState().definirBudgetSemaine(0, 37.5)
      expect(actif().courses[0].budget).toBe(37.5)
   })

   it("changer le budget d'une semaine FAITE réajuste le compte", () => {
      poser({ compte: 400, courses: [{ budget: 100, faite: true }] })   // 100 déjà dépensés
      useBudget.getState().definirBudgetSemaine(0, 30)                   // finalement 30
      expect(actif().compte).toBe(470)          // 70 rendus au compte
      expect(actif().courses[0].budget).toBe(30)
   })

   it("changer le budget d'une semaine NON faite ne touche pas le compte", () => {
      poser({ compte: 500, courses: [{ budget: 100, faite: false }] })
      useBudget.getState().definirBudgetSemaine(0, 30)
      expect(actif().compte).toBe(500)
   })

   it("ajuster le budget d'une semaine faite réajuste le compte", () => {
      poser({ compte: 400, courses: [{ budget: 100, faite: true }] })
      useBudget.getState().ajusterSemaine(0, -40)   // budget → 60
      expect(actif().compte).toBe(440)              // 40 rendus
      expect(actif().courses[0].budget).toBe(60)
   })
})

describe("acheter un vœu (V5)", () => {
   it("déduit le montant réel, termine le vœu, et rectifie l'écart via le disponible", () => {
      // épargné 200 pour une cible 180, compte 500 → disponible = 500 − 200 = 300
      poser({
         compte: 500,
         voeux: [{ id: "v1", nom: "Casque", montantTotal: 180, montantActuel: 200, estTermine: false }],
      })

      useBudget.getState().acheterVoeu("v1", 170) // acheté moins cher que prévu

      expect(actif().compte).toBe(330)               // 500 − 170
      expect(actif().voeux[0].montantActuel).toBe(0)
      expect(actif().voeux[0].estTermine).toBe(true)
      expect(useBudget.getState().historique[0]).toMatchObject({ montant: 170, type: "depense", refId: "v1" })
   })
})

describe("prévisionnel (D6)", () => {
   it("« dépensé ce mois » déduit le budget du compte et journalise", () => {
      poser({ compte: 500, previsionnels: [{ id: "p1", nom: "Loisirs", montant: 60, estDepense: false }] })
      useBudget.getState().basculerPrevisionnelDepense("p1")

      expect(actif().compte).toBe(440)
      expect(actif().previsionnels[0].estDepense).toBe(true)
      expect(useBudget.getState().historique[0]).toMatchObject({ montant: 60, type: "depense" })
   })

   it("ajuster le budget ne descend jamais sous 0", () => {
      poser({ previsionnels: [{ id: "p1", nom: "Loisirs", montant: 10, estDepense: false }] })
      useBudget.getState().ajusterPrevisionnel("p1", -10)
      useBudget.getState().ajusterPrevisionnel("p1", -10)
      expect(actif().previsionnels[0].montant).toBe(0)
   })
})

describe("nouveauMois (M1)", () => {
   it("ajoute un mois, reporte le solde réel et journalise l'écart", () => {
      poser({
         compte: 500, soldeReporte: 0, mois: 5, annee: 2026,
         revenus: [{ ...revenu(1400), estRecu: true }],
         depenses: [{ ...depense(750), estPayer: true }],
      })

      useBudget.getState().nouveauMois(600) // solde réel corrigé à 600 (+100 d'écart)

      const s = useBudget.getState()
      expect(s.moisListe).toHaveLength(2)       // l'ancien mois est conservé
      expect(s.indexActif).toBe(1)              // on affiche le nouveau mois
      expect(actif().mois).toBe(6)
      expect(actif().compte).toBe(600)
      expect(actif().soldeReporte).toBe(600)
      expect(actif().revenus[0].estRecu).toBe(false)   // remis à recevoir
      expect(actif().depenses[0].estPayer).toBe(false) // remis à payer
      // l'ancien mois garde son état (consultable dans le calendrier)
      expect(s.moisListe[0].revenus[0].estRecu).toBe(true)
      expect(s.historique[0]).toMatchObject({ montant: 100, type: "revenu" })
   })

   it("bascule d'année après décembre", () => {
      poser({ mois: 11, annee: 2026, compte: 0 })
      useBudget.getState().nouveauMois(0)

      expect(actif().mois).toBe(0)
      expect(actif().annee).toBe(2027)
   })
})

describe("navigation entre les mois", () => {
   it("suivant ne dépasse jamais le mois en cours", () => {
      useBudget.setState({
         moisListe: [moisBase({ mois: 4 }), moisBase({ mois: 5 }), moisBase({ mois: 6 })],
         indexActif: 0,
      })
      useBudget.getState().moisSuivant()
      useBudget.getState().moisSuivant()
      useBudget.getState().moisSuivant()
      expect(useBudget.getState().indexActif).toBe(2)   // bloqué au mois en cours (le dernier)
   })

   it("précédent au tout début crée un mois vierge (tout à 0)", () => {
      useBudget.setState({
         moisListe: [moisBase({ mois: 5, annee: 2026, compte: 800, depenses: [depense(200)] })],
         indexActif: 0,
      })

      useBudget.getState().moisPrecedent()

      const s = useBudget.getState()
      expect(s.moisListe).toHaveLength(2)
      expect(s.indexActif).toBe(0)              // on affiche le nouveau mois
      const vide = s.moisListe[0]
      expect(vide.mois).toBe(4)                 // avril, le mois d'avant
      expect(vide.annee).toBe(2026)
      expect(vide.compte).toBe(0)               // tout est à 0
      expect(vide.depenses).toHaveLength(0)     // aucune charge régulière (rien n'existait)
      // les semaines de courses existent mais sont à 0 €
      expect(vide.courses.length).toBeGreaterThan(0)
      expect(vide.courses.every((c) => c.budget === 0)).toBe(true)
   })

   it("précédent passe l'année en arrière depuis janvier", () => {
      useBudget.setState({
         moisListe: [moisBase({ mois: 0, annee: 2026 })],
         indexActif: 0,
      })
      useBudget.getState().moisPrecedent()

      const vide = useBudget.getState().moisListe[0]
      expect(vide.mois).toBe(11)   // décembre
      expect(vide.annee).toBe(2025)
   })

   it("allerAuMois : rejoint un mois déjà présent", () => {
      useBudget.setState({
         moisListe: [moisBase({ mois: 4 }), moisBase({ mois: 5 }), moisBase({ mois: 6 })],
         indexActif: 2,
      })
      useBudget.getState().allerAuMois(4, 2026)   // mai
      expect(useBudget.getState().indexActif).toBe(0)
   })

   it("allerAuMois : dans le passé, comble le trou avec des mois vierges", () => {
      // On n'a que septembre 2026 ; on saute directement à juin 2026.
      useBudget.setState({
         moisListe: [moisBase({ mois: 8, annee: 2026, compte: 500 })],
         indexActif: 0,
      })
      useBudget.getState().allerAuMois(5, 2026)   // juin

      const s = useBudget.getState()
      // juin, juillet, août créés vides + septembre existant = 4 mois
      expect(s.moisListe).toHaveLength(4)
      expect(s.indexActif).toBe(0)
      expect(s.moisListe[0]).toMatchObject({ mois: 5, annee: 2026, compte: 0 })
      expect(s.moisListe[1].mois).toBe(6)   // juillet
      expect(s.moisListe[2].mois).toBe(7)   // août
      expect(s.moisListe[3].mois).toBe(8)   // septembre (le mois d'origine)
   })

})

describe("cascade — modifier un mois passé (étape B)", () => {
   it("payer une charge d'un mois passé baisse aussi le mois en cours", () => {
      useBudget.setState({
         moisListe: [
            moisBase({ mois: 4, compte: 500, depenses: [depense(200)] }),
            moisBase({ mois: 5, compte: 800, soldeReporte: 500 }),
         ],
         indexActif: 0,   // on affiche mai (le mois passé)
         historique: [],
      })

      useBudget.getState().marquerPayer("d1")   // on paie une charge de 200 en mai

      const s = useBudget.getState()
      expect(s.moisListe[0].compte).toBe(300)        // mai : 500 − 200
      expect(s.moisListe[1].soldeReporte).toBe(300)  // juin démarre 200 plus bas
      expect(s.moisListe[1].compte).toBe(600)        // juin : 800 − 200
   })

   it("l'écart se propage sur TOUS les mois suivants", () => {
      useBudget.setState({
         moisListe: [
            moisBase({ mois: 3, compte: 1000, revenus: [revenu(300)] }),
            moisBase({ mois: 4, compte: 1200, soldeReporte: 1000 }),
            moisBase({ mois: 5, compte: 900, soldeReporte: 1200 }),
         ],
         indexActif: 0,   // avril
         historique: [],
      })

      useBudget.getState().marquerRecu("r1")   // on encaisse 300 en avril

      const s = useBudget.getState()
      expect(s.moisListe[0].compte).toBe(1300)   // avril : +300
      expect(s.moisListe[1].compte).toBe(1500)   // mai : +300
      expect(s.moisListe[2].compte).toBe(1200)   // juin : +300
   })

   it("ajouter de l'argent dans une enveloppe d'un mois passé se reporte", () => {
      useBudget.setState({
         moisListe: [
            moisBase({ mois: 4, enveloppes: [enveloppe(100)] }),
            moisBase({ mois: 5, enveloppes: [enveloppe(100)] }),
         ],
         indexActif: 0,
         historique: [],
      })

      useBudget.getState().ajouterArgentEnveloppe("e1", 50)   // +50 dans l'enveloppe de mai

      const s = useBudget.getState()
      expect(s.moisListe[0].enveloppes[0].montant).toBe(150)   // mai
      expect(s.moisListe[1].enveloppes[0].montant).toBe(150)   // juin : l'épargne se cumule
   })

   it("ajouter un revenu régulier dans un mois passé le reporte sur les suivants", () => {
      useBudget.setState({
         moisListe: [moisBase({ mois: 3 }), moisBase({ mois: 4 }), moisBase({ mois: 5 })],
         indexActif: 0,   // avril
         historique: [],
      })

      useBudget.getState().ajouterRevenu(revenu(2000))   // Salaire régulier

      const s = useBudget.getState()
      expect(s.moisListe[0].revenus[0].nom).toBe("Salaire")   // avril (créé)
      expect(s.moisListe[1].revenus[0].nom).toBe("Salaire")   // mai (reporté)
      expect(s.moisListe[2].revenus[0].nom).toBe("Salaire")   // juin (reporté)
      // les copies sont neuves : id différent, pas encore reçues
      expect(s.moisListe[1].revenus[0].id).not.toBe("r1")
      expect(s.moisListe[1].revenus[0].estRecu).toBe(false)
   })

   it("ne duplique pas un régulier si un même nom existe déjà plus tard", () => {
      useBudget.setState({
         moisListe: [
            moisBase({ mois: 4 }),                                   // août : pas de loyer
            moisBase({ mois: 5, depenses: [depense(650)] }),         // septembre : loyer déjà là
         ],
         indexActif: 0,
         historique: [],
      })

      useBudget.getState().ajouterDepense(depense(650))   // on ajoute "Loyer" en août

      const s = useBudget.getState()
      expect(s.moisListe[0].depenses).toHaveLength(1)   // août : le nouveau
      expect(s.moisListe[1].depenses).toHaveLength(1)   // septembre : on garde l'existant, pas de doublon
   })

   it("une rentrée ponctuelle ne se reporte pas sur les mois suivants", () => {
      useBudget.setState({
         moisListe: [moisBase({ mois: 4 }), moisBase({ mois: 5 })],
         indexActif: 0,
         historique: [],
      })

      useBudget.getState().ajouterRevenu({ id: "x", nom: "Prime", montant: 100, type: "occasionnel", estRecu: false })

      const s = useBudget.getState()
      expect(s.moisListe[0].revenus).toHaveLength(1)
      expect(s.moisListe[1].revenus).toHaveLength(0)   // ponctuelle : pas de report
   })

   it("supprimer une charge PAYÉE d'un mois passé rend l'argent et remonte les mois suivants", () => {
      useBudget.setState({
         moisListe: [
            moisBase({ mois: 4, compte: 300, depenses: [{ ...depense(200), estPayer: true }] }),
            moisBase({ mois: 5, compte: 700, soldeReporte: 300 }),
         ],
         indexActif: 0,
         historique: [],
      })

      useBudget.getState().retirerDepense("d1")   // on supprime une charge de 200 déjà payée

      const s = useBudget.getState()
      expect(s.moisListe[0].compte).toBe(500)        // mai : 300 + 200 rendus
      expect(s.moisListe[1].soldeReporte).toBe(500)  // juin démarre 200 plus haut
      expect(s.moisListe[1].compte).toBe(900)        // juin : 700 + 200
   })

   it("supprimer une charge NON payée ne change pas le compte", () => {
      useBudget.setState({
         moisListe: [
            moisBase({ mois: 4, compte: 300, depenses: [depense(200)] }),   // non payée
            moisBase({ mois: 5, compte: 700, soldeReporte: 300 }),
         ],
         indexActif: 0,
         historique: [],
      })

      useBudget.getState().retirerDepense("d1")

      const s = useBudget.getState()
      expect(s.moisListe[0].compte).toBe(300)        // inchangé (jamais sortie du compte)
      expect(s.moisListe[1].soldeReporte).toBe(300)  // le mois suivant ne bouge pas
   })

   it("supprimer un revenu REÇU le retire aussi du compte", () => {
      useBudget.setState({
         moisListe: [moisBase({ mois: 4, compte: 1400, revenus: [{ ...revenu(1400), estRecu: true }] })],
         indexActif: 0,
         historique: [],
      })

      useBudget.getState().retirerRevenu("r1")
      expect(useBudget.getState().moisListe[0].compte).toBe(0)
   })

   it("modifier le montant d'une charge payée ajuste le compte de la différence", () => {
      useBudget.setState({
         moisListe: [moisBase({ mois: 4, compte: 300, depenses: [{ ...depense(200), estPayer: true }] })],
         indexActif: 0,
         historique: [],
      })

      useBudget.getState().modifierDepense("d1", "Loyer", 250)   // +50 par rapport à 200
      expect(useBudget.getState().moisListe[0].compte).toBe(250)   // 300 − 50
   })

   it("modifier le mois en cours ne crée aucune propagation (rien après lui)", () => {
      useBudget.setState({
         moisListe: [moisBase({ mois: 4, compte: 500 }), moisBase({ mois: 5, compte: 800 })],
         indexActif: 1,   // le mois en cours
         historique: [],
      })

      useBudget.getState().ajouterAuCompte(100)

      const s = useBudget.getState()
      expect(s.moisListe[1].compte).toBe(900)   // juin monte
      expect(s.moisListe[0].compte).toBe(500)   // mai (passé) intact
   })
})
