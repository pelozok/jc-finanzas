import { Wallet } from 'lucide-react'

export default function Login({ onEntrar }) {
  return (
    <div className="pantalla-centrada">
      <div className="tarjeta login">
        <div className="logo">
          <Wallet size={44} />
        </div>
        <h1>JC Finanzas</h1>
        <p>
          Control de ingresos y gastos del ministerio de jóvenes
          <br />
          <strong>Jóvenes Central</strong>
        </p>
        <button className="boton primario" onClick={onEntrar}>
          Entrar con Google
        </button>
        <p className="nota">Solo las cuentas autorizadas pueden ver los datos.</p>
      </div>
    </div>
  )
}
