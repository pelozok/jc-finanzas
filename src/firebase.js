import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check'
import { firebaseConfig, RECAPTCHA_SITE_KEY } from './config'

const app = initializeApp(firebaseConfig)

if (RECAPTCHA_SITE_KEY && RECAPTCHA_SITE_KEY !== 'PENDIENTE') {
  if (location.hostname === 'localhost') {
    // En desarrollo local, App Check imprime un "token de depuración" en la
    // consola del navegador. Hay que registrarlo en:
    // Firebase console → App Check → Apps → menú ⋮ de la app → Manage debug tokens
    self.FIREBASE_APPCHECK_DEBUG_TOKEN = true
  }
  initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(RECAPTCHA_SITE_KEY),
    isTokenAutoRefreshEnabled: true,
  })
}

export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()
export const db = getFirestore(app)
