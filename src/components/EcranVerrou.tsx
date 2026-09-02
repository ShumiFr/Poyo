import { useState } from 'react'
import ClavierPin from './ClavierPin'
import { useBudget } from '../store/useBudget'
import { useAuth } from '../store/useAuth'
import { supabase } from '../lib/supabase'
import { hacherPin } from '../lib/pin'

// Écran affiché à l'ouverture de l'app quand un code est défini.
export default function EcranVerrou({ onDeverrouille }: { onDeverrouille: () => void }) {
   const codePin = useBudget((s) => s.codePin)
   const retirerCodePin = useBudget((s) => s.retirerCodePin)
   const session = useAuth((s) => s.session)

   const [erreur, setErreur] = useState(false)
   const [oubli, setOubli] = useState(false)
   const [motDePasse, setMotDePasse] = useState("")
   const [messageOubli, setMessageOubli] = useState<string | null>(null)

   async function verifier(code: string) {
      const hash = await hacherPin(code, session?.user.id ?? "")
      if (hash === codePin) {
         setErreur(false)
         onDeverrouille()
      } else {
         setErreur(true)
      }
   }

   // Oubli du code : on re-vérifie le mot de passe du compte, puis on désactive le code.
   async function reinitialiser(e: React.FormEvent) {
      e.preventDefault()
      setMessageOubli(null)
      const email = session?.user.email
      if (!email) return
      const { error } = await supabase.auth.signInWithPassword({ email, password: motDePasse })
      if (error) {
         setMessageOubli("Mot de passe incorrect")
      } else {
         retirerCodePin()
         onDeverrouille()
      }
   }

   return (
      <main className="auth-ecran">
         <div className="card auth-carte">
            <div className="auth-titre">Poyo</div>

            {!oubli ? (
               <>
                  <p className="sous">Entre ton code</p>
                  <ClavierPin onComplete={verifier} />
                  {erreur && <p className="auth-erreur">Code incorrect</p>}
                  <button className="auth-bascule" onClick={() => { setOubli(true); setErreur(false) }}>
                     Code oublié ?
                  </button>
               </>
            ) : (
               <form onSubmit={reinitialiser}>
                  <p className="sous">Confirme ton mot de passe pour désactiver le code.</p>
                  <div className="champ">
                     <label>Mot de passe</label>
                     <input
                        type="password"
                        value={motDePasse}
                        onChange={(e) => setMotDePasse(e.target.value)}
                        autoComplete="current-password"
                        required
                     />
                  </div>
                  {messageOubli && <p className="auth-erreur">{messageOubli}</p>}
                  <button className="btn btn-primary btn-full">Désactiver le code</button>
                  <button type="button" className="auth-bascule" onClick={() => setOubli(false)}>Retour</button>
               </form>
            )}
         </div>
      </main>
   )
}
