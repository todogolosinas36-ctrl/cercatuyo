import React, { useState, useMemo } from 'react';
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
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import {
  FARMACIAS_AGUILARES,
  DIRECTORIO_FARMACIAS,
  TURNOS_FARMACIAS,
  formatearFechaYYYYMMDD,
  obtenerFarmaciasDeTurno,
  obtenerFarmaciasDeTurnoHoy,
  obtenerFechaTurnoActivo,
  Farmacia,
} from '@/data/farmacias';

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
function formatearTelefonoVisual(telefono: string): string {
  const limpio = telefono.replace(/\D/g, '');
  if (limpio.startsWith('03865') && limpio.length === 11) {
    return `(03865) ${limpio.slice(5, 7)}-${limpio.slice(7)}`;
  }
  if (limpio.length === 10) {
    return `(${limpio.slice(0, 4)}) ${limpio.slice(4, 7)}-${limpio.slice(7)}`;
  }
  return telefono;
}

export default function FarmaciasScreen() {
  const [busqueda, setBusqueda] = useState('');
  const [filtroDia, setFiltroDia] = useState<'hoy' | 'manana'>('hoy');

  // Fecha del sistema
  const fechaHoy = useMemo(() => new Date(), []);
  const fechaManana = useMemo(() => {
    const m = new Date();
    m.setDate(m.getDate() + 1);
    return m;
  }, []);

  const fechaMananaStr = useMemo(() => formatearFechaYYYYMMDD(fechaManana), [fechaManana]);

  // Farmacias de turno consumidas mediante la función auxiliar oficial obtenerFarmaciasDeTurnoHoy
  const farmaciasDeTurno = useMemo(() => {
    if (filtroDia === 'hoy') {
      return obtenerFarmaciasDeTurnoHoy(fechaHoy, 'Aguilares');
    }
    return obtenerFarmaciasDeTurnoHoy(fechaMananaStr, 'Aguilares');
  }, [filtroDia, fechaHoy, fechaMananaStr]);

  // IDs de las farmacias que están de turno HOY (para destacar en el directorio general)
  const idsDeTurnoHoy = useMemo(() => {
    const turnoHoy = obtenerFarmaciasDeTurnoHoy(fechaHoy, 'Aguilares');
    return turnoHoy.map(f => f.id);
  }, [fechaHoy]);

  // Filtrado del directorio general por término de búsqueda
  const directorioFiltrado = useMemo(() => {
    if (!busqueda.trim()) return FARMACIAS_AGUILARES;
    const termino = busqueda.toLowerCase().trim();
    return FARMACIAS_AGUILARES.filter(
      f =>
        f.nombre.toLowerCase().includes(termino) ||
        f.direccion.toLowerCase().includes(termino) ||
        f.telefono.includes(termino)
    );
  }, [busqueda]);

  // Acción: Realizar llamada telefónica directa
  const handleLlamar = async (farmacia: Farmacia) => {
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

  // Acción: Abrir ubicación en Google Maps
  const handleAbrirMapa = async (farmacia: Farmacia) => {
    const url =
      farmacia.linkMapa ||
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${farmacia.nombre} ${farmacia.direccion} Aguilares Tucuman`
      )}`;

    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert('Error', 'No se pudo abrir el mapa.');
    }
  };

  // Acción: Abrir portal oficial del Colegio de Farmacéuticos de Tucumán (COFATUC)
  const handleAbrirWebCofatuc = async () => {
    const url = 'https://cofatuc.org.ar';
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
    >
      {/* Encabezado Principal y Ubicación */}
      <View style={styles.header}>
        <View style={styles.cityBadge}>
          <Ionicons name="location-sharp" size={14} color="#0284C7" />
          <Text style={styles.cityBadgeText}>Aguilares, Tucumán</Text>
        </View>

        <Text style={styles.mainTitle}>Farmacias de Turno</Text>

        <View style={styles.dateCard}>
          <View style={styles.dateIconWrapper}>
            <Ionicons name="calendar-outline" size={18} color="#2563EB" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.dateLabel}>Fecha actual</Text>
            <Text style={styles.dateText}>{formatearFechaAmigable(fechaHoy)}</Text>
          </View>
        </View>
      </View>

      {/* Selector de Fecha de Turno (Hoy vs Mañana) */}
      <View style={styles.filterTabs}>
        <TouchableOpacity
          style={[styles.tabButton, filtroDia === 'hoy' && styles.tabButtonActive]}
          onPress={() => setFiltroDia('hoy')}
          activeOpacity={0.7}
        >
          <Ionicons
            name="flame"
            size={16}
            color={filtroDia === 'hoy' ? '#FFFFFF' : '#64748B'}
          />
          <Text
            style={[styles.tabButtonText, filtroDia === 'hoy' && styles.tabButtonTextActive]}
          >
            De Turno Hoy
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, filtroDia === 'manana' && styles.tabButtonActiveSecondary]}
          onPress={() => setFiltroDia('manana')}
          activeOpacity={0.7}
        >
          <Ionicons
            name="time-outline"
            size={16}
            color={filtroDia === 'manana' ? '#FFFFFF' : '#64748B'}
          />
          <Text
            style={[
              styles.tabButtonText,
              filtroDia === 'manana' && styles.tabButtonTextActive,
            ]}
          >
            Turno de Mañana
          </Text>
        </TouchableOpacity>
      </View>

      {/* SECCIÓN DESTACADA: FARMACIA DE TURNO */}
      <View style={styles.sectionTurno}>
        <View style={styles.turnoHeaderRow}>
          <View style={styles.liveIndicator}>
            <View style={styles.pulseDot} />
            <Text style={styles.liveText}>
              {filtroDia === 'hoy' ? 'DE TURNO HOY' : 'TURNO PRÓXIMO'}
            </Text>
          </View>
          <View style={styles.badge24h}>
            <Text style={styles.badge24hText}>24 Horas</Text>
          </View>
        </View>

        <Text style={styles.shiftNotice}>
          Horario de guardia: 08:00 hs a 08:00 hs del día siguiente.
        </Text>

        {farmaciasDeTurno.length > 0 ? (
          farmaciasDeTurno.map(farmacia => (
            <View key={farmacia.id} style={styles.heroCard}>
              <View style={styles.heroCardTop}>
                <View style={styles.heroIconWrapper}>
                  <Ionicons name="medkit" size={26} color="#059669" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.heroTitle}>{farmacia.nombre}</Text>
                  <View style={styles.heroInfoRow}>
                    <Ionicons name="location" size={14} color="#64748B" />
                    <Text style={styles.heroSubtitle}>
                      {farmacia.direccion}, {farmacia.ubicacion}
                    </Text>
                  </View>
                  <View style={styles.heroInfoRow}>
                    <Ionicons name="call" size={14} color="#64748B" />
                    <Text style={styles.heroPhone}>
                      {formatearTelefonoVisual(farmacia.telefono)}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Botones de acción directa */}
              <View style={styles.heroActionsRow}>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.callBtn]}
                  onPress={() => handleLlamar(farmacia)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="call" size={18} color="#FFFFFF" />
                  <Text style={styles.actionBtnText}>Llamar ahora</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtn, styles.mapBtn]}
                  onPress={() => handleAbrirMapa(farmacia)}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons name="google-maps" size={20} color="#FFFFFF" />
                  <Text style={styles.actionBtnText}>Cómo llegar</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyCard}>
            <Ionicons name="alert-circle-outline" size={32} color="#94A3B8" />
            <Text style={styles.emptyText}>
              No hay turnos registrados para esta fecha en Aguilares.
            </Text>
          </View>
        )}
      </View>

      {/* SECCIÓN DIRECTORIO COMPLETO */}
      <View style={styles.directorySection}>
        <View style={styles.directoryHeader}>
          <View>
            <Text style={styles.directoryTitle}>Todas las Farmacias</Text>
            <Text style={styles.directorySubtitle}>
              Directorio de la ciudad de Aguilares
            </Text>
          </View>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>
              {directorioFiltrado.length} {directorioFiltrado.length === 1 ? 'local' : 'locales'}
            </Text>
          </View>
        </View>

        {/* Buscador de Farmacias */}
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nombre o calle..."
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
                  <View style={styles.cardInfoRow}>
                    <Ionicons name="location-outline" size={14} color="#64748B" />
                    <Text style={styles.cardAddress}>
                      {farmacia.direccion}, {farmacia.ubicacion}
                    </Text>
                  </View>
                  <View style={styles.cardInfoRow}>
                    <Ionicons name="call-outline" size={14} color="#64748B" />
                    <Text style={styles.cardNumber}>
                      {formatearTelefonoVisual(farmacia.telefono)}
                    </Text>
                  </View>
                  {farmacia.horarioHabitual && (
                    <View style={styles.cardInfoRow}>
                      <Ionicons name="time-outline" size={13} color="#94A3B8" />
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
                  style={[styles.smallActionBtn, styles.smallCallBtn]}
                  onPress={() => handleLlamar(farmacia)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="call" size={15} color="#059669" />
                  <Text style={styles.smallCallBtnText}>Llamar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.smallActionBtn, styles.smallMapBtn]}
                  onPress={() => handleAbrirMapa(farmacia)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="navigate-outline" size={15} color="#2563EB" />
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
              No se encontraron farmacias con "{busqueda}".
            </Text>
          </View>
        )}
      </View>

      {/* CUADRO DE AVISO ÚTIL: FUENTE OFICIAL Y VERIFICACIÓN PROVINCIAL */}
      <View style={styles.officialNoticeCard}>
        <View style={styles.officialNoticeHeader}>
          <View style={styles.officialIconBadge}>
            <Ionicons name="shield-checkmark" size={20} color="#1D4ED8" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.officialNoticeTitle}>
              Turnos Oficiales en Tucumán
            </Text>
            <Text style={styles.officialNoticeSub}>
              Aguilares • Concepción • Monteros y toda la provincia
            </Text>
          </View>
        </View>

        <Text style={styles.officialNoticeText}>
          Los cronogramas de turno son regulados por el{' '}
          <Text style={styles.boldText}>Colegio de Farmacéuticos de Tucumán (COFATUC)</Text>{' '}
          en coordinación con los municipios. Los turnos de guardia rigen durante{' '}
          <Text style={styles.boldText}>24 horas continuas</Text> (de 08:00 hs a 08:00 hs del día siguiente).
        </Text>

        <Text style={styles.officialNoticeSubText}>
          Para verificar actualizaciones diarias, cronogramas de otras ciudades o cambios excepcionales de último momento, puedes consultar el portal oficial de la institución:
        </Text>

        <TouchableOpacity
          style={styles.officialWebBtn}
          onPress={handleAbrirWebCofatuc}
          activeOpacity={0.8}
        >
          <Ionicons name="globe-outline" size={18} color="#FFFFFF" />
          <Text style={styles.officialWebBtnText}>
            Consultar en Colegio de Farmacéuticos (COFATUC)
          </Text>
          <Ionicons name="open-outline" size={16} color="#93C5FD" />
        </TouchableOpacity>
      </View>

      {/* Tarjeta Informativa de Emergencias */}
      <View style={styles.emergencyCard}>
        <View style={styles.emergencyHeader}>
          <Ionicons name="information-circle" size={20} color="#B45309" />
          <Text style={styles.emergencyTitle}>Información útil de Emergencia</Text>
        </View>
        <Text style={styles.emergencyDesc}>
          • Las farmacias de turno prestan servicio las 24 horas continuas (rotación a las 08:00 AM).
        </Text>
        <Text style={styles.emergencyDesc}>
          • Recomendamos realizar una llamada previa antes de dirigirte para verificar disponibilidad de medicación.
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
    paddingBottom: 36,
  },
  header: {
    marginBottom: 16,
  },
  cityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 8,
    gap: 4,
  },
  cityBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0369A1',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
  filterTabs: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    padding: 4,
    borderRadius: 12,
    marginBottom: 16,
    gap: 6,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  tabButtonActive: {
    backgroundColor: '#059669',
  },
  tabButtonActiveSecondary: {
    backgroundColor: '#2563EB',
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  tabButtonTextActive: {
    color: '#FFFFFF',
  },
  sectionTurno: {
    marginBottom: 24,
  },
  turnoHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pulseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
  },
  liveText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#065F46',
    letterSpacing: 0.5,
  },
  badge24h: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  badge24hText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
  },
  shiftNotice: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 12,
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 2,
    borderColor: '#10B981',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 12,
  },
  heroCardTop: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  heroIconWrapper: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  heroTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
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
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  callBtn: {
    backgroundColor: '#059669',
  },
  mapBtn: {
    backgroundColor: '#2563EB',
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  directorySection: {
    marginBottom: 20,
  },
  directoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  directoryTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  directorySubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  countBadge: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
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
    paddingVertical: 10,
    marginBottom: 14,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
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
    marginBottom: 12,
    gap: 8,
  },
  cardPharmacyName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  cardInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  cardAddress: {
    fontSize: 13,
    color: '#475569',
  },
  cardNumber: {
    fontSize: 13,
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
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  turnoChipText: {
    fontSize: 11,
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
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
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
  emptyCard: {
    backgroundColor: '#FFFFFF',
    padding: 24,
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
  },
  // Tarjeta de aviso sobre fuentes oficiales
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
    fontSize: 15,
    fontWeight: '800',
    color: '#0369A1',
  },
  officialNoticeSub: {
    fontSize: 12,
    color: '#0284C7',
    fontWeight: '600',
  },
  officialNoticeText: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 19,
    marginBottom: 8,
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
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    gap: 8,
  },
  officialWebBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    flexShrink: 1,
    textAlign: 'center',
  },
  // Tarjeta de emergencias
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
    fontSize: 12,
    color: '#78350F',
    lineHeight: 17,
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
