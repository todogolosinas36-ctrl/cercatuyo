/**
 * Retorna la fecha del turno vigente (formato YYYY-MM-DD).
 * Tiene en cuenta que antes de las 08:00 AM sigue vigente el turno del día anterior.
 * Zona horaria: 'America/Argentina/Tucuman'.
 */
export function fechaTurnoVigente(): string {
  const timeZone = 'America/Argentina/Tucuman';
  const ahora = new Date();

  const formateador = new Intl.DateTimeFormat('es-AR', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    hour12: false,
  });

  const partes = formateador.formatToParts(ahora);
  const mapa: Record<string, string> = {};
  for (const p of partes) {
    mapa[p.type] = p.value;
  }

  const anio = parseInt(mapa.year, 10);
  const mes = parseInt(mapa.month, 10) - 1; // 0-indexed para Date
  const dia = parseInt(mapa.day, 10);
  const hora = parseInt(mapa.hour, 10);

  const fechaLocal = new Date(anio, mes, dia);

  // Antes de las 08:00 hs rige el turno de la guardia iniciada el día anterior
  if (hora < 8) {
    fechaLocal.setDate(fechaLocal.getDate() - 1);
  }

  const yyyy = fechaLocal.getFullYear();
  const mm = String(fechaLocal.getMonth() + 1).padStart(2, '0');
  const dd = String(fechaLocal.getDate()).padStart(2, '0');

  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Formatea una fecha en formato YYYY-MM-DD o Date a formato amigable en español.
 * Evita saltos de fecha por desfasaje horario.
 */
export function formatearFechaTurno(fecha: string | Date): string {
  const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const meses = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
  ];

  let fechaObj: Date;
  if (typeof fecha === 'string') {
    const soloFecha = fecha.split('T')[0];
    const partes = soloFecha.split('-');
    if (partes.length === 3) {
      const [anio, mes, dia] = partes.map(Number);
      fechaObj = new Date(anio, mes - 1, dia);
    } else {
      fechaObj = new Date(fecha);
    }
  } else {
    fechaObj = fecha;
  }

  const diaSemana = diasSemana[fechaObj.getDay()];
  const dia = fechaObj.getDate();
  const mes = meses[fechaObj.getMonth()];
  const anio = fechaObj.getFullYear();

  return `${diaSemana}, ${dia} de ${mes} de ${anio}`;
}
