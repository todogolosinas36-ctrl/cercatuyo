export interface Coordenadas {
  lat: number;
  lng: number;
}

export interface Farmacia {
  id: string;
  nombre: string;
  direccion: string;
  telefono: string;
  ubicacion: string; // 'Aguilares', 'Concepción', 'Monteros', etc.
  localidad?: string; // Sinónimo para organización provincial
  coordenadas?: Coordenadas;
  linkMapa?: string; // Enlace a Google Maps
  horarioHabitual?: string;
  deTurnoHoy?: boolean;
  fuente?: string;
}

export interface CronogramaTurno {
  fecha: string; // Formato 'YYYY-MM-DD'
  farmaciasIds: string[]; // IDs de las farmacias que están de turno ese día
  horaInicio?: string; // Por ej. '08:00'
  horaFin?: string; // Por ej. '08:00' (día siguiente)
  nota?: string;
}

export interface FarmaciasTurnoJSON {
  ultimaActualizacion?: string;
  fecha?: string;
  fechaTexto?: string;
  horarioVigencia?: string;
  fuente?: string;
  totalLocalidades?: number;
  totalFarmacias?: number;
  localidades?: string[];
  farmacias?: Farmacia[];
  farmaciasDeTurno?: Farmacia[];
}

/**
 * Padrón base de farmacias reales de Aguilares
 */
export const FARMACIAS_AGUILARES: Farmacia[] = [
  {
    id: 'farm_ag_delmilagro',
    nombre: 'Farmacia Del Milagro',
    direccion: 'J.B. Alberdi 864',
    telefono: '03865483416',
    ubicacion: 'Aguilares',
    localidad: 'Aguilares',
    coordenadas: { lat: -27.4338, lng: -65.6162 },
    linkMapa: 'https://www.google.com/maps/search/?api=1&query=-27.4338,-65.6162+(Farmacia+Del+Milagro)',
    horarioHabitual: '08:00 a 13:00 - 17:00 a 21:30',
  },
  {
    id: 'farm_ag_cordoba',
    nombre: 'Farmacia Córdoba',
    direccion: 'Av. Sarmiento 621',
    telefono: '03865481582',
    ubicacion: 'Aguilares',
    localidad: 'Aguilares',
    coordenadas: { lat: -27.4352, lng: -65.6128 },
    linkMapa: 'https://www.google.com/maps/search/?api=1&query=-27.4352,-65.6128+(Farmacia+Cordoba)',
    horarioHabitual: '08:00 a 13:00 - 17:00 a 22:00',
  },
  {
    id: 'farm_ag_nueva',
    nombre: 'Farmacia Nueva',
    direccion: 'Av. Sarmiento 1301',
    telefono: '03865483764',
    ubicacion: 'Aguilares',
    localidad: 'Aguilares',
    coordenadas: { lat: -27.441, lng: -65.6105 },
    linkMapa: 'https://www.google.com/maps/search/?api=1&query=-27.4410,-65.6105+(Farmacia+Nueva)',
    horarioHabitual: '08:00 a 13:00 - 17:00 a 21:30',
  },
  {
    id: 'farm_ag_sanmartin',
    nombre: 'Farmacia San Martín de Porres',
    direccion: 'San Martín 633',
    telefono: '03865482075',
    ubicacion: 'Aguilares',
    localidad: 'Aguilares',
    coordenadas: { lat: -27.4325, lng: -65.615 },
    linkMapa: 'https://www.google.com/maps/search/?api=1&query=-27.4325,-65.6150+(Farmacia+San+Martin+de+Porres)',
    horarioHabitual: '08:00 a 13:00 - 17:00 a 21:30',
  },
  {
    id: 'farm_ag_valle',
    nombre: 'Farmacia Virgen del Valle',
    direccion: 'Aristóbulo del Valle 763',
    telefono: '03865481521',
    ubicacion: 'Aguilares',
    localidad: 'Aguilares',
    coordenadas: { lat: -27.434, lng: -65.6185 },
    linkMapa: 'https://www.google.com/maps/search/?api=1&query=-27.4340,-65.6185+(Farmacia+Virgen+del+Valle)',
    horarioHabitual: '08:00 a 13:00 - 17:00 a 21:30',
  },
  {
    id: 'farm_ag_sanmartin_alberdi',
    nombre: 'Farmacia San Martín',
    direccion: 'J.B. Alberdi 2395',
    telefono: '03865414964',
    ubicacion: 'Aguilares',
    localidad: 'Aguilares',
    coordenadas: { lat: -27.431, lng: -65.621 },
    linkMapa: 'https://www.google.com/maps/search/?api=1&query=-27.4310,-65.6210+(Farmacia+San+Martin)',
    horarioHabitual: '08:30 a 13:00 - 17:30 a 21:30',
  },
  {
    id: 'farm_ag_sanmiguel',
    nombre: 'Farmacia San Miguel',
    direccion: 'Av. Mitre 761',
    telefono: '03865482900',
    ubicacion: 'Aguilares',
    localidad: 'Aguilares',
    coordenadas: { lat: -27.4365, lng: -65.614 },
    linkMapa: 'https://www.google.com/maps/search/?api=1&query=-27.4365,-65.6140+(Farmacia+San+Miguel)',
    horarioHabitual: '08:00 a 13:00 - 17:00 a 21:30',
  },
  {
    id: 'farm_ag_delbarrio1demayo',
    nombre: 'Farmacia del Barrio 1º de Mayo',
    direccion: 'Alberdi 418',
    telefono: '03865481582',
    ubicacion: 'Aguilares',
    localidad: 'Aguilares',
    coordenadas: { lat: -27.433, lng: -65.6155 },
    linkMapa: 'https://www.google.com/maps/search/?api=1&query=-27.4330,-65.6155+(Farmacia+del+Barrio+1+de+Mayo)',
    horarioHabitual: '08:00 a 13:00 - 17:00 a 21:30',
  },
];

/**
 * Farmacias base de otras ciudades del sur tucumano
 */
export const FARMACIAS_SUR_TUCUMANO: Farmacia[] = [
  ...FARMACIAS_AGUILARES,
  {
    id: 'farm_con_mitre',
    nombre: 'Farmacia Mitre',
    direccion: 'San Martín 789',
    telefono: '03865421000',
    ubicacion: 'Concepción',
    localidad: 'Concepción',
    coordenadas: { lat: -27.345, lng: -65.592 },
    linkMapa: 'https://www.google.com/maps/search/?api=1&query=-27.3450,-65.5920+(Farmacia+Mitre+Concepcion)',
    horarioHabitual: '08:00 a 13:00 - 17:00 a 22:00',
  },
  {
    id: 'farm_mon_centro',
    nombre: 'Farmacia del Centro',
    direccion: 'Colón 123',
    telefono: '03863426000',
    ubicacion: 'Monteros',
    localidad: 'Monteros',
    coordenadas: { lat: -27.167, lng: -65.498 },
    linkMapa: 'https://www.google.com/maps/search/?api=1&query=-27.1670,-65.4980+(Farmacia+del+Centro+Monteros)',
    horarioHabitual: '08:00 a 13:00 - 17:00 a 22:00',
  },
];

// Carga dinámica de farmaciasTurno.json
export let farmaciasTurnoExtraidas: FarmaciasTurnoJSON | null = null;

try {
  farmaciasTurnoExtraidas = require('./farmaciasTurno.json');
} catch {
  try {
    farmaciasTurnoExtraidas = require('./data/farmaciasTurno.json');
  } catch {
    farmaciasTurnoExtraidas = null;
  }
}

// Directorio global de farmacias
export const DIRECTORIO_FARMACIAS: Farmacia[] = (() => {
  const base = [...FARMACIAS_SUR_TUCUMANO];
  const extraidas = farmaciasTurnoExtraidas?.farmacias || farmaciasTurnoExtraidas?.farmaciasDeTurno;
  if (Array.isArray(extraidas)) {
    extraidas.forEach(ext => {
      const existe = base.some(
        b => b.id === ext.id || (b.nombre.toLowerCase() === ext.nombre.toLowerCase() && b.ubicacion.toLowerCase() === (ext.ubicacion || ext.localidad || '').toLowerCase())
      );
      if (!existe) {
        base.push({
          ...ext,
          localidad: ext.localidad || ext.ubicacion,
          ubicacion: ext.ubicacion || ext.localidad || 'Aguilares',
        });
      }
    });
  }
  return base;
})();

/**
 * Formatea una fecha en formato 'YYYY-MM-DD' en hora local
 */
export function formatearFechaYYYYMMDD(fecha: Date = new Date()): string {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
}

/**
 * Determina la fecha de turno activa según la hora actual.
 * En Tucumán, el turno de farmacia cubre 24 horas y rota a las 08:00 AM.
 * Por lo tanto, si la consulta se realiza antes de las 08:00 AM, el turno activo
 * vigente corresponde a la fecha del día anterior.
 */
export function obtenerFechaTurnoActivo(fechaReferencia: Date = new Date()): string {
  const f = new Date(fechaReferencia);
  if (f.getHours() < 8) {
    f.setDate(f.getDate() - 1);
  }
  return formatearFechaYYYYMMDD(f);
}

/**
 * Genera un cronograma de respaldo determinista
 */
export function generarCronogramaTurnos(
  farmacias: Farmacia[] = FARMACIAS_AGUILARES,
  diasAtras: number = 7,
  diasAdelante: number = 30
): { array: CronogramaTurno[]; mapa: Record<string, string[]> } {
  const array: CronogramaTurno[] = [];
  const mapa: Record<string, string[]> = {};
  if (farmacias.length === 0) return { array, mapa };

  const hoy = new Date();

  for (let offset = -diasAtras; offset <= diasAdelante; offset++) {
    const d = new Date(hoy);
    d.setDate(hoy.getDate() + offset);

    const fechaStr = formatearFechaYYYYMMDD(d);

    const diasEpoch = Math.floor(
      (d.getTime() - d.getTimezoneOffset() * 60000) / (1000 * 60 * 60 * 24)
    );
    const indice = Math.abs(diasEpoch) % farmacias.length;
    const farmaciaAsignada = farmacias[indice];

    const item: CronogramaTurno = {
      fecha: fechaStr,
      farmaciasIds: [farmaciaAsignada.id],
      horaInicio: '08:00',
      horaFin: '08:00',
      nota: 'Turno oficial de 24 hs (de 08:00 a 08:00 hs)',
    };

    array.push(item);
    mapa[fechaStr] = [farmaciaAsignada.id];
  }

  return { array, mapa };
}

const _cronogramaData = generarCronogramaTurnos(FARMACIAS_AGUILARES);
export const CRONOGRAMA_TURNOS_MAPA: Record<string, string[]> = _cronogramaData.mapa;
export const TURNOS_FARMACIAS: CronogramaTurno[] = _cronogramaData.array;

/**
 * Devuelve la lista única de localidades disponibles
 * (Aguilares siempre figura al inicio para acceso rápido preferencial)
 */
export function obtenerLocalidadesDisponibles(): string[] {
  const locsJson = farmaciasTurnoExtraidas?.localidades;
  if (Array.isArray(locsJson) && locsJson.length > 0) {
    const resto = locsJson.filter(l => l.toLowerCase() !== 'aguilares');
    return ['Aguilares', ...resto];
  }

  // Localidades por defecto del padrón
  const dePadron = [...new Set(DIRECTORIO_FARMACIAS.map(f => f.localidad || f.ubicacion))].sort();
  const resto = dePadron.filter(l => l.toLowerCase() !== 'aguilares');
  return ['Aguilares', ...resto];
}

/**
 * Consulta las farmacias de turno para una fecha determinada en formato 'YYYY-MM-DD'.
 */
export function obtenerFarmaciasDeTurno(
  fechaStr: string = formatearFechaYYYYMMDD(),
  cronograma: CronogramaTurno[] = TURNOS_FARMACIAS,
  directorio: Farmacia[] = DIRECTORIO_FARMACIAS
): Farmacia[] {
  // Si el archivo JSON tiene farmacias de guardia para esta fecha, priorizarlas
  const listaJson = farmaciasTurnoExtraidas?.farmacias || farmaciasTurnoExtraidas?.farmaciasDeTurno;
  if (
    farmaciasTurnoExtraidas &&
    farmaciasTurnoExtraidas.fecha === fechaStr &&
    Array.isArray(listaJson) &&
    listaJson.length > 0
  ) {
    return listaJson;
  }

  // Búsqueda en mapa determinista
  const idsDirectos = CRONOGRAMA_TURNOS_MAPA[fechaStr];
  if (idsDirectos && idsDirectos.length > 0) {
    return directorio.filter(f => idsDirectos.includes(f.id));
  }

  const turno = cronograma.find(t => t.fecha === fechaStr);
  if (turno && turno.farmaciasIds.length > 0) {
    return directorio.filter(f => turno.farmaciasIds.includes(f.id));
  }

  const [y, m, d] = fechaStr.split('-').map(Number);
  const fechaObj = new Date(y, m - 1, d);
  const diasEpoch = Math.floor(
    (fechaObj.getTime() - fechaObj.getTimezoneOffset() * 60000) / (1000 * 60 * 60 * 24)
  );
  const farmaciasAguilares = directorio.filter(f => (f.localidad || f.ubicacion) === 'Aguilares');
  if (farmaciasAguilares.length === 0) return [];
  const indice = Math.abs(diasEpoch) % farmaciasAguilares.length;
  return [farmaciasAguilares[indice]];
}

/**
 * Función principal para obtener las farmacias de turno activo.
 *
 * @param fechaActual Objeto Date o string en formato 'YYYY-MM-DD'
 * @param localidad Nombre de la localidad a filtrar (ej. 'Aguilares', 'Concepción', o 'Todas')
 * @returns Lista de farmacias de guardia activas
 */
export function obtenerFarmaciasDeTurnoHoy(
  fechaActual: Date | string = new Date(),
  localidad: string = 'Aguilares'
): Farmacia[] {
  let fechaConsultaStr: string;

  if (typeof fechaActual === 'string') {
    fechaConsultaStr = fechaActual;
  } else {
    fechaConsultaStr = obtenerFechaTurnoActivo(fechaActual);
  }

  const todasDeTurno = obtenerFarmaciasDeTurno(fechaConsultaStr, TURNOS_FARMACIAS, DIRECTORIO_FARMACIAS);

  if (!localidad || localidad === 'Todas') {
    return todasDeTurno;
  }

  const filtradas = todasDeTurno.filter(
    f => (f.localidad || f.ubicacion || '').toLowerCase() === localidad.toLowerCase()
  );

  return filtradas;
}

/**
 * Devuelve metadatos del turno oficial (vigencia y fuente)
 */
export function obtenerInfoTurnoOficial(): {
  fechaTexto: string;
  vigencia: string;
  fuente: string;
} {
  const hoy = new Date();
  const dia = String(hoy.getDate()).padStart(2, '0');
  const mes = String(hoy.getMonth() + 1).padStart(2, '0');
  const anio = hoy.getFullYear();

  return {
    fechaTexto: farmaciasTurnoExtraidas?.fechaTexto || `${dia}/${mes}/${anio}`,
    vigencia:
      farmaciasTurnoExtraidas?.horarioVigencia ||
      '08:00 hs del día indicado hasta las 08:00 hs del día siguiente (24 hs continuas)',
    fuente:
      farmaciasTurnoExtraidas?.fuente || 'Colegio de Farmacéuticos de Tucumán (COFATUC)',
  };
}

export const obtenerCiudadesFarmacias = (): string[] => {
  return obtenerLocalidadesDisponibles();
};
