const formatoCRC = new Intl.NumberFormat('es-CR', {
  style: 'currency',
  currency: 'CRC',
  maximumFractionDigits: 0,
})

export function colones(monto) {
  return formatoCRC.format(monto)
}

// Fecha de hoy en formato YYYY-MM-DD usando la hora local (no UTC),
// para que cerca de medianoche no se registre el día equivocado.
export function hoyISO() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function mesActual() {
  return hoyISO().slice(0, 7)
}

// '2026-07-13' → '13 jul 2026'
export function fechaBonita(iso) {
  if (!iso) return ''
  const [a, m, d] = iso.split('-').map(Number)
  return new Date(a, m - 1, d).toLocaleDateString('es-CR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

// '2026-07' → 'julio 2026'
export function mesBonito(yyyyMM) {
  const [a, m] = yyyyMM.split('-').map(Number)
  const texto = new Date(a, m - 1, 1).toLocaleDateString('es-CR', {
    month: 'long',
    year: 'numeric',
  })
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}
