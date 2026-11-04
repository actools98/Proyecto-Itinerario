const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const S={tier:{},occ:2,cur:"COP",fx:{}};let D,map;
const usd=v=>S.cur==="USD"?v:v*S.fx[S.cur];
const money=v=>({COP:"COP ",USD:"US$",GTQ:"Q"})[S.cur]+Math.round(usd(v)).toLocaleString("es-CO");
const night=o=>o.pp?o.u:o.u/S.occ;
const lodging=()=>D.hoteles.reduce((a,h)=>a+h.n*night(h.opts[S.tier[h.c]]),0);
const total=()=>D.fijos.reduce((a,f)=>a+(f.usd??f.cop/S.fx.COP),0)+lodging();
const book=(h,o,i,f)=>`https://www.booking.com/searchresults.html?ss=${encodeURIComponent(o.nm.replace(/\s*\(.*\)/,"")+", "+h.q)}&checkin=${i}&checkout=${f}&group_adults=${S.occ}`;
const gmap=(h,o)=>`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(o.nm.replace(/\s*\(.*\)/,"")+" "+h.q)}`;
const A=(n,u)=>`<a href="${u}" target="_blank" rel="noopener">${n}</a>`;

function ruta(){$("#s-ruta").innerHTML=D.ruta.map(d=>{const[n,f]=d.d.split(" · ");return `<div class="day"><div><b>${n}</b><small>${f}</small></div><div><h3>${d.t}</h3><span class="tag">${d.l}</span><p>${d.x}</p>${d.tip?`<span class="tag ${d.w?"w":""}">${d.tip}</span>`:""}</div></div>`}).join("")}

function mapa(){
 $("#s-mapa").innerHTML=`<p>El trazo es esquemático: las líneas unen los puntos en orden, no siguen las carreteras. La línea punteada es el vuelo Flores–Guatemala.</p><div id="map" class="map"></div><div class="grid">${D.lugares.filter(l=>l.wiki).map(l=>`<div class="place"><div class="ph" id="ph-${l.id}" role="img" aria-label="Foto de ${l.n}"></div><div class="b"><h3>${l.n}</h3><p>${l.dia}</p><p>${l.x}</p><span class="cr" id="cr-${l.id}"></span></div></div>`).join("")}</div>`;
 D.lugares.filter(l=>l.wiki).forEach(foto)}
async function foto(l){try{const j=await(await fetch("https://en.wikipedia.org/api/rest_v1/page/summary/"+encodeURIComponent(l.wiki))).json();
 const u=j.thumbnail?.source?.replace(/\/\d+px-/,"/800px-");if(!u)return;
 $("#ph-"+l.id).style.backgroundImage=`url("${u}")`;$("#cr-"+l.id).innerHTML=`Foto: ${A("Wikipedia / Wikimedia Commons",j.content_urls.desktop.page)}`}catch(e){}}
function initMap(){
 if(map)return map.invalidateSize();
 if(!window.L){$("#map").textContent="No cargó el mapa. Revisa la conexión.";return}
 map=L.map("map",{scrollWheelZoom:false});
 L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:18,attribution:"© OpenStreetMap"}).addTo(map);
 const P=Object.fromEntries(D.lugares.map(l=>[l.id,l])),ll=id=>[P[id].lat,P[id].lng];
 const t=D.trazo.tierra.map(ll);
 L.polyline(t,{color:"#0f7a5c",weight:4}).addTo(map);
 D.trazo.aire.forEach(([a,b])=>L.polyline([ll(a),ll(b)],{color:"#c2410c",weight:3,dashArray:"8 8"}).addTo(map));
 D.lugares.forEach(l=>L.marker(ll(l.id)).addTo(map).bindPopup(`<b>${l.n}</b><br>${l.dia}`));
 map.fitBounds(t,{padding:[30,30]})}

function hoteles(){
 $("#s-hoteles").innerHTML=`<label>Personas por habitación <select id="occ"><option value="1" ${S.occ==1?"selected":""}>1</option><option value="2" ${S.occ==2?"selected":""}>2</option></select></label><p>Precios por noche, de listados de otras fechas. Los enlaces abren una búsqueda con las fechas de tu ruta; verifica la tarifa antes de reservar.</p>`+
 D.hoteles.map(h=>`<div class="dest"><h2>${h.c}</h2><span>${h.n} noches</span></div><div class="grid">${h.opts.map((o,i)=>`<div class="h" aria-pressed="${S.tier[h.c]==i}"><span class="t">${o.k}${o.r?" · "+o.r+"/10":""}</span><div class="p">${money(night(o))}<small> /noche p. p.</small></div><b>${o.nm}</b><p>${o.nt}</p><div class="lk"><button class="pick" data-c="${h.c}" data-i="${i}">Elegir</button>${A("Reservar",book(h,o,h.in,h.out))}${h.in2?A("Reservar 13 a 15 ene",book(h,o,h.in2,h.out2)):""}${A("Mapa",gmap(h,o))}</div></div>`).join("")}</div>`).join("");
 $("#occ").onchange=e=>{S.occ=+e.target.value;render()};
 $$(".pick").forEach(b=>b.onclick=()=>{S.tier[b.dataset.c]=+b.dataset.i;render()})}

function costos(){
 $("#s-costos").innerHTML=`<p>Total por persona con los hoteles elegidos</p><div class="tot">${money(total())}</div><p>Alojamiento: ${money(lodging())}. El resto no cambia con el hotel.</p>`+
 D.hoteles.map(h=>{const o=h.opts[S.tier[h.c]];return `<div class="row"><span>${h.c}: ${o.nm} (${h.n} noches)</span><b>${money(h.n*night(o))}</b></div>`}).join("")+
 D.fijos.map(f=>`<div class="row"><span>${f.l}<br><small>${f.nt}</small></span><b>${money(f.usd??f.cop/S.fx.COP)}</b></div>`).join("")}

function reservas(){const R=D.reservas;
 $("#s-reservas").innerHTML=`<h2>Vuelos</h2>`+R.vuelos.map(v=>`<div class="box"><h3>${v.t}</h3><div class="lk">${v.l.map(l=>A(l.n,l.u)).join("")}</div></div>`).join("")+
 `<h2>Shuttles</h2><div class="box"><p>Guías con horarios y precios actualizados. Reserva con 24 a 48 horas de anticipación.</p><div class="lk">${R.shuttles.map(s=>A(s.t,s.u)).join("")}</div></div><h2>Tours</h2><div class="box"><div class="lk">${R.tours.map(s=>A(s.t,s.u)).join("")}</div></div>`}

function seguridad(){$("#s-seguridad").innerHTML=D.alertas.map(a=>`<div class="box ${a.w?"w":""}"><h3>${a.t}</h3><p>${a.x}</p></div>`).join("")}
function render(){hoteles();costos();$("#foot").textContent=`Tasa: 1 USD = ${S.fx.COP.toLocaleString("es-CO")} COP (${D.fx.fecha}). ${D.fx.nota}`}

const T=[["ruta","Ruta"],["mapa","Mapa"],["hoteles","Hoteles"],["costos","Presupuesto"],["reservas","Reservas"],["seguridad","Seguridad"]];
$("#tabs").innerHTML=T.map(([k,v],i)=>`<button role="tab" data-k="${k}" aria-selected="${i==0}">${v}</button>`).join("");
$$("nav button").forEach(b=>b.onclick=()=>{$$("nav button").forEach(x=>x.setAttribute("aria-selected",x==b));T.forEach(([k])=>$("#s-"+k).hidden=k!==b.dataset.k);if(b.dataset.k==="mapa")initMap()});

fetch("data/data.json").then(r=>r.json()).then(d=>{D=d;S.fx={...D.fx};D.hoteles.forEach(h=>S.tier[h.c]=2);
 $("#rCOP").value=S.fx.COP;$("#rGTQ").value=S.fx.GTQ;
 $("#cur").onchange=e=>{S.cur=e.target.value;render()};
 $("#rCOP").oninput=e=>{S.fx.COP=+e.target.value||D.fx.COP;render()};
 $("#rGTQ").oninput=e=>{S.fx.GTQ=+e.target.value||D.fx.GTQ;render()};
 ruta();mapa();reservas();seguridad();render()})
 .catch(()=>{$("#s-ruta").innerHTML="<p>No se pudo cargar data/data.json. Abre la página desde un servidor (por ejemplo, <code>python3 -m http.server</code>), no con doble clic.</p>"});
