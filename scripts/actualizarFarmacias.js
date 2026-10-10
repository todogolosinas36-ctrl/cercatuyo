/**
 * Script Extractor Provincial de Farmacias de Turno
 * Fuente: Colegio de Farmacéuticos de Tucumán (COFATUC)
 * URL: https://cofatuc.org.ar/farmacias-de-turno/
 *
 * Extrae todas las localidades de Tucumán (Aguilares, Concepción, Monteros,
 * San Miguel de Tucumán, Famaillá, Yerba Buena, etc.) y genera data/farmaciasTurno.json
 *
 * Uso:
 *  node scripts/actualizarFarmacias.js
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');

const URL_COFATUC = 'https://cofatuc.org.ar/farmacias-de-turno/';
const URL_TURNOHOY = 'https://turnohoy.com/farmacias/tucuman/aguilares/';

const ARCHIVO_DESTINO = path.join(__dirname, '..', 'data', 'farmaciasTurno.json');

const HTTP_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'es-AR,es;q=0.9,en;q=0.8',
};

/**
 * Convierte un nombre en Title Case respetando conectores
 */
function capitalizarNombre(texto) {
  if (!texto) return '';

  let limpio = texto
    .replace(/^farmacia\s*[:\-]?\s*/i, '')
    .trim();

  const palabras = limpio.toLowerCase().split(/\s+/).filter(Boolean);
  const conectores = ['de', 'del', 'la', 'las', 'el', 'los', 'y', 'en', 's.a.', 's.r.l.', 's.h.'];

  const formateado = palabras
    .map((p, idx) => {
      if (idx > 0 && conectores.includes(p)) return p;
      return p.charAt(0).toUpperCase() + p.slice(1);
    })
    .join(' ');

  return `Farmacia ${formateado}`;
}

/**
 * Normaliza teléfonos limpiando caracteres extraños
 */
function normalizarTelefono(telefonoOriginal, localidad) {
  if (!telefonoOriginal) return '';

  let limpio = telefonoOriginal.replace(/[^\d]/g, '');

  // Códigos de área habituales en Tucumán
  // San Miguel, Yerba Buena, Banda del Río Salí, Alderetes, Tafí Viejo: 381
  // Concepción, Aguilares, Alberdi: 3865
  // Monteros, Famaillá, Simoca: 3863
  if (limpio.length === 7) {
    // Número local de 7 dígitos sin prefijo (ej: 4865514)
    if (/aguilares|concepci[oó]n|alberdi/i.test(localidad)) {
      return `03865${limpio}`;
    } else if (/monteros|famaill[aá]|simoca/i.test(localidad)) {
      return `03863${limpio}`;
    } else {
      return `0381${limpio}`;
    }
  }

  if (limpio.startsWith('3865') || limpio.startsWith('3863') || limpio.startsWith('381')) {
    return `0${limpio}`;
  }

  return limpio;
}

/**
 * Normaliza dirección
 */
function normalizarDireccion(direccionOriginal) {
  if (!direccionOriginal) return '';
  return direccionOriginal
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/,\s*,/g, ',');
}

/**
 * Genera un ID slug determinista
 */
function generarSlug(localidad, nombre) {
  const base = `${localidad}_${nombre}`
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
  return `farm_${base}`;
}

/**
 * Parsea el HTML de COFATUC extrayendo todas las localidades y farmacias de turno
 */
function parsearCofatuc(html) {
  const $ = cheerio.load(html);
  const farmacias = [];
  const localidadesSet = new Set();

  // Extraer fecha del turno del encabezado si está disponible (ej: "Farmacias de Turno para el 10/10/2026")
  let fechaTexto = '';
  let fechaISO = '';

  const tituloH1 = $('h1').text();
  const matchFecha = tituloH1.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (matchFecha) {
    const [, dia, mes, anio] = matchFecha;
    fechaTexto = `${dia.padStart(2, '0')}/${mes.padStart(2, '0')}/${anio}`;
    fechaISO = `${anio}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
  } else {
    const hoy = new Date();
    const anio = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');
    fechaISO = `${anio}-${mes}-${dia}`;
    fechaTexto = `${dia}/${mes}/${anio}`;
  }

  // Localizar contenedor principal de las farmacias
  const contenedor = $('.listado-de-farmacias, .entry-content');

  // Encontrar todos los h2 que representan las localidades
  contenedor.find('h2').each((_, h2El) => {
    const $h2 = $(h2El);
    let localidad = $h2.text().trim();

    // Descartar encabezados ajenos como "Banners", "Autogestión", etc.
    if (!localidad || /banners|autogesti|publicidad|men[uú]|aviso/i.test(localidad)) {
      return;
    }

    localidadesSet.add(localidad);

    // Recorrer los hermanos hasta el próximo h2
    let actual = $h2.next();
    let farmaciaActual = {
      nombre: '',
      telefono: '',
      domicilio: '',
    };

    const guardarFarmaciaActual = () => {
      if (farmaciaActual.nombre && farmaciaActual.domicilio) {
        const nombreNorm = capitalizarNombre(farmaciaActual.nombre);
        const dirNorm = normalizarDireccion(farmaciaActual.domicilio);
        const telNorm = normalizarTelefono(farmaciaActual.telefono, localidad);

        farmacias.push({
          id: generarSlug(localidad, nombreNorm),
          nombre: nombreNorm,
          direccion: dirNorm,
          telefono: telNorm,
          localidad: localidad,
          ubicacion: localidad, // Alias para compatibilidad
          fecha: fechaISO,
          linkMapa: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            `${nombreNorm} ${dirNorm} ${localidad} Tucuman`
          )}`,
          deTurnoHoy: true,
          fuente: 'COFATUC',
        });
      }
      farmaciaActual = { nombre: '', telefono: '', domicilio: '' };
    };

    while (actual.length && !actual.is('h2')) {
      if (actual.is('hr')) {
        // Un separador <hr> indica fin de una farmacia dentro de la misma localidad
        guardarFarmaciaActual();
      } else if (actual.is('p')) {
        const texto = actual.text().trim();

        const matchFarm = texto.match(/Farmacia\s*:\s*(.+)/i);
        if (matchFarm) {
          farmaciaActual.nombre = matchFarm[1].trim();
        }

        const matchTel = texto.match(/Tel[eé]fono\s*:\s*(.+)/i);
        if (matchTel) {
          farmaciaActual.telefono = matchTel[1].trim();
        }

        const matchDom = texto.match(/Domicilio\s*:\s*(.+)/i);
        if (matchDom) {
          farmaciaActual.domicilio = matchDom[1].trim();
        }
      }

      actual = actual.next();
    }

    // Guardar la última farmacia de esta localidad si quedó pendiente
    guardarFarmaciaActual();
  });

  return {
    fechaISO,
    fechaTexto,
    farmacias,
    localidades: Array.from(localidadesSet).sort((a, b) => a.localeCompare(b, 'es')),
  };
}

/**
 * Respaldo para TurnoHoy si fuese necesario complementar Aguilares
 */
async function extraerTurnoHoyAguilares() {
  try {
    const res = await axios.get(URL_TURNOHOY, { headers: HTTP_HEADERS, timeout: 8000 });
    const $ = cheerio.load(res.data);
    let detectada = null;

    $('h2, h3').each((_, el) => {
      if ($(el).text().toLowerCase().includes('de turno hoy')) {
        const li = $(el).closest('section').find('li').first();
        const nom = li.find('a.font-bold, a[href*="/farmacias/"]').first().text().trim();
        const dir = li.find('p').first().text().trim();
        const tel = li.find('a[href^="tel:"]').attr('href') || '';
        if (nom && dir) {
          detectada = {
            id: generarSlug('Aguilares', nom),
            nombre: capitalizarNombre(nom),
            direccion: normalizarDireccion(dir),
            telefono: normalizarTelefono(tel.replace('tel:', ''), 'Aguilares') || '03865481582',
            localidad: 'Aguilares',
            ubicacion: 'Aguilares',
            deTurnoHoy: true,
            fuente: 'TurnoHoy',
          };
        }
      }
    });

    return detectada;
  } catch {
    return null;
  }
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('🏛️  EXTRACTOR PROVINCIAL DE FARMACIAS DE TURNO (COFATUC)');
  console.log(`🌐  Consultando: ${URL_COFATUC}`);
  console.log('═══════════════════════════════════════════════════════════════════');

  let htmlCofatuc = '';
  let exitoCofatuc = false;

  try {
    const respuesta = await axios.get(URL_COFATUC, {
      headers: HTTP_HEADERS,
      timeout: 15000,
    });
    htmlCofatuc = respuesta.data;
    exitoCofatuc = true;
    console.log('✅ Conexión con COFATUC establecida exitosamente.');
  } catch (errHttp) {
    console.warn(`⚠️ Error al conectar a COFATUC: ${errHttp.message}`);
  }

  let parsed = { farmacias: [], localidades: [], fechaISO: '', fechaTexto: '' };

  if (exitoCofatuc && htmlCofatuc) {
    parsed = parsearCofatuc(htmlCofatuc);
  }

  // Si Aguilares no vino en COFATUC o COFATUC falló, complementar con TurnoHoy
  const tieneAguilares = parsed.farmacias.some(f => /aguilares/i.test(f.localidad));
  if (!tieneAguilares) {
    console.log('ℹ️ Consultando turno específico de Aguilares como respaldo...');
    const farmaciaAguilares = await extraerTurnoHoyAguilares();
    if (farmaciaAguilares) {
      farmaciaAguilares.fecha = parsed.fechaISO || new Date().toISOString().split('T')[0];
      farmaciaAguilares.linkMapa = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${farmaciaAguilares.nombre} ${farmaciaAguilares.direccion} Aguilares Tucuman`
      )}`;
      parsed.farmacias.unshift(farmaciaAguilares);
      if (!parsed.localidades.includes('Aguilares')) {
        parsed.localidades.unshift('Aguilares');
      }
    }
  }

  // Asegurar fecha por defecto
  const hoy = new Date();
  const fechaISO =
    parsed.fechaISO ||
    `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(
      hoy.getDate()
    ).padStart(2, '0')}`;
  const fechaTexto = parsed.fechaTexto || `${hoy.getDate()}/${hoy.getMonth() + 1}/${hoy.getFullYear()}`;

  // Estructura completa de salida para data/farmaciasTurno.json
  const dataFinal = {
    ultimaActualizacion: new Date().toISOString(),
    fecha: fechaISO,
    fechaTexto: fechaTexto,
    horarioVigencia: '08:00 hs a 08:00 hs del día siguiente (24 horas)',
    fuente: 'Colegio de Farmacéuticos de Tucumán (COFATUC)',
    totalLocalidades: parsed.localidades.length,
    totalFarmacias: parsed.farmacias.length,
    localidades: parsed.localidades,
    farmacias: parsed.farmacias,
    // Alias farmaciasDeTurno para retrocompatibilidad
    farmaciasDeTurno: parsed.farmacias,
  };

  // Guardar archivo
  const dirDestino = path.dirname(ARCHIVO_DESTINO);
  if (!fs.existsSync(dirDestino)) {
    fs.mkdirSync(dirDestino, { recursive: true });
  }

  fs.writeFileSync(ARCHIVO_DESTINO, JSON.stringify(dataFinal, null, 2), 'utf-8');

  // Informe detallado por consola
  console.log('\n───────────────────────────────────────────────────────────────────');
  console.log(`📋 LOCALIDADES DETECTADAS (${parsed.localidades.length}):`);
  console.log(`   ${parsed.localidades.join(' • ')}`);
  console.log('───────────────────────────────────────────────────────────────────');
  console.log(`🏥 TOTAL DE FARMACIAS EN GUARDIA: ${parsed.farmacias.length}`);
  console.log('───────────────────────────────────────────────────────────────────');

  // Mostrar resumen agrupado por localidad
  parsed.localidades.forEach(loc => {
    const farmaciasLoc = parsed.farmacias.filter(f => f.localidad === loc);
    console.log(`📍 ${loc.toUpperCase()} (${farmaciasLoc.length}):`);
    farmaciasLoc.forEach(f => {
      console.log(`   • ${f.nombre} | ${f.direccion} | Tel: ${f.telefono || 'Sin dato'}`);
    });
  });

  console.log('\n───────────────────────────────────────────────────────────────────');
  console.log(`💾 Archivo guardado: ${path.relative(process.cwd(), ARCHIVO_DESTINO)}`);
  console.log(`⏰ Vigencia del turno: 08:00 hs a 08:00 hs del día siguiente`);
  console.log('═══════════════════════════════════════════════════════════════════\n');
}

main().catch(err => {
  console.error('❌ Error ejecutando extractor:', err);
  process.exit(1);
});
