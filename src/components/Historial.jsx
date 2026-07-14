import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  Mail,
  Pencil,
  Settings2,
  Trash2,
} from 'lucide-react'
import { colones, fechaBonita, mesBonito } from '../utils'

const ICONOS = {
  ingreso: <ArrowDownLeft size={17} />,
  gasto: <ArrowUpRight size={17} />,
  traslado: <ArrowLeftRight size={17} />,
  asignacion: <Mail size={17} />,
}

function titulo(m) {
  if (m.tipo === 'traslado') {
    return m.direccion === 'efectivo-a-depositado'
      ? 'Depósito: efectivo → banco'
      : 'Retiro: banco → efectivo'
  }
  if (m.tipo === 'asignacion') {
    return `Sobres: ${m.sobreOrigen || 'Sin asignar'} → ${m.sobreDestino || 'Sin asignar'}`
  }
  return m.descripcion || m.categoria
}

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
      <div className="seccion-barra">
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
          <Settings2 size={18} />
        </button>
      </div>

      {movimientos.length === 0 && (
        <p className="vacio">No hay movimientos en este período.</p>
      )}

      <ul className="lista">
        {movimientos.map((m) => (
          <li key={m.id} className="item">
            <div className={`item-icono ${m.tipo}`}>{ICONOS[m.tipo]}</div>
            <div className="item-info">
              <span className="item-titulo">{titulo(m)}</span>
              <span className="item-detalle">
                {fechaBonita(m.fecha)}
                {(m.tipo === 'ingreso' || m.tipo === 'gasto') && (
                  <>
                    {' · '}
                    {m.categoria}
                    {' · '}
                    {m.metodo === 'efectivo' ? 'Efectivo' : 'Depositado'}
                    {m.sobre && <> · Sobre: {m.sobre}</>}
                  </>
                )}
                {(m.tipo === 'traslado' || m.tipo === 'asignacion') && m.descripcion && (
                  <> · {m.descripcion}</>
                )}
              </span>
            </div>
            <div className="item-derecha">
              <span className={`item-monto ${m.tipo}`}>
                {m.tipo === 'ingreso' ? '+' : m.tipo === 'gasto' ? '−' : ''}
                {colones(m.monto)}
              </span>
              <div className="item-botones">
                <button className="boton-icono" onClick={() => onEditar(m)} title="Editar">
                  <Pencil size={16} />
                </button>
                <button className="boton-icono" onClick={() => onBorrar(m)} title="Borrar">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
