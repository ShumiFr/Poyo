import { Plus } from 'lucide-react'
import FormRevenu from './FormRevenu'
import { useState } from 'react'

export default function RevenuCard(id: string, nom: string, montant: number, type: 'regulier' | 'occasionnel') {
   const [isOpen, setIsOpen] = useState(false)
   function handleOpenModal() {
      setIsOpen(true)
   }

   return (
      <>
         <div id={id} className="card">
            <div>
               <h3 className="h3">{nom}</h3>
               {type ? <p>{montant}/mois</p> : <p>Occasionnel</p>}
            </div>
            <h3 className="h3-revenu">{montant} €</h3>
            <button className="btn-revenu" onClick={handleOpenModal}><Plus /></button>
         </div>

         {isOpen &&
            <div className='modal'>
               <div className='modal-header'>
                  <h3>Nouvelle rentrée</h3>
                  <p>Un revenu à recevoir</p>
               </div>
               <FormRevenu />
            </div>}
      </>
   )
}
