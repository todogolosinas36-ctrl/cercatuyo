import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// ============================================================================
// ⚠️ ATENCIÓN: PEGA AQUÍ TUS CLAVES REALES DE CONFIGURACIÓN DE FIREBASE ⚠️
// ============================================================================
// Puedes obtener este objeto desde la Consola de Firebase:
// 1. Ve a "Configuración del proyecto" (ícono de engranaje).
// 2. En la pestaña "General", baja hasta "Tus apps".
// 3. Selecciona tu app Web (</>) y copia el objeto `firebaseConfig`.
// ============================================================================
const firebaseConfig = {
  apiKey: "TU_API_KEY_AQUI",
  authDomain: "TU_PROYECTO.firebaseapp.com",
  projectId: "TU_PROJECT_ID",
  storageBucket: "TU_PROYECTO.appspot.com",
  messagingSenderId: "TU_MESSAGING_SENDER_ID",
  appId: "TU_APP_ID"
};
// ============================================================================

// Inicializar Firebase (evita inicializaciones duplicadas en desarrollo / Fast Refresh)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Instancia de Firestore Database
export const db = getFirestore(app);

export default app;
