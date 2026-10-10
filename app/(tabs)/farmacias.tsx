import React, { useState, useMemo, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Linking,
  TextInput,
  Alert,
  Platform,
  RefreshControl,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import farmaciasFallback from '@/data/farmaciasTurno.json';
import {
  DIRECTORIO_FARMACIAS,
  Farmacia,
} from '@/data/farmacias';

// URL cruda (Raw) del archivo JSON en GitHub generado por GitHub Actions
const URL_FARMACIAS_RAW =
  'https://raw.githubusercontent.com/todogolosinas36-ctrl/cercatuyo/master/data/farmaciasTurno.json';

// Formateador de fecha amigable en español
function formatearFechaAmigable(fecha: Date = new Date()): string {
  const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const meses = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
  ];

  const diaSemana = diasSemana[fecha.getDay()];
  const dia = fecha.getDate();
  const mes = meses[fecha.getMonth()];
  const anio = fecha.getFullYear();

  return `${diaSemana}, ${dia} de ${mes} de ${anio}`;
}

// Formateador visual de teléfono para mostrar en pantalla
function formatearTelefonoVisual(telefono?: string): string {
  if (!telefono) return 'Sin teléfono registrado';
  const limpio = telefono.replace(/\D/g, '');
  if (limpio.startsWith('03865') && limpio.length === 11) {
    return `(03865) ${limpio.slice(5, 7)}-${limpio.slice(7)}`;
  }
  if (limpio.startsWith('0381') && limpio.length === 11) {
    return `(0381) ${limpio.slice(4, 7)}-${limpio.slice(7)}`;
  }
  if (limpio.startsWith('03863') && limpio.length === 11) {
    return `(03863) ${limpio.slice(5, 7)}-${limpio.slice(7)}`;
  }
  if (limpio.length === 10) {
    return `(${limpio.slice(0, 4)}) ${limpio.slice(4, 7)}-${limpio.slice(7)}`;
  }
  return telefono;
}

export default function FarmaciasScreen() {
  const [localidadSeleccionada, setLocalidadSeleccionada] = useState<string>('Aguilares');
  const [busqueda, setBusqueda] = useState<string>('');

  // Estado local para los datos de farmacias (iniciado con el fallback local estático)
  const [farmaciasData, setFarmaciasData] = useState<any>(farmaciasFallback);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [origenRemoto, setOrigenRemoto] = useState<boolean>(false);

  // Fecha del sistema
  const fechaHoy = useMemo(() => new Date(), []);

  // Función asíncrona para consultar el archivo directo desde GitHub Raw
  const cargarFarmacias = async () => {
    setRefreshing(true);
    try {
      // Timestamp anti-caché para obtener siempre la última versión subida por el robot
      const res = await fetch(`${URL_FARMACIAS_RAW}?_t=${Date.now()}`, {
        headers: { Accept: 'application/json' },
      });

      if (res.status === 200) {
        const data = await res.json();
        if (data && (Array.isArray(data.farmacias) || Array.isArray(data.farmaciasDeTurno))) {
          setFarmaciasData(data);
          setOrigenRemoto(true);
          return;
        }
      }

      // Si el status no es 200, aplicar fallback
      setFarmaciasData(farmaciasFallback);
      setOrigenRemoto(false);
    } catch (error) {
      // En caso de error de red, falta de conexión o 404, usar fallback estático
      setFarmaciasData(farmaciasFallback);
      setOrigenRemoto(false);
    } finally {
      setRefreshing(false);
    }
  };

  // Carga inicial al montar el componente
  useEffect(() => {
    cargarFarmacias();
  }, []);

  // Lista de localidades disponibles obtenidas del JSON (con 'Todas' y 'Aguilares' priorizada)
  const listaLocalidades = useMemo(() => {
    const locs: string[] = farmaciasData?.localidades;
    if (Array.isArray(locs) && locs.length > 0) {
      const sinAguilares = locs.filter(l => l.toLowerCase() !== 'aguilares');
      return ['Todas', 'Aguilares', ...sinAguilares];
    }
    return ['Todas', 'Aguilares'];
  }, [farmaciasData]);

  // Lista de todas las farmacias en guardia hoy extraídas del JSON
  const todasDeTurnoHoy = useMemo(() => {
    const lista = farmaciasData?.farmacias || farmaciasData?.farmaciasDeTurno;
    return (Array.isArray(lista) ? lista : []) as Farmacia[];
  }, [farmaciasData]);

  // Farmacias de turno correspondientes a la localidad seleccionada
  const farmaciasDeTurno = useMemo(() => {
    if (localidadSeleccionada === 'Todas') {
      return todasDeTurnoHoy;
    }
    return todasDeTurnoHoy.filter(
      f => (f.localidad || f.ubicacion || '').toLowerCase() === localidadSeleccionada.toLowerCase()
    );
  }, [todasDeTurnoHoy, localidadSeleccionada]);

  // IDs de las farmacias que están de turno hoy (para destacar en el directorio)
  const idsDeTurnoHoy = useMemo(() => {
    return todasDeTurnoHoy.map(f => f.id);
  }, [todasDeTurnoHoy]);

  // Conteo de farmacias de guardia por localidad para las pestañas
  const conteoPorLocalidad = useMemo(() => {
    const mapa: Record<string, number> = { Todas: todasDeTurnoHoy.length };
    todasDeTurnoHoy.forEach(f => {
      const loc = f.localidad || f.ubicacion || 'Aguilares';
      mapa[loc] = (mapa[loc] || 0) + 1;
    });
    return mapa;
  }, [todasDeTurnoHoy]);

  // Directorio general de farmacias filtrado por búsqueda y localidad
  const directorioFiltrado = useMemo(() => {
    let lista = [...DIRECTORIO_FARMACIAS];
    const idsExistentes = new Set(lista.map(f => f.id));

    // Incorporar cualquier farmacia detectada en el JSON que no esté en la base estática
    todasDeTurnoHoy.forEach(f => {
      if (!idsExistentes.has(f.id)) {
        lista.push(f);
        idsExistentes.add(f.id);
      }
    });

    if (localidadSeleccionada !== 'Todas') {
      lista = lista.filter(
        f => (f.localidad || f.ubicacion || '').toLowerCase() === localidadSeleccionada.toLowerCase()
      );
    }

    if (busqueda.trim()) {
      const q = busqueda.toLowerCase().trim();
      lista = lista.filter(
        f =>
          f.nombre.toLowerCase().includes(q) ||
          f.direccion.toLowerCase().includes(q) ||
          (f.localidad || f.ubicacion || '').toLowerCase().includes(q) ||
          (f.telefono && f.telefono.includes(q))
      );
    }

    return lista;
  }, [localidadSeleccionada, busqueda, todasDeTurnoHoy]);

  // Acción: Llamada telefónica directa
  const handleLlamar = async (farmacia: Farmacia) => {
    if (!farmacia.telefono) {
      Alert.alert(farmacia.nombre, 'Esta farmacia no posee número de teléfono registrado.');
      return;
    }

    const numero = farmacia.telefono.replace(/\s+/g, '');
    const url = `tel:${numero}`;

    try {
      if (Platform.OS === 'web') {
        window.open(url, '_self');
        return;
      }
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert(
          farmacia.nombre,
          `Número de contacto: ${formatearTelefonoVisual(farmacia.telefono)}`
        );
      }
    } catch {
      Alert.alert(
        'Error',
        `No se pudo iniciar la llamada al ${formatearTelefonoVisual(farmacia.telefono)}.`
      );
    }
  };

  // Acción: Abrir en Google Maps
  const handleAbrirMapa = async (farmacia: Farmacia) => {
    const localidad = farmacia.localidad || farmacia.ubicacion || 'Tucuman';
    const url =
      farmacia.linkMapa ||
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${farmacia.nombre} ${farmacia.direccion} ${localidad} Tucuman`
      )}`;

    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert('Error', 'No se pudo abrir la aplicación de mapas.');
    }
  };

  // Acción: Abrir sitio oficial de COFATUC
  const handleAbrirWebCofatuc = async () => {
    const url = 'https://cofatuc.org.ar/farmacias-de-turno/';
    try {
      if (Platform.OS === 'web') {
        window.open(url, '_blank');
        return;
      }
      await Linking.openURL(url);
    } catch {
      Alert.alert('Error', 'No se pudo abrir el sitio web del Colegio de Farmacéuticos.');
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={cargarFarmacias}
          colors={['#2563EB', '#10B981']}
          tintColor="#2563EB"
          title="Actualizando farmacias de turno..."
          titleColor="#64748B"
        />
      }
    >
      {/* Encabezado Principal y Badges de Estado */}
      <View style={styles.header}>
        <View style={styles.topBadgesRow}>
          <View style={styles.provinceBadge}>
            <Ionicons name="medical" size={13} color="#0284C7" />
            <Text style={styles.provinceBadgeText}>Tucumán</Text>
          </View>

          {/* Indicador de Datos En Vivo de GitHub Actions vs Respaldo Local */}
          {origenRemoto ? (
            <View style={styles.liveSyncBadge}>
              <View style={styles.syncDotOnline} />
              <Text style={styles.syncTextOnline}>En línea (GitHub Actions)</Text>
            </View>
          ) : (
            <View style={styles.fallbackSyncBadge}>
              <View style={styles.syncDotOffline} />
              <Text style={styles.syncTextOffline}>Datos locales (Respaldo)</Text>
            </View>
          )}
        </View>

        <Text style={styles.mainTitle}>Farmacias de Turno</Text>

        {/* Tarjeta de Fecha Actual */}
        <View style={styles.dateCard}>
          <View style={styles.dateIconWrapper}>
            <Ionicons name="calendar-outline" size={18} color="#2563EB" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.dateLabel}>Fecha actual</Text>
            <Text style={styles.dateText}>{formatearFechaAmigable(fechaHoy)}</Text>
          </View>

          {/* Botón táctil para recargar manualmente */}
          <TouchableOpacity
            style={styles.miniRefreshBtn}
            onPress={cargarFarmacias}
            activeOpacity={0.7}
          >
            <Ionicons name="reload" size={16} color="#2563EB" />
          </TouchableOpacity>
        </View>
      </View>

      {/* AVISO DE VIGENCIA OFICIAL COFATUC (08:00 a 08:00 hs) */}
      <View style={styles.vigenciaBanner}>
        <Ionicons name="time" size={18} color="#B45309" />
        <View style={{ flex: 1 }}>
          <Text style={styles.vigenciaTitle}>Horario de guardia oficial de 24 hs</Text>
          <Text style={styles.vigenciaSubtitle}>
            {farmaciasData?.horarioVigencia ||
              'Rige desde las 08:00 hs del día indicado hasta las 08:00 hs del día siguiente.'}
          </Text>
        </View>
      </View>

      {/* SELECTOR HORIZONTAL DE LOCALIDADES (CHIPS) */}
      <View style={styles.chipsSection}>
        <View style={styles.chipsHeader}>
          <Text style={styles.chipsSectionTitle}>Localidades de la provincia:</Text>
          <Text style={styles.chipsSectionHint}>Desliza para elegir</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsScrollContent}
        >
          {listaLocalidades.map(loc => {
            const esActiva = localidadSeleccionada === loc;
            const cantidad = conteoPorLocalidad[loc] || 0;

            return (
              <TouchableOpacity
                key={loc}
                style={[styles.chipButton, esActiva && styles.chipButtonActive]}
                onPress={() => setLocalidadSeleccionada(loc)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={loc === 'Todas' ? 'map' : 'location'}
                  size={13}
                  color={esActiva ? '#FFFFFF' : '#64748B'}
                />
                <Text style={[styles.chipText, esActiva && styles.chipTextActive]}>
                  {loc}
                </Text>
                {cantidad > 0 && (
                  <View
                    style={[
                      styles.chipCountBadge,
                      esActiva && styles.chipCountBadgeActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipCountText,
                        esActiva && styles.chipCountTextActive,
                      ]}
                    >
                      {cantidad}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* SECCIÓN DESTACADA: FARMACIAS DE TURNO HOY */}
      <View style={styles.sectionTurno}>
        <View style={styles.turnoHeaderRow}>
          <View style={styles.liveIndicator}>
            <View style={styles.pulseDot} />
            <Text style={styles.liveText}>DE TURNO HOY</Text>
          </View>
          <View style={styles.locSelectedBadge}>
            <Ionicons name="navigate-circle" size={13} color="#047857" />
            <Text style={styles.locSelectedText}>
              {localidadSeleccionada === 'Todas' ? 'Toda la provincia' : localidadSeleccionada}
            </Text>
          </View>
        </View>

        {farmaciasDeTurno.length > 0 ? (
          farmaciasDeTurno.map((farmacia, index) => (
            <View key={farmacia.id || index} style={styles.heroCard}>
              <View style={styles.heroCardTop}>
                <View style={styles.heroIconWrapper}>
                  <Ionicons name="medkit" size={26} color="#059669" />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.heroTitleRow}>
                    <Text style={styles.heroTitle}>{farmacia.nombre}</Text>
                  </View>

                  <View style={styles.heroLocationPill}>
                    <Ionicons name="location-sharp" size={12} color="#0369A1" />
                    <Text style={styles.heroLocationPillText}>
                      {farmacia.localidad || farmacia.ubicacion || 'Aguilares'}
                    </Text>
                  </View>

                  <View style={styles.heroInfoRow}>
                    <Ionicons name="navigate-outline" size={14} color="#64748B" />
                    <Text style={styles.heroSubtitle}>{farmacia.direccion}</Text>
                  </View>

                  <View style={styles.heroInfoRow}>
                    <Ionicons name="call" size={14} color="#059669" />
                    <Text style={styles.heroPhone}>
                      {formatearTelefonoVisual(farmacia.telefono)}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Botones de acción directa */}
              <View style={styles.heroActionsRow}>
                <TouchableOpacity
                  style={[
                    styles.actionBtn,
                    styles.callBtn,
                    !farmacia.telefono && styles.actionBtnDisabled,
                  ]}
                  onPress={() => handleLlamar(farmacia)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="call" size={17} color="#FFFFFF" />
                  <Text style={styles.actionBtnText}>
                    {farmacia.telefono ? 'Llamar a farmacia' : 'Sin teléfono'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtn, styles.mapBtn]}
                  onPress={() => handleAbrirMapa(farmacia)}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons name="google-maps" size={19} color="#FFFFFF" />
                  <Text style={styles.actionBtnText}>Cómo llegar</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyCard}>
            <Ionicons name="information-circle-outline" size={32} color="#94A3B8" />
            <Text style={styles.emptyText}>
              No se encontraron farmacias de guardia registradas para{' '}
              <Text style={{ fontWeight: '700' }}>{localidadSeleccionada}</Text> en esta fecha.
            </Text>
          </View>
        )}
      </View>

      {/* SECCIÓN DIRECTORIO DE FARMACIAS */}
      <View style={styles.directorySection}>
        <View style={styles.directoryHeader}>
          <View>
            <Text style={styles.directoryTitle}>
              {localidadSeleccionada === 'Todas'
                ? 'Todas las Farmacias de la Provincia'
                : `Farmacias en ${localidadSeleccionada}`}
            </Text>
            <Text style={styles.directorySubtitle}>Directorio de locales</Text>
          </View>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>
              {directorioFiltrado.length}{' '}
              {directorioFiltrado.length === 1 ? 'farmacia' : 'farmacias'}
            </Text>
          </View>
        </View>

        {/* Buscador de Farmacias */}
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={19} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder={`Buscar en ${localidadSeleccionada === 'Todas' ? 'Tucumán' : localidadSeleccionada}...`}
            placeholderTextColor="#94A3B8"
            value={busqueda}
            onChangeText={setBusqueda}
            clearButtonMode="while-editing"
          />
          {busqueda.length > 0 && (
            <TouchableOpacity onPress={() => setBusqueda('')}>
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>

        {/* Lista del Directorio */}
        {directorioFiltrado.map(farmacia => {
          const estaDeTurno = idsDeTurnoHoy.includes(farmacia.id);

          return (
            <View
              key={farmacia.id}
              style={[
                styles.pharmacyCard,
                estaDeTurno && styles.pharmacyCardTurnoHighlight,
              ]}
            >
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardPharmacyName}>{farmacia.nombre}</Text>

                  <View style={styles.cardCityRow}>
                    <Ionicons name="location" size={12} color="#0284C7" />
                    <Text style={styles.cardCityText}>
                      {farmacia.localidad || farmacia.ubicacion || 'Aguilares'}
                    </Text>
                  </View>

                  <View style={styles.cardInfoRow}>
                    <Ionicons name="navigate-outline" size={13} color="#64748B" />
                    <Text style={styles.cardAddress}>{farmacia.direccion}</Text>
                  </View>

                  <View style={styles.cardInfoRow}>
                    <Ionicons name="call-outline" size={13} color="#64748B" />
                    <Text style={styles.cardNumber}>
                      {formatearTelefonoVisual(farmacia.telefono)}
                    </Text>
                  </View>

                  {farmacia.horarioHabitual && (
                    <View style={styles.cardInfoRow}>
                      <Ionicons name="time-outline" size={12} color="#94A3B8" />
                      <Text style={styles.cardHoursText}>
                        Horario: {farmacia.horarioHabitual}
                      </Text>
                    </View>
                  )}
                </View>

                {estaDeTurno && (
                  <View style={styles.turnoChip}>
                    <Ionicons name="shield-checkmark" size={12} color="#059669" />
                    <Text style={styles.turnoChipText}>De turno hoy</Text>
                  </View>
                )}
              </View>

              {/* Botones de acción en cada ítem */}
              <View style={styles.cardActionsRow}>
                <TouchableOpacity
                  style={[
                    styles.smallActionBtn,
                    styles.smallCallBtn,
                    !farmacia.telefono && styles.smallActionBtnDisabled,
                  ]}
                  onPress={() => handleLlamar(farmacia)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="call"
                    size={14}
                    color={farmacia.telefono ? '#059669' : '#94A3B8'}
                  />
                  <Text
                    style={[
                      styles.smallCallBtnText,
                      !farmacia.telefono && { color: '#94A3B8' },
                    ]}
                  >
                    {farmacia.telefono ? 'Llamar' : 'Sin tel.'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.smallActionBtn, styles.smallMapBtn]}
                  onPress={() => handleAbrirMapa(farmacia)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="navigate-outline" size={14} color="#2563EB" />
                  <Text style={styles.smallMapBtnText}>Ver en mapa</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        {directorioFiltrado.length === 0 && (
          <View style={styles.emptyCard}>
            <Ionicons name="search" size={28} color="#94A3B8" />
            <Text style={styles.emptyText}>
              No se encontraron farmacias que coincidan con "{busqueda}".
            </Text>
          </View>
        )}
      </View>

      {/* CUADRO INFORMATIVO COFATUC OFICIAL */}
      <View style={styles.officialNoticeCard}>
        <View style={styles.officialNoticeHeader}>
          <View style={styles.officialIconBadge}>
            <Ionicons name="shield-checkmark" size={20} color="#1D4ED8" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.officialNoticeTitle}>
              Colegio de Farmacéuticos de Tucumán
            </Text>
            <Text style={styles.officialNoticeSub}>
              Fuente oficial de turnos provinciales (COFATUC)
            </Text>
          </View>
        </View>

        <Text style={styles.officialNoticeText}>
          Los cronogramas de guardia rigen durante <Text style={styles.boldText}>24 horas continuas</Text>{' '}
          (desde las <Text style={styles.boldText}>08:00 hs</Text> hasta las{' '}
          <Text style={styles.boldText}>08:00 hs</Text> del día siguiente).
        </Text>

        <Text style={styles.officialNoticeSubText}>
          Los turnos publicados corresponden a la programación vigente oficial. Ante cualquier duda o urgencia, puedes consultar directamente el portal oficial:
        </Text>

        <TouchableOpacity
          style={styles.officialWebBtn}
          onPress={handleAbrirWebCofatuc}
          activeOpacity={0.8}
        >
          <Ionicons name="globe-outline" size={17} color="#FFFFFF" />
          <Text style={styles.officialWebBtnText}>Ver portal oficial de COFATUC</Text>
          <Ionicons name="open-outline" size={15} color="#93C5FD" />
        </TouchableOpacity>
      </View>

      {/* Tarjeta de Emergencias */}
      <View style={styles.emergencyCard}>
        <View style={styles.emergencyHeader}>
          <Ionicons name="information-circle" size={20} color="#B45309" />
          <Text style={styles.emergencyTitle}>Números Útiles de Emergencia</Text>
        </View>
        <Text style={styles.emergencyDesc}>
          • Recomendamos realizar una llamada previa antes de dirigirte para verificar disponibilidad.
        </Text>
        <View style={styles.emergencyNumbersRow}>
          <TouchableOpacity
            style={styles.quickEmergencyBtn}
            onPress={() => Linking.openURL('tel:107')}
            activeOpacity={0.7}
          >
            <Ionicons name="medical" size={14} color="#DC2626" />
            <Text style={styles.quickEmergencyText}>SAME 107</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickEmergencyBtn}
            onPress={() => Linking.openURL('tel:03865481200')}
            activeOpacity={0.7}
          >
            <Ionicons name="business" size={14} color="#2563EB" />
            <Text style={styles.quickEmergencyText}>Hospital Aguilares</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 12,
  },
  topBadgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  provinceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 4,
  },
  provinceBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0369A1',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  liveSyncBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 5,
  },
  syncDotOnline: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  syncTextOnline: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
  },
  fallbackSyncBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 5,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  syncDotOffline: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#64748B',
  },
  syncTextOffline: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  dateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  dateIconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  dateText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    textTransform: 'capitalize',
  },
  miniRefreshBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  vigenciaBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    gap: 10,
  },
  vigenciaTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#92400E',
    marginBottom: 2,
  },
  vigenciaSubtitle: {
    fontSize: 11,
    color: '#78350F',
    lineHeight: 16,
  },
  chipsSection: {
    marginBottom: 20,
  },
  chipsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  chipsSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  chipsSectionHint: {
    fontSize: 11,
    color: '#94A3B8',
  },
  chipsScrollContent: {
    gap: 8,
    paddingVertical: 2,
  },
  chipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 6,
  },
  chipButtonActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  chipCountBadge: {
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  chipCountBadgeActive: {
    backgroundColor: '#1D4ED8',
  },
  chipCountText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  chipCountTextActive: {
    color: '#FFFFFF',
  },
  sectionTurno: {
    marginBottom: 24,
  },
  turnoHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  pulseDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#10B981',
  },
  liveText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#065F46',
    letterSpacing: 0.5,
  },
  locSelectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 4,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  locSelectedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#047857',
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 2,
    borderColor: '#10B981',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 12,
  },
  heroCardTop: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  heroIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  heroTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
  },
  heroLocationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 2,
    gap: 4,
    marginBottom: 6,
  },
  heroLocationPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0369A1',
  },
  heroInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  heroSubtitle: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '500',
    flex: 1,
  },
  heroPhone: {
    fontSize: 13,
    fontWeight: '700',
    color: '#047857',
  },
  heroActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    borderRadius: 12,
    gap: 7,
  },
  callBtn: {
    backgroundColor: '#059669',
  },
  mapBtn: {
    backgroundColor: '#2563EB',
  },
  actionBtnDisabled: {
    backgroundColor: '#94A3B8',
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  directorySection: {
    marginBottom: 20,
  },
  directoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  directoryTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
  },
  directorySubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  countBadge: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginBottom: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
    padding: 0,
  },
  pharmacyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  pharmacyCardTurnoHighlight: {
    borderColor: '#6EE7B7',
    backgroundColor: '#F0FDF4',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
    gap: 8,
  },
  cardPharmacyName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  cardCityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 3,
  },
  cardCityText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0284C7',
  },
  cardInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  cardAddress: {
    fontSize: 12,
    color: '#475569',
  },
  cardNumber: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '600',
  },
  cardHoursText: {
    fontSize: 11,
    color: '#64748B',
  },
  turnoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  turnoChipText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#065F46',
  },
  cardActionsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  smallActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    borderRadius: 8,
    gap: 5,
    borderWidth: 1,
  },
  smallCallBtn: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  smallCallBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },
  smallMapBtn: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  smallMapBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
  smallActionBtnDisabled: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    padding: 22,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  emptyText: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
  officialNoticeCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    marginBottom: 16,
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  officialNoticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  officialIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  officialNoticeTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0369A1',
  },
  officialNoticeSub: {
    fontSize: 11,
    color: '#0284C7',
    fontWeight: '600',
  },
  officialNoticeText: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 18,
    marginBottom: 6,
  },
  boldText: {
    fontWeight: '700',
    color: '#0F172A',
  },
  officialNoticeSubText: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 17,
    marginBottom: 12,
  },
  officialWebBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0284C7',
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 10,
    gap: 8,
  },
  officialWebBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  emergencyCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  emergencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  emergencyTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#92400E',
  },
  emergencyDesc: {
    fontSize: 11,
    color: '#78350F',
    lineHeight: 16,
    marginTop: 2,
  },
  emergencyNumbersRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  quickEmergencyBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  quickEmergencyText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
  },
});
