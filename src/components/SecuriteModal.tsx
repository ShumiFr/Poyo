import { useState } from 'react'
import { Modal } from './Modal'
import ClavierPin from './ClavierPin'
import { useBudget } from '../store/useBudget'
import { useAuth } from '../store/useAuth'
import { hacherPin } from '../lib/pin'

function Contenu({ onClose }: { onClose: () => void }) {
   const codePin = useBudget((s) => s.codePin)
   const definirCodePin = useBudget((s) => s.definirCodePin)
   const retirerCodePin = useBudget((s) => s.retirerCodePin)
   const session = useAuth((s) => s.session)

   // menu (si un code existe déjà) → sinon on démarre directement sur la saisie.
   const [etape, setEtape] = useState<"menu" | "nouveau" | "confirme">(codePin ? "menu" : "nouveau")
   const [premier, setPremier] = useState("")
   const [erreur, setErreur] = useState<string | null>(null)

   function saisirNouveau(code: string) {
      setPremier(code)
      setErreur(null)
      setEtape("confirme")
   }

   async function confirmer(code: string) {
      if (code !== premier) {
         setErreur("Les codes ne correspondent pas")
         setEtape("nouveau")
         return
      }
      const hash = await hacherPin(code, session?.user.id ?? "")
      definirCodePin(hash)
      onClose()
   }

   if (etape === "menu") {
      return (
         <>
            <h2>Sécurité</h2>
            <p className="sous">Un code à 4 chiffres est demandé à l'ouverture de l'app.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
               <button className="btn btn-primary btn-full" onClick={() => { setPremier(""); setErreur(null); setEtape("nouveau") }}>
                  Changer le code
               </button>
               <button className="btn btn-full" onClick={() => { retirerCodePin(); onClose() }}>
                  Désactiver le code
               </button>
            </div>
         </>
      )
   }

   return (
      <>
         <h2>{etape === "nouveau" ? "Choisis un code" : "Confirme le code"}</h2>
         <p className="sous">{etape === "nouveau" ? "4 chiffres" : "Retape le même code"}</p>
         <ClavierPin onComplete={etape === "nouveau" ? saisirNouveau : confirmer} />
         {erreur && <p className="auth-erreur">{erreur}</p>}
         <button className="auth-bascule" onClick={onClose}>Annuler</button>
      </>
   )
}

export default function SecuriteModal({ ouvert, onClose }: { ouvert: boolean; onClose: () => void }) {
   return (
      <Modal isOpen={ouvert} onClose={onClose}>
         <Contenu onClose={onClose} />
      </Modal>
   )
}
