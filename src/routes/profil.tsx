import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Sun, Moon, ShieldCheck, LogOut } from 'lucide-react'
import { useBudget } from '../store/useBudget'
import { useAuth } from '../store/useAuth'
import SecuriteModal from '../components/SecuriteModal'

export const Route = createFileRoute('/profil')({
   component: RouteComponent,
})

function RouteComponent() {
   const theme = useBudget((s) => s.theme)
   const basculerTheme = useBudget((s) => s.basculerTheme)
   const codePin = useBudget((s) => s.codePin)
   const session = useAuth((s) => s.session)
   const deconnexion = useAuth((s) => s.deconnexion)

   const [securiteOuvert, setSecuriteOuvert] = useState(false)

   const nom = session?.user.user_metadata?.nom
   const email = session?.user.email

   return (
      <>
         <div className="screen-titre-row"><h2>Profil</h2></div>

         <div className="card">
            <h3>{nom || "Mon compte"}</h3>
            <div className="sous">{email}</div>
         </div>

         <div className="card profil-ligne">
            <span>Thème {theme === "sombre" ? "sombre" : "clair"}</span>
            <button className="btn profil-btn" onClick={basculerTheme}>
               {theme === "sombre" ? <Sun size={16} /> : <Moon size={16} />} Changer
            </button>
         </div>

         <div className="card profil-ligne">
            <span>Code de verrouillage · {codePin ? "activé" : "désactivé"}</span>
            <button className="btn profil-btn" onClick={() => setSecuriteOuvert(true)}>
               <ShieldCheck size={16} /> {codePin ? "Gérer" : "Activer"}
            </button>
         </div>

         <button className="btn btn-full profil-deco" onClick={deconnexion}>
            <LogOut size={16} /> Se déconnecter
         </button>

         <SecuriteModal ouvert={securiteOuvert} onClose={() => setSecuriteOuvert(false)} />
      </>
   )
}
