import { useState } from 'react'
import format from '../lib/format'

export default function Section({
   titre,
   total,
   children,
}: {
   titre: string
   total: number
   children: React.ReactNode
}) {
   const [ouvert, setOuvert] = useState(true)

   return (
      <div>
         <button className="section-header" onClick={() => setOuvert(!ouvert)}>
            <span>{titre}</span>
            <span className="total">{format(total)} {ouvert ? '▾' : '▸'}</span>
         </button>
         {ouvert && children}
      </div>
   )
}
