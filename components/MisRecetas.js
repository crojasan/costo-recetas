'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { fmt } from '@/lib/currencies'
import DetalleReceta from './DetalleReceta'

export default function MisRecetas({ currency }) {
  const [recetas, setRecetas] = useState([])
  const [loading, setLoading] = useState(true)
  const [seleccionada, setSeleccionada] = useState(null)

  useEffect(() => { fetchRecetas() }, [])

  async function fetchRecetas() {
    setLoading(true)
    const { data } = await supabase.from('recetas').select('*').order('created_at', { ascending: false })
    setRecetas(data || [])
    setLoading(false)
  }

  async function eliminar(id) {
    await supabase.from('recetas').delete().eq('id', id)
    setRecetas(prev => prev.filter(r => r.id !== id))
    setSeleccionada(null)
  }

  function handleActualizada(recetaActualizada) {
    setRecetas(prev => prev.map(r => r.id === recetaActualizada.id ? recetaActualizada : r))
    setSeleccionada(recetaActualizada)
  }

  if (seleccionada) return (
    <DetalleReceta
      receta={seleccionada}
      currency={currency}
      onVolver={() => setSeleccionada(null)}
      onEliminar={eliminar}
      onActualizada={handleActualizada}
    />
  )

  if (loading) return <p style={{ color:'#888', fontSize:'14px' }}>Cargando...</p>

  if (!recetas.length) return (
    <div style={{ textAlign:'center', padding:'2rem', color:'#888', fontSize:'14px' }}>
      Aún no hay recetas guardadas.
    </div>
  )

  return (
    <div>
      {recetas.map(r => (
        <div key={r.id} style={card}>
          <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'10px' }}>
            <button onClick={() => setSeleccionada(r)}
              style={{ flex:1, textAlign:'left', fontSize:'15px', fontWeight:'500', background:'none', border:'none', cursor:'pointer', color:'#1D9E75', padding:0 }}>
              {r.nombre}
            </button>
            <span style={tag}>{r.categoria}</span>
            <span style={{ fontSize:'12px', color:'#888' }}>{r.porciones} porciones</span>
            <button onClick={() => eliminar(r.id)} style={btnDanger}>eliminar</button>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,minmax(0,1fr))', gap:'8px', marginBottom:'10px' }}>
            {[
              ['Ingredientes', r.costo_ing],
              ['Mano de obra', r.mo],
              ['Otros', r.otros],
              ['Precio venta', r.pventa],
            ].map(([label, val]) => (
              <div key={label} style={metric}>
                <div style={{ fontSize:'15px', fontWeight:'500', color: label==='Precio venta'?'#0F6E56':'#1a1a1a' }}>
                  {fmt(val, currency)}
                </div>
                <div style={{ fontSize:'11px', color:'#888', marginTop:'2px' }}>{label}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize:'12px', color:'#aaa' }}>
            Costo total: {fmt(r.total, currency)} · Por porción: {fmt(r.pventa / r.porciones, currency)} · Margen: {r.margen}%
          </div>
        </div>
      ))}
    </div>
  )
}

const card = { background:'#fff', border:'1px solid #e5e5e5', borderRadius:'12px', padding:'1rem 1.25rem', marginBottom:'12px' }
const metric = { background:'#f5f5f3', borderRadius:'8px', padding:'10px 14px', textAlign:'center' }
const tag = { fontSize:'11px', padding:'2px 8px', borderRadius:'6px', background:'#FAEEDA', color:'#633806', fontWeight:'500' }
const btnDanger = { fontSize:'12px', padding:'4px 10px', background:'transparent', border:'1px solid #fca5a5', color:'#c0392b', borderRadius:'6px', cursor:'pointer' }