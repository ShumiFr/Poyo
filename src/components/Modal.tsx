
export function Modal({ isOpen, onClose, children, }: { isOpen: boolean; onClose: () => void; children: React.ReactNode; }) {
   if (!isOpen) return null;
   return (
      <div className="overlay" onClick={onClose}>
         <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button onClick={onClose}>✕</button>
            {children}
         </div>
      </div>
   );
}