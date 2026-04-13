'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { CURRENCIES } from '@/lib/currencies'
import Ingredientes from './Ingredientes'
import NuevaReceta from './NuevaReceta'
import MisRecetas from './MisRecetas'

export default function Dashboard() {
  const { user } = useAuth()
  const nombre = user?.user_metadata?.nombre || 'Usuario'
  const initials = nombre.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
  const [tab, setTab] = useState('ingredientes')
  const [currency, setCurrency] = useState(user?.user_metadata?.currency || 'CLP')

  async function handleLogout() {
    await supabase.auth.signOut()
  }

  function handleCurrencyChange(e) {
    setCurrency(e.target.value)
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #e5e5e5' }}>
        <span style={{ fontSize: '16px', fontWeight: '600' }}>Costo Recetas</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '13px', color: '#888' }}>{nombre}</span>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#E1F5EE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '600', color: '#0F6E56' }}>
            {initials}
          </div>
          <button onClick={handleLogout} style={{ fontSize: '12px', padding: '5px 12px', border: '1px solid #e5e5e5', borderRadius: '8px', background: 'transparent', cursor: 'pointer', color: '#1a1a1a' }}>
            Salir
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#fff', border: '1px solid #e5e5e5', borderRadius: '8px', padding: '8px 14px', marginBottom: '1.5rem' }}>
        <span style={{ fontSize: '13px', color: '#888' }}>Moneda:</span>
        <select value={currency} onChange={handleCurrencyChange} style={{ fontSize: '13px', border: 'none', background: 'transparent', color: '#1a1a1a', cursor: 'pointer', outline: 'none' }}>
          {Object.entries(CURRENCIES).map(([k, v]) => (
            <option key={k} value={k}>{v.symbol} {v.name} ({k})</option>
          ))}
        </select>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem', borderBottom: '1px solid #e5e5e5', paddingBottom: '1rem' }}>
        {[['ingredientes', 'Ingredientes'], ['nueva', 'Nueva receta'], ['recetas', 'Mis recetas']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            style={{ padding: '6px 14px', fontSize: '13px', fontWeight: '500', border: 'none', borderRadius: '8px', cursor: 'pointer',
              background: tab === key ? '#f5f5f3' : 'transparent', color: tab === key ? '#1a1a1a' : '#888' }}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'ingredientes' && <Ingredientes currency={currency} />}
      {tab === 'nueva' && <NuevaReceta currency={currency} onSaved={() => setTab('recetas')} />}
      {tab === 'recetas' && <MisRecetas currency={currency} />}
    </div>
  )
}