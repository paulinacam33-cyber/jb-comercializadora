/*
  DATOS DEL SITIO - Comercializadora JB
  --------------------------------------------------------------------------
  Aquí están el número de WhatsApp, los mensajes rápidos y las zonas del radar.
  Las coordenadas de las zonas son aproximadas y solo sirven para colocar cada
  punto en el radar (dirección y distancia desde Toluca); no son una ubicación exacta.
*/
window.JB_SITIO = {
  empresa: 'Comercializadora JB',

  whatsapp: {
    numero: '527291002776',          /* con lada de México (52), sin signos */
    visible: '+52 729 100 2776'
  },

  /* Botón de mensajes rápidos de la sección Contacto */
  mensajesRapidos: [
    { etiqueta: 'Conocer el catálogo de productos', mensaje: 'Hola, me interesa conocer el catálogo de productos.' },
    { etiqueta: 'Pedir una cotización',             mensaje: 'Hola, quiero una cotización.' },
    { etiqueta: 'Dar seguimiento a un proyecto',    mensaje: 'Hola, quiero dar seguimiento a un proyecto.' }
  ],

  /* Centro del radar */
  centro: { nombre: 'Toluca', estado: 'Estado de México', lat: 19.2926, lon: -99.6557 },

  /* Zonas que se atienden. "etc." del plan original: la página invita a consultar otras zonas. */
  zonas: [
    { nombre: 'Metepec',                 estado: 'Estado de México', lat: 19.2514, lon:  -99.6049 },
    { nombre: 'Zinacantepec',            estado: 'Estado de México', lat: 19.2833, lon:  -99.7333 },
    { nombre: 'Almoloya de Juárez',      estado: 'Estado de México', lat: 19.3697, lon:  -99.7603 },
    { nombre: 'Calimaya',                estado: 'Estado de México', lat: 19.1667, lon:  -99.6167 },
    { nombre: 'Tenango del Valle',       estado: 'Estado de México', lat: 19.1000, lon:  -99.5967 },
    { nombre: 'Santiago Tianguistenco',  estado: 'Estado de México', lat: 19.1792, lon:  -99.4694 },
    { nombre: 'Tenancingo',              estado: 'Estado de México', lat: 18.9667, lon:  -99.5917 },
    { nombre: 'Villa Victoria',          estado: 'Estado de México', lat: 19.4333, lon: -100.0000 },
    { nombre: 'Valle de Bravo',          estado: 'Estado de México', lat: 19.1953, lon: -100.1317 },
    { nombre: 'Zitácuaro',               estado: 'Michoacán',        lat: 19.4361, lon: -100.3578 },
    { nombre: 'Maravatío',               estado: 'Michoacán',        lat: 19.8942, lon: -100.4425 }
  ]
};
