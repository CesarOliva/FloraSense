# FotoSinDisease — Identidad de marca

Guía corta para usar el nombre, el logo, los colores y el tono de FotoSinDisease de forma consistente
en la app, presentaciones y redes.

## Nombre y lema

**FotoSinDisease**, junto y con la F, la S y la D en mayúscula.
No escribir "Foto Sin Disease", "Fotosindisease" ni "FSD" en textos que vea el usuario.

- **Foto**: lo que hace el usuario (toma una foto).
- **Sin Disease**: lo que obtiene (una planta sin enfermedad).

**Lema:** *Tu planta sana, desde una foto.*

## Logo

![Logo de FotoSinDisease](../frontend/public/brand/fotosindisease-logo.png)

**El nombre y el símbolo son una sola pieza:** la hoja brota de la "i" de **"Sin"**, la palabra que
va en verde porque es la promesa: una planta sana que crece desde el nombre. El tallo es fino para
que la "i" conserve su altura y se siga leyendo "Sin".

**Símbolo, la hoja-obturador:** la hoja es también el diafragma de una cámara. Sus nervaduras son
las aspas y el hexágono del centro es la apertura del lente. Cada aspa tiene un verde distinto, de
la sombra a la luz, como si la luz entrara por arriba a la derecha. De lejos se ve una hoja y de
cerca, una cámara.

**Letras:** Fraunces suave (peso 620, tamaño óptico 144, SOFT 100) convertida a curvas.

### Archivos

| Archivo | Uso |
|---|---|
| `frontend/public/brand/fotosindisease-logo.svg` / `.png` | Logo principal, sobre fondos claros |
| `frontend/public/brand/fotosindisease-logo-negativo.svg` | Sobre fondos oscuros |
| `frontend/public/brand/fotosindisease-simbolo.svg` / `.png` | Solo el símbolo, cuando el logo no cabe: avatar, ícono y espacios cuadrados |
| `frontend/public/brand/fotosindisease-simbolo-mono.svg` | Símbolo a una tinta (se puede cambiar el color, p. ej. blanco sobre verde) |
| `frontend/src/components/brand/logo.tsx` | `<Logo />` (logo completo) y `<LogoMark />` (símbolo; `variant="mono"` para una tinta) en la app |
| `frontend/src/components/brand/logo-paths.ts` | Trazos del logo y del símbolo que usa la app (los mismos de los SVG) |

Íconos que Next.js agrega solo al `<head>` (están en `frontend/src/app/`):

- `favicon.ico` e `icon.svg`: el símbolo en verdes claros sobre un cuadro verde.
- `apple-icon.png`: ícono al guardar la página en la pantalla de inicio del iPhone.
- `opengraph-image.png`: vista previa al compartir el enlace (WhatsApp, redes). Cuando la página
  tenga dominio propio, hay que definir `metadataBase` en `layout.tsx` para que la imagen use URL absoluta.

### Reglas de uso

- **Área de respeto:** alrededor del logo, deja libre al menos la altura de la "F".
- **Tamaño mínimo:** logo desde 140 px de ancho (más chico, la hoja ya no se distingue); símbolo
  desde 20 px.
- **Sobre fondos verdes o fotos:** usa la versión de la imagen para compartir (letras blancas) o el
  símbolo a una tinta en blanco.
- **El nombre siempre es el logo**, no texto escrito con Fraunces: usa los archivos o `<Logo />`.
- **No:** separar la hoja del nombre, engrosar el tallo (la "i" se leería "l"), cerrar las
  separaciones o rellenar el hexágono del centro, cambiar el orden de luz de las aspas, poner
  "Disease" en verde, deformar o rotar el logo, ni agregarle sombras.

## Color

La fuente de verdad son los tokens de `frontend/src/app/globals.css` (en `oklch`); los hex son su
equivalente para usar fuera de la app.

| Color | Hex | Token | Uso |
|---|---|---|---|
| Aspa en sombra | `#0B5534` | `--logo-shade` | Aspa más oscura y tallo de la hoja |
| Aspa en luz | `#58A86A` | `--logo-light` | Aspa más clara |
| Bosque | `#085634` | `--hero` | Inicio del degradado del ícono y del banner principal |
| Brote | `#418646` | `--hero-end` | Final del degradado |
| Verde FotoSin | `#1B6C3A` | `--primary` | "Sin" en el logo, botones y enlaces |
| Menta | `#A6E3B4` | — | "Sin" sobre fondos verdes (imagen para compartir) |
| Tinta | `#101911` | `--foreground` | Texto y "Foto" / "Disease" en el logo |
| Papel | `#FBF9F0` | `--background` | Fondo de la app |

Las aspas intermedias son mezclas entre la sombra y la luz. Sobre fondo oscuro van de `#2F8A4F` a
`#9FDC9C`, y sobre verde, de `#9FD8A8` a blanco.

Cada herramienta tiene su color, que solo sirve para reconocerla (no se usa en el logo):

| Herramienta | Fondo | Texto |
|---|---|---|
| Diagnosticar | `#FFE2DC` | `#A43C2F` |
| Identificar | `#D5F5DA` | `#015D2D` |
| Calculadora de agua | `#D1F1FF` | `#006197` |
| Recordatorios | `#FFEDB9` | `#8D5406` |

## Tipografía

- **Fraunces** semibold: títulos de la app (`font-heading`). El logo usa una versión más suave del
  mismo tipo, ya convertida a curvas.
- **Geist**: textos, botones y formularios (`font-sans`).

Ambas son de Google Fonts y la app las carga con `next/font`.

## Voz y tono

- **Cercana:** tuteo y frases cortas. "Toma una foto", "tu planta".
- **Calmada:** describe lo que se ve y qué hacer, sin alarmar.
  Mejor "Las hojas amarillas suelen indicar exceso de riego" que "¡Tu planta se está muriendo!".
- **Honesta:** si el análisis no está seguro, se dice. Recordar que FotoSinDisease orienta y no
  reemplaza el diagnóstico de un especialista.
- **En español:** "Disease" solo aparece en el nombre; toda la interfaz va en español.
