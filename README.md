# Guatemala 2027

Página estática con la ruta del viaje (12 días desde el 11 de enero de 2027, saliendo de Cali; la fecha de inicio se cambia en la página o con `?inicio=AAAA-MM-DD` en la URL), mapa, hoteles por nivel de precio, presupuesto, enlaces de reserva y alertas de seguridad. No necesita compilar nada.

## Estructura

```
index.html        Página principal
css/styles.css    Estilos
js/app.js         Lógica (pestañas, mapa, presupuesto)
data/data.json    Todo el contenido: ruta, hoteles, precios, enlaces, alertas
```

## Probar en local

```
python3 -m http.server 8000
```

Abre http://localhost:8000. Con doble clic en `index.html` no funciona, porque el navegador bloquea la lectura de `data/data.json`.

## Publicar

- **GitHub Pages:** sube el repositorio, entra a Settings, luego Pages, y elige la rama principal y la carpeta raíz.
- **Tu servidor:** copia la carpeta completa a cualquier servidor web estático.

## Editar contenido

Todo está en `data/data.json`: hoteles (`hoteles`), costos fijos (`fijos`), alertas (`alertas`), puntos del mapa (`lugares` y `trazo`) y enlaces (`reservas`). La tasa de cambio está en `fx` y también se puede cambiar en la página.

## Lo que conviene saber

- Las fotos de destinos se cargan en vivo desde Wikipedia. Las de hoteles se buscan en Wikimedia Commons y solo aparecen si hay una imagen con el nombre del hotel; si no, usa el botón Fotos. Sin conexión se ve un degradado.
- Cada precio del presupuesto y de los hoteles lleva su fuente y fecha en `data/data.json` (campos `s` y `presupuesto`). Actualízalos antes de publicar.
- Los enlaces de hoteles y vuelos abren búsquedas con las fechas del viaje. No son tarifas fijas.
- Las coordenadas del mapa son aproximadas y el trazo es esquemático.
- Los precios de hoteles vienen de listados de otras fechas. Verifica la tarifa de enero de 2027.
- El mapa usa Leaflet 1.9.4 (cdnjs) y teselas de OpenStreetMap.
