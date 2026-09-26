---
plantilla: samples/JuniorRace.txt
---

# Ficha docente 6 — La carrera

| | |
|---|---|
| **Plantilla** | «6. La carrera» (pestaña **Desafíos**) |
| **Edad orientativa** | 6-8 años (1.º a 3.º de Primaria) |
| **Duración** | 30-45 minutos |
| **Agrupamiento** | Por parejas: una persona hace la predicción («¿quién ganará?») y la otra cambia el programa; cambian a mitad de sesión |
| **Material** | Una tableta u ordenador por pareja con https://blocs-junior.edutictac.es |

## Objetivo

Hacer **predicciones** y cambiar un **parámetro** (la velocidad) para modificar el
resultado de un programa.

El alumnado descubre que:

- el bloque **Fijar velocidad** cambia lo rápido que se mueve un personaje (lenta, media,
  rápida);
- un mensaje puede hacer que varios personajes empiecen a la vez;
- cambiar una sola cosa del programa cambia el resultado;
- antes de probar podemos predecir qué pasará.

## Qué hay en la plantilla

- **Tac**, a la derecha, hace de juez: *bandera verde* → dice «3...», «2...», «1...»,
  «¡Ya!» → **envía el mensaje naranja**.
- **Junior**, arriba a la izquierda: *al recibir el mensaje naranja* → velocidad
  **media** → avanza 14 → «¡He llegado!».
- **Tic**, abajo a la izquierda: *al recibir el mensaje naranja* → velocidad **lenta** →
  avanza 14 → «¡He llegado!».
- La consigna arriba: «¡Cambia la velocidad de Tic para que gane!».

## Bloques que aparecen

| Bloque | Categoría | Para qué sirve |
|---|---|---|
| Comenzar al presionar bandera verde | Inicio (amarillo) | Empieza el programa de Tac |
| Enviar mensaje | Inicio (amarillo) | Da la señal de salida a todos los corredores |
| Comenzar al recibir mensaje | Inicio (amarillo) | Los corredores empiezan cuando llega la señal |
| Fijar velocidad | Control (naranja) | Elige la velocidad: lenta, media o rápida |
| Mover a la derecha | Movimiento (azul) | Mueve el personaje hacia la derecha |
| Decir | Apariencia (lila) | Cuenta atrás y «¡He llegado!» |

## Desarrollo

1. **Inicio (5 min).** Carrera a cámara lenta en el patio o en el aula: una persona camina
   despacio, otra normal, otra rápido. ¿Quién llega primero?
2. **Abrir la plantilla (5 min).** Pestaña **Desafíos** → «6. La carrera». **Antes** de
   pulsar la bandera, cada pareja predice quién ganará. Después lo comprobamos.
3. **Leer el código (10 min).** ¿Por qué gana Junior? Tocamos a Junior y a Tic y comparamos
   sus programas: ¿qué cambia? Solo el bloque **Fijar velocidad**.
4. **Reto (10 min).** Cambiar la velocidad de Tic para que gane. Pulsar **Reiniciar** (la
   flecha curva) y volver a correr.
5. **Cierre (5-10 min).** ¿Y si los dos tienen la misma velocidad? Predecimos y probamos.
   Hablamos de cómo un solo dato cambia el resultado.

## Solución

En Tic: cambiar `fijar velocidad` de **lenta** a **rápida**.

Con Tic rápido y Junior a velocidad media, Tic llega primero. Si los dos tienen la misma
velocidad, llegan a la vez. Otra solución válida: dejar a Tic igual y poner a Junior a
velocidad lenta.

## Errores habituales

- **Cambiar a Junior en lugar de a Tic.** Comprobad qué personaje está seleccionado.
- **Cambiar el número de pasos.** Si Tic da menos pasos, «gana» pero no llega a la meta:
  hablad de si es una carrera justa.
- **No reiniciar.** Sin **Reiniciar**, los corredores empiezan desde la meta y no se ve la
  carrera.
- **Tocar a los corredores para empezar.** La carrera empieza con la bandera verde: Tac da
  la salida.

## Ampliación

- Añadir un tercer corredor (copiando el programa de Junior) con otra velocidad.
- Hacer que el ganador salte al llegar.
- Añadir un bloque **Esperar** a un corredor para que salga más tarde y ver si aún gana.
- Para quien termine antes: hacer una carrera de ida y vuelta.

## Observación y evaluación

| Indicador | Sí | Con ayuda | Todavía no |
|---|---|---|---|
| Hace una predicción antes de probar | | | |
| Encuentra la diferencia entre dos programas | | | |
| Cambia la velocidad para conseguir el objetivo | | | |
| Explica el resultado con sus palabras | | | |

## Pensamiento computacional

- **Parámetros:** cambiar un valor cambia el comportamiento.
- **Eventos y mensajes:** una señal hace empezar a varios personajes a la vez.
- **Predicción y comprobación:** pensar qué pasará y verificarlo.
