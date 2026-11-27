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
  // El encabezado es transparente sobre la foto de la portada y se vuelve blanco al bajar o al abrir el menú
  function actualizarCabecera() {
    cabecera.classList.toggle('solido', scrollY > 40 || cabecera.classList.contains('nav-open'));
  }
  addEventListener('scroll', actualizarCabecera, { passive: true });
  function abrirMenu(abierto) {
    cabecera.classList.toggle('nav-open', abierto);
    botonMenu.setAttribute('aria-expanded', String(abierto));
    botonMenu.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú');
    document.documentElement.classList.toggle('sin-scroll', abierto);
    actualizarCabecera();
  }
  actualizarCabecera();
  botonMenu.addEventListener('click', () => abrirMenu(!cabecera.classList.contains('nav-open')));
  nav.addEventListener('click', e => { if (e.target.closest('a')) abrirMenu(false); });
  addEventListener('keydown', e => {
    if (e.key === 'Escape' && cabecera.classList.contains('nav-open')) { abrirMenu(false); botonMenu.focus(); }
  });
  matchMedia('(min-width: 901px)').addEventListener('change', e => { if (e.matches) abrirMenu(false); });

  /* ---------- Catálogo ---------- */
  // Tarjetas con foto, nombre, resumen y precio; pestañas por línea y páginas de 6 (en laptop).
  // Al elegir una tarjeta se abre una ventana con la animación 3D y los datos técnicos.
  const raiz = $('#catalogo-lista');
  const PRODUCTOS = new Map();
  const LINEA_DE = new Map();
  CAT.categorias.forEach(c => c.productos.forEach(p => { PRODUCTOS.set(p.id, p); LINEA_DE.set(p.id, c); }));
  const TODOS = 'todos';

  // Evita que una cifra se separe de su unidad al cambiar de renglón ("24" / "m (120 t)")
  function sinCortes(texto) {
    return String(texto)
      .replace(/\(([^)]*)\)/g, m => m.replace(/ /g, ' '))
      .replace(/(\d) (?=(?:m|t|kg|g)\b)/g, '$1 ')
      .replace(/\b(m|t|kg) \(/g, '$1 (');
  }

  function precioTexto(p) {
    const n = Number(p.precio);
    if (p.precio !== '' && p.precio != null && !Number.isNaN(n)) {
      return n.toLocaleString('es-MX', { style: 'currency', currency: CAT.moneda || 'MXN' });
    }
    return null;
  }
  function precioHtml(p) {
    const t = precioTexto(p);
    return t ? `<strong>${esc(t)}</strong>` : '<strong class="sin-precio">Bajo cotización</strong>';
  }
  function primeraFrase(t) {
    const m = String(t || '').match(/^.+?[.!?](?=\s|$)/);
    return m ? m[0] : String(t || '');
  }

  const lineas = [{ id: TODOS, etiqueta: 'Todos' }, ...CAT.categorias.map(c => ({ id: c.id, etiqueta: c.etiqueta || c.nombre }))];
  const botonFlecha = dir =>
    `<button type="button" class="flecha" data-pag="${dir}" aria-label="${dir === 'ant' ? 'Página anterior' : 'Página siguiente'}">${icono('flecha')}</button>`;

  raiz.innerHTML = `
    <div class="cat" data-paginas="1">
      <div class="cat__barra">
        <div class="cat__tabs" role="tablist" aria-label="Líneas de producto">
          ${lineas.map(l =>
            `<button type="button" class="cat__tab" role="tab" id="tab-${esc(l.id)}" data-linea="${esc(l.id)}" aria-selected="false" aria-controls="catalogo-panel" tabindex="-1">${esc(l.etiqueta)}</button>`
          ).join('')}
        </div>
        <div class="cat__flechas">${botonFlecha('ant')}${botonFlecha('sig')}</div>
      </div>
      <div class="pgrid" id="catalogo-panel" role="tabpanel"></div>
      <div class="cat__pie">${botonFlecha('ant')}<div class="cat__dots"></div>${botonFlecha('sig')}</div>
      <p class="sr-only" id="cat-estado" role="status"></p>
    </div>`;

  const caja = $('.cat', raiz);
  const panel = $('#catalogo-panel', raiz);
  const puntos = $('.cat__dots', raiz);
  const anuncio = $('#cat-estado', raiz);

  // Productos por pantalla: 6 en laptop (3 × 2), 4 en tableta (2 × 2) y 3 en teléfono (1 columna)
  const mqGrande = matchMedia('(min-width: 1000px)');
  const mqMedia = matchMedia('(min-width: 640px)');
  const porPagina = () => (mqGrande.matches ? 6 : mqMedia.matches ? 4 : 3);
  const estado = { linea: TODOS, pagina: 0, n: porPagina() };
  const productosDe = id => (id === TODOS ? CAT.categorias.flatMap(c => c.productos) : (CAT.categorias.find(c => c.id === id)?.productos || []));

  function tarjetaHtml(p) {
    const foto = p.fotos[0];
    const precio = precioTexto(p);
    return `
      <article class="pcard">
        <div class="pcard__img"><img src="${esc(foto.src)}" alt="${esc(foto.alt || p.nombre)}" data-ajuste="${esc(foto.ajuste || 'cover')}" loading="lazy" decoding="async"></div>
        <div class="pcard__txt">
          <h3 class="pcard__nombre">${esc(p.nombre)}</h3>
          <p class="pcard__desc">${esc(sinCortes(p.resumen || primeraFrase(p.descripcion)))}</p>
        </div>
        <div class="pcard__pie">
          <span class="pcard__precio${precio ? '' : ' pcard__precio--sin'}">${esc(precio || 'Bajo cotización')}</span>
          <button type="button" class="pcard__ver" data-ver="${esc(p.id)}" aria-label="Ver los datos de ${esc(p.nombre)}">Ver${icono('flecha')}</button>
        </div>
      </article>`;
  }

  function pintarCatalogo(animar) {
    const foco = document.activeElement;
    const lista = productosDe(estado.linea);
    const paginas = Math.max(1, Math.ceil(lista.length / estado.n));
    estado.pagina = Math.min(Math.max(estado.pagina, 0), paginas - 1);
    const desde = estado.pagina * estado.n;
    const trozo = lista.slice(desde, desde + estado.n);

    panel.innerHTML = trozo.length
      ? trozo.map(tarjetaHtml).join('')
      : '<p class="cat__vacio">Pronto habrá productos en esta línea.</p>';
    caja.dataset.paginas = String(paginas);

    $$('.cat__tab', caja).forEach(t => {
      const activa = t.dataset.linea === estado.linea;
      t.setAttribute('aria-selected', String(activa));
      t.tabIndex = activa ? 0 : -1;
    });
    panel.setAttribute('aria-labelledby', `tab-${estado.linea}`);
    $$('[data-pag="ant"]', caja).forEach(b => { b.disabled = estado.pagina === 0; });
    $$('[data-pag="sig"]', caja).forEach(b => { b.disabled = estado.pagina >= paginas - 1; });
    puntos.innerHTML = paginas > 1
      ? Array.from({ length: paginas }, (_, i) =>
          `<button type="button" class="dot" data-pagina="${i}" aria-label="Página ${i + 1} de ${paginas}" aria-current="${i === estado.pagina}"></button>`
        ).join('')
      : '';

    if (animar) {
      const etiqueta = lineas.find(l => l.id === estado.linea).etiqueta;
      anuncio.textContent = `${etiqueta}: ${trozo.length} de ${lista.length} productos. Página ${estado.pagina + 1} de ${paginas}.`;
      if (!REDUCED) { panel.classList.remove('cambia'); void panel.offsetWidth; panel.classList.add('cambia'); }
    }
    // Si el control que tenía el foco se deshabilitó o se volvió a dibujar, el foco pasa a un punto vigente
    if (foco && (foco.disabled || (foco.classList && foco.classList.contains('dot')))) {
      const nuevo = $('.dot[aria-current="true"]', caja) || $('.cat__tab[aria-selected="true"]', caja);
      if (nuevo) nuevo.focus({ preventScroll: true });
    }
  }

  function alCambiarTamano() {
    const n = porPagina();
    if (n === estado.n) return;
    const primero = estado.pagina * estado.n;      // se conserva el primer producto visible
    estado.n = n;
    estado.pagina = Math.floor(primero / n);
    pintarCatalogo(false);
  }
  mqGrande.addEventListener('change', alCambiarTamano);
  mqMedia.addEventListener('change', alCambiarTamano);

  raiz.addEventListener('click', e => {
    const tab = e.target.closest('.cat__tab');
    if (tab) { estado.linea = tab.dataset.linea; estado.pagina = 0; return pintarCatalogo(true); }
    const flecha = e.target.closest('[data-pag]');
    if (flecha) {
      if (flecha.disabled) return;
      estado.pagina += flecha.dataset.pag === 'sig' ? 1 : -1;
      return pintarCatalogo(true);
    }
    const punto = e.target.closest('.dot');
    if (punto) { estado.pagina = Number(punto.dataset.pagina); return pintarCatalogo(true); }
    const ver = e.target.closest('[data-ver]');
    if (ver) abrirProducto(ver.dataset.ver);
  });
  // Flechas del teclado entre pestañas (patrón de pestañas)
  raiz.addEventListener('keydown', e => {
    const tab = e.target.closest('.cat__tab');
    if (!tab || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
    const tabs = $$('.cat__tab', caja);
    let i = tabs.indexOf(tab);
    if (e.key === 'ArrowRight') i = (i + 1) % tabs.length;
    if (e.key === 'ArrowLeft') i = (i - 1 + tabs.length) % tabs.length;
    if (e.key === 'Home') i = 0;
    if (e.key === 'End') i = tabs.length - 1;
    e.preventDefault();
    estado.linea = tabs[i].dataset.linea; estado.pagina = 0;
    pintarCatalogo(true);
    tabs[i].focus();
  });

  /* ---------- Animación 3D y visor de pantalla completa ---------- */
  function urlAnimacion(p, completa) {
    const a = p.animacion;
    const q = new URLSearchParams({ tema: 'papel', ...a.parametros });
    if (completa) q.set('solo', '1');
    else { q.set('embed', '1'); q.set('etiquetas', '0'); }
    return `${a.archivo}?${q.toString()}`;
  }

  const modal = $('#producto');
  const visor = $('#visor');
  const visorFrame = $('#visor-frame');
  const bloquearScroll = () => document.documentElement.classList.toggle('sin-scroll', modal.open || visor.open);

  function abrirVisor(p) {
    $('#visor-titulo').textContent = p.nombre;
    visorFrame.title = `${p.nombre}: animación 3D en pantalla completa`;
    visorFrame.src = urlAnimacion(p, true);
    visor.showModal();
    bloquearScroll();
  }
  visor.addEventListener('close', () => {
    visorFrame.removeAttribute('src');
    bloquearScroll();
  });
  $('#visor-cerrar').addEventListener('click', () => visor.close());
  visor.addEventListener('click', e => { if (e.target === visor) visor.close(); });

  /* ---------- Ventana del producto ---------- */
  let productoAbierto = null;

  function modalHtml(p) {
    const linea = LINEA_DE.get(p.id);
    const foto = p.fotos[0];
    const tiene3d = Boolean(p.animacion);
    const specs = p.caracteristicas.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(sinCortes(v))}</dd></div>`).join('');
    const comps = (p.componentes && p.componentes.length)
      ? `<h3 class="sub">Componentes</h3>
         <ul class="comps">${p.componentes.map(c =>
           `<li><strong>${esc(c.nombre)}</strong>${c.opcional ? '<span class="tag-opc">Opcional</span>' : ''}${c.detalle ? `<p>${esc(c.detalle)}</p>` : ''}</li>`
         ).join('')}</ul>`
      : '';
    const miniaturas = p.fotos.length > 1
      ? `<div class="thumbs"${tiene3d ? ' hidden' : ''}>${p.fotos.map((f, i) =>
          `<button type="button" data-foto="${i}" aria-label="Ver foto ${i + 1} de ${p.fotos.length}" aria-current="${i === 0}"><img src="${esc(f.src)}" alt=""></button>`
        ).join('')}</div>`
      : '';
    const vistas = tiene3d
      ? `<div class="seg" role="group" aria-label="Tipo de vista">
           <button type="button" data-vista="3d" aria-pressed="true">${icono('cubo')}Animación 3D</button>
           <button type="button" data-vista="foto" aria-pressed="false">${icono('foto')}Foto original</button>
         </div>
         <button type="button" class="chip chip--ink" data-accion="pantalla">${icono('pantalla')}<span>Pantalla completa</span></button>`
      : '';
    const animacion = tiene3d
      ? `<div class="modal__anim">
           <iframe src="${esc(urlAnimacion(p, false))}" title="${esc(p.nombre)}: animación 3D" allow="fullscreen"></iframe>
           <p class="modal__carga">Cargando animación 3D…<small>Requiere conexión a internet</small></p>
         </div>`
      : '';
    return `
      <button type="button" class="modal__cerrar" data-accion="cerrar" aria-label="Cerrar">${icono('cerrar')}</button>
      <div class="modal__media">
        <div class="modal__vista" style="--ratio:${esc(p.aspecto || '4/3')}">
          <div class="modal__foto"${tiene3d ? ' hidden' : ''}><img src="${esc(foto.src)}" alt="${esc(foto.alt || p.nombre)}" data-ajuste="${esc(foto.ajuste || 'cover')}"></div>
          ${animacion}
        </div>
        <div class="modal__barra">${vistas}${miniaturas}</div>
      </div>
      <div class="modal__info">
        <p class="modal__cat">${esc(linea.etiqueta || linea.nombre)}</p>
        <h2 class="modal__nombre" id="producto-nombre">${esc(p.nombre)}</h2>
        <p class="modal__desc">${esc(p.descripcion)}</p>
        <div class="modal__oferta">
          <div class="modal__precio"><span>Precio</span>${precioHtml(p)}</div>
          <a class="btn btn--primary" data-wa="Hola, quiero cotizar: ${esc(p.nombre)}." href="https://wa.me/${SITIO.whatsapp.numero}">${icono('wa')}Cotizar por WhatsApp</a>
        </div>
        <h3 class="sub">Características</h3>
        <dl class="specs">${specs}</dl>
        ${comps}
      </div>`;
  }

  function mostrarVista(vista) {
    const es3d = vista === '3d';
    const foto = $('.modal__foto', modal), anim = $('.modal__anim', modal);
    if (foto) foto.hidden = es3d;
    if (anim) anim.hidden = !es3d;
    $$('[data-vista]', modal).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.vista === vista)));
    const pantalla = $('[data-accion="pantalla"]', modal);
    if (pantalla) pantalla.hidden = !es3d;
    const mini = $('.thumbs', modal);
    if (mini) mini.hidden = es3d;
  }

  function elegirFoto(boton) {
    const f = productoAbierto.fotos[Number(boton.dataset.foto)];
    const img = $('.modal__foto img', modal);
    img.src = f.src; img.alt = f.alt || productoAbierto.nombre; img.dataset.ajuste = f.ajuste || 'cover';
    $$('.thumbs button', modal).forEach(b => b.setAttribute('aria-current', String(b === boton)));
  }

  function abrirProducto(id) {
    const p = PRODUCTOS.get(id);
    if (!p || modal.open) return;
    productoAbierto = p;
    modal.innerHTML = modalHtml(p);
    conectarWa(modal);
    const marco = $('.modal__anim iframe', modal);
    if (marco) marco.addEventListener('load', () => { const c = $('.modal__carga', modal); if (c) c.remove(); }, { once: true });
    $('.modal__info', modal).scrollTop = 0;
    modal.scrollTop = 0;
    modal.showModal();
    bloquearScroll();
    try { history.replaceState(null, '', `#ficha-${id}`); } catch (_) { /* sin historial: no pasa nada */ }
  }

  modal.addEventListener('click', e => {
    if (e.target === modal) return modal.close();            // clic en el fondo oscuro
    const a = e.target.closest('[data-accion], [data-vista], .thumbs button');
    if (!a) return;
    if (a.dataset.accion === 'cerrar') return modal.close();
    if (a.dataset.accion === 'pantalla') return abrirVisor(productoAbierto);
    if (a.dataset.vista) return mostrarVista(a.dataset.vista);
    if (a.matches('.thumbs button')) return elegirFoto(a);
  });
  modal.addEventListener('close', () => {
    if (modal.open) return;                                  // se volvió a abrir antes de que llegara este aviso
    modal.innerHTML = '';                                    // se destruye la animación 3D al cerrar
    productoAbierto = null;
    bloquearScroll();
    if (/^#ficha-/.test(location.hash)) {
      try { history.replaceState(null, '', '#catalogo'); } catch (_) { /* sin historial */ }
    }
  });

  pintarCatalogo(false);

  // Si se llega con un enlace a un producto (#ficha-id), se abre su línea, su página y su ventana
  function abrirDesdeHash() {
    const m = location.hash.match(/^#ficha-(.+)$/);
    if (!m || !PRODUCTOS.has(m[1]) || modal.open) return;
    const p = PRODUCTOS.get(m[1]);
    estado.linea = LINEA_DE.get(p.id).id;
    estado.pagina = Math.floor(productosDe(estado.linea).indexOf(p) / estado.n);
    pintarCatalogo(false);
    $('#catalogo').scrollIntoView();
    abrirProducto(p.id);
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
    const anchoTexto = t => 8.6 * t.length + 6;                // ancho aproximado de la etiqueta (Inter 15 px)
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
