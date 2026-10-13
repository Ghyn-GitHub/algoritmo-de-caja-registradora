console.log(
  `%c╔══════════════════════════════════════════╗
║        💶  CAJA REGISTRADORA  💶        ║
╚══════════════════════════════════════════╝%c

📌 CÓMO SE USA
   procesarPago(precio, crearPago({ valor: cantidad }))

   · El precio va en EUROS:  12,80 € → 12.80
   · El pago es un objeto: clave = valor en euros,
     número = cuántos billetes/monedas entrega.

💡 EJEMPLO
   procesarPago(12.80, crearPago({ 20: 1, 5: 1 }))
   → paga 12,80 € con un billete de 20 € y uno de 5 €

🪙 VALORES ADMITIDOS (en euros)
   Billetes: 500 · 200 · 100 · 50 · 20 · 10 · 5
   Monedas:  2 · 1 · 0.5 · 0.2 · 0.1 · 0.05 · 0.02 · 0.01
`,
  "color: #2e7d32; font-weight: bold;",
  "color: inherit;",
);

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
  const precioCentimos = Math.round(precio * 100);

  const pagado = calcularTotal(pago);
  if (pagado < precioCentimos) {
    return console.log("Te falta ruca");
  }
  if (pagado === precioCentimos) {
    for (let i = 0; i < pago.length; i++) {
      caja[i].cantidad += pago[i].cantidad;
    }
    return console.log("Está justo");
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
    return console.log("Voy al bar a por cambio");
  }

  for (let i = 0; i < desglose.length; i++) {
    caja[i].cantidad -= desglose[i].cantidad;
  }

  console.log("──────────────────────────");
  console.log("Cambio:");
  for (let i = 0; i < desglose.length; i++) {
    if (desglose[i].cantidad > 0) {
      console.log(`${desglose[i].cantidad} x ${desglose[i].valor / 100} €`);
    }
  }
  console.log("Total cambio:", (calcularTotal(desglose) / 100).toFixed(2), "€");

  console.log("──────────────────────────");

  console.log("Caja restante:");
  for (let i = 0; i < caja.length; i++) {
    if (caja[i].cantidad > 0) {
      console.log(`${caja[i].cantidad} x ${caja[i].valor / 100} €`);
    }
  }
  console.log("Total caja:", (calcularTotal(caja) / 100).toFixed(2), "€");
  console.log("──────────────────────────");
}

function crearPago(entregado) {
  return caja.map((item) => ({
    valor: item.valor,
    cantidad: entregado[item.valor / 100] || 0,
  }));
}
