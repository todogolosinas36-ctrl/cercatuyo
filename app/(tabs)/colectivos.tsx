import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Platform,
  Modal,
  Pressable,
  TextInput,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { TODOS_LOS_VIAJES, PRECIOS_TESA, Viaje } from '@/data/horarios';
import {
  GUTIERREZ_DATA,
  TipoDiaGutierrez,
  ServicioGutierrezIda,
  ServicioGutierrezVuelta,
} from '@/constants/gutierrez';

type EmpresaTipo = 'TESA' | 'Exprebus' | 'Gutierrez';
type DireccionGutierrez = 'ida' | 'vuelta';

const CIUDADES = [
  'Tucumán',
  'Lules',
  'Famaillá',
  'Fronterita',
  'Nva. Baviera',
  'Acheral',
  'R. Colorado',
  'Monteros',
  'Santa Lucía',
  'Cáceres',
  'Sgto. Moya',
  'Río Seco',
  'Concepción',
  'Aguilares',
  'Santa Ana',
  'Alberdi',
  'La Cocha',
  'Los Pizarro',
  'Río Huacra',
];

const TIPOS_DIA = ['Lunes a Viernes', 'Sábados', 'Domingos/Feriados'];

const EMPRESAS: { id: EmpresaTipo; label: string }[] = [
  { id: 'TESA', label: 'TESA' },
  { id: 'Exprebus', label: 'Exprebus' },
  { id: 'Gutierrez', label: 'Gutiérrez (Interurbano)' },
];

const DIAS_GUTIERREZ: { id: TipoDiaGutierrez; label: string; badge: string }[] = [
  { id: 'habiles', label: 'Lunes a Viernes', badge: '28 serv.' },
  { id: 'sabados', label: 'Sábados', badge: '9 serv.' },
  { id: 'domingos', label: 'Domingos y Feriados', badge: '3 serv.' },
];

// Función auxiliar para calcular duración estimada entre dos horas formato HH:mm
function calcularDuracion(horaSalida: string, horaLlegada: string): string {
  const [h1, m1] = horaSalida.split(':').map(Number);
  const [h2, m2] = horaLlegada.split(':').map(Number);
  let minutosTotales = h2 * 60 + m2 - (h1 * 60 + m1);
  if (minutosTotales < 0) minutosTotales += 24 * 60; // caso cruce de medianoche

  const horas = Math.floor(minutosTotales / 60);
  const minutos = minutosTotales % 60;
  if (horas === 0) return `${minutos}m`;
  if (minutos === 0) return `${horas}h`;
  return `${horas}h ${minutos}m`;
}

// Función auxiliar para consultar tarifa TESA
function obtenerPrecio(origen: string, destino: string): string {
  const rutaDirecta = `${origen}-${destino}`;
  const rutaInversa = `${destino}-${origen}`;
  return PRECIOS_TESA[rutaDirecta] || PRECIOS_TESA[rutaInversa] || 'Consultar';
}

// Helpers visuales para badges de destino de Gutiérrez
function getDestinoBadgeStyle(destino?: string | null) {
  if (!destino) return { backgroundColor: '#F1F5F9', borderColor: '#E2E8F0' };
  const d = destino.toLowerCase();
  if (d.includes('matienzo') || d.includes('b.m.')) {
    return { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' };
  }
  if (d.includes('francia')) {
    return { backgroundColor: '#EEF2FF', borderColor: '#C7D2FE' };
  }
  if (d.includes('shipton')) {
    return { backgroundColor: '#FAF5FF', borderColor: '#E9D5FF' };
  }
  if (d.includes('cristo rey') || d.includes('c.c.rey')) {
    return { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' };
  }
  if (d.includes('santa rita') || d.includes('sta. rita')) {
    return { backgroundColor: '#F5F3FF', borderColor: '#DDD6FE' };
  }
  if (d.includes('san carlos') || d.includes('s.c.')) {
    return { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' };
  }
  if (d.includes('terminal')) {
    return { backgroundColor: '#ECFDF5', borderColor: '#BBF7D0' };
  }
  if (d.includes('taller')) {
    return { backgroundColor: '#F1F5F9', borderColor: '#CBD5E1' };
  }
  if (d.includes('monteagudo')) {
    return { backgroundColor: '#F0F9FF', borderColor: '#BAE6FD' };
  }
  if (d.includes('medinas')) {
    return { backgroundColor: '#F0FDFA', borderColor: '#99F6E4' };
  }
  return { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' };
}

function getDestinoBadgeColor(destino?: string | null) {
  if (!destino) return '#475569';
  const d = destino.toLowerCase();
  if (d.includes('matienzo') || d.includes('b.m.')) return '#1D4ED8';
  if (d.includes('francia')) return '#4338CA';
  if (d.includes('shipton')) return '#7E22CE';
  if (d.includes('cristo rey') || d.includes('c.c.rey')) return '#047857';
  if (d.includes('santa rita') || d.includes('sta. rita')) return '#6D28D9';
  if (d.includes('san carlos') || d.includes('s.c.')) return '#B45309';
  if (d.includes('terminal')) return '#059669';
  if (d.includes('taller')) return '#475569';
  if (d.includes('monteagudo')) return '#0284C7';
  if (d.includes('medinas')) return '#0F766E';
  return '#334155';
}

export default function ColectivosScreen() {
  const [isMounted, setIsMounted] = useState(false);

  // Selector de Empresa Activa
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState<EmpresaTipo>('TESA');

  // Estados para TESA / Exprebus
  const [origen, setOrigen] = useState('Tucumán');
  const [destino, setDestino] = useState('Concepción');
  const [tipoDia, setTipoDia] = useState('Lunes a Viernes');
  const [resultados, setResultados] = useState<Viaje[]>([]);
  const [haBuscado, setHaBuscado] = useState(false);

  // Estados para Modal de Selección (TESA / Exprebus)
  const [modalVisible, setModalVisible] = useState(false);
  const [seleccionando, setSeleccionando] = useState<'origen' | 'destino' | 'dia'>('origen');

  // Estados específicos para Empresa Gutiérrez
  const [tipoDiaGutierrez, setTipoDiaGutierrez] = useState<TipoDiaGutierrez>('habiles');
  const [direccionGutierrez, setDireccionGutierrez] = useState<DireccionGutierrez>('ida');
  const [busquedaGutierrez, setBusquedaGutierrez] = useState('');

  // Preselección automática del día actual de la semana (SSR compatible)
  useEffect(() => {
    setIsMounted(true);
    const diaSemana = new Date().getDay(); // 0: Domingo, 6: Sábado, 1-5: Lunes a Viernes
    if (diaSemana === 0) {
      setTipoDiaGutierrez('domingos');
    } else if (diaSemana === 6) {
      setTipoDiaGutierrez('sabados');
    } else {
      setTipoDiaGutierrez('habiles');
    }
  }, []);

  // Búsqueda de viajes para TESA y Exprebus
  const ejecutarBusquedaTradicional = (empresa: EmpresaTipo = empresaSeleccionada) => {
    setHaBuscado(true);
    const filtrados = TODOS_LOS_VIAJES.filter((viaje) => {
      // 1. Filtrar por empresa
      if (empresa !== 'Gutierrez' && viaje.empresa !== empresa) {
        return false;
      }

      // 2. Filtrar por el día seleccionado
      if (!viaje.dias || !viaje.dias.includes(tipoDia)) {
        return false;
      }

      // 3. Verificar que existan horarios para ambos puntos
      const horaOrigen = viaje.paradas[origen];
      const horaDestino = viaje.paradas[destino];

      if (!horaOrigen || !horaDestino) return false;

      // 4. Sentido del viaje
      const paradasArray = Object.keys(viaje.paradas);
      const indexOrigen = paradasArray.indexOf(origen);
      const indexDestino = paradasArray.indexOf(destino);

      return indexOrigen < indexDestino;
    });

    filtrados.sort((a, b) => a.paradas[origen].localeCompare(b.paradas[origen]));
    setResultados(filtrados);
  };

  const handleCambiarEmpresa = (nuevaEmpresa: EmpresaTipo) => {
    setEmpresaSeleccionada(nuevaEmpresa);
    if (nuevaEmpresa !== 'Gutierrez' && haBuscado) {
      ejecutarBusquedaTradicional(nuevaEmpresa);
    }
  };

  const abrirSelector = (tipo: 'origen' | 'destino' | 'dia') => {
    setSeleccionando(tipo);
    setModalVisible(true);
  };

  const seleccionarOpcion = (opcion: string) => {
    if (seleccionando === 'origen') {
      setOrigen(opcion);
    } else if (seleccionando === 'destino') {
      setDestino(opcion);
    } else if (seleccionando === 'dia') {
      setTipoDia(opcion);
    }
    setModalVisible(false);
  };

  const intercambiarCiudades = () => {
    setOrigen(destino);
    setDestino(origen);
  };

  // Filtrado reactivo de viajes para Gutiérrez según tipo de día y búsqueda
  const viajesGutierrezFiltrados = useMemo(() => {
    const cuadroDia =
      tipoDiaGutierrez === 'sabados'
        ? GUTIERREZ_DATA.sabados
        : tipoDiaGutierrez === 'domingos'
        ? GUTIERREZ_DATA.domingos
        : GUTIERREZ_DATA.habiles;

    const lista = direccionGutierrez === 'ida' ? cuadroDia.ida : cuadroDia.vuelta;

    if (!busquedaGutierrez.trim()) return lista;

    const term = busquedaGutierrez.trim().toLowerCase();

    if (direccionGutierrez === 'ida') {
      return (lista as ServicioGutierrezIda[]).filter((item) => {
        return (
          item.destinoFinal?.toLowerCase().includes(term) ||
          item.llegadaMedinas?.toLowerCase().includes(term) ||
          item.llegadaMonteagudo?.toLowerCase().includes(term) ||
          item.llegadaTrinidad?.toLowerCase().includes(term) ||
          item.salidaItaliaColon?.toLowerCase().includes(term) ||
          item.salidaConcepcion24Colon?.toLowerCase().includes(term) ||
          item.salidaTerminal?.toLowerCase().includes(term) ||
          item.pasoTerminal?.toLowerCase().includes(term) ||
          item.nota?.toLowerCase().includes(term)
        );
      });
    } else {
      return (lista as ServicioGutierrezVuelta[]).filter((item) => {
        return (
          item.destinoEspecial?.toLowerCase().includes(term) ||
          item.salidaMonteagudo?.toLowerCase().includes(term) ||
          item.salidaMedinas?.toLowerCase().includes(term) ||
          item.salidaTrinidad?.toLowerCase().includes(term) ||
          item.pasoTrinidad?.toLowerCase().includes(term) ||
          item.llegadaConcepcion?.toLowerCase().includes(term) ||
          item.llegadaTerminal?.toLowerCase().includes(term) ||
          item.nota?.toLowerCase().includes(term)
        );
      });
    }
  }, [tipoDiaGutierrez, direccionGutierrez, busquedaGutierrez]);

  const valorActual =
    seleccionando === 'origen'
      ? origen
      : seleccionando === 'destino'
      ? destino
      : tipoDia;

  const listaModal = seleccionando === 'dia' ? TIPOS_DIA : CIUDADES;

  const tituloModal =
    seleccionando === 'origen'
      ? 'Seleccionar Origen'
      : seleccionando === 'destino'
      ? 'Seleccionar Destino'
      : 'Día de la semana';

  const subtituloModal =
    seleccionando === 'dia'
      ? 'Frecuencias según el cronograma de viaje'
      : 'Elige una parada o localidad';

  const precioActual = obtenerPrecio(origen, destino);

  // Render Cabecera Común + Selectores
  const renderHeader = () => (
    <View>
      {/* Título de la sección con acceso secreto a admin por pulsación prolongada */}
      <TouchableOpacity
        activeOpacity={1}
        delayLongPress={2000}
        onLongPress={() => router.push('/admin' as any)}
      >
        <View style={styles.topHeader}>
          <Text style={styles.screenTitle}>Horarios de Colectivos</Text>
          <Text style={styles.screenSubtitle}>
            Consulta salidas interurbanas y de media distancia en el Sur Tucumano
          </Text>
        </View>
      </TouchableOpacity>

      {/* SELECTOR DE EMPRESA (PILL TABS) */}
      <View style={styles.companySelectorWrapper}>
        <Text style={styles.selectorSectionLabel}>Seleccionar Empresa:</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.companySelectorScroll}
        >
          {EMPRESAS.map((emp) => {
            const isActive = empresaSeleccionada === emp.id;
            return (
              <TouchableOpacity
                key={emp.id}
                style={[
                  styles.companyPill,
                  isActive && styles.companyPillActive,
                ]}
                onPress={() => handleCambiarEmpresa(emp.id)}
                activeOpacity={0.8}
              >
                <FontAwesome
                  name="bus"
                  size={13}
                  color={isActive ? '#FFFFFF' : '#64748B'}
                  style={{ marginRight: 7 }}
                />
                <Text
                  style={[
                    styles.companyPillText,
                    isActive && styles.companyPillTextActive,
                  ]}
                >
                  {emp.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* VISTA SEGÚN EMPRESA SELECCIONADA */}
      {empresaSeleccionada === 'Gutierrez' ? (
        <View style={styles.gutierrezContainer}>
          {/* Tarjeta Informativa de la Línea Gutiérrez */}
          <View style={styles.gutierrezInfoCard}>
            <View style={styles.gutierrezInfoHeader}>
              <View style={styles.gutierrezLogoBadge}>
                <Ionicons name="git-network-outline" size={18} color="#0284C7" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.gutierrezLineTitle}>
                  {tipoDiaGutierrez === 'domingos'
                    ? 'Concepción (24 y Colón) – La Trinidad – Medinas'
                    : GUTIERREZ_DATA.linea}
                </Text>
                <Text style={styles.gutierrezLineSubtitle}>
                  {tipoDiaGutierrez === 'habiles' && 'Días Hábiles (Lunes a Viernes) • 28 salidas'}
                  {tipoDiaGutierrez === 'sabados' && 'Sábados • 9 salidas'}
                  {tipoDiaGutierrez === 'domingos' && 'Domingos y Feriados • 3 salidas'}
                  {' • Vigencia: ' + GUTIERREZ_DATA.vigencia}
                </Text>
              </View>
            </View>
          </View>

          {/* SELECTOR DE TIPO DE DÍA PARA GUTIÉRREZ */}
          <View style={styles.daySelectorWrapper}>
            <Text style={styles.selectorSectionLabel}>Día de Servicio:</Text>
            <View style={styles.daySelectorRow}>
              {DIAS_GUTIERREZ.map((diaItem) => {
                const isActive = tipoDiaGutierrez === diaItem.id;
                return (
                  <TouchableOpacity
                    key={diaItem.id}
                    style={[
                      styles.dayButton,
                      isActive && styles.dayButtonActive,
                    ]}
                    onPress={() => setTipoDiaGutierrez(diaItem.id)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.dayButtonText,
                        isActive && styles.dayButtonTextActive,
                      ]}
                    >
                      {diaItem.label}
                    </Text>
                    <Text
                      style={[
                        styles.dayButtonBadge,
                        isActive && styles.dayButtonBadgeActive,
                      ]}
                    >
                      {diaItem.badge}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* SELECTOR DE DIRECCIÓN (IDA / VUELTA) */}
          <View style={styles.directionSection}>
            <Text style={styles.selectorSectionLabel}>Sentido del Viaje:</Text>
            <View style={styles.directionToggleContainer}>
              {/* Opción IDA */}
              <TouchableOpacity
                style={[
                  styles.directionTab,
                  direccionGutierrez === 'ida' && styles.directionTabActive,
                ]}
                onPress={() => setDireccionGutierrez('ida')}
                activeOpacity={0.8}
              >
                <View style={styles.directionTabHeader}>
                  <Ionicons
                    name="arrow-forward-circle"
                    size={16}
                    color={direccionGutierrez === 'ida' ? '#FFFFFF' : '#0284C7'}
                  />
                  <Text
                    style={[
                      styles.directionTabTitle,
                      direccionGutierrez === 'ida' && styles.directionTabTitleActive,
                    ]}
                  >
                    Ida
                  </Text>
                </View>
                <Text
                  style={[
                    styles.directionTabSubtext,
                    direccionGutierrez === 'ida' && styles.directionTabSubtextActive,
                  ]}
                  numberOfLines={2}
                >
                  {tipoDiaGutierrez === 'domingos'
                    ? 'Concepción (24 y Colón) ➔ La Trinidad ➔ Medinas'
                    : 'Concepción ➔ Trinidad / Medinas / Monteagudo'}
                </Text>
              </TouchableOpacity>

              {/* Opción VUELTA */}
              <TouchableOpacity
                style={[
                  styles.directionTab,
                  direccionGutierrez === 'vuelta' && styles.directionTabActive,
                ]}
                onPress={() => setDireccionGutierrez('vuelta')}
                activeOpacity={0.8}
              >
                <View style={styles.directionTabHeader}>
                  <Ionicons
                    name="arrow-back-circle"
                    size={16}
                    color={direccionGutierrez === 'vuelta' ? '#FFFFFF' : '#0284C7'}
                  />
                  <Text
                    style={[
                      styles.directionTabTitle,
                      direccionGutierrez === 'vuelta' && styles.directionTabTitleActive,
                    ]}
                  >
                    Vuelta
                  </Text>
                </View>
                <Text
                  style={[
                    styles.directionTabSubtext,
                    direccionGutierrez === 'vuelta' && styles.directionTabSubtextActive,
                  ]}
                  numberOfLines={2}
                >
                  {tipoDiaGutierrez === 'domingos'
                    ? 'Medinas ➔ La Trinidad ➔ Concepción'
                    : 'Monteagudo / Medinas / Trinidad ➔ Concepción'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* BUSCADOR / FILTRO RÁPIDO */}
          <View style={styles.searchBoxWrapper}>
            <View style={styles.searchBox}>
              <Ionicons name="search" size={17} color="#64748B" />
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar por parada o destino (ej. Medinas, Trinidad, Cristo Rey...)"
                placeholderTextColor="#94A3B8"
                value={busquedaGutierrez}
                onChangeText={setBusquedaGutierrez}
                autoCorrect={false}
              />
              {busquedaGutierrez.length > 0 && (
                <TouchableOpacity
                  onPress={() => setBusquedaGutierrez('')}
                  activeOpacity={0.7}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="close-circle" size={18} color="#94A3B8" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Título de Resultados de Gutiérrez */}
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsTitle}>
              {direccionGutierrez === 'ida'
                ? tipoDiaGutierrez === 'domingos'
                  ? 'Salidas Concepción (24 y Colón)'
                  : 'Salidas desde Concepción'
                : 'Salidas hacia Concepción'}
            </Text>
            <Text style={styles.resultsBadge}>
              {viajesGutierrezFiltrados.length}{' '}
              {viajesGutierrezFiltrados.length === 1 ? 'servicio' : 'servicios'}
            </Text>
          </View>
        </View>
      ) : (
        /* Tarjeta de Búsqueda Tradicional (TESA / Exprebus) */
        <View style={styles.searchCard}>
          {/* Selector Origen */}
          <View style={styles.selectorWrapper}>
            <Text style={styles.fieldLabel}>Origen</Text>
            <TouchableOpacity
              style={styles.selectorButton}
              activeOpacity={0.7}
              onPress={() => abrirSelector('origen')}
            >
              <View style={styles.selectorLeft}>
                <View style={[styles.circleMarker, { backgroundColor: '#2563EB' }]} />
                <Text style={styles.selectorText}>{origen}</Text>
              </View>
              <FontAwesome name="chevron-down" size={13} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {/* Botón para intercambiar origen/destino */}
          <View style={styles.dividerRow}>
            <View style={styles.dashedLine} />
            <TouchableOpacity
              style={styles.switchButton}
              activeOpacity={0.8}
              onPress={intercambiarCiudades}
            >
              <FontAwesome
                name="exchange"
                size={13}
                color="#2563EB"
                style={{ transform: [{ rotate: '90deg' }] }}
              />
            </TouchableOpacity>
          </View>

          {/* Selector Destino */}
          <View style={styles.selectorWrapper}>
            <Text style={styles.fieldLabel}>Destino</Text>
            <TouchableOpacity
              style={styles.selectorButton}
              activeOpacity={0.7}
              onPress={() => abrirSelector('destino')}
            >
              <View style={styles.selectorLeft}>
                <View style={[styles.circleMarker, { backgroundColor: '#10B981' }]} />
                <Text style={styles.selectorText}>{destino}</Text>
              </View>
              <FontAwesome name="chevron-down" size={13} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {/* Selector Día de la Semana */}
          <View style={[styles.selectorWrapper, { marginTop: 14 }]}>
            <Text style={styles.fieldLabel}>Día de la semana</Text>
            <TouchableOpacity
              style={styles.selectorButton}
              activeOpacity={0.7}
              onPress={() => abrirSelector('dia')}
            >
              <View style={styles.selectorLeft}>
                <View style={[styles.circleMarker, { backgroundColor: '#8B5CF6' }]} />
                <Text style={styles.selectorText}>{tipoDia}</Text>
              </View>
              <FontAwesome name="calendar" size={14} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {/* Botón de Búsqueda */}
          <TouchableOpacity
            style={styles.searchButton}
            activeOpacity={0.85}
            onPress={() => ejecutarBusquedaTradicional()}
          >
            <FontAwesome name="search" size={16} color="#FFFFFF" />
            <Text style={styles.searchButtonText}>Buscar Horarios {empresaSeleccionada}</Text>
          </TouchableOpacity>

          {/* Título de la lista de resultados */}
          <View style={[styles.resultsHeader, { marginTop: 24, marginBottom: 0 }]}>
            <Text style={styles.resultsTitle}>Próximas Salidas ({empresaSeleccionada})</Text>
            <Text style={styles.resultsBadge}>
              {resultados.length} {resultados.length === 1 ? 'encontrado' : 'encontrados'}
            </Text>
          </View>
        </View>
      )}
    </View>
  );

  // Render Card Especial para Gutiérrez en DOMINGOS
  const renderGutierrezCardDomingo = (item: any) => {
    const esIda = direccionGutierrez === 'ida';

    if (esIda) {
      const horaSalida = item.salidaConcepcion24Colon || item.salidaItaliaColon || '--:--';
      const horaTrinidad = item.llegadaTrinidad || '--:--';
      const horaMedinas = item.llegadaMedinas || '--:--';

      return (
        <View style={styles.domingoCard}>
          <View style={styles.domingoCardHeader}>
            <View style={styles.gEmpresaBadge}>
              <FontAwesome name="bus" size={11} color="#0284C7" />
              <Text style={styles.gEmpresaText}>Gutiérrez • Domingo</Text>
            </View>
            <View style={[styles.gDestinoBadge, { backgroundColor: '#F0FDFA', borderColor: '#99F6E4' }]}>
              <Ionicons name="location-sharp" size={12} color="#0F766E" />
              <Text style={[styles.gDestinoBadgeText, { color: '#0F766E' }]}>Llegada Medinas</Text>
            </View>
          </View>

          {/* Columnas específicas para Domingo (Ida) */}
          <View style={styles.domingoColumnsRow}>
            {/* 1. Salida Concepción (24 y Colón) */}
            <View style={styles.domingoCol}>
              <Text style={styles.domingoColTag}>1. Salida</Text>
              <Text style={styles.domingoColTime}>{horaSalida}</Text>
              <Text style={styles.domingoColPlace}>Concepción</Text>
              <Text style={styles.domingoColSub}>24 y Colón</Text>
            </View>

            <View style={styles.domingoArrowBox}>
              <Ionicons name="arrow-forward" size={16} color="#0284C7" />
            </View>

            {/* 2. Paso La Trinidad */}
            <View style={styles.domingoCol}>
              <Text style={styles.domingoColTag}>2. Paso</Text>
              <Text style={styles.domingoColTime}>{horaTrinidad}</Text>
              <Text style={styles.domingoColPlace}>La Trinidad</Text>
              <Text style={styles.domingoColSub}>Parada</Text>
            </View>

            <View style={styles.domingoArrowBox}>
              <Ionicons name="arrow-forward" size={16} color="#0284C7" />
            </View>

            {/* 3. Llegada Medinas */}
            <View style={styles.domingoCol}>
              <Text style={styles.domingoColTag}>3. Llegada</Text>
              <Text style={[styles.domingoColTime, { color: '#0F766E' }]}>{horaMedinas}</Text>
              <Text style={styles.domingoColPlace}>Medinas</Text>
              <Text style={styles.domingoColSub}>Plaza / Centro</Text>
            </View>
          </View>

          {item.nota && (
            <View style={styles.domingoFooter}>
              <Ionicons name="information-circle" size={14} color="#0284C7" />
              <Text style={styles.domingoNotaText}>{item.nota}</Text>
            </View>
          )}
        </View>
      );
    }

    // Vuelta en Domingo: Salida Medinas ➔ Paso La Trinidad ➔ Llegada Concepción
    const horaSalida = item.salidaMedinas || '--:--';
    const horaTrinidad = item.salidaTrinidad || item.pasoTrinidad || '--:--';
    const horaConcepcion = item.llegadaConcepcion || '--:--';

    return (
      <View style={styles.domingoCard}>
        <View style={styles.domingoCardHeader}>
          <View style={styles.gEmpresaBadge}>
            <FontAwesome name="bus" size={11} color="#0284C7" />
            <Text style={styles.gEmpresaText}>Gutiérrez • Domingo</Text>
          </View>
          <View style={[styles.gDestinoBadge, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}>
            <Ionicons name="location-sharp" size={12} color="#1D4ED8" />
            <Text style={[styles.gDestinoBadgeText, { color: '#1D4ED8' }]}>Llegada Concepción</Text>
          </View>
        </View>

        {/* Columnas específicas para Domingo (Vuelta) */}
        <View style={styles.domingoColumnsRow}>
          {/* 1. Salida Medinas */}
          <View style={styles.domingoCol}>
            <Text style={styles.domingoColTag}>1. Salida</Text>
            <Text style={[styles.domingoColTime, { color: '#0F766E' }]}>{horaSalida}</Text>
            <Text style={styles.domingoColPlace}>Medinas</Text>
            <Text style={styles.domingoColSub}>Plaza / Centro</Text>
          </View>

          <View style={styles.domingoArrowBox}>
            <Ionicons name="arrow-forward" size={16} color="#0284C7" />
          </View>

          {/* 2. Paso La Trinidad */}
          <View style={styles.domingoCol}>
            <Text style={styles.domingoColTag}>2. Paso</Text>
            <Text style={styles.domingoColTime}>{horaTrinidad}</Text>
            <Text style={styles.domingoColPlace}>La Trinidad</Text>
            <Text style={styles.domingoColSub}>Parada</Text>
          </View>

          <View style={styles.domingoArrowBox}>
            <Ionicons name="arrow-forward" size={16} color="#0284C7" />
          </View>

          {/* 3. Llegada Concepción */}
          <View style={styles.domingoCol}>
            <Text style={styles.domingoColTag}>3. Llegada</Text>
            <Text style={[styles.domingoColTime, { color: '#0284C7' }]}>{horaConcepcion}</Text>
            <Text style={styles.domingoColPlace}>Concepción</Text>
            <Text style={styles.domingoColSub}>24 y Colón</Text>
          </View>
        </View>

        {item.nota && (
          <View style={styles.domingoFooter}>
            <Ionicons name="information-circle" size={14} color="#0284C7" />
            <Text style={styles.domingoNotaText}>{item.nota}</Text>
          </View>
        )}
      </View>
    );
  };

  // Render Card para Gutiérrez (Ida en Hábiles y Sábados)
  const renderGutierrezCardIda = (item: ServicioGutierrezIda) => {
    const horaSalidaPrincipal = item.salidaItaliaColon || item.salidaConcepcion24Colon || '--:--';
    const horaLlegadaPrincipal =
      item.llegadaMonteagudo || item.llegadaMedinas || item.llegadaTrinidad || '--:--';

    const esCaminoViejo =
      item.salidaTerminal === 'C.V.' ||
      item.nota?.toLowerCase().includes('camino viejo');
    const esPorIngenio =
      item.llegadaMedinas?.toLowerCase().includes('ingenio') ||
      item.nota?.toLowerCase().includes('ingenio');
    const esPorTerminal =
      item.pasoTerminal !== null ||
      (item.salidaTerminal !== null && item.salidaTerminal !== 'C.V.');
    const esEscolar = item.nota?.toLowerCase().includes('escolar');

    return (
      <View style={styles.gutierrezCard}>
        {/* Cabecera de la Tarjeta */}
        <View style={styles.gCardHeader}>
          <View style={styles.gCardBadgeRow}>
            <View style={styles.gEmpresaBadge}>
              <FontAwesome name="bus" size={11} color="#0284C7" />
              <Text style={styles.gEmpresaText}>Gutiérrez</Text>
            </View>
            <Text style={styles.gIdText}>
              #{item.id.replace('g-ida-', '').replace('g-sab-ida-', 'S-')}
            </Text>
          </View>

          {/* Destino Final con Badge Visual */}
          <View style={[styles.gDestinoBadge, getDestinoBadgeStyle(item.destinoFinal)]}>
            <Ionicons
              name="location-sharp"
              size={12}
              color={getDestinoBadgeColor(item.destinoFinal)}
            />
            <Text
              style={[
                styles.gDestinoBadgeText,
                { color: getDestinoBadgeColor(item.destinoFinal) },
              ]}
            >
              {item.destinoFinal}
            </Text>
          </View>
        </View>

        {/* Sección Horarios Principales */}
        <View style={styles.gTimeRow}>
          <View style={styles.gTimeCol}>
            <Text style={styles.gTimeLabel}>Salida Concepción</Text>
            <Text style={styles.gTimeMain}>{horaSalidaPrincipal}</Text>
            <Text style={styles.gTimeSub}>Italia y Colón</Text>
          </View>

          <View style={styles.gArrowCol}>
            <Ionicons name="arrow-forward" size={18} color="#94A3B8" />
            <Text style={styles.gDirectoText}>Interurbano</Text>
          </View>

          <View style={[styles.gTimeCol, { alignItems: 'flex-end' }]}>
            <Text style={styles.gTimeLabel}>Llegada Est.</Text>
            <Text style={[styles.gTimeMain, { color: '#0F172A' }]}>{horaLlegadaPrincipal}</Text>
            <Text style={styles.gTimeSub}>{item.destinoFinal}</Text>
          </View>
        </View>

        {/* Timeline / Tiempos Estimados de Paso */}
        <View style={styles.gTimelineContainer}>
          <Text style={styles.gTimelineTitle}>Puntos intermedios de paso:</Text>
          <View style={styles.gStopsRow}>
            {item.salidaTerminal && item.salidaTerminal !== 'C.V.' && (
              <View style={styles.gStopPill}>
                <Text style={styles.gStopName}>Terminal</Text>
                <Text style={styles.gStopTime}>{item.salidaTerminal}</Text>
              </View>
            )}
            <View style={styles.gStopPill}>
              <Text style={styles.gStopName}>It. y Colón</Text>
              <Text style={styles.gStopTime}>{item.salidaItaliaColon}</Text>
            </View>
            {item.pasoTerminal && (
              <View style={[styles.gStopPill, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}>
                <Text style={[styles.gStopName, { color: '#1E40AF' }]}>Paso Term.</Text>
                <Text style={[styles.gStopTime, { color: '#1E40AF' }]}>{item.pasoTerminal}</Text>
              </View>
            )}
            {item.llegadaTrinidad && (
              <View style={styles.gStopPill}>
                <Text style={styles.gStopName}>Trinidad</Text>
                <Text style={styles.gStopTime}>{item.llegadaTrinidad}</Text>
              </View>
            )}
            {item.llegadaMedinas && (
              <View style={styles.gStopPill}>
                <Text style={styles.gStopName}>Medinas</Text>
                <Text style={styles.gStopTime}>{item.llegadaMedinas}</Text>
              </View>
            )}
            {item.llegadaMonteagudo && (
              <View style={styles.gStopPill}>
                <Text style={styles.gStopName}>Monteagudo</Text>
                <Text style={styles.gStopTime}>{item.llegadaMonteagudo}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Badges Adicionales y Notas */}
        <View style={styles.gFooterRow}>
          <View style={styles.gBadgesWrap}>
            {esPorIngenio && (
              <View style={[styles.gAttrBadge, { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' }]}>
                <Ionicons name="business-outline" size={11} color="#B45309" />
                <Text style={[styles.gAttrBadgeText, { color: '#B45309' }]}>Por Ingenio</Text>
              </View>
            )}
            {esCaminoViejo && (
              <View style={[styles.gAttrBadge, { backgroundColor: '#F3E8FF', borderColor: '#E9D5FF' }]}>
                <Ionicons name="git-branch-outline" size={11} color="#7E22CE" />
                <Text style={[styles.gAttrBadgeText, { color: '#7E22CE' }]}>Camino Viejo</Text>
              </View>
            )}
            {esPorTerminal && (
              <View style={[styles.gAttrBadge, { backgroundColor: '#E0F2FE', borderColor: '#BAE6FD' }]}>
                <Ionicons name="bus-outline" size={11} color="#0369A1" />
                <Text style={[styles.gAttrBadgeText, { color: '#0369A1' }]}>
                  {item.pasoTerminal ? `Por Terminal (${item.pasoTerminal})` : 'Por Terminal'}
                </Text>
              </View>
            )}
            {esEscolar && (
              <View style={[styles.gAttrBadge, { backgroundColor: '#FFEDD5', borderColor: '#FED7AA' }]}>
                <Ionicons name="school-outline" size={11} color="#C2410C" />
                <Text style={[styles.gAttrBadgeText, { color: '#C2410C' }]}>Servicio Escolar</Text>
              </View>
            )}
          </View>

          {item.nota && !esCaminoViejo && !esPorIngenio && (
            <Text style={styles.gNotaText}>{item.nota}</Text>
          )}
        </View>
      </View>
    );
  };

  // Render Card para Gutiérrez (Vuelta en Hábiles y Sábados)
  const renderGutierrezCardVuelta = (item: ServicioGutierrezVuelta) => {
    const horaSalidaPrincipal =
      item.salidaMonteagudo || item.salidaMedinas || item.salidaTrinidad || '--:--';
    const lugarSalidaPrincipal = item.salidaMonteagudo
      ? item.salidaMonteagudo.includes('Sta. Rita')
        ? 'Santa Rita'
        : item.salidaMonteagudo.includes('C.C.Rey')
        ? 'Col. Cristo Rey'
        : item.salidaMonteagudo.includes('S.C.')
        ? 'San Carlos'
        : 'Monteagudo'
      : item.salidaMedinas
      ? 'Medinas'
      : 'La Trinidad';

    const esCaminoViejo =
      item.salidaMedinas?.toLowerCase().includes('c.v.') ||
      item.nota?.toLowerCase().includes('camino viejo');
    const esPorIngenio =
      item.salidaMedinas?.toLowerCase().includes('ingenio') ||
      item.nota?.toLowerCase().includes('ingenio');
    const esHastaTerminal =
      item.destinoEspecial?.toLowerCase().includes('terminal') ||
      item.llegadaTerminal?.toLowerCase().includes('terminal');

    return (
      <View style={styles.gutierrezCard}>
        {/* Cabecera */}
        <View style={styles.gCardHeader}>
          <View style={styles.gCardBadgeRow}>
            <View style={styles.gEmpresaBadge}>
              <FontAwesome name="bus" size={11} color="#0284C7" />
              <Text style={styles.gEmpresaText}>Gutiérrez</Text>
            </View>
            <Text style={styles.gIdText}>
              #{item.id.replace('g-vta-', '').replace('g-sab-vta-', 'S-')}
            </Text>
          </View>

          {/* Destino Final Especial con Badge */}
          <View style={[styles.gDestinoBadge, getDestinoBadgeStyle(item.destinoEspecial || 'Concepción')]}>
            <Ionicons
              name="navigate-circle"
              size={13}
              color={getDestinoBadgeColor(item.destinoEspecial || 'Concepción')}
            />
            <Text
              style={[
                styles.gDestinoBadgeText,
                { color: getDestinoBadgeColor(item.destinoEspecial || 'Concepción') },
              ]}
            >
              {item.destinoEspecial || 'Concepción'}
            </Text>
          </View>
        </View>

        {/* Sección Horarios Principales */}
        <View style={styles.gTimeRow}>
          <View style={styles.gTimeCol}>
            <Text style={styles.gTimeLabel}>Salida Origen</Text>
            <Text style={styles.gTimeMain}>{horaSalidaPrincipal}</Text>
            <Text style={styles.gTimeSub}>{lugarSalidaPrincipal}</Text>
          </View>

          <View style={styles.gArrowCol}>
            <Ionicons name="arrow-forward" size={18} color="#94A3B8" />
            <Text style={styles.gDirectoText}>A Concepción</Text>
          </View>

          <View style={[styles.gTimeCol, { alignItems: 'flex-end' }]}>
            <Text style={styles.gTimeLabel}>Llegada Concepción</Text>
            <Text style={[styles.gTimeMain, { color: '#0F172A' }]}>{item.llegadaConcepcion}</Text>
            <Text style={styles.gTimeSub}>
              {item.llegadaTerminal ? `Ext: ${item.llegadaTerminal}` : 'Centro'}
            </Text>
          </View>
        </View>

        {/* Timeline / Tiempos Estimados de Paso */}
        <View style={styles.gTimelineContainer}>
          <Text style={styles.gTimelineTitle}>Puntos intermedios de paso:</Text>
          <View style={styles.gStopsRow}>
            {item.salidaMonteagudo && (
              <View style={styles.gStopPill}>
                <Text style={styles.gStopName}>Monteagudo/Ext.</Text>
                <Text style={styles.gStopTime}>{item.salidaMonteagudo}</Text>
              </View>
            )}
            {item.salidaMedinas && (
              <View style={styles.gStopPill}>
                <Text style={styles.gStopName}>Medinas</Text>
                <Text style={styles.gStopTime}>{item.salidaMedinas}</Text>
              </View>
            )}
            {item.salidaTrinidad && (
              <View style={styles.gStopPill}>
                <Text style={styles.gStopName}>Trinidad</Text>
                <Text style={styles.gStopTime}>{item.salidaTrinidad}</Text>
              </View>
            )}
            <View style={styles.gStopPill}>
              <Text style={styles.gStopName}>Concepción</Text>
              <Text style={styles.gStopTime}>{item.llegadaConcepcion}</Text>
            </View>
            {item.llegadaTerminal && (
              <View style={[styles.gStopPill, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}>
                <Text style={[styles.gStopName, { color: '#1E40AF' }]}>Extensión</Text>
                <Text style={[styles.gStopTime, { color: '#1E40AF' }]}>{item.llegadaTerminal}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Badges Adicionales y Notas */}
        <View style={styles.gFooterRow}>
          <View style={styles.gBadgesWrap}>
            {esPorIngenio && (
              <View style={[styles.gAttrBadge, { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' }]}>
                <Ionicons name="business-outline" size={11} color="#B45309" />
                <Text style={[styles.gAttrBadgeText, { color: '#B45309' }]}>Por Ingenio</Text>
              </View>
            )}
            {esCaminoViejo && (
              <View style={[styles.gAttrBadge, { backgroundColor: '#F3E8FF', borderColor: '#E9D5FF' }]}>
                <Ionicons name="git-branch-outline" size={11} color="#7E22CE" />
                <Text style={[styles.gAttrBadgeText, { color: '#7E22CE' }]}>Camino Viejo</Text>
              </View>
            )}
            {esHastaTerminal && (
              <View style={[styles.gAttrBadge, { backgroundColor: '#E0F2FE', borderColor: '#BAE6FD' }]}>
                <Ionicons name="bus-outline" size={11} color="#0369A1" />
                <Text style={[styles.gAttrBadgeText, { color: '#0369A1' }]}>Hasta Terminal</Text>
              </View>
            )}
          </View>

          {item.nota && (
            <Text style={styles.gNotaText}>{item.nota}</Text>
          )}
        </View>
      </View>
    );
  };

  // Render Component para TESA / Exprebus
  const renderItemTradicional = ({ item }: { item: Viaje }) => {
    const horaSalida = item.paradas?.[origen];
    const horaLlegada = item.paradas?.[destino];

    if (!horaSalida || !horaLlegada) return null;

    const isTesa = item.empresa === 'TESA';
    const isDirecto = item.tipo === 'Directo';
    const duracion = calcularDuracion(horaSalida, horaLlegada);

    return (
      <View style={styles.tripCard}>
        {/* Izquierda: Empresa y Tipo */}
        <View style={styles.companyColumn}>
          <View
            style={[
              styles.companyBadge,
              { backgroundColor: isTesa ? '#e0f2fe' : '#ffedd5' },
            ]}
          >
            <Text
              style={[
                styles.companyName,
                { color: isTesa ? '#0369a1' : '#c2410c' },
              ]}
            >
              {item.empresa}
            </Text>
          </View>
          <View
            style={[
              styles.typeBadge,
              { backgroundColor: isDirecto ? '#ECFDF5' : '#F1F5F9' },
            ]}
          >
            <Text
              style={[
                styles.typeText,
                { color: isDirecto ? '#047857' : '#475569' },
              ]}
            >
              {item.tipo}
            </Text>
          </View>
        </View>

        {/* Centro: Horarios exactos */}
        <View style={styles.timeColumn}>
          <View style={styles.timeSchedule}>
            <Text style={styles.timeMain}>{horaSalida}</Text>
            <View style={styles.arrowBetween}>
              <FontAwesome name="long-arrow-right" size={14} color="#94A3B8" />
            </View>
            <Text style={styles.timeArrival}>{horaLlegada}</Text>
          </View>
          <Text style={styles.scheduleSubtitle}>
            {origen} ➔ {destino}
          </Text>
        </View>

        {/* Derecha: Duración y Pastilla de Precio */}
        <View style={styles.rightColumn}>
          <View style={styles.priceBadge}>
            <FontAwesome name="ticket" size={11} color="#065F46" />
            <Text style={styles.priceBadgeText}>{precioActual}</Text>
          </View>
          <View style={styles.durationContainer}>
            <FontAwesome name="clock-o" size={11} color="#64748B" />
            <Text style={styles.durationText}>{duracion}</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderEmptyComponent = () => {
    if (empresaSeleccionada === 'Gutierrez') {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={40} color="#CBD5E1" />
          <Text style={styles.emptyTitle}>No se encontraron salidas</Text>
          <Text style={styles.emptySubtitle}>
            No hay viajes de la empresa Gutiérrez que coincidan con &quot;{busquedaGutierrez}&quot; para este día y sentido.
          </Text>
        </View>
      );
    }

    if (!haBuscado) {
      return (
        <View style={styles.emptyContainer}>
          <FontAwesome name="compass" size={40} color="#CBD5E1" />
          <Text style={styles.emptyTitle}>Selecciona origen, destino y día</Text>
          <Text style={styles.emptySubtitle}>
            Presiona &quot;Buscar Horarios&quot; para consultar las salidas disponibles
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <FontAwesome name="exclamation-circle" size={40} color="#CBD5E1" />
        <Text style={styles.emptyTitle}>No hay salidas disponibles</Text>
        <Text style={styles.emptySubtitle}>
          No se encontraron viajes directos entre {origen} y {destino} para {tipoDia} en {empresaSeleccionada}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      {empresaSeleccionada === 'Gutierrez' ? (
        <FlatList
          data={viajesGutierrezFiltrados as any}
          keyExtractor={(item: any) => item.id}
          renderItem={({ item }) =>
            tipoDiaGutierrez === 'domingos'
              ? renderGutierrezCardDomingo(item)
              : direccionGutierrez === 'ida'
              ? renderGutierrezCardIda(item)
              : renderGutierrezCardVuelta(item)
          }
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmptyComponent}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <FlatList
          data={resultados}
          keyExtractor={(item) => item.id}
          renderItem={renderItemTradicional}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmptyComponent}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Modal dinámico para selección de Ciudad o Día (TESA / Exprebus) */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <Pressable style={styles.modalContainer} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>{tituloModal}</Text>
                <Text style={styles.modalSubtitle}>{subtituloModal}</Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseButton}
                activeOpacity={0.7}
                onPress={() => setModalVisible(false)}
              >
                <FontAwesome name="times" size={16} color="#64748B" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={listaModal}
              keyExtractor={(item) => item}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const isSelected = item === valorActual;
                return (
                  <TouchableOpacity
                    style={[styles.cityItem, isSelected && styles.cityItemSelected]}
                    activeOpacity={0.7}
                    onPress={() => seleccionarOpcion(item)}
                  >
                    <View style={styles.cityItemLeft}>
                      <View
                        style={[
                          styles.cityDot,
                          isSelected && styles.cityDotSelected,
                          seleccionando === 'dia' && isSelected && { backgroundColor: '#8B5CF6' },
                        ]}
                      />
                      <Text
                        style={[
                          styles.cityItemText,
                          isSelected && styles.cityItemTextSelected,
                          seleccionando === 'dia' && isSelected && { color: '#6D28D9' },
                        ]}
                      >
                        {item}
                      </Text>
                    </View>
                    {isSelected && (
                      <FontAwesome
                        name="check"
                        size={15}
                        color={seleccionando === 'dia' ? '#8B5CF6' : '#2563EB'}
                      />
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 36,
  },
  topHeader: {
    marginBottom: 16,
    paddingTop: 4,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  screenSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '500',
    lineHeight: 20,
  },

  /* SELECTOR DE EMPRESA (PILL TABS) */
  companySelectorWrapper: {
    marginBottom: 16,
  },
  selectorSectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  companySelectorScroll: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 2,
  },
  companyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
      },
    }),
  },
  companyPillActive: {
    backgroundColor: '#0284C7',
    borderColor: '#0284C7',
    ...Platform.select({
      ios: {
        shadowColor: '#0284C7',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
      default: {
        shadowColor: '#0284C7',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
      },
    }),
  },
  companyPillText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  companyPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  /* VISTA GUTIÉRREZ */
  gutierrezContainer: {
    marginBottom: 12,
  },
  gutierrezInfoCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    marginBottom: 16,
  },
  gutierrezInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  gutierrezLogoBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gutierrezLineTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0369A1',
    letterSpacing: -0.2,
  },
  gutierrezLineSubtitle: {
    fontSize: 12,
    color: '#0284C7',
    marginTop: 2,
    fontWeight: '500',
  },

  /* SELECTOR DE DÍA PARA GUTIÉRREZ */
  daySelectorWrapper: {
    marginBottom: 14,
  },
  daySelectorRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dayButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 3,
      },
      android: {
        elevation: 1,
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 3,
      },
    }),
  },
  dayButtonActive: {
    backgroundColor: '#0284C7',
    borderColor: '#0284C7',
    ...Platform.select({
      ios: {
        shadowColor: '#0284C7',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
      default: {
        shadowColor: '#0284C7',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
      },
    }),
  },
  dayButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    textAlign: 'center',
  },
  dayButtonTextActive: {
    color: '#FFFFFF',
  },
  dayButtonBadge: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
  },
  dayButtonBadgeActive: {
    color: '#E0F2FE',
  },

  /* SELECTOR DE DIRECCIÓN */
  directionSection: {
    marginBottom: 14,
  },
  directionToggleContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  directionTab: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
      },
    }),
  },
  directionTabActive: {
    backgroundColor: '#0284C7',
    borderColor: '#0284C7',
    ...Platform.select({
      ios: {
        shadowColor: '#0284C7',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
      default: {
        shadowColor: '#0284C7',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
    }),
  },
  directionTabHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  directionTabTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  directionTabTitleActive: {
    color: '#FFFFFF',
  },
  directionTabSubtext: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 15,
  },
  directionTabSubtextActive: {
    color: '#E0F2FE',
  },

  /* BUSCADOR RÁPIDO GUTIÉRREZ */
  searchBoxWrapper: {
    marginBottom: 16,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    gap: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
      },
    }),
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '500',
  },

  /* TARJETA DOMINGOS DE GUTIÉRREZ */
  domingoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
      },
    }),
  },
  domingoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  domingoColumnsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  domingoCol: {
    flex: 1,
    alignItems: 'center',
  },
  domingoColTag: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  domingoColTime: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0284C7',
    letterSpacing: -0.5,
  },
  domingoColPlace: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 2,
    textAlign: 'center',
  },
  domingoColSub: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 1,
    textAlign: 'center',
  },
  domingoArrowBox: {
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  domingoFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  domingoNotaText: {
    fontSize: 11,
    color: '#64748B',
    fontStyle: 'italic',
  },

  /* TARJETA HABITUAL GUTIÉRREZ (HÁBILES Y SÁBADOS) */
  gutierrezCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
      },
    }),
  },
  gCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  gCardBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  gEmpresaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  gEmpresaText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0284C7',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  gIdText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
  },
  gDestinoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  gDestinoBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  gTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 10,
  },
  gTimeCol: {
    flex: 1,
  },
  gTimeLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  gTimeMain: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0284C7',
    letterSpacing: -0.5,
  },
  gTimeSub: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginTop: 1,
  },
  gArrowCol: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  gDirectoText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94A3B8',
    marginTop: 2,
  },
  gTimelineContainer: {
    marginBottom: 10,
  },
  gTimelineTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 6,
  },
  gStopsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  gStopPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  gStopName: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  gStopTime: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F172A',
  },
  gFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 2,
  },
  gBadgesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  gAttrBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  gAttrBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  gNotaText: {
    fontSize: 11,
    color: '#64748B',
    fontStyle: 'italic',
  },

  /* ESTILOS DE BÚSQUEDA TESA / EXPREBUS */
  searchCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 26,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 14,
      },
      android: {
        elevation: 4,
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 14,
      },
    }),
  },
  selectorWrapper: {
    width: '100%',
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  selectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  selectorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  circleMarker: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  selectorText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 6,
    position: 'relative',
    height: 24,
  },
  dashedLine: {
    position: 'absolute',
    left: 20,
    right: 20,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  switchButton: {
    backgroundColor: '#EFF6FF',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    zIndex: 2,
  },
  searchButton: {
    backgroundColor: '#0284C7',
    borderRadius: 16,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 18,
    ...Platform.select({
      ios: {
        shadowColor: '#0284C7',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
      default: {
        shadowColor: '#0284C7',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
    }),
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    paddingHorizontal: 4,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  resultsBadge: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },

  /* TARJETA TESA / EXPREBUS */
  tripCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
      },
    }),
  },
  companyColumn: {
    alignItems: 'flex-start',
    gap: 6,
    minWidth: 76,
  },
  companyBadge: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
  },
  companyName: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  typeBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  typeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  timeColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  timeSchedule: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeMain: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  arrowBetween: {
    paddingHorizontal: 2,
  },
  timeArrival: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748B',
  },
  scheduleSubtitle: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
    fontWeight: '500',
  },
  rightColumn: {
    alignItems: 'flex-end',
    gap: 6,
    minWidth: 84,
  },
  priceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 5,
  },
  priceBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#065F46',
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  durationText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 36,
    paddingHorizontal: 20,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 280,
  },

  /* MODAL */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    width: '100%',
    maxWidth: 420,
    maxHeight: '75%',
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 25,
      },
      android: {
        elevation: 10,
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 25,
      },
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  modalCloseButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginVertical: 2,
  },
  cityItemSelected: {
    backgroundColor: '#EFF6FF',
  },
  cityItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#CBD5E1',
  },
  cityDotSelected: {
    backgroundColor: '#2563EB',
  },
  cityItemText: {
    fontSize: 16,
    color: '#334155',
    fontWeight: '500',
  },
  cityItemTextSelected: {
    color: '#1D4ED8',
    fontWeight: '700',
  },
});
