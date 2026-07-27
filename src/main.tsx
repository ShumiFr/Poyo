import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import "./index.css";

// On crée le routeur à partir de l'arbre des routes généré automatiquement
const router = createRouter({ routeTree });

// Astuce TypeScript : on enregistre le type du routeur pour avoir
// l'autocomplétion et la vérification des liens (<Link to="..." />).
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
