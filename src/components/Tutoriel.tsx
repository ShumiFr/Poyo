import { useState } from "react";
import { Wallet, Coins, Mail, Flag, FileText, CalendarDays, BarChart3, type LucideIcon } from "lucide-react";
import { useUI } from "../store/useUI";

// Les étapes du tutoriel de bienvenue.
const ETAPES: { Icone: LucideIcon; couleur: string; titre: string; texte: string }[] = [
   {
      Icone: Wallet, couleur: "var(--accent)",
      titre: "Bienvenue dans Mon Budget",
      texte: "Gère ton argent simplement, avec la méthode des enveloppes. Voici l'essentiel en quelques secondes.",
   },
   {
      Icone: Coins, couleur: "var(--accent)",
      titre: "Ton compte & ton disponible",
      texte: "Ton solde est suivi en temps réel. Le « disponible », c'est ce qu'il te reste vraiment une fois tout réservé.",
   },
   {
      Icone: Mail, couleur: "var(--teal)",
      titre: "Les enveloppes",
      texte: "Mets de côté pour des postes précis (courses, essence, cadeaux…). L'argent quitte le disponible mais reste sur ton compte.",
   },
   {
      Icone: Flag, couleur: "var(--violet)",
      titre: "Les vœux",
      texte: "Épargne pour tes projets avec une barre de progression, et valide l'achat une fois la cible atteinte.",
   },
   {
      Icone: FileText, couleur: "var(--rouge)",
      titre: "Rentrées & dépenses",
      texte: "Note tes revenus et tes charges, puis coche-les quand c'est reçu ou payé : tout s'ajoute ou se retire du compte.",
   },
   {
      Icone: CalendarDays, couleur: "var(--accent)",
      titre: "Voyage dans le temps",
      texte: "Reviens sur les mois passés avec les flèches. Corrige une erreur et tout se répercute sur les mois suivants.",
   },
   {
      Icone: BarChart3, couleur: "var(--cat-gold)",
      titre: "Tes statistiques",
      texte: "Visualise où part ton argent et l'évolution de ton solde, mois après mois.",
   },
];

export default function Tutoriel() {
   const fermer = useUI((s) => s.fermerTutoriel);
   const [i, setI] = useState(0);

   const etape = ETAPES[i];
   const dernier = i === ETAPES.length - 1;
   const { Icone } = etape;

   return (
      <div className="tuto-overlay">
         <div className="tuto-sheet">
            <button className="tuto-passer" onClick={fermer}>Passer</button>

            <div className="tuto-illus" style={{ color: etape.couleur, background: `color-mix(in srgb, ${etape.couleur} 14%, transparent)` }}>
               <Icone size={48} />
            </div>

            <h2>{etape.titre}</h2>
            <p className="tuto-texte">{etape.texte}</p>

            <div className="tuto-points">
               {ETAPES.map((_, k) => (
                  <span key={k} className={k === i ? "tuto-point actif" : "tuto-point"} />
               ))}
            </div>

            <div className="tuto-actions">
               {i > 0 && <button className="btn" onClick={() => setI(i - 1)}>Retour</button>}
               <button className="btn btn-primary tuto-suivant" onClick={() => (dernier ? fermer() : setI(i + 1))}>
                  {dernier ? "C'est parti !" : "Suivant"}
               </button>
            </div>
         </div>
      </div>
   );
}
