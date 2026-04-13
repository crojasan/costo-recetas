import { AuthProvider } from '@/context/AuthContext'
import './globals.css'

export const metadata = {
  title: 'Costo Recetas',
  description: 'Calculadora de costos para cocina y repostería',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}