'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { CURRENCIES } from '@/lib/currencies'

export default function Auth() {
  const [tab, setTab] = useState('login')
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [currency, setCurrency] = useState('CLP')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    setError(''); setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError('Correo o contraseña incorrectos.')
    setLoading(false)
  }

  async function handleRegister() {
    setError(''); setLoading(true)
    if (!nombre || !email || !password) { setError('Completa todos los campos.'); setLoading(false); return }
    if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres.'); setLoading(false); return }
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { nombre, currency } }
    })
    if (error) setError(error.message)
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '4px' }}>Costo Recetas</h1>
          <p style={{ color: '#888', fontSize: '14px' }}>Tu calculadora personal de costos</p>
        </div>

        <div style={{ display: 'flex', background: '#fff', border: '1px solid #e5e5e5', borderRadius: '10px', overflow: 'hidden', marginBottom: '1rem' }}>
          {['login', 'register'].map(t => (
            <button key={t} onClick={() => { setTab(t); setError('') }}
              style={{ flex: 1, padding: '10px', fontSize: '14px', fontWeight: '500', border: 'none', cursor: 'pointer',
                background: tab === t ? '#f5f5f3' : '#fff', color: tab === t ? '#1a1a1a' : '#888' }}>
              {t === 'login' ? 'Iniciar sesión' : 'Registrarse'}
            </button>
          ))}
        </div>

        <div style={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: '12px', padding: '1.5rem' }}>
          {tab === 'register' && (
            <div style={{ marginBottom: '12px' }}>
              <label style={labelStyle}>Nombre</label>
              <input style={inputStyle} placeholder="Tu nombre" value={nombre} onChange={e => setNombre(e.target.value)} />
            </div>
          )}
          <div style={{ marginBottom: '12px' }}>
            <label style={labelStyle}>Correo</label>
            <input style={inputStyle} type="email" placeholder="tu@correo.com" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div style={{ marginBottom: '12px' }}>
            <label style={labelStyle}>Contraseña</label>
            <input style={inputStyle} type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          {tab === 'register' && (
            <div style={{ marginBottom: '12px' }}>
              <label style={labelStyle}>Moneda principal</label>
              <select style={inputStyle} value={currency} onChange={e => setCurrency(e.target.value)}>
                {Object.entries(CURRENCIES).map(([k, v]) => (
                  <option key={k} value={k}>{v.symbol} {v.name} ({k})</option>
                ))}
              </select>
            </div>
          )}
          {error && <p style={{ color: '#c0392b', fontSize: '13px', marginBottom: '10px' }}>{error}</p>}
          <button onClick={tab === 'login' ? handleLogin : handleRegister} disabled={loading}
            style={{ width: '100%', padding: '10px', background: '#1D9E75', color: '#fff', border: 'none',
              borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>
            {loading ? 'Cargando...' : tab === 'login' ? 'Entrar' : 'Crear cuenta'}
          </button>
        </div>
      </div>
    </div>
  )
}

const labelStyle = { fontSize: '12px', color: '#888', display: 'block', marginBottom: '4px' }
const inputStyle = { width: '100%', padding: '8px 10px', fontSize: '14px', border: '1px solid #e5e5e5', borderRadius: '8px', outline: 'none', background: '#fff', color: '#1a1a1a' }