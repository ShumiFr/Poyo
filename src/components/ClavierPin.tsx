import { useState } from 'react'
import { Delete } from 'lucide-react'

// Clavier de saisie d'un code à 4 chiffres : affiche 4 points et appelle
// onComplete(code) dès que 4 chiffres sont saisis, puis se vide.
export default function ClavierPin({ onComplete }: { onComplete: (code: string) => void }) {
   const [code, setCode] = useState("")

   const presser = (chiffre: string) => {
      const suite = (code + chiffre).slice(0, 4)
      setCode(suite)
      if (suite.length === 4) {
         onComplete(suite)
         setCode("")   // prêt pour une nouvelle saisie (ex. après une erreur)
      }
   }
   const effacer = () => setCode((c) => c.slice(0, -1))

   return (
      <>
         <div className="pin-points">
            {[0, 1, 2, 3].map((i) => (
               <span key={i} className={i < code.length ? "pin-point rempli" : "pin-point"} />
            ))}
         </div>

         <div className="pave-grid">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((n) => (
               <button key={n} type="button" onClick={() => presser(n)}>{n}</button>
            ))}
            <span />
            <button type="button" onClick={() => presser("0")}>0</button>
            <button type="button" onClick={effacer} aria-label="Effacer"><Delete size={20} /></button>
         </div>
      </>
   )
}
