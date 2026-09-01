import { useState } from 'react'
import format from '../lib/format'

export default function Section({
   titre,
   total,
   couleur,
   children,
}: {
   titre: string
   total: number
   couleur?: string   // couleur du total (var CSS), ex. "var(--vert)"
   children: React.ReactNode
}) {
   const [ouvert, setOuvert] = useState(true)

   return (
      <div>
         <button className="section-header" onClick={() => setOuvert(!ouvert)}>
            <span>{titre}</span>
            <span className="total" style={couleur ? { color: couleur } : undefined}>{format(total)} {ouvert ? '▾' : '▸'}</span>
         </button>
         {ouvert && children}
      </div>
   )
}
