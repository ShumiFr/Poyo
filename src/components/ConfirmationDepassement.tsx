import { Modal } from './Modal'
import format from '../lib/format'

export default function ConfirmationDepassement({
   montant,
   disponible,
   couleur,
   onAnnuler,
   onValider,
}: {
   montant: number | null 
   disponible: number
   couleur: string
   onAnnuler: () => void
   onValider: () => void
}) {
   return (
      <Modal isOpen={montant !== null} onClose={onAnnuler}>
         <h2>Dépassement du disponible</h2>
         <p className="sous">Vérifie avant de placer</p>
         <ul className="legende">
            <li><span className="libelle">Disponible sur le compte</span><span className="valeur">{format(disponible)}</span></li>
            <li><span className="libelle">Montant à placer</span><span className="valeur text-red">{format(montant ?? 0)}</span></li>
         </ul>
         <div className="pave-actions">
            <button className="btn" onClick={onAnnuler}>Annuler</button>
            <button className={"btn bg-" + couleur} onClick={onValider}>Valider</button>
         </div>
      </Modal>
   )
}
