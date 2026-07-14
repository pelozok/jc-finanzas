import { useState } from 'react'
import { Banknote, Landmark } from 'lucide-react'
import Modal from './Modal'
import { hoyISO } from '../utils'

export default function MovimientoForm({ inicial, categorias, sobres, onGuardar, onCerrar }) {
  const editando = Boolean(inicial?.id)
  const [tipo, setTipo] = useState(inicial?.tipo ?? 'ingreso')
  const [monto, setMonto] = useState(inicial?.monto ?? '')
  const [fecha, setFecha] = useState(inicial?.fecha ?? hoyISO())
  const [categoria, setCategoria] = useState(inicial?.categoria ?? categorias[0] ?? 'Otros')
  const [metodo, setMetodo] = useState(inicial?.metodo ?? 'efectivo')
  const [sobre, setSobre] = useState(inicial?.sobre ?? '')
  const [descripcion, setDescripcion] = useState(inicial?.descripcion ?? '')
  const [guardando, setGuardando] = useState(false)

  // Si se está editando un movimiento cuya categoría o sobre ya fue borrado
  // de la lista, se agrega como opción para no perderlo al abrir el formulario.
  const opcionesCategoria = categorias.includes(categoria)
    ? categorias
    : [categoria, ...categorias]
  const opcionesSobre = !sobre || sobres.includes(sobre) ? sobres : [sobre, ...sobres]

  async function enviar(e) {
    e.preventDefault()
    const montoNum = Number(monto)
    if (!montoNum || montoNum <= 0) {
      alert('Ingresá un monto mayor a cero.')
      return
    }
    setGuardando(true)
    await onGuardar(
      { tipo, monto: montoNum, fecha, categoria, metodo, sobre, descripcion: descripcion.trim() },
      inicial?.id,
    )
    setGuardando(false)
  }

  return (
    <Modal
      titulo={editando ? 'Editar movimiento' : tipo === 'ingreso' ? 'Nuevo ingreso' : 'Nuevo gasto'}
      onCerrar={onCerrar}
    >
      <form onSubmit={enviar} className="formulario">
        <div className="selector-doble">
          <button
            type="button"
            className={tipo === 'ingreso' ? 'activo verde' : ''}
            onClick={() => setTipo('ingreso')}
          >
            Ingreso
          </button>
          <button
            type="button"
            className={tipo === 'gasto' ? 'activo rojo' : ''}
            onClick={() => setTipo('gasto')}
          >
            Gasto
          </button>
        </div>

        <label>
          Monto (₡)
          <input
            type="number"
            inputMode="numeric"
            min="1"
            step="1"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            placeholder="Ej: 5000"
            required
            autoFocus={!editando}
          />
        </label>

        <label>
          Fecha
          <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
        </label>

        <label>
          Categoría
          <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
            {opcionesCategoria.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label className="etiqueta-grupo">Método</label>
        <div className="selector-doble">
          <button
            type="button"
            className={metodo === 'efectivo' ? 'activo' : ''}
            onClick={() => setMetodo('efectivo')}
          >
            <Banknote size={16} /> Efectivo
          </button>
          <button
            type="button"
            className={metodo === 'depositado' ? 'activo' : ''}
            onClick={() => setMetodo('depositado')}
          >
            <Landmark size={16} /> Depositado
          </button>
        </div>

        {opcionesSobre.length > 0 && (
          <label>
            Sobre (opcional)
            <select value={sobre} onChange={(e) => setSobre(e.target.value)}>
              <option value="">Sin asignar</option>
              {opcionesSobre.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
        )}

        <label>
          Descripción (opcional)
          <input
            type="text"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Ej: ofrenda del viernes"
            maxLength={500}
          />
        </label>

        <button type="submit" className="boton primario" disabled={guardando}>
          {guardando ? 'Guardando…' : 'Guardar'}
        </button>
      </form>
    </Modal>
  )
}
