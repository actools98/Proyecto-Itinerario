const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const S={tier:{},occ:2,cur:"COP",fx:{},start:"2027-01-11"},C={};let D,map;
const toUSD=l=>l.usd??(l.cop!=null?l.cop/S.fx.COP:l.gtq/S.fx.GTQ);
const usd=v=>S.cur==="USD"?v:v*S.fx[S.cur];
const money=v=>({COP:"COP ",USD:"US$",GTQ:"Q"})[S.cur]+Math.round(usd(v)).toLocaleString("es-CO");
const night=o=>o.pp?o.u:o.u/S.occ;
const lodging=()=>D.hoteles.reduce((a,h)=>a+h.n*night(h.opts[S.tier[h.c]]),0);
const total=()=>D.presupuesto.reduce((a,l)=>a+toUSD(l),0)+lodging();
const A=(n,u)=>`<a href="${u}" target="_blank" rel="noopener">${n}</a>`;
const src=s=>`<span class="src">Fuente: ${A(s.n,s.u)}${s.f?`, ${s.f}`:""}</span>`;
const srcs=a=>a.map(src).join(" ");
const dt=n=>{const d=new Date(S.start+"T00:00:00Z");d.setUTCDate(d.getUTCDate()+n);return d};
const iso=d=>d.toISOString().slice(0,10);
const fmt=d=>d.toLocaleDateString("es-CO",{weekday:"short",day:"numeric",month:"short",timeZone:"UTC"}).replace(/[.,]/g,"").replace(" de "," ");
const dm=d=>d.toLocaleDateString("es-CO",{day:"numeric",month:"short",timeZone:"UTC"}).replace(".","");
const fl=v=>{const d1=iso(dt(v.d1)),d2=v.d2!=null?iso(dt(v.d2)):null,s=x=>x.replace(/-/g,"").slice(2);
 const g="https://www.google.com/travel/flights?q="+encodeURIComponent(`Flights from ${v.a} to ${v.b} on ${d1}`+(d2?` through ${d2}`:""));
 const k=`https://www.kayak.com.co/flights/${v.a}-${v.b}/${d1}${d2?"/"+d2:""}`;
 const sk=v.a==="CLO"?`https://www.skyscanner.com.co/transporte/vuelos/clo/gua/${s(d1)}/${s(d2)}/`:"";
 return [A("Google Flights",g),sk&&A("Skyscanner",sk),A("Kayak",k),...(v.l||[]).map(l=>A(l.n,l.u))].filter(Boolean).join("")};
const clean=n=>n.replace(/\s*\(.*\)/,"");
const book=(h,o,i,f)=>o.hw||`https://www.booking.com/searchresults.html?ss=${encodeURIComponent(clean(o.nm)+", "+h.q)}&checkin=${i}&checkout=${f}&group_adults=${S.occ}`;
const q=(o,h,p)=>encodeURIComponent(clean(o.nm)+" "+h.q+p);

async function wiki(t){if(C[t])return C[t];try{const j=await(await fetch(`https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&piprop=thumbnail&pithumbsize=500&titles=${encodeURIComponent(t)}&format=json&origin=*`)).json();return C[t]=Object.values(j.query.pages)[0].thumbnail?.source||""}catch(e){return ""}}
async function commons(n){const k="c:"+n;if(k in C)return C[k];try{const j=await(await fetch(`https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrlimit=5&gsrsearch=${encodeURIComponent(n)}&prop=imageinfo&iiprop=url&iiurlwidth=500&format=json&origin=*`)).json();const w=n.toLowerCase().split(" ").slice(0,2).join(" ");const p=Object.values(j.query?.pages||{}).find(p=>p.title.toLowerCase().includes(w));return C[k]=p?.imageinfo?.[0]?.thumburl||""}catch(e){return ""}}
const paint=(el,u)=>{if(u&&el){el.style.backgroundImage=`url("${u}")`;el.classList.add("on")}};

function ruta(){
 const op=$("#pre")?.open?" open":"";
 $("#s-ruta").innerHTML=`<details class="pre" id="pre"${op}><summary>Antes de salir: fiebre amarilla, seguridad, volcán y teléfonos</summary><div class="in antes">${D.antes.map(b=>`<details class="box ${b.w?"w":""}"><summary>${b.t}</summary><ul>${b.l.map(x=>`<li>${x}</li>`).join("")}</ul><p>${srcs(b.s)}</p></details>`).join("")}</div></details><h2>Día por día</h2>`+
 D.ruta.map(d=>{const n=d.n,f=fmt(dt(d.n-1));return `<div class="day"><div><b>${n}</b><small>${f}</small></div><div><h3>${d.t}</h3><span class="tag">${d.l}</span><p>${d.x}</p>${d.tip?`<span class="tag ${d.w?"w":""}">${d.tip}</span>`:""}<div class="food"><b>Qué comer</b><p>${d.c.x}</p><p>${srcs(d.c.s)}</p></div></div></div>`}).join("")}

function mapa(){
 $("#s-mapa").innerHTML=`<p>El trazo es esquemático: une los puntos en orden y no sigue las carreteras. La línea punteada es el vuelo Flores–Guatemala.</p><div id="map" class="map"></div><div class="grid">${D.lugares.filter(l=>l.wiki).map(l=>`<div class="place"><div class="ph" id="ph-${l.id}" role="img" aria-label="Foto de ${l.n}"></div><div class="b"><h3>${l.n}</h3><p>${l.dia}</p><p>${l.x}</p><span class="cr">Foto: ${A("Wikipedia",`https://en.wikipedia.org/wiki/${l.wiki}`)}</span></div></div>`).join("")}</div>`;
 D.lugares.filter(l=>l.wiki).forEach(async l=>{const u=await wiki(l.wiki);if(u)$("#ph-"+l.id).style.backgroundImage=`url("${u}")`})}
function initMap(){
 if(map)return map.invalidateSize();
 if(!window.L){$("#map").textContent="No cargó el mapa. Revisa la conexión.";return}
 map=L.map("map",{scrollWheelZoom:false});
 L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:18,attribution:"© OpenStreetMap"}).addTo(map);
 const P=Object.fromEntries(D.lugares.map(l=>[l.id,l])),ll=id=>[P[id].lat,P[id].lng],t=D.trazo.tierra.map(ll);
 L.polyline(t,{color:"#0f7a5c",weight:4}).addTo(map);
 D.trazo.aire.forEach(([a,b])=>L.polyline([ll(a),ll(b)],{color:"#c2410c",weight:3,dashArray:"8 8"}).addTo(map));
 D.lugares.forEach(l=>L.marker(ll(l.id)).addTo(map).bindPopup(`<b>${l.n}</b><br>${l.dia}`));
 map.fitBounds(t,{padding:[30,30]})}

function hoteles(){
 $("#s-hoteles").innerHTML=`<label>Personas por habitación <select id="occ"><option value="1" ${S.occ==1?"selected":""}>1</option><option value="2" ${S.occ==2?"selected":""}>2</option></select></label><p>Cada precio indica su fuente y la fecha de la consulta. Ninguna es de enero de 2027, así que verifica la tarifa al reservar. El nivel Hostal es por persona; los hoteles se dividen entre las personas de la habitación.</p>`+
 D.hoteles.map((h,ci)=>`<div class="dest"><h2>${h.c}</h2><span>${h.n} noches</span></div><div class="grid">${h.opts.map((o,i)=>`<div class="h" aria-pressed="${S.tier[h.c]==i}"><div class="hp" id="hp-${ci}-${i}"></div><span class="t">${o.k}</span><div class="p">${money(night(o))}<small> /noche p. p.</small></div><b>${o.nm}</b><p>${o.nt||""}</p><p>${src(o.s)}</p><div class="lk"><button class="pick" data-c="${h.c}" data-i="${i}">Elegir</button>${A("Reservar",book(h,o,iso(dt(h.in)),iso(dt(h.out))))}${h.in2&&!o.hw?A(`Reservar ${dm(dt(h.in2))} al ${dm(dt(h.out2))}`,book(h,o,iso(dt(h.in2)),iso(dt(h.out2)))):""}${o.hw?"":A("Mapa",`https://www.google.com/maps/search/?api=1&query=${q(o,h," Guatemala")}`)+A("Fotos",`https://www.google.com/search?tbm=isch&q=${q(o,h,"")}`)}</div></div>`).join("")}</div>`).join("");
 $("#occ").onchange=e=>{S.occ=+e.target.value;render()};
 $$(".pick").forEach(b=>b.onclick=()=>{S.tier[b.dataset.c]=+b.dataset.i;render()});
 D.hoteles.forEach((h,ci)=>h.opts.forEach(async(o,i)=>{if(!o.hw)paint($(`#hp-${ci}-${i}`),await commons(clean(o.nm)))}))}

function costos(){
 $("#s-costos").innerHTML=`<p>Total por persona con los hoteles elegidos</p><div class="tot">${money(total())}</div><p>Alojamiento: ${money(lodging())}. Cada línea cita su fuente.</p><h3>Alojamiento</h3>`+
 D.hoteles.map(h=>{const o=h.opts[S.tier[h.c]];return `<div class="row"><span>${h.c}: ${o.nm} (${h.n} noches)<br><small>${src(o.s)}</small></span><b>${money(h.n*night(o))}</b></div>`}).join("")+`<h3>Transporte, actividades y comida</h3>`+
 D.presupuesto.map(l=>`<div class="row"><span>${l.l}<br><small>${l.n} ${srcs(l.s)}</small></span><b>${money(toUSD(l))}</b></div>`).join("")+`<p>${D.nota_no_incluido}</p>`}

function reservas(){const R=D.reservas;
 $("#s-reservas").innerHTML=`<h2>Vuelos</h2>`+R.vuelos.map(v=>`<div class="box"><h3>${v.t} (${dm(dt(v.d1))}${v.d2!=null?" y "+dm(dt(v.d2)):""})</h3><div class="lk">${fl(v)}</div></div>`).join("")+
 `<h2>Shuttles</h2><div class="box"><p>Guías con horarios y precios. Reserva con 24 a 48 horas de anticipación.</p><div class="lk">${R.shuttles.map(s=>A(s.t,s.u)).join("")}</div></div><h2>Tours</h2><div class="box"><div class="lk">${R.tours.map(s=>A(s.t,s.u)).join("")}</div></div>`}

function fechas(){const a=dt(0),b=dt(11),m=d=>d.toLocaleDateString("es-CO",{month:"long",timeZone:"UTC"});
 const t=a.getUTCMonth()==b.getUTCMonth()?`${a.getUTCDate()} al ${b.getUTCDate()} de ${m(b)} de ${b.getUTCFullYear()}`:`${a.getUTCDate()} de ${m(a)} al ${b.getUTCDate()} de ${m(b)} de ${b.getUTCFullYear()}`;
 $("#ttl").textContent="Guatemala, "+t;document.title="Guatemala: "+t;ruta();reservas();hoteles()}
function render(){hoteles();costos();$("#foot").textContent=`Tasas: 1 USD = ${S.fx.COP.toLocaleString("es-CO")} COP y ${S.fx.GTQ} GTQ. ${D.fx.nota}`}
const T=[["ruta","Ruta"],["mapa","Mapa"],["hoteles","Hoteles"],["costos","Presupuesto"],["reservas","Reservas"]];
$("#tabs").innerHTML=T.map(([k,v],i)=>`<button role="tab" data-k="${k}" aria-selected="${i==0}">${v}</button>`).join("");
$$("nav button").forEach(b=>b.onclick=()=>{$$("nav button").forEach(x=>x.setAttribute("aria-selected",x==b));T.forEach(([k])=>$("#s-"+k).hidden=k!==b.dataset.k);if(b.dataset.k==="mapa")initMap()});
(window.DATA?Promise.resolve(window.DATA):fetch("data/data.json").then(r=>r.json())).then(d=>{D=d;S.fx={...D.fx};D.hoteles.forEach(h=>S.tier[h.c]=0);
 $("#rCOP").value=S.fx.COP;$("#rGTQ").value=S.fx.GTQ;
 $("#cur").onchange=e=>{S.cur=e.target.value;render()};
 $("#rCOP").oninput=e=>{S.fx.COP=+e.target.value||D.fx.COP;render()};
 $("#rGTQ").oninput=e=>{S.fx.GTQ=+e.target.value||D.fx.GTQ;render()};
 const p=new URLSearchParams(location.search).get("inicio");if(/^\d{4}-\d{2}-\d{2}$/.test(p||""))S.start=p;
 $("#ini").value=S.start;
 $("#ini").onchange=e=>{if(!e.target.value)return;S.start=e.target.value;try{history.replaceState(null,"","?inicio="+S.start)}catch(_){}fechas();render()};
 mapa();render();fechas()})
 .catch(()=>{$("#s-ruta").innerHTML="<p>No se pudo cargar data/data.json. Abre la página desde un servidor (por ejemplo, <code>python3 -m http.server</code>), no con doble clic.</p>"});
