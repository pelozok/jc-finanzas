// ============================================================
// Configuración pública de la app.
//
// IMPORTANTE: nada de lo que hay en este archivo es secreto.
// La "apiKey" de Firebase solo identifica el proyecto (es como
// la dirección del edificio, no la llave de la puerta).
// La seguridad real está en:
//   1. Las reglas de Firestore (archivo firestore.rules)
//   2. Firebase App Check con reCAPTCHA v3
//   3. Los dominios autorizados de Firebase Auth
// ============================================================

export const firebaseConfig = {
  apiKey: 'AIzaSyDvz-GaOhvBJZccAV0_Puu_HxjAiKQlL8o',
  authDomain: 'jc-finanzas.firebaseapp.com',
  projectId: 'jc-finanzas',
  storageBucket: 'jc-finanzas.firebasestorage.app',
  messagingSenderId: '945174010534',
  appId: '1:945174010534:web:f04a72b985bf5e55fab267',
}

// Clave del sitio de reCAPTCHA v3 (también es pública; la clave SECRETA
// solo vive en Firebase → App Check, nunca en este repositorio).
export const RECAPTCHA_SITE_KEY = '6LeIVVItAAAAACEoTGMqyEs6980r4rWZjjbf7EFW'

// Categorías que se crean la primera vez que se usa la app.
// Después se administran desde la propia app (⚙️ Categorías).
export const CATEGORIAS_INICIALES = [
  'Ofrendas',
  'Actividades',
  'Materiales',
  'Transporte',
  'Otros',
]
