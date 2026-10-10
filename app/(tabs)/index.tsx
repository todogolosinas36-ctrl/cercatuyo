import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Platform,
  Modal,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';
import { TODOS_LOS_VIAJES, PRECIOS_TESA, Viaje } from '@/data/horarios';

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

// Función auxiliar para consultar tarifa
function obtenerPrecio(origen: string, destino: string): string {
  const rutaDirecta = `${origen}-${destino}`;
  const rutaInversa = `${destino}-${origen}`;
  return PRECIOS_TESA[rutaDirecta] || PRECIOS_TESA[rutaInversa] || 'Consultar';
}

export default function ColectivosScreen() {
  const [origen, setOrigen] = useState('Tucumán');
  const [destino, setDestino] = useState('Concepción');
  const [tipoDia, setTipoDia] = useState('Lunes a Viernes');
  const [resultados, setResultados] = useState<Viaje[]>([]);
  const [haBuscado, setHaBuscado] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [seleccionando, setSeleccionando] = useState<'origen' | 'destino' | 'dia'>('origen');

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

  const handleBuscar = () => {
    setHaBuscado(true);
    const filtrados = TODOS_LOS_VIAJES.filter((viaje) => {
      // 1. Filtrar por el día seleccionado
      if (!viaje.dias || !viaje.dias.includes(tipoDia)) {
        return false;
      }

      // 2. Verificar que existan horarios para ambos puntos
      const horaOrigen = viaje.paradas[origen];
      const horaDestino = viaje.paradas[destino];

      if (!horaOrigen || !horaDestino) return false;

      // 3. LÓGICA INFALIBLE: Verificar el sentido del viaje
      // Object.keys(viaje.paradas) nos da el array de paradas en el orden exacto de la ruta
      const paradasArray = Object.keys(viaje.paradas);
      const indexOrigen = paradasArray.indexOf(origen);
      const indexDestino = paradasArray.indexOf(destino);

      // Si el origen aparece en la ruta DESPUÉS del destino, es un colectivo que va en sentido contrario
      return indexOrigen < indexDestino;
    });

    filtrados.sort((a, b) => a.paradas[origen].localeCompare(b.paradas[origen]));
    setResultados(filtrados);
  };

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

  const renderHeader = () => (
    <View>
      {/* Título de la sección */}
      <View style={styles.topHeader}>
        <Text style={styles.screenTitle}>Buscador de Horarios</Text>
        <Text style={styles.screenSubtitle}>Encuentra tu próximo viaje</Text>
      </View>

      {/* Tarjeta Flotante de Búsqueda */}
      <View style={styles.searchCard}>
        {/* Selector Origen */}
        <View style={styles.selectorWrapper}>
          <Text style={styles.fieldLabel}>Origen</Text>
          <TouchableOpacity
            style={styles.selectorButton}
            activeOpacity={0.7}
            onPress={() => abrirSelector('origen')}>
            <View style={styles.selectorLeft}>
              <View style={[styles.circleMarker, { backgroundColor: '#2563EB' }]} />
              <Text style={styles.selectorText}>{origen}</Text>
            </View>
            <FontAwesome name="chevron-down" size={13} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* Botón flotante para intercambiar origen/destino */}
        <View style={styles.dividerRow}>
          <View style={styles.dashedLine} />
          <TouchableOpacity
            style={styles.switchButton}
            activeOpacity={0.8}
            onPress={intercambiarCiudades}>
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
            onPress={() => abrirSelector('destino')}>
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
            onPress={() => abrirSelector('dia')}>
            <View style={styles.selectorLeft}>
              <View style={[styles.circleMarker, { backgroundColor: '#8B5CF6' }]} />
              <Text style={styles.selectorText}>{tipoDia}</Text>
            </View>
            <FontAwesome name="calendar" size={14} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* Botón Primario de Búsqueda */}
        <TouchableOpacity
          style={styles.searchButton}
          activeOpacity={0.85}
          onPress={handleBuscar}>
          <FontAwesome name="search" size={16} color="#FFFFFF" />
          <Text style={styles.searchButtonText}>Buscar Horarios</Text>
        </TouchableOpacity>
      </View>

      {/* Título de la lista de resultados */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsTitle}>Próximas Salidas</Text>
        <Text style={styles.resultsBadge}>
          {resultados.length} {resultados.length === 1 ? 'encontrado' : 'encontrados'}
        </Text>
      </View>
    </View>
  );

  const renderEmptyComponent = () => {
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
          No se encontraron viajes directos entre {origen} y {destino} para {tipoDia}
        </Text>
      </View>
    );
  };

  const renderItem = ({ item }: { item: Viaje }) => {
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
            ]}>
            <Text
              style={[
                styles.companyName,
                { color: isTesa ? '#0369a1' : '#c2410c' },
              ]}>
              {item.empresa}
            </Text>
          </View>
          <View
            style={[
              styles.typeBadge,
              { backgroundColor: isDirecto ? '#ECFDF5' : '#F1F5F9' },
            ]}>
            <Text
              style={[
                styles.typeText,
                { color: isDirecto ? '#047857' : '#475569' },
              ]}>
              {item.tipo}
            </Text>
          </View>
        </View>

        {/* Centro: Horarios exactos extraídos de paradas */}
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

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <FlatList
        data={resultados}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyComponent}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Modal dinámico para selección de Ciudad o Día */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}>
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}>
          <Pressable
            style={styles.modalContainer}
            onPress={(e) => e.stopPropagation()}>
            {/* Cabecera del Modal */}
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>{tituloModal}</Text>
                <Text style={styles.modalSubtitle}>{subtituloModal}</Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseButton}
                activeOpacity={0.7}
                onPress={() => setModalVisible(false)}>
                <FontAwesome name="times" size={16} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Lista de Opciones */}
            <FlatList
              data={listaModal}
              keyExtractor={(item) => item}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const isSelected = item === valorActual;
                return (
                  <TouchableOpacity
                    style={[
                      styles.cityItem,
                      isSelected && styles.cityItemSelected,
                    ]}
                    activeOpacity={0.7}
                    onPress={() => seleccionarOpcion(item)}>
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
                        ]}>
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
    paddingBottom: 32,
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
    fontSize: 15,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '500',
  },
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
    backgroundColor: '#1E3A8A',
    borderRadius: 16,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 18,
    ...Platform.select({
      ios: {
        shadowColor: '#1E3A8A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
      default: {
        shadowColor: '#1E3A8A',
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
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  resultsBadge: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
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
  /* Modal Styles */
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
