'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { fmt, CURRENCIES } from '@/lib/currencies'

const CATEGORIAS = ['Harina y almidones','Lácteos','Huevos','Azúcares','Grasas y aceites','Saborizantes','Frutas','Otros']
const UNIDADES = ['g','ml','un','kg','l']

export default function Ingredientes({ currency }) {
  const { user } = useAuth()
  const [ingredientes, setIngredientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [editando, setEditando] = useState(null)
  const [nombre, setNombre] = useState('')
  const [categoria, setCategoria] = useState(CATEGORIAS[0])
  const [precio, setPrecio] = useState('')
  const [cantidad, setCantidad] = useState('')
  const [unidad, setUnidad] = useState('g')
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchIngredientes() }, [])

  async function fetchIngredientes() {
    setLoading(true)
    const { data } = await supabase.from('ingredientes').select('*').order('created_at', { ascending: false })
    setIngredientes(data || [])
    setLoading(false)
  }

  function iniciarEdicion(i) {
    setEditando(i.id)
    setNombre(i.nombre)
    setCategoria(i.categoria)
    setPrecio(i.precio)
    setCantidad(i.cantidad)
    setUnidad(i.unidad)
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
  }

  function cancelarEdicion() {
    setEditando(null)
    setNombre(''); setPrecio(''); setCantidad(''); setUnidad('g'); setCategoria(CATEGORIAS[0])
  }

  async function guardar() {
    if (!nombre || !precio || !cantidad) { alert('Completa todos los campos.'); return }
    setSaving(true)
    const ppu = parseFloat(precio) / parseFloat(cantidad)
    if (editando) {
      await supabase.from('ingredientes').update({ nombre, categoria, precio: parseFloat(precio), cantidad: parseFloat(cantidad), unidad, ppu, currency }).eq('id', editando)
    } else {
      await supabase.from('ingredientes').insert({ user_id: user.id, nombre, categoria, precio: parseFloat(precio), cantidad: parseFloat(cantidad), unidad, ppu, currency })
    }
    cancelarEdicion()
    await fetchIngredientes()
    setSaving(false)
  }

  async function eliminar(id) {
    await supabase.from('ingredientes').delete().eq('id', id)
    setIngredientes(prev => prev.filter(i => i.id !== id))
    if (editando === id) cancelarEdicion()
  }

  async function cargarEjemplos() {
    setSaving(true)
    const ejemplos = [
      { nombre:'Harina de trigo', categoria:'Harina y almidones', precio:1200, cantidad:1000, unidad:'g' },
      { nombre:'Azúcar blanca', categoria:'Azúcares', precio:900, cantidad:1000, unidad:'g' },
      { nombre:'Mantequilla', categoria:'Grasas y aceites', precio:2800, cantidad:500, unidad:'g' },
      { nombre:'Huevos', categoria:'Huevos', precio:3600, cantidad:12, unidad:'un' },
      { nombre:'Leche entera', categoria:'Lácteos', precio:1100, cantidad:1000, unidad:'ml' },
      { nombre:'Cacao en polvo', categoria:'Saborizantes', precio:4500, cantidad:200, unidad:'g' },
      { nombre:'Chocolate cobertura', categoria:'Saborizantes', precio:6000, cantidad:400, unidad:'g' },
      { nombre:'Crema de leche', categoria:'Lácteos', precio:2200, cantidad:500, unidad:'ml' },
    ]
    const rows = ejemplos.map(e => ({ user_id: user.id, currency, ppu: e.precio/e.cantidad, ...e }))
    await supabase.from('ingredientes').insert(rows)
    await fetchIngredientes()
    setSaving(false)
  }

  return (
    <div>
      <p style={sTitle}>Ingredientes registrados</p>
      {loading ? <p style={{ color:'#888', fontSize:'14px' }}>Cargando...</p> : (
        ingredientes.length === 0
          ? <div style={emptyStyle}>Aún no hay ingredientes. Agrega el primero abajo.</div>
          : ingredientes.map(i => (
            <div key={i.id} style={{ ...cardStyle, borderLeft: editando === i.id ? '3px solid #1D9E75' : '1px solid #e5e5e5', borderRadius: editando === i.id ? '0 12px 12px 0' : '12px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                <span style={{ flex:1, fontWeight:'500', fontSize:'14px' }}>{i.nombre}</span>
                <span style={tagStyle}>{i.categoria}</span>
                <span style={{ fontSize:'12px', color:'#888' }}>{fmt(i.precio, currency)} / {i.cantidad}{i.unidad}</span>
                <span style={{ fontSize:'12px', color:'#aaa' }}>{fmt(i.ppu, currency)}/{i.unidad}</span>
                <button onClick={() => iniciarEdicion(i)} style={btnEdit}>editar</button>
                <button onClick={() => eliminar(i.id)} style={btnDanger}>eliminar</button>
              </div>
            </div>
          ))
      )}

      <p style={{ ...sTitle, marginTop:'1.5rem' }}>
        {editando ? 'Editando ingrediente' : 'Agregar ingrediente'}
      </p>
      <div style={cardStyle}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'10px' }}>
          <div><label style={lbl}>Nombre</label><input style={inp} placeholder="Ej: Harina de trigo" value={nombre} onChange={e => setNombre(e.target.value)} /></div>
          <div><label style={lbl}>Categoría</label>
            <select style={inp} value={categoria} onChange={e => setCategoria(e.target.value)}>
              {CATEGORIAS.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'10px', marginBottom:'12px' }}>
          <div><label style={lbl}>Precio ({CURRENCIES[currency]?.symbol})</label><input style={inp} type="number" placeholder="0" value={precio} onChange={e => setPrecio(e.target.value)} /></div>
          <div><label style={lbl}>Cantidad del envase</label><input style={inp} type="number" placeholder="1000" value={cantidad} onChange={e => setCantidad(e.target.value)} /></div>
          <div><label style={lbl}>Unidad</label>
            <select style={inp} value={unidad} onChange={e => setUnidad(e.target.value)}>
              {UNIDADES.map(u => <option key={u}>{u}</option>)}
            </select>
          </div>
        </div>
        <div style={{ display:'flex', gap:'8px' }}>
          <button onClick={guardar} disabled={saving} style={btnPrimary}>
            {saving ? 'Guardando...' : editando ? 'Guardar cambios' : 'Agregar'}
          </button>
          {editando
            ? <button onClick={cancelarEdicion} style={btnGhost}>Cancelar</button>
            : <button onClick={cargarEjemplos} disabled={saving} style={btnGhost}>Cargar ejemplos</button>
          }
        </div>
      </div>
    </div>
  )
}

const sTitle = { fontSize:'16px', fontWeight:'500', marginBottom:'1rem' }
const cardStyle = { background:'#fff', border:'1px solid #e5e5e5', borderRadius:'12px', padding:'1rem 1.25rem', marginBottom:'8px' }
const emptyStyle = { textAlign:'center', padding:'2rem', color:'#888', fontSize:'14px' }
const tagStyle = { fontSize:'11px', padding:'2px 8px', borderRadius:'6px', background:'#E1F5EE', color:'#0F6E56', fontWeight:'500' }
const lbl = { fontSize:'12px', color:'#888', display:'block', marginBottom:'4px' }
const inp = { width:'100%', padding:'8px 10px', fontSize:'13px', border:'1px solid #e5e5e5', borderRadius:'8px', outline:'none', background:'#fff', color:'#1a1a1a' }
const btnPrimary = { padding:'8px 16px', background:'#1D9E75', color:'#fff', border:'none', borderRadius:'8px', fontSize:'13px', fontWeight:'500', cursor:'pointer' }
const btnGhost = { padding:'8px 16px', background:'transparent', border:'1px solid #e5e5e5', borderRadius:'8px', fontSize:'13px', cursor:'pointer', color:'#1a1a1a' }
const btnDanger = { fontSize:'12px', padding:'4px 10px', background:'transparent', border:'1px solid #fca5a5', color:'#c0392b', borderRadius:'6px', cursor:'pointer' }
const btnEdit = { fontSize:'12px', padding:'4px 10px', background:'transparent', border:'1px solid #b5d4f4', color:'#185FA5', borderRadius:'6px', cursor:'pointer' }