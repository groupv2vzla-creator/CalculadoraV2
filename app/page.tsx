"use client";
import { useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { MATERIALS, initialLayers, calculate, DEFAULT_LASER_RATE, type Layer } from "../lib/costs";
import { calculateConsumables } from "../lib/consumables";
const displayLayerName = (name: string) => name === "Letras" ? "Relieve" : name;
const usd = (n: number) => new Intl.NumberFormat("es-VE", { style: "currency", currency: "USD" }).format(n);
export default function Home() {
 const [user, setUser] = useState<User | null>(null);
 const [checking, setChecking] = useState(true);
 const [email, setEmail] = useState("");
 const [message, setMessage] = useState("");
 const [busy, setBusy] = useState(false);
 const [quoteName, setQuoteName] = useState("");
 const [manualProfit, setManualProfit] = useState("");
 const [profitMargin, setProfitMargin] = useState(40);
 const [customerNotes, setCustomerNotes] = useState("");
 const [budgetCopied, setBudgetCopied] = useState(false);
 const [quotes, setQuotes] = useState<Array<{id:string;name:string;layers:Layer[];laser_rate:number;created_at:string}>>([]);
 const [materials, setMaterials] = useState<Array<{name:string;price_eighth:number}>>([]);
 const [layers, setLayers] = useState<Layer[]>(initialLayers);
 const [packWidth, setPackWidth] = useState(60);
 const [packHeight, setPackHeight] = useState(60);
 const [includeGlue, setIncludeGlue] = useState(true);
 const [separator1230, setSeparator1230] = useState(0);
 const [separator1640, setSeparator1640] = useState(0);
 const separatorTotal = separator1230 * 0.83 + separator1640 * 1.52;
 const consumables = useMemo(() => calculateConsumables({widthCm:packWidth,heightCm:packHeight,includeGlue}),[packWidth,packHeight,includeGlue]);
 useEffect(() => { supabase.auth.getUser().then(({data}) => { setUser(data.user); setChecking(false); }); const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,session)=>setUser(session?.user??null));return ()=>subscription.unsubscribe(); },[]);
 useEffect(() => { if(!user) return; void loadData(); },[user]);
 async function loadData(){const [q,m]=await Promise.all([supabase.from("quotes").select("id,name,layers,laser_rate,created_at").order("created_at",{ascending:false}),supabase.from("materials").select("name,price_eighth").eq("active",true)]);if(q.error)setMessage(q.error.message);else setQuotes(q.data??[]);if(!m.error)setMaterials(m.data??[]);}
 async function login(e:React.FormEvent){e.preventDefault();setBusy(true);setMessage("");if(!["groupv2.vzla@gmail.com","estudiolaserv2@gmail.com"].includes(email.trim().toLowerCase())){setMessage("Utiliza el correo autorizado de Group V2.");setBusy(false);return;}const {error}=await supabase.auth.signInWithOtp({email,options:{emailRedirectTo:window.location.origin}});setMessage(error?error.message:"Te enviamos un enlace de acceso. En el teléfono, ábrelo directamente en Safari o Chrome; si Gmail lo abre dentro de la app, elige «Abrir en el navegador».");setBusy(false);}
 async function saveQuote(){if(!user)return;const name=quoteName.trim();if(!name){setMessage("Escribe un nombre para guardar el trabajo.");return;}setBusy(true);setMessage("");const {error}=await supabase.from("quotes").insert({owner_id:user.id,name,layers:layers.map((layer,i)=>i===0?{...layer,packWidth,packHeight,includeGlue,separator1230,separator1640}:layer),laser_rate:rate,material_total:Number(material.toFixed(2)),laser_total:Number(laser.toFixed(2)),total:Number((material+laser+tape3m+consumables.total+separatorTotal).toFixed(2))});if(error)setMessage(error.message);else{setMessage("Cotización guardada.");setQuoteName("");await loadData();}setBusy(false);}
 function loadQuote(q:{layers:Layer[];laser_rate:number;name:string}){setLayers(q.layers);const first=q.layers[0] as Layer & {packWidth?:number;packHeight?:number;includeGlue?:boolean;separator1230?:number;separator1640?:number};setPackWidth(first?.packWidth??60);setPackHeight(first?.packHeight??60);setIncludeGlue(first?.includeGlue??true);setSeparator1230(Math.max(0,Math.floor(first?.separator1230??0)));setSeparator1640(Math.max(0,Math.floor(first?.separator1640??0)));setRate(q.laser_rate);setQuoteName(q.name);setMessage("Trabajo cargado. Puedes modificarlo y guardarlo con otro nombre.");}

 const [rate, setRate] = useState(DEFAULT_LASER_RATE);
 const update = (i: number, patch: Partial<Layer>) => setLayers(old => old.map((l, j) => j === i ? { ...l, ...patch } : l));
 const rows = useMemo(() => layers.map(l => {
 const dbPrice = materials.find(m=>m.name===l.material)?.price_eighth;
 const base = calculate(l,rate);
 if(dbPrice===undefined)return base;
 const custom = l.override.trim()!=="" && Number(l.override)>0 ? Number(l.override) : dbPrice;
 const materialCost = l.material ? Math.max(0,l.width)*Math.max(0,l.height)/1_000_000/0.3721*custom:0;
 return {...base,supplier:dbPrice,sheetPrice:custom,materialCost,subtotal:materialCost+base.laserCost+base.tape3mCost};
 }), [layers, rate, materials]);
 const activeLayers = layers.filter(l => l.material && l.width > 0 && l.height > 0);
 const biggestLayer = activeLayers.reduce<Layer | null>((best,l) => !best || l.width*l.height > best.width*best.height ? l : best, null);
 const tape3m = rows.reduce((sum,r)=>sum+r.tape3mCost,0);
 const productionCost = rows.reduce((sum,r)=>sum+r.materialCost+r.laserCost+r.tape3mCost,0)+consumables.total+separatorTotal;
 const suggestedPrice = profitMargin < 100 ? productionCost/(1-profitMargin/100) : productionCost;
 const usingManualProfit = manualProfit.trim()!=="" && Number.isFinite(Number(manualProfit)) && Number(manualProfit)>=0;
 const finalPrice = usingManualProfit ? productionCost+Number(manualProfit) : suggestedPrice;
 const grossProfit = finalPrice-productionCost;
 const formatCm = (mm:number) => new Intl.NumberFormat("es-VE",{maximumFractionDigits:1}).format(mm/10);
 const clientBudget = [
   "Te compartimos por acá el presupuesto para tu proyecto personalizado. ✨🥳",
   "",
   biggestLayer ? "📏 *Tamaño aproximado:* " + formatCm(biggestLayer.width) + " × " + formatCm(biggestLayer.height) + " cm" : "📏 *Tamaño aproximado:* Por confirmar",
   "🎨 *Colores y acabados:*",
   activeLayers.length ? activeLayers.map(l => "• *" + displayLayerName(l.name) + ":* " + l.material).join("\n") : "Por confirmar",
   "💰 *Valor de fabricación de tu proyecto:* " + (productionCost>0 ? usd(finalPrice) + " BCV" : "Por confirmar"),
   customerNotes.trim() ? "📝 *Observaciones:* " + customerNotes.trim() : "",
   "",
   "💜💵 *¡Puedes comenzar tu proyecto abonando solo el 50%!* 💵💜",
   "Con ese primer abono iniciamos el proceso de producción. El *50% restante lo pagas al retirar tu producto en nuestra oficina.* 📦🚀",
   "",
   "✨ ¡Nos encantará darle vida a tu idea!",
   "💜 Estamos atentos para ayudarte con cualquier duda que tengas."
 ].join("\n").replace(/\n{3,}/g,"\n\n");
 async function copyBudget(){
   try { await navigator.clipboard.writeText(clientBudget); setBudgetCopied(true); setMessage("Presupuesto copiado. Ya puedes pegarlo en WhatsApp."); }
   catch { setMessage("No se pudo copiar automáticamente. Selecciona el texto de la vista previa para copiarlo."); }
 }
 const material = rows.reduce((s, r) => s + r.materialCost, 0);
 const laser = rows.reduce((s, r) => s + r.laserCost, 0);
 if(checking)return <main className="shell"><p>Verificando acceso...</p></main>;
 if(!user)return <main className="shell"><div className="login"><div className="logo"><img src="https://drive.google.com/thumbnail?id=1_VWBCGAwNwhWiTHvWn_VTvUP_jYhjHnD&sz=w200" alt="Logo Group V2" width="52" height="52" style={{width:"100%",height:"100%",objectFit:"contain",borderRadius:"50%"}} onError={e=>{e.currentTarget.style.display="none";e.currentTarget.parentElement!.textContent="V2";}}/></div><p className="eyebrow">GROUP V2 · ACCESO PRIVADO</p><h1>Bienvenido de nuevo.</h1><p>Introduce tu correo autorizado. Te enviaremos un enlace seguro para entrar, sin contraseña.</p><form onSubmit={login}><label>Correo electrónico<input type="email" required value={email} onChange={e=>setEmail(e.target.value)}/></label><button disabled={busy} type="submit">Enviarme enlace de acceso</button></form>{message&&<p role="status">{message}</p>}</div></main>;
 return <main className="shell">
  <header className="header"><div className="brand"><div className="logo"><img src="https://drive.google.com/thumbnail?id=1_VWBCGAwNwhWiTHvWn_VTvUP_jYhjHnD&sz=w200" alt="Logo Group V2" width="52" height="52" style={{width:"100%",height:"100%",objectFit:"contain",borderRadius:"50%"}} onError={e=>{e.currentTarget.style.display="none";e.currentTarget.parentElement!.textContent="V2";}}/></div><div><strong>GROUP V2</strong><small>Calculadora de producción</small></div></div><div className="top-actions"><span className="tag">ACRÍLICO · 3 MM · ⅛ LÁMINA</span><button className="signout" onClick={()=>void supabase.auth.signOut()}>Salir</button></div></header>
  <section className="hero"><div><p className="eyebrow">COTIZACIÓN INTERNA</p><h1>Calcula con precisión.<br/><em>Produce con confianza.</em></h1><p>Selecciona tus materiales, agrega las medidas reservadas y el tiempo de láser. Los costos se actualizan automáticamente.</p></div><div className="rate"><label htmlFor="rate">Tarifa láser · USD/min</label><input id="rate" type="number" min="0" step="0.01" value={rate} onChange={e=>setRate(Number(e.target.value))}/></div></section>
  <div className="section-heading"><h2>Materiales del trabajo</h2><span>4 capas disponibles</span></div>
  <div className="layers">{layers.map((l,i) => <section className="layer" key={i}><div className="layer-head"><div><span className="number">{String(i+1).padStart(2,"0")}</span><h3>{displayLayerName(l.name)}</h3></div><strong className="subtotal">{usd(rows[i].subtotal)}</strong></div>
  <div className="fields"><label className="wide">Material<select value={l.material} onChange={e=>update(i,{material:e.target.value})}><option value="">Seleccionar material</option>{MATERIALS.map(m=><option key={m.name} value={m.name}>{m.name}</option>)}</select></label>
  <label>Ancho reservado (mm)<input type="number" min="0" value={l.width||""} onChange={e=>update(i,{width:Number(e.target.value)})}/></label>
  <label>Alto reservado (mm)<input type="number" min="0" value={l.height||""} onChange={e=>update(i,{height:Number(e.target.value)})}/></label>
  <label>Minutos de láser<input type="number" min="0" step="0.1" value={l.minutes||""} onChange={e=>update(i,{minutes:Number(e.target.value)})}/></label>
  <label>Precio propio por ⅛ (opcional)<input type="number" min="0" step="0.01" placeholder="Usar precio Vexcel" value={l.override} onChange={e=>update(i,{override:e.target.value})}/></label></div>
  <div className="layer-footer"><span>Vexcel ⅛: <b>{usd(rows[i].supplier)}</b></span><span>Material: <b>{usd(rows[i].materialCost)}</b></span><span>Láser: <b>{usd(rows[i].laserCost)}</b></span>{rows[i].tape3mCost>0 && <span>Cinta 3M espejo: <b>{usd(rows[i].tape3mCost)}</b></span>}</div></section>)}</div>
  <section className="saved"><div><p className="eyebrow">CONSUMIBLES V2</p><h2>Empaque y consumibles</h2><p>Introduce las dimensiones generales del trabajo en centímetros. Envoplast estimado por una capa equivalente al área frontal.</p></div><div className="fields"><label>Ancho del logo (cm)<input type="number" min="0" step="0.1" value={packWidth} onChange={e=>setPackWidth(Number(e.target.value))}/></label><label>Alto del logo (cm)<input type="number" min="0" step="0.1" value={packHeight} onChange={e=>setPackHeight(Number(e.target.value))}/></label><label className="wide"><input type="checkbox" checked={includeGlue} onChange={e=>setIncludeGlue(e.target.checked)}/> Incluir cloruro (desactivar si no se usa)</label></div><div className="summary-values"><div><span>Envoplast</span><b>{usd(consumables.envoplast)}</b></div><div><span>Cloruro</span><b>{usd(consumables.glue)}</b></div><div><span>Bolsas · {consumables.bagType}</span><b>{usd(consumables.bags)}</b></div><div><span>Tirro · {consumables.wraps} vueltas</span><b>{usd(consumables.tape)}</b></div><div className="total"><span>TOTAL CONSUMIBLES</span><strong>{usd(consumables.total)}</strong></div></div><p>Para empaques especiales o logos con dimensiones muy grandes, verifica manualmente la cantidad de bolsas. No incluye solapes ni profundidad del envoltorio.</p></section>
  <section className="saved"><div><p className="eyebrow">SEPARADORES DE ACRÍLICO</p><h2>Separadores</h2><p>Indica cuántas unidades lleva el trabajo. Si no lleva, deja ambos campos en cero.</p></div><div className="fields"><label>Separador 12 × 30 · $0,83 c/u<input type="number" min="0" step="1" value={separator1230} onChange={e=>setSeparator1230(Math.max(0,Math.floor(Number(e.target.value)||0)))}/></label><label>Separador 16 × 40 · $1,52 c/u<input type="number" min="0" step="1" value={separator1640} onChange={e=>setSeparator1640(Math.max(0,Math.floor(Number(e.target.value)||0)))}/></label></div><div className="summary-values"><div className="total"><span>TOTAL SEPARADORES</span><strong>{usd(separatorTotal)}</strong></div></div></section>
  <section className="summary"><div><p className="eyebrow">RESUMEN DE PRODUCCIÓN</p><h2>Costo del trabajo</h2><p>Incluye materiales, cinta 3M para acrílicos espejo, corte láser, consumibles y separadores. No incluye mano de obra, ensamblaje ni utilidad.</p></div><div className="summary-values"><div><span>Materiales</span><b>{usd(material)}</b></div><div><span>Corte láser</span><b>{usd(laser)}</b></div><div><span>Cinta 3M · acrílicos espejo</span><b>{usd(tape3m)}</b></div><div><span>Consumibles</span><b>{usd(consumables.total)}</b></div><div><span>Separadores de acrílico</span><b>{usd(separatorTotal)}</b></div><div className="total"><span>TOTAL USD</span><strong>{usd(productionCost)}</strong></div></div></section>
  <section className="profit-panel"><div className="profit-heading"><div><p className="eyebrow">PRECIO DE VENTA Y RENTABILIDAD</p><h2>Tu ganancia, bajo control <span aria-hidden="true">✦</span></h2><p>Elige el margen de ganancia bruta sobre el precio de venta. El precio se calcula automáticamente a partir del costo real de fabricación.</p></div><div className="profit-percentage">{profitMargin}%</div></div><input className="neon-slider" aria-label="Margen de ganancia sobre el precio de venta" type="range" min="10" max="70" step="5" value={profitMargin} style={{background:`linear-gradient(90deg,#8b5cf6 0%,#ec4899 ${(profitMargin-10)/60*100}%,#30243f ${(profitMargin-10)/60*100}%)`}} onChange={e=>{setProfitMargin(Number(e.target.value));setManualProfit("");setBudgetCopied(false);}}/><div className="profit-scale"><span>10%</span><span>40%</span><span>70%</span></div><div className="profit-stats"><div><small>Costo de fabricación</small><strong>{usd(productionCost)}</strong></div><div><small>Precio final de venta</small><strong className="profit-highlight">{usd(finalPrice)}</strong></div><div><small>Ganancia bruta {usingManualProfit?"manual":"estimada"}</small><strong>{usd(grossProfit)}</strong></div></div><div className="manual-profit"><label htmlFor="manualProfit">Ganancia manual en USD (opcional)</label><input id="manualProfit" type="number" min="0" step="0.01" placeholder="Ej. 30,00" value={manualProfit} onChange={e=>{setManualProfit(e.target.value);setBudgetCopied(false);}}/><p>{usingManualProfit?"Modo manual activo: el precio final es el costo de fabricación más la ganancia que escribiste. Mueve la barra para volver al porcentaje.":"Deja este campo vacío para usar el margen de la barra. Si escribes un monto, reemplaza el margen, no se acumula."}</p></div><p className="profit-note">El margen es sobre el precio de venta, no un recargo sobre el costo. No incluye otros gastos generales que aún no se hayan incorporado.</p></section>
  <section className="saved"><div><p className="eyebrow">PRESUPUESTO PARA CLIENTE</p><h2>Copiar presupuesto</h2><p>Mensaje listo para WhatsApp. Usa la capa de mayor superficie como tamaño final estimado y enumera los colores seleccionados. Los costos internos nunca se comparten.</p></div><div className="fields"><label>Precio final para WhatsApp (automático)<input type="text" readOnly value={usd(finalPrice)+" BCV"} /></label><label className="wide">Observaciones para el cliente (opcional)<input value={customerNotes} placeholder="Ej. Instalación no incluida" onChange={e=>{setCustomerNotes(e.target.value);setBudgetCopied(false);}}/></label></div><pre style={{whiteSpace:"pre-wrap",overflowWrap:"anywhere",fontFamily:"inherit",lineHeight:1.6}}>{clientBudget}</pre><button type="button" onClick={()=>void copyBudget()} className={budgetCopied?"copy-success":""} aria-live="polite">{budgetCopied?"✓ ¡Copiado!":"📋 Copiar presupuesto"}</button><p>Revisa el tamaño final antes de enviarlo: las medidas ingresadas en las capas son medidas reservadas de material.</p></section>
  <section className="saved"><div><p className="eyebrow">HISTORIAL PRIVADO</p><h2>Mis cotizaciones</h2><p>Guarda el trabajo actual o recupera uno anterior.</p></div><div className="savebar"><input aria-label="Nombre del trabajo" placeholder="Nombre del trabajo, por ejemplo: Logo recepción" value={quoteName} onChange={e=>setQuoteName(e.target.value)}/><button onClick={()=>void saveQuote()} disabled={busy}>Guardar cotización</button></div>{message&&<p role="status">{message}</p>}<div className="quote-list">{quotes.length===0?<p>Todavía no hay cotizaciones guardadas.</p>:quotes.map(q=><div key={q.id} className="quote-item"><div><strong>{q.name}</strong><small>{new Date(q.created_at).toLocaleDateString("es-VE")}</small></div><button onClick={()=>loadQuote(q)}>Abrir</button></div>)}</div></section>
  <footer>GROUP V2 · Precios Vexcel por ⅛ de lámina (61 × 61 cm) · Referencia 09/11/2026</footer>
 </main>;
}
