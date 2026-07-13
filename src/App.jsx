import { useEffect, useMemo, useState } from 'react'
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore'
import { auth, googleProvider, db } from './firebase'
import { CATEGORIAS_INICIALES } from './config'
import { mesActual } from './utils'
import Login from './components/Login'
import Saldos from './components/Saldos'
import Historial from './components/Historial'
import MovimientoForm from './components/MovimientoForm'
import TrasladoForm from './components/TrasladoForm'
import Categorias from './components/Categorias'

export default function App() {
  const [user, setUser] = useState(undefined) // undefined = todavía no sabemos
  const [acceso, setAcceso] = useState('cargando') // cargando | ok | denegado
  const [movimientos, setMovimientos] = useState([])
  const [categorias, setCategorias] = useState(CATEGORIAS_INICIALES)
  const [modal, setModal] = useState(null)
  const [filtroMes, setFiltroMes] = useState(mesActual())

  useEffect(() => onAuthStateChanged(auth, (u) => setUser(u ?? null)), [])

  // Escucha los movimientos en vivo. Si Firestore rechaza la lectura,
  // significa que el correo no está en la lista autorizada de las reglas.
  useEffect(() => {
    if (!user) return
    setAcceso('cargando')
    const unsub = onSnapshot(
      collection(db, 'movimientos'),
      (snap) => {
        setMovimientos(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
        setAcceso('ok')
      },
      (err) => {
        if (err.code === 'permission-denied') setAcceso('denegado')
        else console.error(err)
      },
    )
    return unsub
  }, [user])

  // Categorías en vivo; si el documento aún no existe, se crea con las iniciales.
  useEffect(() => {
    if (acceso !== 'ok') return
    const ref = doc(db, 'config', 'categorias')
    return onSnapshot(ref, (snap) => {
      if (snap.exists()) setCategorias(snap.data().lista)
      else setDoc(ref, { lista: CATEGORIAS_INICIALES }).catch(console.error)
    })
  }, [acceso])

  // Los saldos se calculan siempre sobre TODOS los movimientos,
  // sin importar el mes filtrado en el historial.
  const saldos = useMemo(() => {
    let efectivo = 0
    let depositado = 0
    for (const m of movimientos) {
      if (m.tipo === 'traslado') {
        const signo = m.direccion === 'efectivo-a-depositado' ? 1 : -1
        efectivo -= signo * m.monto
        depositado += signo * m.monto
      } else {
        const signo = m.tipo === 'ingreso' ? 1 : -1
        if (m.metodo === 'efectivo') efectivo += signo * m.monto
        else depositado += signo * m.monto
      }
    }
    return { efectivo, depositado, total: efectivo + depositado }
  }, [movimientos])

  const meses = useMemo(() => {
    const set = new Set(movimientos.map((m) => m.fecha?.slice(0, 7)).filter(Boolean))
    set.add(mesActual())
    return [...set].sort().reverse()
  }, [movimientos])

  const visibles = useMemo(() => {
    const lista =
      filtroMes === 'todos'
        ? movimientos
        : movimientos.filter((m) => m.fecha?.startsWith(filtroMes))
    return [...lista].sort(
      (a, b) =>
        (b.fecha ?? '').localeCompare(a.fecha ?? '') ||
        (b.creadoEn?.seconds ?? 0) - (a.creadoEn?.seconds ?? 0),
    )
  }, [movimientos, filtroMes])

  async function guardar(datos, id) {
    try {
      if (id) {
        await updateDoc(doc(db, 'movimientos', id), datos)
      } else {
        await addDoc(collection(db, 'movimientos'), {
          ...datos,
          creadoPor: user.email,
          creadoEn: serverTimestamp(),
        })
      }
      setModal(null)
    } catch (e) {
      alert('No se pudo guardar: ' + e.message)
    }
  }

  async function borrar(m) {
    if (!confirm('¿Seguro que querés borrar este movimiento?')) return
    try {
      await deleteDoc(doc(db, 'movimientos', m.id))
    } catch (e) {
      alert('No se pudo borrar: ' + e.message)
    }
  }

  async function guardarCategorias(lista) {
    try {
      await setDoc(doc(db, 'config', 'categorias'), { lista })
      setModal(null)
    } catch (e) {
      alert('No se pudieron guardar las categorías: ' + e.message)
    }
  }

  if (user === undefined) {
    return <div className="pantalla-centrada">Cargando…</div>
  }

  if (user === null) {
    return <Login onEntrar={() => signInWithPopup(auth, googleProvider).catch(() => {})} />
  }

  if (acceso === 'denegado') {
    return (
      <div className="pantalla-centrada">
        <div className="tarjeta acceso-denegado">
          <h1>🔒 Acceso restringido</h1>
          <p>
            La cuenta <strong>{user.email}</strong> no está autorizada para ver las
            finanzas de JC — Jóvenes Central.
          </p>
          <p>Si creés que es un error, hablá con el encargado del ministerio.</p>
          <button className="boton secundario" onClick={() => signOut(auth)}>
            Salir y usar otra cuenta
          </button>
        </div>
      </div>
    )
  }

  if (acceso === 'cargando') {
    return <div className="pantalla-centrada">Cargando datos…</div>
  }

  return (
    <div className="app">
      <header className="encabezado">
        <div className="titulo">
          <h1>💰 JC Finanzas</h1>
          <span>Jóvenes Central</span>
        </div>
        <button className="boton-salir" onClick={() => signOut(auth)} title={user.email}>
          Salir
        </button>
      </header>

      <Saldos saldos={saldos} />

      <div className="acciones">
        <button
          className="boton accion-ingreso"
          onClick={() => setModal({ tipo: 'movimiento', datos: { tipo: 'ingreso' } })}
        >
          + Ingreso
        </button>
        <button
          className="boton accion-gasto"
          onClick={() => setModal({ tipo: 'movimiento', datos: { tipo: 'gasto' } })}
        >
          − Gasto
        </button>
        <button className="boton accion-traslado" onClick={() => setModal({ tipo: 'traslado' })}>
          ⇄ Traslado
        </button>
      </div>

      <Historial
        movimientos={visibles}
        meses={meses}
        filtroMes={filtroMes}
        onFiltroMes={setFiltroMes}
        onEditar={(m) =>
          setModal(
            m.tipo === 'traslado'
              ? { tipo: 'traslado', datos: m }
              : { tipo: 'movimiento', datos: m },
          )
        }
        onBorrar={borrar}
        onCategorias={() => setModal({ tipo: 'categorias' })}
      />

      {modal?.tipo === 'movimiento' && (
        <MovimientoForm
          inicial={modal.datos}
          categorias={categorias}
          onGuardar={guardar}
          onCerrar={() => setModal(null)}
        />
      )}
      {modal?.tipo === 'traslado' && (
        <TrasladoForm inicial={modal.datos} onGuardar={guardar} onCerrar={() => setModal(null)} />
      )}
      {modal?.tipo === 'categorias' && (
        <Categorias lista={categorias} onGuardar={guardarCategorias} onCerrar={() => setModal(null)} />
      )}
    </div>
  )
}
