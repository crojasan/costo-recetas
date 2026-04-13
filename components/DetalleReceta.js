'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { fmt, CURRENCIES } from '@/lib/currencies'

const CATEGORIAS = ['Tortas y pasteles','Galletas','Pan y masas','Postres individuales','Cocina salada','Bebidas']
const UNIDADES = ['g','ml','un','kg','l']

function conv(cant, from, to) {
  if (from === to) return cant
  if (from === 'kg' && to === 'g') return cant * 1000
  if (from === 'g' && to === 'kg') return cant / 1000
  if (from === 'l' && to === 'ml') return cant * 1000
  if (from === 'ml' && to === 'l') return cant / 1000
  return cant
}

export default function DetalleReceta({ receta, currency, onVolver, onEliminar, onActualizada }) {
  const { user } = useAuth()
  const [modo, setModo] = useState('ver')
  const [ingredientesDB, setIngredientesDB] = useState([])
  const [ingReceta, setIngReceta] = useState(receta.ingredientes || [])
  const [nombre, setNombre] = useState(receta.nombre)
  const [categoria, setCategoria] = useState(receta.categoria)
  const [porciones, setPorciones] = useState(receta.porciones)
  const [horas, setHoras] = useState(receta.horas)
  const [tarifa, setTarifa] = useState(receta.tarifa)
  const [energia, setEnergia] = useState(receta.energia)
  const [empaque, setEmpaque] = useState(receta.empaque)
  const [margen, setMargen] = useState(receta.margen)
  const [ingSel, setIngSel] = useState('')
  const [ingCant, setIngCant] = useState('')
  const [ingUnidad, setIngUnidad] = useState('g')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase.from('ingredientes').select('*').then(({ data }) => {
      setIngredientesDB(data || [])
      if (data?.length) setIngSel(data[0].id)
    })
  }, [])

  const costoIng = ingReceta.reduce((s, i) => s + i.costo, 0)
  const mo = Number(horas) * Number(tarifa)
  const otros = Number(energia) + Number(empaque)
  const total = costoIng + mo + otros
  const pventa = total * (1 + Number(margen) / 100)
  const sym = CURRENCIES[currency]?.symbol || '$'

  function agregarIng() {
    if (!ingCant) { alert('Ingresa la cantidad.'); return }
    const ing = ingredientesDB.find(i => i.id === ingSel)
    if (!ing) return
    const cantConv = conv(parseFloat(ingCant), ingUnidad, ing.unidad)
    const costo = ing.ppu * cantConv
    setIngReceta(prev => [...prev, { ingId: ing.id, nombre: ing.nombre, cant: parseFloat(ingCant), unidad: ingUnidad, costo }])
    setIngCant('')
  }

  function quitarIng(idx) {
    setIngReceta(prev => prev.filter((_, i) => i !== idx))
  }

  async function guardarCambios() {
    if (!nombre) { alert('La receta necesita un nombre.'); return }
    if (!ingReceta.length) { alert('Agrega al menos un ingrediente.'); return }
    setSaving(true)
    const { data } = await supabase.from('recetas').update({
      nombre, categoria,
      porciones: Number(porciones), horas: Number(horas),
      tarifa: Number(tarifa), energia: Number(energia), empaque: Number(empaque),
      costo_ing: costoIng, mo, otros, total, margen: Number(margen),
      pventa, currency, ingredientes: ingReceta
    }).eq('id', receta.id).select().single()
    setSaving(false)
    if (data) { onActualizada(data); setModo('ver') }
  }

  if (modo === 'ver') return (
    <div>
      <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'1.5rem' }}>
        <button onClick={onVolver} style={btnGhost}>← Volver</button>
        <span style={{ flex:1, fontSize:'18px', fontWeight:'500' }}>{receta.nombre}</span>
        <span style={tag}>{receta.categoria}</span>
        <button onClick={() => setModo('editar')} style={btnPrimary}>Editar receta</button>
        <button onClick={() => onEliminar(receta.id)} style={btnDanger}>Eliminar</button>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,minmax(0,1fr))', gap:'10px', marginBottom:'12px' }}>
        {[
          ['Porciones', receta.porciones],
          ['Horas de prep.', receta.horas + ' hrs'],
          ['Margen', receta.margen + '%'],
        ].map(([label, val]) => (
          <div key={label} style={metric}>
            <div style={{ fontSize:'18px', fontWeight:'500' }}>{val}</div>
            <div style={{ fontSize:'11px', color:'#888', marginTop:'2px' }}>{label}</div>
          </div>
        ))}
      </div>

      <p style={sTitle}>Ingredientes</p>
      <div style={card}>
        {receta.ingredientes.map((i, idx) => (
          <div key={idx} style={{ display:'flex', alignItems:'center', gap:'10px', padding:'8px 0', borderBottom:'1px solid #f0f0f0', fontSize:'13px' }}>
            <span style={{ flex:1, fontWeight:'500' }}>{i.nombre}</span>
            <span style={{ color:'#888' }}>{i.cant} {i.unidad}</span>
            <span style={{ fontWeight:'500' }}>{fmt(i.costo, currency)}</span>
          </div>
        ))}
        <div style={{ display:'flex', justifyContent:'flex-end', paddingTop:'10px', fontSize:'13px', color:'#888' }}>
          Subtotal ingredientes: <strong style={{ marginLeft:'8px', color:'#1a1a1a' }}>{fmt(receta.costo_ing, currency)}</strong>
        </div>
      </div>

      <p style={sTitle}>Desglose de costos</p>
      <div style={card}>
        {[
          ['Ingredientes', receta.costo_ing],
          ['Mano de obra', receta.mo],
          ['Energía', receta.energia],
          ['Empaque', receta.empaque],
        ].map(([label, val]) => (
          <div key={label} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px solid #f5f5f5', fontSize:'13px' }}>
            <span style={{ color:'#888' }}>{label}</span>
            <span>{fmt(val, currency)}</span>
          </div>
        ))}
        <div style={{ display:'flex', justifyContent:'space-between', padding:'10px 0 4px', fontSize:'14px', fontWeight:'500' }}>
          <span>Costo total</span>
          <span>{fmt(receta.total, currency)}</span>
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', padding:'4px 0', fontSize:'14px' }}>
          <span style={{ color:'#888' }}>Margen ({receta.margen}%)</span>
          <span style={{ color:'#0F6E56', fontWeight:'500' }}>+ {fmt(receta.total * receta.margen / 100, currency)}</span>
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', padding:'10px 0 0', fontSize:'16px', fontWeight:'500', borderTop:'1px solid #e5e5e5', marginTop:'6px' }}>
          <span>Precio de venta</span>
          <span style={{ color:'#0F6E56' }}>{fmt(receta.pventa, currency)}</span>
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', padding:'6px 0 0', fontSize:'13px', color:'#888' }}>
          <span>Por porción</span>
          <span>{fmt(receta.pventa / receta.porciones, currency)}</span>
        </div>
      </div>
    </div>
  )

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'1.5rem' }}>
        <button onClick={() => setModo('ver')} style={btnGhost}>← Cancelar</button>
        <span style={{ flex:1, fontSize:'18px', fontWeight:'500' }}>Editar receta</span>
      </div>

      <div style={card}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'10px' }}>
          <div><label style={lbl}>Nombre</label><input style={inp} value={nombre} onChange={e => setNombre(e.target.value)} /></div>
          <div><label style={lbl}>Categoría</label>
            <select style={inp} value={categoria} onChange={e => setCategoria(e.target.value)}>
              {CATEGORIAS.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'10px', marginBottom:'10px' }}>
          <div><label style={lbl}>Porciones</label><input style={inp} type="number" value={porciones} onChange={e => setPorciones(e.target.value)} /></div>
          <div><label style={lbl}>Horas de prep.</label><input style={inp} type="number" step="0.5" value={horas} onChange={e => setHoras(e.target.value)} /></div>
          <div><label style={lbl}>Tarifa/hora ({sym})</label><input style={inp} type="number" value={tarifa} onChange={e => setTarifa(e.target.value)} /></div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
          <div><label style={lbl}>Energía ({sym})</label><input style={inp} type="number" value={energia} onChange={e => setEnergia(e.target.value)} /></div>
          <div><label style={lbl}>Empaque ({sym})</label><input style={inp} type="number" value={empaque} onChange={e => setEmpaque(e.target.value)} /></div>
        </div>
      </div>

      <p style={sTitle}>Ingredientes</p>
      <div style={card}>
        {ingReceta.map((i, idx) => (
          <div key={idx} style={{ display:'flex', alignItems:'center', gap:'10px', padding:'6px 0', borderBottom:'1px solid #f0f0f0', fontSize:'13px' }}>
            <span style={{ flex:1, fontWeight:'500' }}>{i.nombre}</span>
            <span style={{ color:'#888' }}>{i.cant} {i.unidad}</span>
            <span>{fmt(i.costo, currency)}</span>
            <button onClick={() => quitarIng(idx)} style={btnDanger}>x</button>
          </div>
        ))}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'10px', marginTop:'12px' }}>
          <div><label style={lbl}>Ingrediente</label>
            <select style={inp} value={ingSel} onChange={e => setIngSel(e.target.value)}>
              {ingredientesDB.map(i => <option key={i.id} value={i.id}>{i.nombre} ({i.unidad})</option>)}
            </select>
          </div>
          <div><label style={lbl}>Cantidad</label><input style={inp} type="number" placeholder="250" value={ingCant} onChange={e => setIngCant(e.target.value)} /></div>
          <div><label style={lbl}>Unidad</label>
            <select style={inp} value={ingUnidad} onChange={e => setIngUnidad(e.target.value)}>
              {UNIDADES.map(u => <option key={u}>{u}</option>)}
            </select>
          </div>
        </div>
        <button onClick={agregarIng} style={{ ...btnGhost, marginTop:'8px' }}>+ Agregar ingrediente</button>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,minmax(0,1fr))', gap:'10px', marginBottom:'12px' }}>
        {[['Ingredientes', costoIng],['Mano de obra', mo],['Energía + empaque', otros],['Costo total', total]].map(([label, val]) => (
          <div key={label} style={metric}>
            <div style={{ fontSize:'16px', fontWeight:'500', color: label==='Costo total'?'#0F6E56':'#1a1a1a' }}>{fmt(val, currency)}</div>
            <div style={{ fontSize:'11px', color:'#888', marginTop:'2px' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={card}>
        <label style={lbl}>Margen de ganancia: <strong>{margen}%</strong></label>
        <input type="range" min="10" max="300" step="5" value={margen} onChange={e => setMargen(Number(e.target.value))} style={{ width:'100%', marginBottom:'12px' }} />
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,minmax(0,1fr))', gap:'10px' }}>
          <div style={metric}><div style={{ fontSize:'16px', fontWeight:'500', color:'#0F6E56' }}>{fmt(pventa, currency)}</div><div style={{ fontSize:'11px', color:'#888', marginTop:'2px' }}>Precio de venta</div></div>
          <div style={metric}><div style={{ fontSize:'16px', fontWeight:'500' }}>{fmt(pventa / (porciones||1), currency)}</div><div style={{ fontSize:'11px', color:'#888', marginTop:'2px' }}>Por porción</div></div>
          <div style={metric}><div style={{ fontSize:'16px', fontWeight:'500', color:'#854F0B' }}>{margen}%</div><div style={{ fontSize:'11px', color:'#888', marginTop:'2px' }}>Margen</div></div>
        </div>
      </div>

      <button onClick={guardarCambios} disabled={saving} style={{ ...btnPrimary, width:'100%', marginTop:'4px', padding:'10px' }}>
        {saving ? 'Guardando...' : 'Guardar cambios'}
      </button>
    </div>
  )
}

const sTitle = { fontSize:'16px', fontWeight:'500', marginBottom:'1rem' }
const card = { background:'#fff', border:'1px solid #e5e5e5', borderRadius:'12px', padding:'1rem 1.25rem', marginBottom:'12px' }
const metric = { background:'#f5f5f3', borderRadius:'8px', padding:'10px 14px', textAlign:'center' }
const tag = { fontSize:'11px', padding:'2px 8px', borderRadius:'6px', background:'#FAEEDA', color:'#633806', fontWeight:'500' }
const lbl = { fontSize:'12px', color:'#888', display:'block', marginBottom:'4px' }
const inp = { width:'100%', padding:'8px 10px', fontSize:'13px', border:'1px solid #e5e5e5', borderRadius:'8px', outline:'none', background:'#fff', color:'#1a1a1a' }
const btnPrimary = { padding:'8px 16px', background:'#1D9E75', color:'#fff', border:'none', borderRadius:'8px', fontSize:'13px', fontWeight:'500', cursor:'pointer' }
const btnGhost = { padding:'8px 16px', background:'transparent', border:'1px solid #e5e5e5', borderRadius:'8px', fontSize:'13px', cursor:'pointer', color:'#1a1a1a' }
const btnDanger = { fontSize:'12px', padding:'4px 10px', background:'transparent', border:'1px solid #fca5a5', color:'#c0392b', borderRadius:'6px', cursor:'pointer' }