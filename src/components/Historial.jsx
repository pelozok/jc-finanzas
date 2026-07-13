import { colones, fechaBonita, mesBonito } from '../utils'

export default function Historial({
  movimientos,
  meses,
  filtroMes,
  onFiltroMes,
  onEditar,
  onBorrar,
  onCategorias,
}) {
  return (
    <section className="historial">
      <div className="historial-barra">
        <h2>Movimientos</h2>
        <select value={filtroMes} onChange={(e) => onFiltroMes(e.target.value)}>
          <option value="todos">Todos los meses</option>
          {meses.map((m) => (
            <option key={m} value={m}>
              {mesBonito(m)}
            </option>
          ))}
        </select>
        <button className="boton-icono" onClick={onCategorias} title="Editar categorías">
          ⚙️
        </button>
      </div>

      {movimientos.length === 0 && (
        <p className="vacio">No hay movimientos en este período.</p>
      )}

      <ul className="lista">
        {movimientos.map((m) => (
          <li key={m.id} className="item">
            <div className="item-info">
              <span className="item-titulo">
                {m.tipo === 'traslado'
                  ? m.direccion === 'efectivo-a-depositado'
                    ? '⇄ Depósito: efectivo → banco'
                    : '⇄ Retiro: banco → efectivo'
                  : m.descripcion || m.categoria}
              </span>
              <span className="item-detalle">
                {fechaBonita(m.fecha)}
                {m.tipo !== 'traslado' && (
                  <>
                    {' · '}
                    {m.categoria}
                    {' · '}
                    {m.metodo === 'efectivo' ? '💵 Efectivo' : '🏦 Depositado'}
                  </>
                )}
                {m.tipo === 'traslado' && m.descripcion && <> · {m.descripcion}</>}
              </span>
            </div>
            <div className="item-derecha">
              <span className={`item-monto ${m.tipo}`}>
                {m.tipo === 'ingreso' ? '+' : m.tipo === 'gasto' ? '−' : ''}
                {colones(m.monto)}
              </span>
              <div className="item-botones">
                <button className="boton-icono" onClick={() => onEditar(m)} title="Editar">
                  ✏️
                </button>
                <button className="boton-icono" onClick={() => onBorrar(m)} title="Borrar">
                  🗑️
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
