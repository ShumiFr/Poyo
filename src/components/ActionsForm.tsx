export default function ActionsForm({
   onAnnuler,
   onValider,
   libelle = "Créer",
   couleur = "green",
   invalide,
}: {
   onAnnuler: () => void
   onValider: () => void
   libelle?: string
   couleur?: string
   invalide?: boolean
}) {
   return (
      <div className="form-actions">
         <button className="btn" type="button" onClick={onAnnuler}>Annuler</button>
         <button className={"btn bg-" + couleur} type="button" disabled={invalide} onClick={onValider}>{libelle}</button>
      </div>
   )
}
