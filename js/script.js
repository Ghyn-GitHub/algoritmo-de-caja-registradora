const caja = [
  { valor: 50000, cantidad: 0 },
  { valor: 20000, cantidad: 0 },
  { valor: 10000, cantidad: 0 },
  { valor: 5000, cantidad: 1 },
  { valor: 2000, cantidad: 4 },
  { valor: 1000, cantidad: 8 },
  { valor: 500, cantidad: 2 },
  { valor: 200, cantidad: 5 },
  { valor: 100, cantidad: 4 },
  { valor: 50, cantidad: 0 },
  { valor: 20, cantidad: 0 },
  { valor: 10, cantidad: 1 },
  { valor: 5, cantidad: 2 },
  { valor: 2, cantidad: 3 },
  { valor: 1, cantidad: 1 },
];

const desglose = caja.map((item) => ({ valor: item.valor, cantidad: 0 }));

function calcularTotal(arr) {
  let total = 0;
  for (let i = 0; i < arr.length; i++) {
    total += arr[i].valor * arr[i].cantidad;
  }
  return total;
}

function calcularCambio(restante, i) {
  if (restante === 0) {
    return true;
  }
  if (i >= caja.length) {
    return false;
  }

  const maximo = Math.min(
    Math.floor(restante / caja[i].valor),
    caja[i].cantidad,
  );

  for (let usar = maximo; usar >= 0; usar--) {
    const nuevoRestante = restante - usar * caja[i].valor;
    const resultado = calcularCambio(nuevoRestante, i + 1);
    if (resultado) {
      desglose[i].cantidad = usar;
      return true;
    }
  }
  return false;
}

function procesarPago(precio, pago) {
  limpiar("alerta");
  limpiar("desglose-cambio");
  limpiar("total-cambio");
  limpiar("desglose-caja");
  limpiar("total-caja");

  const precioCentimos = Math.round(precio * 100);

  const pagado = calcularTotal(pago);
  if (pagado < precioCentimos) {
    return mostrar("Te falta dinero", "alerta");
  }
  if (pagado === precioCentimos) {
    for (let i = 0; i < pago.length; i++) {
      caja[i].cantidad += pago[i].cantidad;
    }
    mostrarCaja();
    return mostrar("Está justo", "alerta");
  }
  const cambio = pagado - precioCentimos;

  for (let i = 0; i < pago.length; i++) {
    caja[i].cantidad += pago[i].cantidad;
  }

  for (let i = 0; i < desglose.length; i++) {
    desglose[i].cantidad = 0;
  }

  const hayCambio = calcularCambio(cambio, 0);

  if (!hayCambio) {
    for (let i = 0; i < pago.length; i++) {
      caja[i].cantidad -= pago[i].cantidad;
    }
    return mostrar("Voy al bar a por cambio", "alerta");
  }

  for (let i = 0; i < desglose.length; i++) {
    caja[i].cantidad -= desglose[i].cantidad;
  }

  for (let i = 0; i < desglose.length; i++) {
    if (desglose[i].cantidad > 0) {
      mostrar(`${desglose[i].cantidad} x ${desglose[i].valor / 100} €`, "desglose-cambio");
    }
  }
  mostrar(`Total cambio: ${(calcularTotal(desglose) / 100).toFixed(2)} €`, "total-cambio");

  mostrarCaja();
}

function crearPago(entregado) {
  return caja.map((item) => ({
    valor: item.valor,
    cantidad: entregado[item.valor / 100] || 0,
  }));
}

function mostrar(texto, zona) {
  const destino = document.getElementById(zona);
  const linea = document.createElement("p");
  linea.textContent = texto;
  destino.appendChild(linea);
}

function mostrarCaja() {
  for (let i = 0; i < caja.length; i++) {
    if (caja[i].cantidad > 0) {
      mostrar(`${caja[i].cantidad} x ${caja[i].valor / 100} €`, "desglose-caja");
    }
  }
  mostrar(`Total caja: ${(calcularTotal(caja) / 100).toFixed(2)} €`, "total-caja");
}

const entrada = document.getElementById("entrada");

function enviar() {
  ejecutarComando(entrada.value);
  entrada.value = "";
}

entrada.addEventListener("keydown", function (evento) {
  if (evento.key === "Enter") {
    enviar();
  }
});

const boton = document.getElementById("enviar");

boton.addEventListener("click", enviar);

function crearEntregado(pares) {
  const entregado = {};
  for (let i = 0; i < pares.length; i++) {
    const mitades = pares[i].split(":");
    entregado[mitades[0]] = Number(mitades[1]);
  }
  return entregado;
}

function ejecutarComando(texto) {
  const partes = texto.split(" ");
  if (partes[0] === "cobrar") {
    const precio = Number(partes[1])
    const entregado = crearEntregado(partes.slice(2));
    procesarPago(precio, crearPago(entregado));
  } else {
    limpiar("alerta");
    mostrar("Comando no reconocido", "alerta");
  }
}

function limpiar(zona) {
  const destino = document.getElementById(zona);
  destino.textContent = "";
}