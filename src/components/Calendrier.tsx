import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useBudget } from "../store/useBudget";
import { libelleMois } from "../lib/format";
import { Modal } from "./Modal";

// Les 12 mois en toutes lettres (Janvier … Décembre).
const NOMS_MOIS = Array.from({ length: 12 }, (_, i) => {
   const texte = new Date(2000, i).toLocaleDateString("fr-FR", { month: "long" });
   return texte.charAt(0).toUpperCase() + texte.slice(1);
});

// Navigateur de mois : flèches précédent / suivant + sélecteur mois/année.
// La flèche « suivant » s'arrête au mois en cours (le dernier de la liste).
export default function Calendrier() {
   const moisListe = useBudget((state) => state.moisListe);
   const indexActif = useBudget((state) => state.indexActif);
   const moisPrecedent = useBudget((state) => state.moisPrecedent);
   const moisSuivant = useBudget((state) => state.moisSuivant);
   const allerAuMois = useBudget((state) => state.allerAuMois);

   const actif = moisListe[indexActif];
   const enCours = moisListe[moisListe.length - 1];   // le mois en cours = le dernier
   const estDernier = indexActif === moisListe.length - 1;

   // Sélecteur mois/année : ouvert ? et quelle année on regarde dedans.
   const [ouvert, setOuvert] = useState(false);
   const [anneeVue, setAnneeVue] = useState(actif.annee);

   function ouvrirSelecteur() {
      setAnneeVue(actif.annee);
      setOuvert(true);
   }

   function choisir(mois: number) {
      allerAuMois(mois, anneeVue);
      setOuvert(false);
   }

   // On ne peut pas dépasser le mois en cours.
   const cleMax = enCours.annee * 12 + enCours.mois;
   const moisFutur = (mois: number) => anneeVue * 12 + mois > cleMax;

   return (
      <>
         <div className="mois-nav">
            {/* ◀ ne se bloque jamais : au tout début, elle crée le mois précédent */}
            <button className="mois-fleche" onClick={moisPrecedent} aria-label="Mois précédent">
               <ChevronLeft size={18} />
            </button>

            <button className="mois-label" onClick={ouvrirSelecteur}>
               {libelleMois(actif.mois, actif.annee)}
               {!estDernier && <span className="mois-passe">passé</span>}
            </button>

            <button className="mois-fleche" onClick={moisSuivant} disabled={estDernier} aria-label="Mois suivant">
               <ChevronRight size={18} />
            </button>
         </div>

         {/* Sélecteur : on choisit une année puis un mois (pas de jour) */}
         <Modal isOpen={ouvert} onClose={() => setOuvert(false)}>
            <h2>Aller à un mois</h2>

            <div className="selecteur-annee">
               <button className="mois-fleche" onClick={() => setAnneeVue((a) => a - 1)} aria-label="Année précédente">
                  <ChevronLeft size={18} />
               </button>
               <span className="selecteur-annee-valeur">{anneeVue}</span>
               <button
                  className="mois-fleche"
                  onClick={() => setAnneeVue((a) => a + 1)}
                  disabled={anneeVue >= enCours.annee}
                  aria-label="Année suivante"
               >
                  <ChevronRight size={18} />
               </button>
            </div>

            <div className="selecteur-grille">
               {NOMS_MOIS.map((nom, i) => {
                  const estActif = i === actif.mois && anneeVue === actif.annee;
                  return (
                     <button
                        key={nom}
                        className={estActif ? "selecteur-mois actif" : "selecteur-mois"}
                        disabled={moisFutur(i)}
                        onClick={() => choisir(i)}
                     >
                        {nom}
                     </button>
                  );
               })}
            </div>
         </Modal>
      </>
   );
}
