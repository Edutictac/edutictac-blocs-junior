---
plantilla: samples/JuniorMaze.txt
---

# Ficha docente 3 — El laberinto

| | |
|---|---|
| **Plantilla** | «3. El laberinto» (pestaña **Desafíos**) |
| **Edad orientativa** | 6-8 años (1.º a 3.º de Primaria) |
| **Duración** | 45 minutos |
| **Agrupamiento** | Por parejas: una persona dibuja el camino con el dedo sobre la pantalla y la otra lo programa; cambian a mitad de sesión |
| **Material** | Una tableta u ordenador por pareja con https://blocs-junior.edutictac.es. Opcional: papel cuadriculado y lápiz |

## Objetivo

Planificar un **camino con varias direcciones** (arriba, adelante, abajo) para esquivar
obstáculos, y corregirlo cuando Junior toca un cactus.

El alumnado descubre que:

- para llegar a un sitio a menudo hay que combinar movimientos en direcciones distintas;
- antes de programar conviene pensar el camino;
- los personajes avisan cuando los tocan, y eso nos ayuda a encontrar errores.

## Qué hay en la plantilla

- **Junior**, abajo a la izquierda, con el bloque **bandera verde** y nada más.
- **Dos cactus**: uno abajo, cerca de Junior, y otro arriba, más a la derecha. Los dos
  están programados: *al tocarlos* → dicen «¡Ay!».
- **La estrella**, abajo a la derecha: *al tocarla* → crece, hace «pop» y vuelve a su
  tamaño normal.
- La consigna arriba: «¡Lleva a Junior a la estrella sin tocar los cactus!».

## Bloques que aparecen

| Bloque | Categoría | Para qué sirve |
|---|---|---|
| Comenzar al presionar bandera verde | Inicio (amarillo) | Empieza el programa cuando se pulsa la bandera de arriba |
| Mover a la derecha | Movimiento (azul) | Mueve el personaje hacia la derecha |
| Subir | Movimiento (azul) | Mueve el personaje hacia arriba |
| Bajar | Movimiento (azul) | Mueve el personaje hacia abajo |
| Comenzar al tocar | Inicio (amarillo) | Ya lo tienen los cactus y la estrella: reaccionan cuando los tocan |
| Decir | Apariencia (lila) | Ya lo tienen los cactus: muestran un bocadillo con «¡Ay!» |

## Desarrollo

1. **Inicio (5-10 min).** Laberinto en el aula: con sillas hacemos dos «cactus» y un alumno
   hace de Junior. La clase le dicta el camino («sube 5, avanza 8, baja 5...»). Si toca una
   silla, dice «¡Ay!» y volvemos a empezar.
2. **Abrir la plantilla (5 min).** Pestaña **Desafíos** → «3. El laberinto». Miramos el
   escenario: ¿dónde está el primer cactus? ¿Y el segundo? ¿Por dónde podría pasar Junior?
3. **Planificar (10 min).** Dibujar el camino con el dedo sobre la pantalla o en papel
   cuadriculado. Primera prueba: solo hacia la derecha. Junior toca el cactus y dice «¡Ay!».
4. **Reto (15 min).** Añadir **Subir** para pasar por encima del primer cactus, **Bajar**
   antes del segundo (que está más arriba) y terminar hacia la derecha hasta la estrella.
   Ajustar los números después de cada prueba.
5. **Cierre (5 min).** Cada pareja explica su camino en voz alta. ¿Todos los caminos que
   funcionan son iguales?

## Solución

`bandera verde` → `subir 5` → `mover a la derecha 8` → `bajar 5` →
`mover a la derecha 7`

El primer cactus es alto: con `subir 4` o menos, Junior todavía lo toca. Por eso hay que
subir 5 pasos, pasarlo, bajar antes del segundo cactus (que está arriba) y avanzar hasta la
estrella. Hay otros caminos válidos; lo importante es que ningún cactus diga «¡Ay!» y que
la estrella reaccione.

## Errores habituales

- **No subir lo suficiente.** Junior es alto: si sube poco, los pies tocan el cactus. El
  «¡Ay!» nos dice dónde está el error.
- **Bajar demasiado tarde.** Si Junior sigue arriba, choca con el segundo cactus.
- **Confundir subir y bajar.** Las flechas indican la dirección; haced el movimiento con la
  mano antes de elegir el bloque.
- **Probar sin reiniciar.** La bandera no devuelve a Junior a su sitio: hay que pulsar
  **Reiniciar** (la flecha curva) antes de cada prueba.

## Ampliación

- Cambiar un cactus de sitio y buscar un camino nuevo.
- Añadir un tercer cactus (desde la biblioteca de personajes) y copiarle el programa «¡Ay!».
- Hacer que Junior diga «¡Lo he conseguido!» al llegar a la estrella.
- Para quien termine antes: volver al inicio por un camino diferente.

## Observación y evaluación

| Indicador | Sí | Con ayuda | Todavía no |
|---|---|---|---|
| Planifica el camino antes de programar | | | |
| Combina movimientos en diferentes direcciones | | | |
| Encuentra el error cuando un cactus dice «¡Ay!» | | | |
| Corrige el programa hasta llegar a la estrella | | | |

## Pensamiento computacional

- **Descomposición:** dividir el camino en tramos (subir, avanzar, bajar, avanzar).
- **Planificación:** pensar el algoritmo antes de ejecutarlo.
- **Depuración:** usar el mensaje «¡Ay!» como pista para corregir.
