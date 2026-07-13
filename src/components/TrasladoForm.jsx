import { useState } from 'react'
import Modal from './Modal'
import { hoyISO } from '../utils'

export default function TrasladoForm({ inicial, onGuardar, onCerrar }) {
  const [direccion, setDireccion] = useState(inicial?.direccion ?? 'efectivo-a-depositado')
  const [monto, setMonto] = useState(inicial?.monto ?? '')
  const [fecha, setFecha] = useState(inicial?.fecha ?? hoyISO())
  const [descripcion, setDescripcion] = useState(inicial?.descripcion ?? '')
  const [guardando, setGuardando] = useState(false)

  async function enviar(e) {
    e.preventDefault()
    const montoNum = Number(monto)
    if (!montoNum || montoNum <= 0) {
      alert('Ingresá un monto mayor a cero.')
      return
    }
    setGuardando(true)
    await onGuardar(
      { tipo: 'traslado', monto: montoNum, fecha, direccion, descripcion: descripcion.trim() },
      inicial?.id,
    )
    setGuardando(false)
  }

  return (
    <Modal titulo={inicial?.id ? 'Editar traslado' : 'Nuevo traslado'} onCerrar={onCerrar}>
      <form onSubmit={enviar} className="formulario">
        <div className="selector-doble vertical">
          <button
            type="button"
            className={direccion === 'efectivo-a-depositado' ? 'activo' : ''}
            onClick={() => setDireccion('efectivo-a-depositado')}
          >
            💵 → 🏦 Depositar efectivo al banco
          </button>
          <button
            type="button"
            className={direccion === 'depositado-a-efectivo' ? 'activo' : ''}
            onClick={() => setDireccion('depositado-a-efectivo')}
          >
            🏦 → 💵 Retirar del banco a efectivo
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
            placeholder="Ej: 50000"
            required
            autoFocus={!inicial?.id}
          />
        </label>

        <label>
          Fecha
          <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
        </label>

        <label>
          Descripción (opcional)
          <input
            type="text"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Ej: depósito por SINPE"
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
