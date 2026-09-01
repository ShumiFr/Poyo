export default function Champ({
   label,
   valeur,
   onChange,
   placeholder,
}: {
   label: string
   valeur: string
   onChange: (valeur: string) => void
   placeholder?: string
}) {
   return (
      <div className="champ">
         <label>{label}</label>
         <input value={valeur} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      </div>
   )
}
