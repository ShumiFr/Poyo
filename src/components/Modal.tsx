
export function Modal({ isOpen, onClose, children, }: { isOpen: boolean; onClose: () => void; children: React.ReactNode; }) {
   if (!isOpen) return null;
   return (
      <div className="overlay" onClick={onClose}>
         <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <div className="grabber" />
            {children}
         </div>
      </div>
   );
}