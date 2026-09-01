import { Modal } from './Modal'
import PaveNumerique from './PaveNumerique'

export default function ModalePave({
   ouvert,
   onFermer,
   titre,
   sousTitre,
   couleur,
   libelleValider,
   onValider,
}: {
   ouvert: boolean
   onFermer: () => void
   titre: string
   sousTitre: string
   couleur?: string
   libelleValider?: string
   onValider: (montant: number) => void
}) {
   return (
      <Modal isOpen={ouvert} onClose={onFermer}>
         <PaveNumerique
            titre={titre}
            sousTitre={sousTitre}
            couleur={couleur}
            libelleValider={libelleValider}
            onAnnuler={onFermer}
            onValider={onValider}
         />
      </Modal>
   )
}
