'use client'
import { useAuth } from '@/context/AuthContext'
import Auth from '@/components/Auth'
import Dashboard from '@/components/Dashboard'

export default function Home() {
  const { user, loading } = useAuth()

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <p style={{ color: '#888' }}>Cargando...</p>
    </div>
  )

  return user ? <Dashboard /> : <Auth />
}