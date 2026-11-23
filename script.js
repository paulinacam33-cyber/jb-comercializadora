/* ==========================================================================
   Comercializadora JB: comportamiento de la página
   Lee los datos de data/sitio.js y data/productos.js.
   ========================================================================== */
(() => {
  'use strict';

  const SITIO = window.JB_SITIO;
  const CAT = window.JB_CATALOGO;
  if (!SITIO || !CAT) return;

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const MOVIL = /Android|iPhone|iPad|iPod|Mobi/i.test(navigator.userAgent);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const icono = id => `<svg class="icon" aria-hidden="true" focusable="false"><use href="#i-${id}"/></svg>`;

  /* ---------- WhatsApp ---------- */
  // En computadora abre WhatsApp Web; en el teléfono, la aplicación.
  function waUrl(texto) {
    const n = SITIO.whatsapp.numero;
    const t = encodeURIComponent(texto || '');
    return MOVIL ? `https://wa.me/${n}?text=${t}` : `https://web.whatsapp.com/send?phone=${n}&text=${t}`;
  }
  function conectarWa(raiz = document) {
    $$('[data-wa]', raiz).forEach(a => {
      a.href = waUrl(a.dataset.wa);
      a.target = '_blank';
      a.rel = 'noopener';
    });
  }

  /* ---------- Menú en pantallas chicas ---------- */
  const cabecera = $('.site-header');
  const botonMenu = $('#menu-btn');
  const nav = $('#nav');
  function abrirMenu(abierto) {
    cabecera.classList.toggle('nav-open', abierto);
    botonMenu.setAttribute('aria-expanded', String(abierto));
    botonMenu.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú');
    document.documentElement.classList.toggle('sin-scroll', abierto);
  }
  botonMenu.addEventListener('click', () => abrirMenu(!cabecera.classList.contains('nav-open')));
  nav.addEventListener('click', e => { if (e.target.closest('a')) abrirMenu(false); });
  addEventListener('keydown', e => {
    if (e.key === 'Escape' && cabecera.classList.contains('nav-open')) { abrirMenu(false); botonMenu.focus(); }
  });
  matchMedia('(min-width: 901px)').addEventListener('change', e => { if (e.matches) abrirMenu(false); });

  /* ---------- Catálogo ---------- */
  const lista = $('#catalogo-lista');
  const PRODUCTOS = new Map();
  CAT.categorias.forEach(c => c.productos.forEach(p => PRODUCTOS.set(p.id, p)));

  // Evita que una cifra se separe de su unidad al cambiar de renglón ("24" / "m (120 t)")
  function sinCortes(texto) {
    return String(texto)
      .replace(/\(([^)]*)\)/g, m => m.replace(/ /g, ' '))
      .replace(/(\d) (?=(?:m|t|kg|g)\b)/g, '$1 ')
      .replace(/\b(m|t|kg) \(/g, '$1 (');
  }

  function precioHtml(p) {
    const n = Number(p.precio);
    if (p.precio !== '' && p.precio != null && !Number.isNaN(n)) {
      return `<strong>${esc(n.toLocaleString('es-MX', { style: 'currency', currency: CAT.moneda || 'MXN' }))}</strong>`;
    }
    return '<strong class="sin-precio">Bajo cotización</strong>';
  }

  function fichaHtml(p, visible) {
    const foto = p.fotos[0];
    const miniaturas = p.fotos.length > 1
      ? `<div class="thumbs">${p.fotos.map((f, i) =>
          `<button type="button" data-foto="${i}" aria-label="Ver foto ${i + 1} de ${p.fotos.length}" aria-current="${i === 0}"><img src="${esc(f.src)}" alt="" loading="lazy"></button>`
        ).join('')}</div>`
      : '';
    const anim = p.animacion
      ? `<button type="button" class="chip" data-accion="anim" aria-pressed="false">${icono('cubo')}<span class="chip__txt">${esc(p.animacion.etiqueta || 'Ver animación 3D')}</span></button>
         <button type="button" class="chip" data-accion="pantalla" hidden>${icono('pantalla')}<span>Pantalla completa</span></button>`
      : '';
    const specs = p.caracteristicas.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(sinCortes(v))}</dd></div>`).join('');
    const comps = (p.componentes && p.componentes.length)
      ? `<h5 class="sub">Componentes</h5>
         <ul class="comps">${p.componentes.map(c =>
           `<li><strong>${esc(c.nombre)}</strong>${c.opcional ? '<span class="tag-opc">Opcional</span>' : ''}${c.detalle ? `<p>${esc(c.detalle)}</p>` : ''}</li>`
         ).join('')}</ul>`
      : '';
    return `
      <article class="ficha" id="ficha-${esc(p.id)}" data-id="${esc(p.id)}" style="--ratio:${esc(p.aspecto || '4/3')}" ${visible ? '' : 'hidden'}>
        <div class="ficha__media">
          <div class="ficha__foto"><img src="${esc(foto.src)}" alt="${esc(foto.alt || p.nombre)}" data-ajuste="${esc(foto.ajuste || 'cover')}" loading="lazy" decoding="async"></div>
          <div class="ficha__anim" hidden></div>
          <div class="media-tools">${anim}${miniaturas}</div>
        </div>
        <div class="ficha__cuerpo">
          <h4 class="ficha__nombre">${esc(p.nombre)}</h4>
          <p class="ficha__desc">${esc(p.descripcion)}</p>
          <div class="precio"><span>Precio</span>${precioHtml(p)}</div>
          <h5 class="sub">Características</h5>
          <dl class="specs">${specs}</dl>
          ${comps}
          <div class="ficha__acciones">
            <a class="btn btn--primary" data-wa="Hola, quiero cotizar: ${esc(p.nombre)}." href="https://wa.me/${SITIO.whatsapp.numero}">${icono('wa')}Cotizar por WhatsApp</a>
          </div>
        </div>
      </article>`;
  }

  function categoriaHtml(c, i) {
    const n = c.productos.length;
    const tabs = n > 1
      ? `<div class="tabs" role="tablist" aria-label="Productos de ${esc(c.nombre)}">${c.productos.map((p, k) =>
          `<button type="button" class="tab" role="tab" id="tab-${esc(p.id)}" data-id="${esc(p.id)}" aria-selected="${k === 0}" aria-controls="ficha-${esc(p.id)}" tabindex="${k === 0 ? 0 : -1}">${esc(p.nombre)}</button>`
        ).join('')}</div>`
      : '';
    return `
      <div class="acc" data-cat="${esc(c.id)}" data-open="false">
        <h3 class="acc__titulo">
          <button type="button" class="acc__btn" id="btn-${esc(c.id)}" aria-expanded="false" aria-controls="panel-${esc(c.id)}">
            <span class="acc__nombre">${esc(c.nombre)}</span>
            <span class="acc__resumen">${esc(c.resumen || '')}</span>
            <span class="acc__meta">${n} ${n === 1 ? 'producto' : 'productos'}</span>
            <span class="acc__icono" aria-hidden="true"></span>
          </button>
        </h3>
        <div class="acc__panel" id="panel-${esc(c.id)}" role="region" aria-labelledby="btn-${esc(c.id)}" inert>
          <div class="acc__inner">
            ${tabs}
            ${c.productos.map((p, k) => fichaHtml(p, k === 0)).join('')}
          </div>
        </div>
      </div>`;
  }

  lista.innerHTML = CAT.categorias.map(categoriaHtml).join('');
  conectarWa(lista);

  function abrirCategoria(acc, abrir) {
    acc.dataset.open = String(abrir);
    $('.acc__btn', acc).setAttribute('aria-expanded', String(abrir));
    $('.acc__panel', acc).inert = !abrir;
    if (!abrir) $$('.ficha', acc).forEach(detenerAnimacion);
  }
  function alternarCategoria(acc) {
    const abrir = acc.dataset.open !== 'true';
    $$('.acc', lista).forEach(o => { if (o !== acc && o.dataset.open === 'true') abrirCategoria(o, false); });
    abrirCategoria(acc, abrir);
  }

  function elegirProducto(tab, enfocar) {
    const acc = tab.closest('.acc');
    $$('.tab', acc).forEach(t => {
      const activa = t === tab;
      t.setAttribute('aria-selected', String(activa));
      t.tabIndex = activa ? 0 : -1;
    });
    $$('.ficha', acc).forEach(f => {
      const activa = f.dataset.id === tab.dataset.id;
      if (!activa) detenerAnimacion(f);
      if (activa && f.hidden) {
        f.hidden = false;
        f.classList.remove('entra'); void f.offsetWidth; f.classList.add('entra');
      } else if (!activa) {
        f.hidden = true;
      }
    });
    if (enfocar) tab.focus();
  }

  function elegirFoto(boton) {
    const ficha = boton.closest('.ficha');
    const p = PRODUCTOS.get(ficha.dataset.id);
    const f = p.fotos[Number(boton.dataset.foto)];
    const img = $('.ficha__foto img', ficha);
    img.src = f.src; img.alt = f.alt || p.nombre; img.dataset.ajuste = f.ajuste || 'cover';
    $$('.thumbs button', ficha).forEach(b => b.setAttribute('aria-current', String(b === boton)));
  }

  /* Animaciones 3D: se crean solo al pedirlas y se destruyen al cerrar, para no gastar memoria */
  function urlAnimacion(p, completa) {
    const a = p.animacion;
    const q = new URLSearchParams({ tema: 'papel', ...a.parametros });
    if (completa) q.set('solo', '1');
    else { q.set('embed', '1'); q.set('etiquetas', '0'); }
    return `${a.archivo}?${q.toString()}`;
  }
  function pintarBotonAnimacion(ficha, activa) {
    const boton = $('[data-accion="anim"]', ficha);
    if (!boton) return;
    const p = PRODUCTOS.get(ficha.dataset.id);
    boton.setAttribute('aria-pressed', String(activa));
    boton.innerHTML = activa
      ? `${icono('foto')}<span class="chip__txt">Ver foto</span>`
      : `${icono('cubo')}<span class="chip__txt">${esc(p.animacion.etiqueta || 'Ver animación 3D')}</span>`;
    const pantalla = $('[data-accion="pantalla"]', ficha);
    if (pantalla) pantalla.hidden = !activa;
    const mini = $('.thumbs', ficha);
    if (mini) mini.hidden = activa;
  }
  function iniciarAnimacion(ficha) {
    const p = PRODUCTOS.get(ficha.dataset.id);
    const caja = $('.ficha__anim', ficha);
    caja.innerHTML = `<iframe src="${esc(urlAnimacion(p, false))}" title="${esc(p.nombre)}: animación 3D" allow="fullscreen"></iframe>`;
    caja.hidden = false;
    $('.ficha__foto', ficha).hidden = true;
    ficha.dataset.anim = 'on';
    pintarBotonAnimacion(ficha, true);
  }
  function detenerAnimacion(ficha) {
    if (ficha.dataset.anim !== 'on') return;
    const caja = $('.ficha__anim', ficha);
    caja.innerHTML = '';
    caja.hidden = true;
    $('.ficha__foto', ficha).hidden = false;
    ficha.dataset.anim = 'off';
    pintarBotonAnimacion(ficha, false);
  }

  const visor = $('#visor');
  const visorFrame = $('#visor-frame');
  function abrirVisor(p) {
    $('#visor-titulo').textContent = p.nombre;
    visorFrame.title = `${p.nombre}: animación 3D en pantalla completa`;
    visorFrame.src = urlAnimacion(p, true);
    visor.showModal();
    document.documentElement.classList.add('sin-scroll');
  }
  visor.addEventListener('close', () => {
    visorFrame.removeAttribute('src');
    document.documentElement.classList.remove('sin-scroll');
  });
  $('#visor-cerrar').addEventListener('click', () => visor.close());
  visor.addEventListener('click', e => { if (e.target === visor) visor.close(); });

  lista.addEventListener('click', e => {
    const bAcc = e.target.closest('.acc__btn');
    if (bAcc) return alternarCategoria(bAcc.closest('.acc'));
    const tab = e.target.closest('.tab');
    if (tab) return elegirProducto(tab, false);
    const mini = e.target.closest('.thumbs button');
    if (mini) return elegirFoto(mini);
    const accion = e.target.closest('[data-accion]');
    if (accion) {
      const ficha = accion.closest('.ficha');
      const p = PRODUCTOS.get(ficha.dataset.id);
      if (accion.dataset.accion === 'anim') return ficha.dataset.anim === 'on' ? detenerAnimacion(ficha) : iniciarAnimacion(ficha);
      if (accion.dataset.accion === 'pantalla') return abrirVisor(p);
    }
  });
  // Flechas del teclado entre productos (patrón de pestañas)
  lista.addEventListener('keydown', e => {
    const tab = e.target.closest('.tab');
    if (!tab || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
    const tabs = $$('.tab', tab.closest('.acc'));
    let i = tabs.indexOf(tab);
    if (e.key === 'ArrowRight') i = (i + 1) % tabs.length;
    if (e.key === 'ArrowLeft') i = (i - 1 + tabs.length) % tabs.length;
    if (e.key === 'Home') i = 0;
    if (e.key === 'End') i = tabs.length - 1;
    e.preventDefault();
    elegirProducto(tabs[i], true);
  });

  // La primera línea del catálogo arranca abierta
  const primera = $('.acc', lista);
  if (primera) abrirCategoria(primera, true);
  // Si se llega con un enlace a un producto (#ficha-id), se abre su categoría
  function abrirDesdeHash() {
    const m = location.hash.match(/^#ficha-(.+)$/);
    if (!m) return;
    const tab = $(`.tab[data-id="${CSS.escape(m[1])}"]`);
    const acc = tab ? tab.closest('.acc') : (PRODUCTOS.has(m[1]) ? $(`#ficha-${CSS.escape(m[1])}`)?.closest('.acc') : null);
    if (!acc) return;
    $$('.acc', lista).forEach(o => { if (o !== acc) abrirCategoria(o, false); });
    abrirCategoria(acc, true);
    if (tab) elegirProducto(tab, false);
  }
  abrirDesdeHash();
  addEventListener('hashchange', abrirDesdeHash);

  /* ---------- Radar de cobertura ---------- */
  function iniciarRadar() {
    const svg = $('#radar');
    if (!svg) return;
    const R = 290, D_MAX = 120, EXP = 0.6;               // radio exterior, distancia máxima (km), escala no lineal
    const radio = d => R * Math.pow(Math.min(d, D_MAX) / D_MAX, EXP);
    const c = SITIO.centro;
    const kx = 111.32 * Math.cos(c.lat * Math.PI / 180), ky = 110.57;
    const puntos = SITIO.zonas.map((z, i) => {
      const dx = (z.lon - c.lon) * kx, dy = (z.lat - c.lat) * ky;
      const d = Math.hypot(dx, dy);
      let rumbo = Math.atan2(dx, dy) * 180 / Math.PI; if (rumbo < 0) rumbo += 360;
      const r = radio(d), a = rumbo * Math.PI / 180;
      return { ...z, i, d, rumbo, x: r * Math.sin(a), y: -r * Math.cos(a) };
    });

    // Etiquetas sin traslapes: se prueba a un lado, al otro, arriba y abajo del punto
    const anchoTexto = t => 8.8 * t.length + 6;
    const choca = (a, b) => a.x0 < b.x1 && a.x1 > b.x0 && a.y0 < b.y1 && a.y1 > b.y0;
    const ocupado = [
      { x0: -17, x1: 17, y0: -17, y1: 17 },                    // aro del centro
      { x0: -118, x1: -18, y0: -36, y1: -6 }                    // etiqueta del centro
    ];
    puntos.forEach(p => ocupado.push({ x0: p.x - 10, x1: p.x + 10, y0: p.y - 10, y1: p.y + 10 }));
    [...puntos].sort((a, b) => a.d - b.d).forEach(p => {
      const w = anchoTexto(p.nombre), lado = p.x < 0 ? -1 : 1;
      const opciones = [
        { dx: lado * 13, dy: 6, ancla: lado < 0 ? 'end' : 'start' },
        { dx: -lado * 13, dy: 6, ancla: lado < 0 ? 'start' : 'end' },
        { dx: 0, dy: -15, ancla: 'middle' },
        { dx: 0, dy: 27, ancla: 'middle' }
      ];
      const caja = o => {
        const x = p.x + o.dx, y = p.y + o.dy;
        const x0 = o.ancla === 'end' ? x - w : o.ancla === 'middle' ? x - w / 2 : x;
        return { x0, x1: x0 + w, y0: y - 14, y1: y + 4 };
      };
      const propio = { x0: p.x - 10, x1: p.x + 10, y0: p.y - 10, y1: p.y + 10 };
      const libre = o => {
        const b = caja(o);
        if (b.x0 < -372 || b.x1 > 372 || b.y0 < -300 || b.y1 > 300) return false;
        return !ocupado.some(r => r !== propio && !(r.x0 === p.x - 10 && r.y0 === p.y - 10) && choca(b, r));
      };
      const elegida = opciones.find(libre) || opciones[0];
      p.lx = p.x + elegida.dx; p.ly = p.y + elegida.dy; p.ancla = elegida.ancla;
      ocupado.push(caja(elegida));
    });

    // Aros, ejes y escala
    let html = '';
    [25, 50, 100].forEach(km => { html += `<circle class="r-ring" r="${radio(km).toFixed(1)}"/>`; });
    html += `<circle class="r-ring r-ring--borde" r="${R}"/>`;
    html += `<line class="r-axis" x1="0" y1="${-R}" x2="0" y2="${R}"/><line class="r-axis" x1="${-R}" y1="0" x2="${R}" y2="0"/>`;
    [25, 50, 100].forEach(km => { html += `<text class="r-texto" x="8" y="${(-radio(km) - 6).toFixed(1)}">${km} km</text>`; });
    html += `<text class="r-texto" text-anchor="middle" x="0" y="${-R - 14}">N</text>`;
    html += `<text class="r-texto" text-anchor="middle" x="0" y="${R + 26}">S</text>`;
    html += `<text class="r-texto" x="${R + 14}" y="5">E</text>`;
    html += `<text class="r-texto" text-anchor="end" x="${-R - 14}" y="5">O</text>`;

    // Barrido: rebanadas de 1.6° que se desvanecen hacia atrás
    let barrido = '';
    const PASO = 1.6, N = 30;
    for (let k = 0; k < N; k++) {
      const a1 = -(k + 1) * PASO * Math.PI / 180, a2 = -k * PASO * Math.PI / 180;
      const op = (0.34 * Math.pow(1 - k / N, 1.6)).toFixed(3);
      barrido += `<path d="M0 0 L${(R * Math.sin(a1)).toFixed(2)} ${(-R * Math.cos(a1)).toFixed(2)} A${R} ${R} 0 0 1 ${(R * Math.sin(a2)).toFixed(2)} ${(-R * Math.cos(a2)).toFixed(2)}Z" fill="#ffa621" fill-opacity="${op}"/>`;
    }
    barrido += `<line x1="0" y1="0" x2="0" y2="${-R}" stroke="#ffa621" stroke-width="2" stroke-opacity=".9"/>`;
    html += `<g class="r-sweep" id="barrido">${barrido}</g>`;

    // Zonas
    puntos.forEach(p => {
      html += `<g class="blip" data-zona="${p.i}" transform="translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})">
        <circle class="blip__halo" r="10"/><circle class="blip__dot" r="5"/>
        <text class="blip__label" x="${(p.lx - p.x).toFixed(1)}" y="${(p.ly - p.y).toFixed(1)}" text-anchor="${p.ancla}">${esc(p.nombre)}</text></g>`;
    });
    // Centro
    html += `<g class="centro"><circle class="centro__aro" r="15"/><circle class="centro__dot" r="7"/>
      <text class="centro__label" x="-22" y="-14" text-anchor="end">${esc(c.nombre)}</text></g>`;
    svg.innerHTML = html;

    // Lista de zonas, al lado del radar y para pantallas chicas
    const ul = $('#zonas-lista');
    ul.innerHTML = `<li><strong>${esc(c.nombre)}</strong><span>Centro</span></li>` +
      puntos.map(p => `<li data-zona="${p.i}"><strong>${esc(p.nombre)}</strong>${p.estado !== c.estado ? `<span>${esc(p.estado)}</span>` : ''}</li>`).join('');
    const blips = $$('.blip', svg);
    $$('li[data-zona]', ul).forEach(li => {
      const marcar = on => { li.classList.toggle('hl', on); blips[Number(li.dataset.zona)].classList.toggle('hl', on); };
      li.addEventListener('mouseenter', () => marcar(true));
      li.addEventListener('mouseleave', () => marcar(false));
    });

    // Animación del barrido: los puntos brillan cuando el barrido pasa y se atenúan después
    const grupo = $('#barrido', svg);
    const halos = blips.map(b => $('.blip__halo', b));
    const pausa = $('#radar-pausa');
    let ang = 300, ultimo = 0, visible = false, pausado = REDUCED, raf = 0;
    function pintar() {
      grupo.setAttribute('transform', `rotate(${ang.toFixed(1)})`);
      puntos.forEach((p, i) => {
        const d = (ang - p.rumbo + 360) % 360;
        blips[i].style.opacity = (1 - 0.74 * (d / 360)).toFixed(2);
        const h = d < 40 ? 1 - d / 40 : 0;
        halos[i].style.opacity = h.toFixed(2);
        halos[i].style.transform = `scale(${(1 + (1 - h) * 1.6).toFixed(2)})`;
      });
    }
    function fotograma(t) {
      if (!visible || pausado) { raf = 0; return; }
      const dt = Math.min((t - ultimo) / 1000, 0.1); ultimo = t;
      ang = (ang + dt * 45) % 360;
      pintar();
      raf = requestAnimationFrame(fotograma);
    }
    function arrancar() { if (!raf && visible && !pausado) { ultimo = performance.now(); raf = requestAnimationFrame(fotograma); } }
    if (REDUCED) {
      grupo.style.display = 'none';
      blips.forEach(b => { b.style.opacity = '1'; });
      halos.forEach(h => { h.style.opacity = '0'; });
      pausa.hidden = true;
    } else {
      pintar();
      new IntersectionObserver(es => { visible = es[0].isIntersecting; arrancar(); }, { threshold: 0.1 }).observe(svg);
      pausa.addEventListener('click', () => {
        pausado = !pausado;
        pausa.setAttribute('aria-pressed', String(pausado));
        $('span', pausa).textContent = pausado ? 'Reanudar radar' : 'Pausar radar';
        $('use', pausa).setAttribute('href', pausado ? '#i-play' : '#i-pausa');
        if (!pausado) arrancar();
      });
    }
  }
  iniciarRadar();

  /* ---------- Quiénes somos: el texto se ilumina palabra por palabra al avanzar ---------- */
  function momentoPalabras() {
    const el = $('#statement');
    if (!el) return;
    const palabras = el.textContent.trim().split(/\s+/);
    el.innerHTML = palabras.map(w => `<span class="w">${esc(w)}</span>`).join(' ');
    const spans = $$('.w', el);
    if (REDUCED) { spans.forEach(s => s.classList.add('on')); return; }
    let espera = false;
    const actualizar = () => {
      espera = false;
      const r = el.getBoundingClientRect(), vh = innerHeight;
      const avance = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height * 0.9 + vh * 0.1)));
      const n = Math.round(avance * spans.length);
      spans.forEach((s, i) => s.classList.toggle('on', i < n));
    };
    addEventListener('scroll', () => { if (!espera) { espera = true; requestAnimationFrame(actualizar); } }, { passive: true });
    addEventListener('resize', actualizar);
    actualizar();
  }
  momentoPalabras();

  /* ---------- Contacto ---------- */
  function iniciarContacto() {
    // Mensajes rápidos
    $('#rapidos').innerHTML = SITIO.mensajesRapidos.map(m =>
      `<a class="rapido" data-wa="${esc(m.mensaje)}" href="https://wa.me/${SITIO.whatsapp.numero}"><span>${esc(m.etiqueta)}</span>${icono('flecha')}</a>`
    ).join('');
    conectarWa($('#rapidos'));
    conectarWa($('.numero'));

    // Formulario
    const form = $('#form-contacto');
    const selProducto = $('#f-producto'), selZona = $('#f-zona'), inpNombre = $('#f-nombre');
    selProducto.innerHTML = '<option value="">Elegir un producto</option>' +
      CAT.categorias.map(c => `<optgroup label="${esc(c.nombre)}">${c.productos.map(p => `<option>${esc(p.nombre)}</option>`).join('')}</optgroup>`).join('') +
      '<option>Otro producto o aún no lo sé</option>';
    selZona.innerHTML = '<option value="">Elegir una zona</option>' +
      [SITIO.centro, ...SITIO.zonas].map(z => `<option>${esc(z.nombre)}</option>`).join('') +
      '<option>Otra zona</option>';

    const estado = $('#form-estado');
    const campos = [
      [selProducto, $('#e-producto'), v => v ? '' : 'Elegir un producto de la lista.'],
      [selZona, $('#e-zona'), v => v ? '' : 'Elegir la zona donde se encuentra.'],
      [inpNombre, $('#e-nombre'), v => v.trim().length >= 2 ? '' : 'Escribir el nombre de la persona o de la empresa.']
    ];
    function validar(campo, mensajeEl, regla) {
      const msg = regla(campo.value);
      mensajeEl.textContent = msg;
      if (msg) campo.setAttribute('aria-invalid', 'true'); else campo.removeAttribute('aria-invalid');
      return !msg;
    }
    campos.forEach(([campo, mensajeEl, regla]) => {
      campo.addEventListener('input', () => { if (campo.getAttribute('aria-invalid')) validar(campo, mensajeEl, regla); });
      campo.addEventListener('change', () => { if (campo.getAttribute('aria-invalid')) validar(campo, mensajeEl, regla); });
    });
    form.addEventListener('submit', e => {
      e.preventDefault();
      estado.textContent = '';
      const resultados = campos.map(([campo, mensajeEl, regla]) => validar(campo, mensajeEl, regla));
      if (resultados.includes(false)) {
        const primero = campos.find(([campo]) => campo.getAttribute('aria-invalid'));
        if (primero) primero[0].focus();
        return;
      }
      const texto = `Hola, soy ${inpNombre.value.trim()}. Me interesa: ${selProducto.value}. Zona: ${selZona.value}.`;
      const url = waUrl(texto);
      const ventana = window.open(url, '_blank');
      if (ventana) {
        ventana.opener = null;
        estado.innerHTML = `Se abrió WhatsApp con el mensaje listo para enviar. <a href="${esc(url)}" target="_blank" rel="noopener">Abrir de nuevo</a>`;
      } else {
        estado.innerHTML = `El navegador bloqueó la ventana. <a href="${esc(url)}" target="_blank" rel="noopener">Abrir WhatsApp con el mensaje</a>`;
      }
    });
  }
  iniciarContacto();

  conectarWa(document);
})();
