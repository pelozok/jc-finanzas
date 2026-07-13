import { colones } from '../utils'

export default function Saldos({ saldos }) {
  return (
    <section className="saldos">
      <div className="saldo-total">
        <span className="saldo-etiqueta">Saldo total</span>
        <span className="saldo-monto grande">{colones(saldos.total)}</span>
      </div>
      <div className="saldos-detalle">
        <div className="saldo">
          <span className="saldo-etiqueta">💵 Efectivo</span>
          <span className="saldo-monto">{colones(saldos.efectivo)}</span>
        </div>
        <div className="saldo">
          <span className="saldo-etiqueta">🏦 Depositado</span>
          <span className="saldo-monto">{colones(saldos.depositado)}</span>
        </div>
      </div>
    </section>
  )
}
