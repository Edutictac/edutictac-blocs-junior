---
plantilla: samples/JuniorRace.txt
---

# Fitxa docent 6 — La cursa

| | |
|---|---|
| **Plantilla** | «6. La cursa» (pestanya **Reptes**) |
| **Edat orientativa** | 6-8 anys (1r a 3r de Primària) |
| **Durada** | 30-45 minuts |
| **Agrupament** | Per parelles: una persona fa la predicció («qui guanyarà?») i l'altra canvia el programa; canvien a meitat sessió |
| **Material** | Una tauleta o ordinador per parella amb https://blocs-junior.edutictac.es |

## Objectiu

Fer **prediccions** i canviar un **paràmetre** (la velocitat) per modificar el resultat
d'un programa.

L'alumnat descobreix que:

- el bloc **Estableix velocitat** canvia com de ràpid es mou un personatge (lenta, mitjana,
  ràpida);
- un missatge pot fer que diversos personatges comencen alhora;
- canviar una sola cosa del programa canvia el resultat;
- abans de provar podem predir què passarà.

## Què hi ha a la plantilla

- **Tac**, a la dreta, fa de jutge: *bandera verda* → diu «3...», «2...», «1...», «Ja!» →
  **envia el missatge taronja**.
- **Junior**, a dalt a l'esquerra: *en rebre el missatge taronja* → velocitat **mitjana** →
  avança 14 → «He arribat!».
- **Tic**, a baix a l'esquerra: *en rebre el missatge taronja* → velocitat **lenta** →
  avança 14 → «He arribat!».
- La consigna a dalt: «Canvia la velocitat de Tic perquè guanye!».

## Blocs que apareixen

| Bloc | Categoria | Per a què serveix |
|---|---|---|
| Comença en prémer la bandera verda | Inici (groc) | Comença el programa de Tac |
| Envia missatge | Inici (groc) | Dona el senyal de sortida a tots els corredors |
| Comença en rebre missatge | Inici (groc) | Els corredors comencen quan arriba el senyal |
| Estableix velocitat | Control (taronja) | Tria la velocitat: lenta, mitjana o ràpida |
| Mou-te a la dreta | Moviment (blau) | Mou el personatge cap a la dreta |
| Digues | Aparença (lila) | Compte enrere i «He arribat!» |

## Desenvolupament

1. **Inici (5 min).** Cursa a càmera lenta al pati o a l'aula: una persona camina lent,
   una altra normal, una altra ràpid. Qui arriba primer?
2. **Obrir la plantilla (5 min).** Pestanya **Reptes** → «6. La cursa». **Abans** de prémer
   la bandera, cada parella prediu qui guanyarà. Després ho comprovem.
3. **Llegir el codi (10 min).** Per què Junior guanya? Toquem Junior i Tic i comparem els
   seus programes: què canvia? Només el bloc **Estableix velocitat**.
4. **Repte (10 min).** Canviar la velocitat de Tic perquè guanye. Prémer **Reinicia** (la
   fletxa corba) i tornar a córrer.
5. **Tancament (5-10 min).** I si els dos tenen la mateixa velocitat? Prediem i provem.
   Parlem de com una sola dada canvia el resultat.

## Solució

A Tic: canviar `estableix velocitat` de **lenta** a **ràpida**.

Amb Tic ràpid i Junior a velocitat mitjana, Tic arriba primer. Si els dos tenen la mateixa
velocitat, arriben alhora. Una altra solució vàlida: deixar Tic igual i posar Junior a
velocitat lenta.

## Errors habituals

- **Canviar Junior en lloc de Tic.** Comproveu quin personatge està seleccionat.
- **Canviar el número de passos.** Si Tic fa menys passos, «guanya» però no arriba a la
  meta: parleu de si és una cursa justa.
- **No reiniciar.** Sense **Reinicia**, els corredors comencen des de la meta i no es veu la
  cursa.
- **Tocar els corredors per començar.** La cursa comença amb la bandera verda: Tac dona la
  sortida.

## Ampliació

- Afegir un tercer corredor (copiant el programa de Junior) amb una altra velocitat.
- Fer que el guanyador salte en arribar.
- Afegir un bloc **Espera** a un corredor perquè isca més tard i veure si encara guanya.
- Per a qui acaba abans: fer una cursa d'anada i tornada.

## Observació i avaluació

| Indicador | Sí | Amb ajuda | Encara no |
|---|---|---|---|
| Fa una predicció abans de provar | | | |
| Troba la diferència entre dos programes | | | |
| Canvia la velocitat per aconseguir l'objectiu | | | |
| Explica el resultat amb les seues paraules | | | |

## Pensament computacional

- **Paràmetres:** canviar un valor canvia el comportament.
- **Esdeveniments i missatges:** un senyal fa començar diversos personatges alhora.
- **Predicció i comprovació:** pensar què passarà i verificar-ho.
