import {
   ShoppingCart, ShoppingBag, Utensils, Coffee, Fuel, Car,
   House, Heart, Pill, Gift, Plane, Book,
   Music, Dumbbell, Gamepad2, Smartphone, Wifi, Sparkles,
   type LucideIcon,
} from "lucide-react"

// Registre : une clé stockée dans la donnée → un composant icône.
// Utilisé par le sélecteur (création) ET par la carte (affichage).
export const ICONES: Record<string, LucideIcon> = {
   "shopping-cart": ShoppingCart,
   "shopping-bag": ShoppingBag,
   "utensils": Utensils,
   "coffee": Coffee,
   "fuel": Fuel,
   "car": Car,
   "house": House,
   "heart": Heart,
   "pill": Pill,
   "gift": Gift,
   "plane": Plane,
   "book": Book,
   "music": Music,
   "dumbbell": Dumbbell,
   "gamepad": Gamepad2,
   "smartphone": Smartphone,
   "wifi": Wifi,
   "sparkles": Sparkles,
}

// Clés dans l'ordre d'affichage de la grille.
export const CLES_ICONES = Object.keys(ICONES)

// Palette de couleurs (correspond aux classes CSS text-* / bg-*).
export const COULEURS = [
   "navy", "steel", "teal", "green", "sage",
   "gold", "red", "rose", "purple", "lilac",
]

// Valeurs hex (pour le SVG du donut, qui ne peut pas utiliser les classes CSS).
export const COULEURS_HEX: Record<string, string> = {
   navy: "#21445a", steel: "#4f7f96", teal: "#12b39a", green: "#2f9e6f", sage: "#6f8253",
   gold: "#c19a2e", red: "#c0492f", rose: "#b56576", purple: "#3f3563", lilac: "#8b7fb0",
   blue: "#4f7f96",
}
