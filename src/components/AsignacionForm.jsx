import { useState } from 'react'
import Modal from './Modal'
import { hoyISO } from '../utils'

export default function AsignacionForm({ inicial, sobres, onGuardar, onCerrar }) {
  const [sobreOrigen, setSobreOrigen] = useState(inicial?.sobreOrigen ?? '')
  const [sobreDestino, setSobreDestino] = useState(inicial?.sobreDestino ?? (sobres[0] ?? ''))
  const [monto, setMonto] = useState(inicial?.monto ?? '')
  const [fecha, setFecha] = useState(inicial?.fecha ?? hoyISO())
  const [descripcion, setDescripcion] = useState(inicial?.descripcion ?? '')
  const [guardando, setGuardando] = useState(false)

  // Por si un sobre viejo ya no está en la lista pero aparece en este registro.
  const opciones = [...new Set([...sobres, sobreOrigen, sobreDestino])].filter(Boolean)

  async function enviar(e) {
    e.preventDefault()
    const montoNum = Number(monto)
    if (!montoNum || montoNum <= 0) {
      alert('Ingresá un monto mayor a cero.')
      return
    }
    if (sobreOrigen === sobreDestino) {
      alert('Elegí dos sobres distintos.')
      return
    }
    setGuardando(true)
    await onGuardar(
      {
        tipo: 'asignacion',
        monto: montoNum,
        fecha,
        sobreOrigen,
        sobreDestino,
        descripcion: descripcion.trim(),
      },
      inicial?.id,
    )
    setGuardando(false)
  }

  function selectorSobre(valor, setValor) {
    return (
      <select value={valor} onChange={(e) => setValor(e.target.value)}>
        <option value="">Sin asignar</option>
        {opciones.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
    )
  }

  return (
    <Modal
      titulo={inicial?.id ? 'Editar movimiento de sobres' : 'Mover entre sobres'}
      onCerrar={onCerrar}
    >
      <form onSubmit={enviar} className="formulario">
        <label>
          Desde
          {selectorSobre(sobreOrigen, setSobreOrigen)}
        </label>

        <label>
          Hacia
          {selectorSobre(sobreDestino, setSobreDestino)}
        </label>

        <label>
          Monto (₡)
          <input
            type="number"
            inputMode="numeric"
            min="1"
            step="1"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            placeholder="Ej: 25000"
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
            placeholder="Ej: apartado para el campamento"
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
