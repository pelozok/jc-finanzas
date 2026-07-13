import { useState } from 'react'
import Modal from './Modal'

export default function Categorias({ lista, onGuardar, onCerrar }) {
  const [categorias, setCategorias] = useState(lista)
  const [nueva, setNueva] = useState('')

  function agregar() {
    const nombre = nueva.trim()
    if (!nombre) return
    if (categorias.some((c) => c.toLowerCase() === nombre.toLowerCase())) {
      alert('Esa categoría ya existe.')
      return
    }
    setCategorias([...categorias, nombre])
    setNueva('')
  }

  return (
    <Modal titulo="Categorías" onCerrar={onCerrar}>
      <p className="nota">
        Los movimientos ya guardados conservan su categoría aunque la quités de la lista.
      </p>
      <ul className="lista-categorias">
        {categorias.map((c) => (
          <li key={c}>
            <span>{c}</span>
            <button
              className="boton-icono"
              onClick={() => setCategorias(categorias.filter((x) => x !== c))}
              title="Quitar"
            >
              🗑️
            </button>
          </li>
        ))}
      </ul>
      <div className="agregar-categoria">
        <input
          value={nueva}
          onChange={(e) => setNueva(e.target.value)}
          placeholder="Nueva categoría"
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
        onClick={() => onGuardar(categorias)}
        disabled={categorias.length === 0}
      >
        Guardar cambios
      </button>
    </Modal>
  )
}
