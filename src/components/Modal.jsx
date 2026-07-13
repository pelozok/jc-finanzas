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
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
