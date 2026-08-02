import { createFileRoute } from '@tanstack/react-router'
import DepenseCard from '../components/DepenseCard'
import FormDepense from '../components/FormDepense'
import { Modal } from '../components/Modal'
import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useBudget } from '../store/useBudget'

export const Route = createFileRoute('/depenses')({
  component: RouteComponent,
})

function RouteComponent() {
  const depenses = useBudget((state) => state.depenses)
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div>
      {depenses.map((depense) => (
        <DepenseCard key={depense.id} depense={depense} />
      ))}

      <button onClick={() => setIsOpen(true)}><Plus /></button>


      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <FormDepense />
      </Modal>
    </div>
  )
}
