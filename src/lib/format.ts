export default function format(number: number): string {
   const decimales = Number.isInteger(number) ? 0 : 2
   return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: decimales,
      maximumFractionDigits: decimales,
   }).format(number)
}

// Libellé « Août 2026 » à partir d'un index de mois (0-11) et d'une année.
export function libelleMois(mois: number, annee: number): string {
   const texte = new Date(annee, mois).toLocaleDateString('fr-FR', {
      month: 'long',
      year: 'numeric',
   })
   return texte.charAt(0).toUpperCase() + texte.slice(1)
}