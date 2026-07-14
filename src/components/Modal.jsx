import { X } from 'lucide-react'

export default function Modal({ titulo, onCerrar, children }) {
  return (
    <div
      className="modal-fondo"
      onClick={(e) => e.target === e.currentTarget && onCerrar()}
    >
      <div className="modal">
        <div className="modal-encabezado">
          <h2>{titulo}</h2>
          <button className="boton-icono" onClick={onCerrar} aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
