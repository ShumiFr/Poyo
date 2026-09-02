import { createPortal } from "react-dom";

export function Modal({ isOpen, onClose, children, }: { isOpen: boolean; onClose: () => void; children: React.ReactNode; }) {
   if (!isOpen) return null;
   // On rend la modale directement dans le <body> : ainsi elle n'hérite pas des
   // styles de la carte qui l'ouvre (ex. l'opacité d'une dépense déjà payée).
   return createPortal(
      <div className="overlay" onClick={onClose}>
         <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <div className="grabber" />
            {children}
         </div>
      </div>,
      document.body
   );
}