// Hache un code PIN (jamais stocké en clair). Le "sel" = l'id du compte,
// pour qu'un même code donne une empreinte différente d'un utilisateur à l'autre.
export async function hacherPin(pin: string, sel: string): Promise<string> {
   const donnees = new TextEncoder().encode(sel + ":" + pin)
   const buffer = await crypto.subtle.digest("SHA-256", donnees)
   return [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, "0")).join("")
}
