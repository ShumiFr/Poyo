import { useState } from "react";
import { useAuth } from "../store/useAuth";

export function AuthScreen() {
   const connexion = useAuth((s) => s.connexion);
   const inscription = useAuth((s) => s.inscription);

   // false = connexion, true = inscription
   const [modeInscription, setModeInscription] = useState(false);
   const [nom, setNom] = useState("");
   const [email, setEmail] = useState("");
   const [motDePasse, setMotDePasse] = useState("");
   const [erreur, setErreur] = useState<string | null>(null);
   const [message, setMessage] = useState<string | null>(null);
   const [enCours, setEnCours] = useState(false);

   async function valider(e: React.FormEvent) {
      e.preventDefault();
      setErreur(null);
      setMessage(null);
      setEnCours(true);
      const probleme = modeInscription
         ? await inscription(email, motDePasse, nom.trim())
         : await connexion(email, motDePasse);
      setEnCours(false);
      if (probleme) {
         setErreur(probleme);
      } else if (modeInscription) {
         // si la confirmation d'email est activée, la session n'arrive qu'après le clic
         setMessage("Compte créé. Si un email de confirmation t'est envoyé, valide-le puis connecte-toi.");
      }
   }

   return (
      <main className="auth-ecran">
         <div className="card auth-carte">
            <div className="auth-titre">Mon Budget</div>
            <p className="sous">{modeInscription ? "Crée ton compte" : "Connecte-toi"}</p>

            <form onSubmit={valider}>
               {modeInscription && (
                  <div className="champ">
                     <label>Nom</label>
                     <input
                        type="text"
                        value={nom}
                        onChange={(e) => setNom(e.target.value)}
                        autoComplete="name"
                        required
                     />
                  </div>
               )}
               <div className="champ">
                  <label>Email</label>
                  <input
                     type="email"
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                     autoComplete="email"
                     required
                  />
               </div>
               <div className="champ">
                  <label>Mot de passe</label>
                  <input
                     type="password"
                     value={motDePasse}
                     onChange={(e) => setMotDePasse(e.target.value)}
                     autoComplete={modeInscription ? "new-password" : "current-password"}
                     required
                  />
               </div>

               {erreur && <p className="auth-erreur">{erreur}</p>}
               {message && <p className="auth-message">{message}</p>}

               <button className="btn btn-primary btn-full" disabled={enCours}>
                  {enCours ? "..." : modeInscription ? "Créer mon compte" : "Se connecter"}
               </button>
            </form>

            <button
               className="auth-bascule"
               onClick={() => { setModeInscription(!modeInscription); setErreur(null); setMessage(null); }}
            >
               {modeInscription ? "J'ai déjà un compte — me connecter" : "Pas de compte ? En créer un"}
            </button>
         </div>
      </main>
   );
}
