# NAMI — Diseño + Web

Landing estática independiente, basada en los assets y el brief originales. El sitio está en la carpeta extraída: no necesita instalar paquetes ni compilar.

## Abrir y editar

Abrí `index.html` directamente en tu navegador o serví la carpeta extraída desde cualquier servidor estático. La fuente Sora/Inter se solicita a Google Fonts; si estás sin conexión se usa la alternativa local sans-serif.

- `index.html`: contenido, secciones, enlaces y composiciones de los tres conceptos.
- `styles.css`: identidad, responsive y variantes de movimiento reducido.
- `contact-config.js`: números públicos y destinos de WhatsApp.
- `app.js`: scrollytelling, proceso, navegación, ventanas de conceptos, cursor y símbolo + con proyección 3D en canvas.
- `assets/`: SVG originales sin modificar, wordmark convertido a trazos compatibles y fotografías originales de Francisco y Santiago.

## Movimiento

El scroll es nativo: no hay captura de rueda ni scroll forzado. El hero se mantiene brevemente en desktop; el manifiesto desarrolla tres ideas y el proceso acompaña sus cuatro pasos. En móvil el proceso es vertical y el hero es estático. La preferencia del sistema `prefers-reduced-motion` convierte el manifiesto en contenido continuo y elimina los desplazamientos.

El canvas solo dibuja cuando cambian el scroll, el tamaño o la posición del cursor, y cuando el objeto está cerca de la pantalla. No usa Three.js, video ni un bucle permanente.

## Proyectos

Los tres elementos son **conceptos visuales**, no trabajos de clientes. Sus vistas se editan en `index.html` y los textos del diálogo en el array `projects` de `app.js`. Hay campos preparados para imagen, tecnologías, URL y año; cuando se incorporen casos reales, conectar esos campos con la vista y reemplazar los avisos de concepto. Actualmente no se presentan métricas, clientes ni enlaces de proyecto ficticios.

## Contacto

- Email: visual.nami@gmail.com
- Instagram: @nami.tandil
- Santiago: +54 9 249 400-1904
- Francisco: +54 9 249 437-0109

El botón flotante permanece disponible durante el recorrido y se oculta al llegar al contacto o al footer, al abrir el menú móvil o un proyecto. Abre una conversación con Santiago. En la sección de contacto se puede elegir entre Santiago y Francisco. Ambos enlaces también funcionan sin JavaScript.

Editá `contact-config.js` para configurar los contactos:

- `name`: nombre que se muestra cuando hay más de un contacto.
- `phoneDisplay`: número visible. Si está vacío, esa persona no aparece.
- `whatsappE164`: número internacional confirmado, solo dígitos, sin `+` ni espacios. Cuando se completa, se habilita el enlace directo a WhatsApp.
- El primer contacto es el destino del botón flotante. Santiago es el primer contacto y Francisco el segundo. Los números se normalizaron con el 9 que WhatsApp requiere entre el código de país 54 y el código de área argentino.

La copia automática necesita permisos del navegador. Si no está disponible al abrir `index.html` directamente, se muestra el número para seleccionarlo y copiarlo manualmente. Los números de este archivo son públicos: no colocar credenciales ni información privada.

## Equipo

Se conservan las fotografías originales de Francisco y Santiago. La foto de Santiago usa sus dimensiones reales y encuadre superior. El footer incorpora el wordmark original convertido de glifos SVG a trazos, enlaces de contacto, hora de Tandil y una animación de entrada que respeta movimiento reducido.

## Validación

Se verifica sintaxis JavaScript, estructura HTML, destinos internos y archivos locales. Esta entrega no incluye una prueba automatizada en navegador ni una auditoría formal de accesibilidad.

## Cambios de esta revisión

- Mensaje comercial desde el inicio: sitios web, sistemas e identidades para empresas, profesionales y emprendimientos.
- Sección «¿Qué podemos ayudarte a resolver?» con seis necesidades concretas y un llamado a conversar.
- Presentación de Santiago con mayor énfasis en diseño gráfico y UX/UI.
- Contacto más orientado a necesidades, botón flotante discreto y configuración para dos contactos.
- Título, descripción y metadatos sociales centrados en los servicios y Tandil. No se inventaron dominio definitivo, testimonios, clientes ni resultados.
- Se mantienen las fotos, logos, conceptos, footer y recorrido por scroll. En pantallas de escritorio de poca altura, el hero fluye normalmente para mostrar todo el texto.

Pendientes de contenido: casos reales de portfolio y las fotos que cambiarán manualmente. Esta revisión se entrega como archivos y no modifica la publicación existente.
