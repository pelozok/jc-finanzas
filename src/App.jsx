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
import { ArrowLeftRight, Lock, Minus, Plus } from 'lucide-react'
import { auth, googleProvider, db } from './firebase'
import { CATEGORIAS_INICIALES } from './config'
import { mesActual } from './utils'
import { exportarExcel } from './exportar'
import logo from './assets/logo-jc.png'
import Login from './components/Login'
import Saldos from './components/Saldos'
import Sobres from './components/Sobres'
import Historial from './components/Historial'
import MovimientoForm from './components/MovimientoForm'
import TrasladoForm from './components/TrasladoForm'
import AsignacionForm from './components/AsignacionForm'
import EditorLista from './components/EditorLista'

export default function App() {
  const [user, setUser] = useState(undefined) // undefined = todavía no sabemos
  const [acceso, setAcceso] = useState('cargando') // cargando | ok | denegado
  const [movimientos, setMovimientos] = useState([])
  const [categorias, setCategorias] = useState(CATEGORIAS_INICIALES)
  const [listaSobres, setListaSobres] = useState([])
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

  // Sobres en vivo (fondos apartados dentro del saldo total).
  useEffect(() => {
    if (acceso !== 'ok') return
    return onSnapshot(doc(db, 'config', 'sobres'), (snap) => {
      if (snap.exists()) setListaSobres(snap.data().lista)
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
      } else if (m.tipo === 'ingreso' || m.tipo === 'gasto') {
        const signo = m.tipo === 'ingreso' ? 1 : -1
        if (m.metodo === 'efectivo') efectivo += signo * m.monto
        else depositado += signo * m.monto
      }
    }
    return { efectivo, depositado, total: efectivo + depositado }
  }, [movimientos])

  // Saldo de cada sobre. La clave '' representa "Sin asignar".
  const balancesSobres = useMemo(() => {
    const mapa = new Map()
    const sumar = (nombre, delta) =>
      mapa.set(nombre || '', (mapa.get(nombre || '') ?? 0) + delta)
    for (const m of movimientos) {
      if (m.tipo === 'ingreso') sumar(m.sobre, m.monto)
      else if (m.tipo === 'gasto') sumar(m.sobre, -m.monto)
      else if (m.tipo === 'asignacion') {
        sumar(m.sobreOrigen, -m.monto)
        sumar(m.sobreDestino, m.monto)
      }
    }
    return mapa
  }, [movimientos])

  // Sobres a mostrar: los configurados más cualquiera que aún tenga
  // movimientos aunque se haya quitado de la lista.
  const nombresSobres = useMemo(() => {
    const conMovimientos = [...balancesSobres.keys()].filter((n) => n !== '')
    return [...new Set([...listaSobres, ...conMovimientos])]
  }, [listaSobres, balancesSobres])

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

  async function guardarLista(docId, lista) {
    try {
      await setDoc(doc(db, 'config', docId), { lista })
      setModal(null)
    } catch (e) {
      alert('No se pudo guardar la lista: ' + e.message)
    }
  }

  function editar(m) {
    if (m.tipo === 'traslado') setModal({ tipo: 'traslado', datos: m })
    else if (m.tipo === 'asignacion') setModal({ tipo: 'asignacion', datos: m })
    else setModal({ tipo: 'movimiento', datos: m })
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
          <div className="logo">
            <Lock size={40} />
          </div>
          <h1>Acceso restringido</h1>
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
          <img src={logo} alt="JC" className="logo-encabezado" />
          <div>
            <h1>JC Finanzas</h1>
            <span>Jóvenes Central</span>
          </div>
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
          <Plus size={17} /> Ingreso
        </button>
        <button
          className="boton accion-gasto"
          onClick={() => setModal({ tipo: 'movimiento', datos: { tipo: 'gasto' } })}
        >
          <Minus size={17} /> Gasto
        </button>
        <button className="boton accion-traslado" onClick={() => setModal({ tipo: 'traslado' })}>
          <ArrowLeftRight size={17} /> Traslado
        </button>
      </div>

      <Sobres
        nombres={nombresSobres}
        balances={balancesSobres}
        onMover={() => setModal({ tipo: 'asignacion' })}
        onEditar={() => setModal({ tipo: 'sobres' })}
      />

      <Historial
        movimientos={visibles}
        meses={meses}
        filtroMes={filtroMes}
        onFiltroMes={setFiltroMes}
        onEditar={editar}
        onBorrar={borrar}
        onCategorias={() => setModal({ tipo: 'categorias' })}
        onExportar={() =>
          exportarExcel({
            movimientos: visibles,
            filtroMes,
            saldos,
            nombresSobres,
            balancesSobres,
          })
        }
      />

      {modal?.tipo === 'movimiento' && (
        <MovimientoForm
          inicial={modal.datos}
          categorias={categorias}
          sobres={nombresSobres}
          onGuardar={guardar}
          onCerrar={() => setModal(null)}
        />
      )}
      {modal?.tipo === 'traslado' && (
        <TrasladoForm inicial={modal.datos} onGuardar={guardar} onCerrar={() => setModal(null)} />
      )}
      {modal?.tipo === 'asignacion' && (
        <AsignacionForm
          inicial={modal.datos}
          sobres={nombresSobres}
          onGuardar={guardar}
          onCerrar={() => setModal(null)}
        />
      )}
      {modal?.tipo === 'categorias' && (
        <EditorLista
          titulo="Categorías"
          nota="Los movimientos ya guardados conservan su categoría aunque la quités de la lista."
          lista={categorias}
          placeholder="Nueva categoría"
          onGuardar={(l) => guardarLista('categorias', l)}
          onCerrar={() => setModal(null)}
        />
      )}
      {modal?.tipo === 'sobres' && (
        <EditorLista
          titulo="Sobres"
          nota="Los sobres dividen el saldo total en fondos apartados (campamento, caja chica, etc.). La plata que no esté en ningún sobre queda como «Sin asignar»."
          lista={listaSobres}
          placeholder="Nuevo sobre"
          permitirVacia
          onGuardar={(l) => guardarLista('sobres', l)}
          onCerrar={() => setModal(null)}
        />
      )}
    </div>
  )
}
