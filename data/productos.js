/*
  CATÁLOGO DE PRODUCTOS - Comercializadora JB
  --------------------------------------------------------------------------
  Este archivo es la única fuente de los productos de la página. Para cambiar
  un texto, agregar un producto o poner un precio, se edita aquí; no hace falta
  tocar el resto del sitio.

  Cada producto tiene estos campos:
    id              Identificador corto, sin espacios ni acentos (no se repite).
    nombre          Nombre que se muestra en la ficha.
    precio          Número en pesos mexicanos (por ejemplo 125000). Mientras esté
                    vacío ("") la ficha dice "Bajo cotización".
    fotos           Lista de fotos: { src, alt, ajuste }.
                    ajuste "cover"   = la foto llena el marco (fotos de ambiente).
                    ajuste "contain" = la foto se ve completa sobre fondo claro
                                       (fotos de estudio con fondo blanco).
    aspecto         Proporción del marco de la foto, por ejemplo "4/3" o "4/5".
    descripcion     Texto breve.
    caracteristicas Lista de pares [nombre, valor].
    componentes     Lista de { nombre, detalle, opcional }. Si no hay, va [].
    animacion       Animación 3D de la carpeta modelos-3d: { archivo, parametros, etiqueta }.

  Para agregar un producto, se copia uno existente dentro de su categoría y se
  cambian los datos. Para agregar una categoría nueva (por ejemplo, equipos de
  transporte de materiales), se agrega otro bloque en "categorias".
*/

/* Componentes que comparten las dos básculas camioneras */
const COMPONENTES_CAMIONERA = [
  { nombre: 'Celdas de carga',
    detalle: 'Sensores de acero (de compresión, tipo columna) que convierten el peso en una señal eléctrica. Va una en cada apoyo de la plataforma: de 6 a 10, según el largo.' },
  { nombre: 'Caja suma',
    detalle: 'Reúne los cables de todas las celdas, iguala sus señales y las manda al indicador por un solo cable.' },
  { nombre: 'Indicador camionero',
    detalle: 'Muestra el peso en tiempo real, avisa cuando la lectura está estable y manda cada pesada a la computadora.' },
  { nombre: 'No break (UPS)', opcional: true,
    detalle: 'Mantiene encendidos el indicador y la laptop durante un apagón o una variación de voltaje, para no perder la pesada en curso.' },
  { nombre: 'Laptop con software', opcional: true,
    detalle: 'Registra cada pesada, genera la boleta y guarda el historial de entradas y salidas.' }
];

/* Componentes que comparten las dos básculas ganaderas */
const COMPONENTES_GANADERA = [
  { nombre: 'Celdas de carga niqueladas',
    detalle: 'Cuatro por báscula, una en cada esquina de la plataforma. Convierten el peso en una señal eléctrica.' },
  { nombre: 'Caja suma hermética',
    detalle: 'Junta las señales de las 4 celdas y las manda al indicador por un solo cable. Protege contra el agua y el polvo del corral.' },
  { nombre: 'Indicador digital',
    detalle: 'Muestra el peso en kilos con divisiones de 500 g y avisa cuando la lectura está estable, aunque el animal se mueva un poco.' }
];

const PINTURA_CONTENEDOR = {
  nombre: 'Pintura de logotipos y murales', opcional: true,
  detalle: 'Contacto con un proveedor que pinta logotipos y murales en el contenedor.'
};

window.JB_CATALOGO = {
  moneda: 'MXN',
  categorias: [

    /* ------------------------------------------------------------------ */
    {
      id: 'pesaje',
      nombre: 'Sistemas de pesaje',
      resumen: 'Básculas camioneras y ganaderas',
      productos: [
        {
          id: 'camionera-fosa',
          nombre: 'Báscula camionera de fosa',
          precio: '',
          fotos: [
            { src: 'imagenes/camionera-fosa.webp', ajuste: 'cover',
              alt: 'Báscula camionera de fosa: plataforma de acero azul al nivel del piso, con franja de seguridad amarilla y negra y un montacargas al fondo' }
          ],
          aspecto: '3/2',
          descripcion: 'Plataforma de acero que se instala dentro de una fosa de concreto, con la cubierta al nivel del piso. No necesita rampas: el camión entra en línea recta por cualquiera de los dos extremos.',
          caracteristicas: [
            ['Capacidades', '40, 60, 80, 100 y 120 t'],
            ['Largo', '12 m (40 t), 15 m (60 t), 18 m (80 t), 21 m (100 t) y 24 m (120 t)'],
            ['Ancho', '3.00 m'],
            ['Instalación', 'En fosa de concreto, de unos 0.81 m de profundidad'],
            ['Cubierta', 'Al nivel del piso, sin rampas'],
            ['Acceso', 'Por cualquiera de los dos extremos'],
            ['Construcción', 'Módulos de acero con placa antiderrapante, sobre vigas tipo I']
          ],
          componentes: COMPONENTES_CAMIONERA,
          animacion: { archivo: 'modelos-3d/index.html', parametros: { modo: 'conjunto', tipo: 'fosa', cap: 80 }, etiqueta: 'Ver animación 3D' }
        },
        {
          id: 'camionera-piso',
          nombre: 'Báscula camionera de piso',
          precio: '',
          fotos: [
            { src: 'imagenes/camionera-piso.jpg', ajuste: 'cover',
              alt: 'Báscula camionera de piso: plataforma azul con rampa de concreto y postes amarillos, junto a un silo' }
          ],
          aspecto: '3/2',
          descripcion: 'Se monta sobre una cimentación al nivel del suelo, con rampas de acceso en ambos extremos. Su instalación es más rápida y deja las celdas a la vista para revisarlas.',
          caracteristicas: [
            ['Capacidades', '40, 60, 80, 100 y 120 t'],
            ['Largo', '12 m (40 t), 15 m (60 t), 18 m (80 t), 21 m (100 t) y 24 m (120 t)'],
            ['Largo con rampas', '19 m (40 t), 22 m (60 t), 25 m (80 t), 28 m (100 t) y 31 m (120 t)'],
            ['Ancho', '3.00 m'],
            ['Instalación', 'Sobre cimentación al nivel del suelo'],
            ['Rampas', 'De acceso en ambos extremos, de 3.50 m cada una'],
            ['Altura de la plataforma', '0.57 m'],
            ['Construcción', 'Módulos de acero con placa antiderrapante, sobre vigas tipo I']
          ],
          componentes: COMPONENTES_CAMIONERA,
          animacion: { archivo: 'modelos-3d/index.html', parametros: { modo: 'conjunto', tipo: 'piso', cap: 80 }, etiqueta: 'Ver animación 3D' }
        },
        {
          id: 'ganadera-jaula',
          nombre: 'Báscula ganadera tipo jaula',
          precio: '',
          fotos: [
            { src: 'imagenes/ganadera-jaula.jpg', ajuste: 'contain',
              alt: 'Báscula ganadera tipo jaula: redilas azules de tubo, piso de madera, indicador digital y caja suma' }
          ],
          aspecto: '4/3',
          descripcion: 'La misma plataforma con redilas de tubo cédula 30 y puertas corredizas: el animal entra, queda encerrado mientras se pesa y sale por el otro lado.',
          caracteristicas: [
            ['Capacidades', '1,500 kg y 2,000 kg'],
            ['División', '500 g'],
            ['Estructura', 'Acero pintado de azul, con recubrimiento contra el agua y la corrosión causada por los animales'],
            ['Piso', 'Madera'],
            ['Redilas', 'Tubo cédula 30'],
            ['Puertas', 'Corredizas, una en cada extremo'],
            ['Plataforma', '2.30 × 0.90 m (1,500 kg) y 2.50 × 1.00 m (2,000 kg)'],
            ['Altura de la plataforma', '0.20 m'],
            ['Altura de las redilas', '1.88 m sobre el piso'],
            ['Rampas', 'Cortas, de 0.60 m, en ambos extremos']
          ],
          componentes: COMPONENTES_GANADERA,
          animacion: { archivo: 'modelos-3d/ganaderas.html', parametros: { modo: 'conjunto', tipo: 'jaula', cap: 1500 }, etiqueta: 'Ver animación 3D' }
        },
        {
          id: 'ganadera-plataforma',
          nombre: 'Báscula ganadera tipo plataforma',
          precio: '',
          fotos: [
            { src: 'imagenes/ganadera-plataforma.jpg', ajuste: 'contain',
              alt: 'Báscula ganadera tipo plataforma: piso de madera con marco azul e indicador digital conectado por cable' }
          ],
          aspecto: '4/3',
          descripcion: 'Estructura de acero pintado de azul, con recubrimiento contra el agua y la corrosión, y piso de madera. Se apoya en 4 celdas de carga niqueladas y lleva rampas cortas para que el animal suba sin tropezar.',
          caracteristicas: [
            ['Capacidades', '1,500 kg y 2,000 kg'],
            ['División', '500 g'],
            ['Estructura', 'Acero pintado de azul, con recubrimiento contra el agua y la corrosión causada por los animales'],
            ['Piso', 'Madera'],
            ['Medidas', '2.30 × 0.90 m (1,500 kg) y 2.50 × 1.00 m (2,000 kg)'],
            ['Altura', '0.20 m'],
            ['Rampas', 'Cortas, de 0.60 m, en ambos extremos']
          ],
          componentes: COMPONENTES_GANADERA,
          animacion: { archivo: 'modelos-3d/ganaderas.html', parametros: { modo: 'conjunto', tipo: 'plataforma', cap: 1500 }, etiqueta: 'Ver animación 3D' }
        }
      ]
    },

    /* ------------------------------------------------------------------ */
    {
      id: 'almacenamiento',
      nombre: 'Equipos para almacenamiento y transporte de materiales',
      resumen: 'Silos para forraje',
      productos: [
        {
          id: 'silo-forraje',
          nombre: 'Silo para forraje',
          precio: '',
          fotos: [
            { src: 'imagenes/silo.jpg', ajuste: 'contain',
              alt: 'Silo galvanizado con tolva cónica sobre patas con contravientos' }
          ],
          aspecto: '1/1',
          descripcion: 'Guarda el forraje protegido del agua y la intemperie. Se llena por arriba y descarga por la tolva inferior directo a la boca de ensaque.',
          caracteristicas: [
            ['Uso', 'Almacenamiento de forraje'],
            ['Capacidades', 'De 1 a 20 t'],
            ['Forma', 'Cuerpo cilíndrico con techo cónico y tolva inferior, sobre 4 patas con contravientos'],
            ['Medidas del modelo de 20 t', 'Diámetro de 3.00 m y altura total de 8.10 m'],
            ['Inspección', 'Puerta lateral en el cuerpo y puerta en el techo'],
            ['Llenado', 'Por arriba, con tubo exterior'],
            ['Descarga', 'Boca de ensaque con compuerta, en la parte baja de la tolva'],
            ['Pesaje', 'Opcional']
          ],
          componentes: [
            { nombre: 'Puerta de inspección',
              detalle: 'Permite revisar el nivel y el estado del forraje, y entrar a limpiar el silo cuando hace falta. Va en el cuerpo y en el techo, con bisagras, manija y marco.' },
            { nombre: 'Boca de ensaque',
              detalle: 'Salida en la parte baja de la tolva para llenar costales directo del silo. La compuerta abre y corta el paso del forraje. Incluye tubo de descarga y abrazadera del costal.' },
            { nombre: 'Sistema de pesaje', opcional: true,
              detalle: 'Una celda de carga bajo cada pata, una caja suma y un indicador. Así se sabe cuántos kilos de forraje hay dentro y cuánto sale en cada costal.' }
          ],
          animacion: { archivo: 'modelos-3d/silos.html', parametros: { modo: 'conjunto', tipo: 'con' }, etiqueta: 'Ver animación 3D' }
        }
      ]
    },

    /* ------------------------------------------------------------------ */
    {
      id: 'contenedores',
      nombre: 'Contenedores',
      resumen: 'Contenedores de 20 y 40 pies, y locales hechos con ellos',
      productos: [
        {
          id: 'contenedor-20',
          nombre: 'Contenedor de 20 pies',
          precio: '',
          fotos: [
            { src: 'imagenes/contenedor-20.jpg', ajuste: 'cover',
              alt: 'Contenedor gris de 20 pies visto de frente, con puertas dobles y barras de cierre' }
          ],
          aspecto: '4/5',
          descripcion: 'Contenedor estándar con piso de madera y puertas dobles. Es la base para un local pequeño.',
          caracteristicas: [
            ['Largo', '6.06 m'],
            ['Ancho', '2.44 m'],
            ['Alto', '2.59 m (altura estándar)'],
            ['Piso', 'Madera'],
            ['Puertas', 'Dobles'],
            ['Paredes', 'De lámina corrugada'],
            ['Colores', 'Gris, verde, negro y rojo']
          ],
          componentes: [PINTURA_CONTENEDOR],
          animacion: { archivo: 'modelos-3d/contenedores.html', parametros: { modo: 'catalogo', item: 'c20' }, etiqueta: 'Ver modelo 3D' }
        },
        {
          id: 'contenedor-40',
          nombre: 'Contenedor de 40 pies',
          precio: '',
          fotos: [
            { src: 'imagenes/contenedor-40.jpg', ajuste: 'cover',
              alt: 'Contenedor verde de 40 pies visto de frente, con puertas dobles y barras de cierre' }
          ],
          aspecto: '4/5',
          descripcion: 'El doble de largo que el de 20 pies. Da espacio para un local más amplio o para dividirlo en dos.',
          caracteristicas: [
            ['Largo', '12.19 m'],
            ['Ancho', '2.44 m'],
            ['Alto', '2.59 m (altura estándar)'],
            ['Puertas', 'Dobles'],
            ['Paredes', 'De lámina corrugada'],
            ['Colores', 'Gris, verde, negro y rojo']
          ],
          componentes: [PINTURA_CONTENEDOR],
          animacion: { archivo: 'modelos-3d/contenedores.html', parametros: { modo: 'catalogo', item: 'c40' }, etiqueta: 'Ver modelo 3D' }
        },
        {
          id: 'local-ejemplo',
          nombre: 'Local de ejemplo',
          precio: '',
          fotos: [
            { src: 'imagenes/local-dos-niveles.jpg', ajuste: 'cover',
              alt: 'Local hecho con contenedores negros, con cafetería, tienda, terraza de concreto y un segundo nivel con balcón de cristal' },
            { src: 'imagenes/local-un-nivel.jpg', ajuste: 'cover',
              alt: 'Local hecho con contenedores negros en un nivel, con toldos abatibles, barra exterior y terraza de concreto' }
          ],
          aspecto: '16/9',
          descripcion: 'Así puede quedar un contenedor convertido en local: con toldo abatible, barra exterior y terraza. El interior se adapta al giro del negocio como servicio aparte y opcional. Los contenedores se venden por separado; unirlos es opcional.',
          caracteristicas: [
            ['Base', 'Contenedor de 20 o de 40 pies'],
            ['Venta', 'Los contenedores se venden por separado'],
            ['Fachada', 'Lámina corrugada del propio contenedor (opción más económica)'],
            ['Toldo', 'Abatible, con puntales'],
            ['Barra', 'Exterior, con ménsulas'],
            ['Terraza', 'Plataforma de concreto con escalones (opción más económica)']
          ],
          componentes: [
            { nombre: 'Unión de contenedores', opcional: true,
              detalle: 'Varios contenedores en un nivel, o con un segundo nivel.' },
            { nombre: 'Fachada de listones de madera', opcional: true,
              detalle: 'En lugar de la lámina corrugada del contenedor.' },
            { nombre: 'Terraza de madera con marco de acero', opcional: true,
              detalle: 'En lugar de la plataforma de concreto.' },
            { nombre: 'Interior', opcional: true,
              detalle: 'JB puede acondicionarlo como servicio aparte, según el giro del negocio: por ejemplo, cafetería, tienda o cocina con campana.' },
            PINTURA_CONTENEDOR
          ],
          animacion: { archivo: 'modelos-3d/contenedores.html', parametros: { modo: 'conjunto', size: 20 }, etiqueta: 'Ver animación 3D' }
        }
      ]
    }
  ]
};
