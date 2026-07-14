import * as XLSX from 'xlsx'

const TIPOS = {
  ingreso: 'Ingreso',
  gasto: 'Gasto',
  traslado: 'Traslado',
  asignacion: 'Sobres',
}

function metodoTexto(m) {
  if (m.tipo === 'traslado') {
    return m.direccion === 'efectivo-a-depositado'
      ? 'Efectivo → Depositado'
      : 'Depositado → Efectivo'
  }
  if (m.metodo === 'efectivo') return 'Efectivo'
  if (m.metodo === 'depositado') return 'Depositado'
  return ''
}

function sobreTexto(m) {
  if (m.tipo === 'asignacion') {
    return `${m.sobreOrigen || 'Sin asignar'} → ${m.sobreDestino || 'Sin asignar'}`
  }
  return m.sobre ?? ''
}

// Descarga un Excel con los movimientos visibles (según el filtro de mes)
// y una hoja de resumen con los saldos y sobres actuales.
export function exportarExcel({ movimientos, filtroMes, saldos, nombresSobres, balancesSobres }) {
  // En el Excel conviene el orden cronológico (viejo → nuevo).
  const filas = [...movimientos].reverse().map((m) => ({
    Fecha: m.fecha,
    Tipo: TIPOS[m.tipo] ?? m.tipo,
    'Descripción': m.descripcion ?? '',
    'Categoría': m.categoria ?? '',
    'Método': metodoTexto(m),
    Sobre: sobreTexto(m),
    'Monto (₡)': m.tipo === 'gasto' ? -m.monto : m.monto,
    'Registrado por': m.creadoPor ?? '',
  }))
  const hojaMovimientos = XLSX.utils.json_to_sheet(filas)
  hojaMovimientos['!cols'] = [
    { wch: 11 }, { wch: 9 }, { wch: 32 }, { wch: 14 },
    { wch: 22 }, { wch: 26 }, { wch: 12 }, { wch: 26 },
  ]

  const resumen = [
    ['Resumen de saldos (todos los movimientos)'],
    ['Efectivo', saldos.efectivo],
    ['Depositado', saldos.depositado],
    ['Total', saldos.total],
    [],
    ['Sobres'],
    ...nombresSobres.map((n) => [n, balancesSobres.get(n) ?? 0]),
    ['Sin asignar', balancesSobres.get('') ?? 0],
  ]
  const hojaResumen = XLSX.utils.aoa_to_sheet(resumen)
  hojaResumen['!cols'] = [{ wch: 24 }, { wch: 14 }]

  const libro = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(libro, hojaMovimientos, 'Movimientos')
  XLSX.utils.book_append_sheet(libro, hojaResumen, 'Resumen')

  const etiqueta = filtroMes === 'todos' ? 'todo' : filtroMes
  XLSX.writeFile(libro, `JC-Finanzas-${etiqueta}.xlsx`)
}
