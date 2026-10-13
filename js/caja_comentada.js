// =====================================================================
// CAJA REGISTRADORA - CÓDIGO COMENTADO
//
// IDEA GENERAL
//   · Por dentro TODO va en céntimos (números enteros, sin errores de decimales).
//   · Los euros solo se usan al entrar (precio y claves del pago) y al mostrar.
//   · Caja, pago y desglose comparten el mismo formato:
//       array de 15 objetos { valor, cantidad }, ordenado de mayor a menor.
//     Gracias a eso la posición i es la misma denominación en los tres arrays.
//
// ORDEN DE EJECUCIÓN DE LA LLAMADA
//   procesarPago(12.80, crearPago({ 20: 1 }))
//   1) crearPago construye el array del pago
//   2) procesarPago decide qué caso es y, si hay cambio, usa calcularCambio
// =====================================================================

// ---------------------------------------------------------------------
// DATOS
// ---------------------------------------------------------------------

// La caja: un objeto por cada tipo de billete o moneda (denominación).
//   valor    -> céntimos de esa denominación (5000 = billete de 50 €)
//   cantidad -> cuántas piezas hay en caja
// El orden de mayor a menor es IMPORTANTE: calcularCambio lo recorre así.
const caja = [
  { valor: 50000, cantidad: 0 }, // billete 500 €
  { valor: 20000, cantidad: 0 }, // billete 200 €
  { valor: 10000, cantidad: 0 }, // billete 100 €
  { valor: 5000, cantidad: 1 }, // billete 50 €
  { valor: 2000, cantidad: 4 }, // billete 20 €
  { valor: 1000, cantidad: 8 }, // billete 10 €
  { valor: 500, cantidad: 2 }, // billete 5 €
  { valor: 200, cantidad: 5 }, // moneda 2 €
  { valor: 100, cantidad: 4 }, // moneda 1 €
  { valor: 50, cantidad: 0 }, // moneda 0,50 €
  { valor: 20, cantidad: 0 }, // moneda 0,20 €
  { valor: 10, cantidad: 1 }, // moneda 0,10 €
  { valor: 5, cantidad: 2 }, // moneda 0,05 €
  { valor: 2, cantidad: 3 }, // moneda 0,02 €
  { valor: 1, cantidad: 1 }, // moneda 0,01 €
];

// El desglose: aquí se anota qué piezas se devuelven como cambio.
// Se crea con map a partir de la caja:
//   · mismo valor en cada fila (mismas 15 denominaciones, mismo orden)
//   · cantidad a 0 (todavía no se ha devuelto nada)
// Se crean objetos NUEVOS ({ ... }) para que no compartan memoria con la caja;
// si no, modificar el desglose cambiaría también la caja.
const desglose = caja.map((item) => ({ valor: item.valor, cantidad: 0 }));

// ---------------------------------------------------------------------
// FUNCIÓN 1: calcularTotal
// Recibe: un array con formato { valor, cantidad } (caja, pago o desglose)
// Devuelve: el dinero total que hay en él, en céntimos
// ---------------------------------------------------------------------
function calcularTotal(arr) {
  let total = 0; // acumulador, empieza en 0

  for (let i = 0; i < arr.length; i++) {
    // recorre las 15 filas
    total += arr[i].valor * arr[i].cantidad; // céntimos de la fila = valor × cantidad
  }

  return total;
}
// Se reutiliza en tres sitios: total pagado, total de la caja y total del cambio.

// ---------------------------------------------------------------------
// FUNCIÓN 2: calcularCambio  (el corazón: recursiva + backtracking)
//
// Pregunta que responde:
//   "Me quedan `restante` céntimos por devolver y voy por la denominación
//    caja[i]. ¿Puedo completar el cambio con esta y las siguientes?"
//
// Recibe:
//   restante -> céntimos que faltan por devolver
//   i        -> posición de la denominación que se está mirando (0 = la mayor)
// Devuelve:
//   true  -> sí se puede (y deja anotadas las piezas en `desglose`)
//   false -> no se puede
// ---------------------------------------------------------------------
function calcularCambio(restante, i) {
  // CASO BASE 1 (éxito): no falta nada por devolver.
  // Va primero: si ya está resuelto, da igual en qué denominación estemos.
  if (restante === 0) {
    return true;
  }

  // CASO BASE 2 (fallo): nos hemos quedado sin denominaciones y aún falta dinero.
  // Las posiciones válidas son 0..14, así que i = 15 (= caja.length) ya no existe.
  if (i >= caja.length) {
    return false;
  }

  // Máximo de piezas de ESTA denominación que podemos usar. Dos límites:
  //   · lo que cabe:  Math.floor(restante / valor)  -> cuántas entran en lo que falta
  //   · lo que hay:   caja[i].cantidad              -> cuántas tenemos en caja
  // Math.min se queda con el menor, para respetar ambos a la vez.
  const maximo = Math.min(
    Math.floor(restante / caja[i].valor),
    caja[i].cantidad,
  );

  // BACKTRACKING: probamos desde el máximo hasta 0 (el 0 también es una opción:
  // "no usar ninguna de esta denominación"). Empezar por el máximo es lo que da
  // preferencia a las piezas grandes (un billete de 20 antes que dos de 10).
  // La variable se llama `usar` y no `i` porque `i` ya es el parámetro.
  for (let usar = maximo; usar >= 0; usar--) {
    // Lo que quedaría por devolver si usamos `usar` piezas de esta denominación.
    const nuevoRestante = restante - usar * caja[i].valor;

    // RECURSIVIDAD: la misma función resuelve el resto con la SIGUIENTE
    // denominación (i + 1). Nosotros solo recibimos true o false.
    const resultado = calcularCambio(nuevoRestante, i + 1);

    // Si el resto se pudo resolver, esta opción es buena:
    //   · se anota cuántas piezas de esta denominación se usan
    //   · se devuelve true hacia arriba (la anotación ocurre "al volver" de
    //     las llamadas, de la denominación más pequeña a la más grande)
    // Si fue false, no se hace nada y el bucle prueba con una pieza menos.
    if (resultado) {
      desglose[i].cantidad = usar;
      return true;
    }
  }

  // Ninguna opción (de maximo a 0) funcionó -> desde esta denominación no hay solución.
  // La llamada anterior probará con una pieza menos en SU denominación (volver atrás).
  return false;
}
// Nota: devuelve la PRIMERA solución que encuentra, no se ha demostrado que
// sea siempre la de menos piezas.

// ---------------------------------------------------------------------
// FUNCIÓN 3: procesarPago  (el flujo general, usa las dos anteriores)
//
// Recibe:
//   precio -> precio del artículo en EUROS (ej. 12.80)
//   pago   -> array con el formato de la caja, con lo que entrega el cliente
//             (se obtiene con crearPago)
// ---------------------------------------------------------------------
function procesarPago(precio, pago) {
  // ENTRADA: euros -> céntimos. Math.round es necesario porque
  // multiplicar decimales puede dar errores (1.15 * 100 = 114.99999999999999).
  const precioCentimos = Math.round(precio * 100);

  // Total que ha entregado el cliente, en céntimos.
  const pagado = calcularTotal(pago);

  // CASO 1: paga de menos. Se comprueba primero; si no, la resta daría negativo.
  if (pagado < precioCentimos) {
    return console.log("Te falta ruca");
  }

  // CASO 2: pago exacto, no hay cambio que dar.
  // Suma lo que entrega el cliente a la caja.
  if (pagado === precioCentimos) {
    for (let i = 0; i < pago.length; i++) {
      caja[i].cantidad += pago[i].cantidad;
    }
    return console.log("Está justo");
  }

  // CASO 3: hay que devolver cambio. Cuánto, en céntimos.
  const cambio = pagado - precioCentimos;

  // Paso A: sumar lo que entrega el cliente a la caja ANTES de buscar el cambio,
  // porque esas piezas pueden hacer falta para devolver.
  // La posición i del pago y de la caja son la misma denominación.
  // (Operador +=; ojo, `=+` NO suma, machaca el valor.)
  for (let i = 0; i < pago.length; i++) {
    caja[i].cantidad += pago[i].cantidad;
  }

  // Paso B: poner el desglose a 0. Se limpia ANTES de usarlo, para no arrastrar
  // restos de una operación anterior. (Si se hiciera después de calcularCambio,
  // se borraría el resultado recién calculado.)
  for (let i = 0; i < desglose.length; i++) {
    desglose[i].cantidad = 0;
  }

  // Paso C: buscar el cambio, empezando por la primera denominación (posición 0).
  // Si devuelve true, `desglose` queda rellenado con las piezas a devolver.
  const hayCambio = calcularCambio(cambio, 0);

  // Paso D: si no se puede dar cambio, la venta no se hace -> DESHACER el paso A
  // (mismo bucle con -=) para que la caja quede exactamente como estaba.
  if (!hayCambio) {
    // !hayCambio se lee "si NO hay cambio"
    for (let i = 0; i < pago.length; i++) {
      caja[i].cantidad -= pago[i].cantidad;
    }
    return console.log("Voy al bar a por cambio");
  }

  // Paso E: sí hay cambio -> las piezas del desglose salen de la caja.
  // Ahora la cantidad que se resta viene de `desglose`, no de `pago`.
  for (let i = 0; i < desglose.length; i++) {
    caja[i].cantidad -= desglose[i].cantidad;
  }

  // Paso F: mostrar el cambio y la caja (salida de euros).
  // Aquí van los console.log: recorren desglose y caja mostrando solo las filas
  // con cantidad > 0, con valor / 100 (céntimos -> euros) y el total
  // calcularTotal(...) / 100 con .toFixed(2) para fijar dos decimales.
}

// ---------------------------------------------------------------------
// FUNCIÓN 4: crearPago
// Convierte lo que escribe el usuario, un objeto corto como { 20: 1, 5: 1 },
// en un array de 15 filas con el formato de la caja (el que necesita procesarPago).
//
// Recibe:  entregado -> objeto donde
//            clave  = valor de la pieza en EUROS (etiqueta para buscar)
//            número = cuántas piezas entrega
// Devuelve: array de 15 objetos { valor (céntimos), cantidad }
// ---------------------------------------------------------------------
function crearPago(entregado) {
  // La caja se usa como PLANTILLA: map recorre sus 15 filas, en orden, y por cada
  // una construye una fila nueva. `item` es la fila actual de la caja.
  return caja.map((item) => ({
    // valor: se COPIA de la caja, ya está en céntimos.
    valor: item.valor,

    // cantidad: se CONSULTA en `entregado`, no se calcula.
    //   · item.valor / 100 traduce los céntimos de la fila (2000) a la etiqueta en
    //     euros que escribió el usuario (20). Solo sirve para buscar.
    //   · entregado[20] devuelve 1 si el usuario escribió { 20: 1 }, y
    //     undefined si esa etiqueta no existe.
    //   · || 0 convierte ese undefined en 0 (no entregó de esa denominación).
    cantidad: entregado[item.valor / 100] || 0,
  }));
}
// Limitación: si el usuario escribe una etiqueta que no existe en la caja
// (por ejemplo { 3: 1 }), se ignora en silencio.

// =====================================================================
// MAPA RÁPIDO DE QUIÉN USA A QUIÉN
//
//   procesarPago ──► calcularTotal   (total pagado, total del cambio y de la caja)
//        │
//        └─────────► calcularCambio  (backtracking; rellena `desglose`)
//                         └──► se llama a sí misma con i + 1 (recursividad)
//
//   crearPago ──► construye el `pago` que recibe procesarPago
//
// DÓNDE SE CONVIERTE EUROS <-> CÉNTIMOS (y solo ahí)
//   · Math.round(precio * 100)   en procesarPago  (euros -> céntimos)
//   · item.valor / 100           en crearPago     (solo para buscar la etiqueta)
//   · valor / 100 y total / 100  en los console.log (céntimos -> euros)
// =====================================================================
