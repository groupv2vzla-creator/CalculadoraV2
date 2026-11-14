"use client";
import { useMemo, useState } from "react";
import { MATERIALS, initialLayers, calculate, DEFAULT_LASER_RATE, type Layer } from "../lib/costs";
const usd = (n: number) => new Intl.NumberFormat("es-VE", { style: "currency", currency: "USD" }).format(n);
export default function Home() {
 const [layers, setLayers] = useState<Layer[]>(initialLayers);
 const [rate, setRate] = useState(DEFAULT_LASER_RATE);
 const update = (i: number, patch: Partial<Layer>) => setLayers(old => old.map((l, j) => j === i ? { ...l, ...patch } : l));
 const rows = useMemo(() => layers.map(l => calculate(l, rate)), [layers, rate]);
 const material = rows.reduce((s, r) => s + r.materialCost, 0);
 const laser = rows.reduce((s, r) => s + r.laserCost, 0);
 return <main className="shell">
  <header className="header"><div className="brand"><div className="logo">V2</div><div><strong>GROUP V2</strong><small>Calculadora de producción</small></div></div><span className="tag">ACRÍLICO · 3 MM · ⅛ LÁMINA</span></header>
  <section className="hero"><div><p className="eyebrow">COTIZACIÓN INTERNA</p><h1>Calcula con precisión.<br/><em>Produce con confianza.</em></h1><p>Selecciona tus materiales, agrega las medidas reservadas y el tiempo de láser. Los costos se actualizan automáticamente.</p></div><div className="rate"><label htmlFor="rate">Tarifa láser · USD/min</label><input id="rate" type="number" min="0" step="0.01" value={rate} onChange={e=>setRate(Number(e.target.value))}/></div></section>
  <div className="section-heading"><h2>Materiales del trabajo</h2><span>4 capas disponibles</span></div>
  <div className="layers">{layers.map((l,i) => <section className="layer" key={i}><div className="layer-head"><div><span className="number">{String(i+1).padStart(2,"0")}</span><h3>{l.name}</h3></div><strong className="subtotal">{usd(rows[i].subtotal)}</strong></div>
  <div className="fields"><label className="wide">Material<select value={l.material} onChange={e=>update(i,{material:e.target.value})}><option value="">Seleccionar material</option>{MATERIALS.map(m=><option key={m.name} value={m.name}>{m.name}</option>)}</select></label>
  <label>Ancho reservado (mm)<input type="number" min="0" value={l.width||""} onChange={e=>update(i,{width:Number(e.target.value)})}/></label>
  <label>Alto reservado (mm)<input type="number" min="0" value={l.height||""} onChange={e=>update(i,{height:Number(e.target.value)})}/></label>
  <label>Minutos de láser<input type="number" min="0" step="0.1" value={l.minutes||""} onChange={e=>update(i,{minutes:Number(e.target.value)})}/></label>
  <label>Precio propio por ⅛ (opcional)<input type="number" min="0" step="0.01" placeholder="Usar precio Vexcel" value={l.override} onChange={e=>update(i,{override:e.target.value})}/></label></div>
  <div className="layer-footer"><span>Vexcel ⅛: <b>{usd(rows[i].supplier)}</b></span><span>Material: <b>{usd(rows[i].materialCost)}</b></span><span>Láser: <b>{usd(rows[i].laserCost)}</b></span></div></section>)}</div>
  <section className="summary"><div><p className="eyebrow">RESUMEN DE PRODUCCIÓN</p><h2>Costo del trabajo</h2><p>Incluye materiales y corte láser. No incluye mano de obra, ensamblaje ni utilidad.</p></div><div className="summary-values"><div><span>Materiales</span><b>{usd(material)}</b></div><div><span>Corte láser</span><b>{usd(laser)}</b></div><div className="total"><span>TOTAL USD</span><strong>{usd(material+laser)}</strong></div></div></section>
  <footer>GROUP V2 · Precios Vexcel por ⅛ de lámina (61 × 61 cm) · Referencia 09/11/2026</footer>
 </main>;
}
