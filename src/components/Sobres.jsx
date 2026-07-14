import { ArrowLeftRight, Mail, Settings2 } from 'lucide-react'
import { colones } from '../utils'

export default function Sobres({ nombres, balances, onMover, onEditar }) {
  const sinAsignar = balances.get('') ?? 0

  return (
    <section className="sobres">
      <div className="seccion-barra">
        <h2>
          <Mail size={16} /> Sobres
        </h2>
        {nombres.length > 0 && (
          <button className="boton-chico" onClick={onMover}>
            <ArrowLeftRight size={14} /> Mover
          </button>
        )}
        <button className="boton-icono" onClick={onEditar} title="Editar sobres">
          <Settings2 size={18} />
        </button>
      </div>

      {nombres.length === 0 ? (
        <p className="nota">
          Creá sobres para apartar plata del saldo total: campamento, caja chica, etc.
        </p>
      ) : (
        <div className="sobres-chips">
          {nombres.map((n) => (
            <div key={n} className="sobre-chip">
              <span>{n}</span>
              <strong>{colones(balances.get(n) ?? 0)}</strong>
            </div>
          ))}
          <div className="sobre-chip sin-asignar">
            <span>Sin asignar</span>
            <strong>{colones(sinAsignar)}</strong>
          </div>
        </div>
      )}
    </section>
  )
}
