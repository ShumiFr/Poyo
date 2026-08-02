export default function format(number: number): string {
   const decimales = Number.isInteger(number) ? 0 : 2
   return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: decimales,
      maximumFractionDigits: decimales,
   }).format(number)
}