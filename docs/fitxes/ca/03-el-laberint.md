---
plantilla: samples/JuniorMaze.txt
---

# Fitxa docent 3 — El laberint

| | |
|---|---|
| **Plantilla** | «3. El laberint» (pestanya **Reptes**) |
| **Edat orientativa** | 6-8 anys (1r a 3r de Primària) |
| **Durada** | 45 minuts |
| **Agrupament** | Per parelles: una persona dibuixa el camí amb el dit sobre la pantalla i l'altra el programa; canvien a meitat sessió |
| **Material** | Una tauleta o ordinador per parella amb https://blocs-junior.edutictac.es. Opcional: paper quadriculat i llapis |

## Objectiu

Planificar un **camí amb diverses direccions** (amunt, avant, avall) per esquivar
obstacles, i corregir-lo quan Junior toca un cactus.

L'alumnat descobreix que:

- per arribar a un lloc sovint cal combinar moviments en direccions diferents;
- abans de programar convé pensar el camí;
- els personatges avisen quan els toquen, i això ens ajuda a trobar errors.

## Què hi ha a la plantilla

- **Junior**, a baix a l'esquerra, amb el bloc **bandera verda** i res més.
- **Dos cactus**: un de baix, prop de Junior, i un de dalt, més a la dreta. Tots dos
  estan programats: *quan els toquen* → diuen «Ai!».
- **L'estrella**, a baix a la dreta: *quan la toquen* → creix, fa «pop» i torna a la mida
  normal.
- La consigna a dalt: «Porta Junior a l'estrella sense tocar els cactus!».

## Blocs que apareixen

| Bloc | Categoria | Per a què serveix |
|---|---|---|
| Comença en prémer la bandera verda | Inici (groc) | Comença el programa quan es prem la bandera de dalt |
| Mou-te a la dreta | Moviment (blau) | Mou el personatge cap a la dreta |
| Mou-te amunt | Moviment (blau) | Mou el personatge cap amunt |
| Mou-te avall | Moviment (blau) | Mou el personatge cap avall |
| Comença en tocar-se | Inici (groc) | Ja el tenen els cactus i l'estrella: reaccionen quan els toquen |
| Digues | Aparença (lila) | Ja el tenen els cactus: fan aparéixer una bafarada amb «Ai!» |

## Desenvolupament

1. **Inici (5-10 min).** Laberint a l'aula: amb cadires fem dos «cactus» i un alumne fa
   de Junior. La classe li dicta el camí («amunt 5, avant 8, avall 5...»). Si toca una
   cadira, diu «Ai!» i tornem a començar.
2. **Obrir la plantilla (5 min).** Pestanya **Reptes** → «3. El laberint». Mirem
   l'escenari: on és el primer cactus? i el segon? Per on podria passar Junior?
3. **Planificar (10 min).** Dibuixar el camí amb el dit sobre la pantalla o en paper
   quadriculat. Primer prova: només cap a la dreta. Junior toca el cactus i diu «Ai!».
4. **Repte (15 min).** Afegir **Mou-te amunt** per passar per damunt del primer cactus,
   **Mou-te avall** abans del segon (que està més amunt) i acabar cap a la dreta fins a
   l'estrella. Ajustar els números després de cada prova.
5. **Tancament (5 min).** Cada parella explica el seu camí en veu alta. Tots els camins
   que funcionen són iguals?

## Solució

`bandera verda` → `mou-te amunt 5` → `mou-te a la dreta 8` → `mou-te avall 5` →
`mou-te a la dreta 7`

El primer cactus és alt: amb `amunt 4` o menys, Junior encara el toca. Per això cal pujar
5 passos, passar-lo, baixar abans del segon cactus (que està a dalt) i avançar fins a
l'estrella. Hi ha altres camins vàlids; l'important és que cap cactus diga «Ai!» i que
l'estrella reaccione.

## Errors habituals

- **No pujar prou.** Junior és alt: si puja poc, els peus toquen el cactus. El «Ai!» ens
  diu on està l'error.
- **Baixar massa tard.** Si Junior continua dalt, xoca amb el segon cactus.
- **Confondre amunt i avall.** Les fletxes indiquen la direcció; feu el moviment amb la mà
  abans de triar el bloc.
- **Provar sense reiniciar.** La bandera no torna Junior al seu lloc: cal prémer
  **Reinicia** (la fletxa corba) abans de cada prova.

## Ampliació

- Canviar un cactus de lloc i buscar un camí nou.
- Afegir un tercer cactus (des de la biblioteca de personatges) i copiar-li el programa
  «Ai!».
- Fer que Junior diga «Ho he aconseguit!» en arribar a l'estrella.
- Per a qui acaba abans: tornar a l'inici per un camí diferent.

## Observació i avaluació

| Indicador | Sí | Amb ajuda | Encara no |
|---|---|---|---|
| Planifica el camí abans de programar | | | |
| Combina moviments en diferents direccions | | | |
| Troba l'error quan un cactus diu «Ai!» | | | |
| Corregeix el programa fins arribar a l'estrella | | | |

## Pensament computacional

- **Descomposició:** dividir el camí en trams (pujar, avançar, baixar, avançar).
- **Planificació:** pensar l'algoritme abans d'executar-lo.
- **Depuració:** fer servir el missatge «Ai!» com a pista per corregir.
