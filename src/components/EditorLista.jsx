import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import Modal from './Modal'

export default function EditorLista({
  titulo,
  nota,
  lista,
  placeholder,
  permitirVacia = false,
  onGuardar,
  onCerrar,
}) {
  const [items, setItems] = useState(lista)
  const [nuevo, setNuevo] = useState('')

  function agregar() {
    const nombre = nuevo.trim()
    if (!nombre) return
    if (items.some((c) => c.toLowerCase() === nombre.toLowerCase())) {
      alert('Ese nombre ya existe.')
      return
    }
    setItems([...items, nombre])
    setNuevo('')
  }

  return (
    <Modal titulo={titulo} onCerrar={onCerrar}>
      <p className="nota">{nota}</p>
      <ul className="lista-editable">
        {items.map((c) => (
          <li key={c}>
            <span>{c}</span>
            <button
              className="boton-icono"
              onClick={() => setItems(items.filter((x) => x !== c))}
              title="Quitar"
            >
              <Trash2 size={16} />
            </button>
          </li>
        ))}
      </ul>
      <div className="agregar-item">
        <input
          value={nuevo}
          onChange={(e) => setNuevo(e.target.value)}
          placeholder={placeholder}
          maxLength={50}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              agregar()
            }
          }}
        />
        <button type="button" className="boton secundario" onClick={agregar}>
          Agregar
        </button>
      </div>
      <button
        className="boton primario"
        onClick={() => onGuardar(items)}
        disabled={!permitirVacia && items.length === 0}
      >
        Guardar cambios
      </button>
    </Modal>
  )
}
