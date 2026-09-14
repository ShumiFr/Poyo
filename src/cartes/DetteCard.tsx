import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { useBudget } from '../store/useBudget'
import ModalePave from '../components/ModalePave'
import { Modal } from '../components/Modal'
import Form from '../components/Form'
import { champsNomMontant } from '../lib/champs'
import format, { enNombre } from '../lib/format'
import type { Dette } from '../types'

export default function DetteCard({ dette }: { dette: Dette }) {
   const rembourser = useBudget((s) => s.rembourserDette)
   const modifier = useBudget((s) => s.modifierDette)
   const retirer = useBudget((s) => s.retirerDette)

   const [ouvertRemb, setOuvertRemb] = useState(false)
   const [ouvertEdit, setOuvertEdit] = useState(false)

   const reste = Math.max(0, dette.montantTotal - dette.montantRembourse)
   const pct = dette.montantTotal > 0 ? Math.min(100, (dette.montantRembourse / dette.montantTotal) * 100) : 0
   const soldee = reste === 0

   return (
      <div className={soldee ? "card payee" : "card"}>
         <div className="voeu-tete">
            <h3>{dette.nom}</h3>
            <span className="sur">{soldee ? "Remboursée ✓" : "reste " + format(reste)}</span>
         </div>
         <p className="voeu-montant" style={{ color: "var(--teal)" }}>
            {format(dette.montantRembourse)} <span className="pct">· {Math.round(pct)} % sur {format(dette.montantTotal)}</span>
         </p>

         <div className="dette-barre"><div className="dette-barre-remplie" style={{ width: pct + "%" }} /></div>

         <div className="carte-actions">
            {!soldee && <button className="btn bg-teal" onClick={() => setOuvertRemb(true)}>Rembourser</button>}
            <button className="btn" onClick={() => setOuvertEdit(true)}>Modifier</button>
            <button className="carre" onClick={() => retirer(dette.id)} aria-label="Supprimer">
               <Trash2 size={16} />
            </button>
         </div>

         <ModalePave
            ouvert={ouvertRemb}
            onFermer={() => setOuvertRemb(false)}
            titre={"Rembourser · " + dette.nom}
            sousTitre={"Reste " + format(reste)}
            couleur="teal"
            libelleValider="Rembourser"
            onValider={(m) => { rembourser(dette.id, m); setOuvertRemb(false) }}
         />

         <Modal isOpen={ouvertEdit} onClose={() => setOuvertEdit(false)}>
            <h2>Modifier · {dette.nom}</h2>
            <p className="sous">Nom et montant total de la dette</p>
            <Form
               champs={champsNomMontant}
               valeursInitiales={{ nom: dette.nom, montant: String(dette.montantTotal) }}
               couleur="navy"
               libelle="Enregistrer"
               estValide={(v) => v.nom.trim() !== "" && enNombre(v.montant) > 0}
               onAnnuler={() => setOuvertEdit(false)}
               onValider={(v) => { modifier(dette.id, v.nom.trim(), enNombre(v.montant)); setOuvertEdit(false) }}
            />
         </Modal>
      </div>
   )
}
