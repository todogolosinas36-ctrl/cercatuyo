import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';

interface HorarioSalida {
  id: string;
  empresa: 'TESA' | 'Exprebus';
  horaSalida: string;
  horaLlegada: string;
  duracionEstimada: string;
  tipo: 'Directo' | 'Común';
}

const mockSalidas: HorarioSalida[] = [
  {
    id: '1',
    empresa: 'TESA',
    horaSalida: '06:25',
    horaLlegada: '07:45',
    duracionEstimada: '1h 20m',
    tipo: 'Directo',
  },
  {
    id: '2',
    empresa: 'Exprebus',
    horaSalida: '06:50',
    horaLlegada: '08:35',
    duracionEstimada: '1h 45m',
    tipo: 'Común',
  },
  {
    id: '3',
    empresa: 'TESA',
    horaSalida: '07:15',
    horaLlegada: '08:35',
    duracionEstimada: '1h 20m',
    tipo: 'Directo',
  },
  {
    id: '4',
    empresa: 'Exprebus',
    horaSalida: '07:40',
    horaLlegada: '09:00',
    duracionEstimada: '1h 20m',
    tipo: 'Directo',
  },
  {
    id: '5',
    empresa: 'TESA',
    horaSalida: '08:10',
    horaLlegada: '10:00',
    duracionEstimada: '1h 50m',
    tipo: 'Común',
  },
  {
    id: '6',
    empresa: 'Exprebus',
    horaSalida: '08:45',
    horaLlegada: '10:10',
    duracionEstimada: '1h 25m',
    tipo: 'Directo',
  },
];

export default function ColectivosScreen() {
  const [origen, setOrigen] = useState('Tucumán');
  const [destino, setDestino] = useState('Concepción');

  const handleBuscar = () => {
    console.log(`Buscando colectivos de ${origen} a ${destino}`);
  };

  const intercambiarCiudades = () => {
    setOrigen(destino);
    setDestino(origen);
  };

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
            onPress={() => console.log('Seleccionar origen')}>
            <View style={styles.selectorLeft}>
              <View style={[styles.circleMarker, { backgroundColor: '#2563EB' }]} />
              <Text style={styles.selectorText}>{origen}</Text>
            </View>
            <FontAwesome name="chevron-down" size={13} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* Botón flotante para invertir origen/destino */}
        <View style={styles.dividerRow}>
          <View style={styles.dashedLine} />
          <TouchableOpacity
            style={styles.switchButton}
            activeOpacity={0.8}
            onPress={intercambiarCiudades}>
            <FontAwesome name="exchange" size={13} color="#2563EB" style={{ transform: [{ rotate: '90deg' }] }} />
          </TouchableOpacity>
        </View>

        {/* Selector Destino */}
        <View style={styles.selectorWrapper}>
          <Text style={styles.fieldLabel}>Destino</Text>
          <TouchableOpacity
            style={styles.selectorButton}
            activeOpacity={0.7}
            onPress={() => console.log('Seleccionar destino')}>
            <View style={styles.selectorLeft}>
              <View style={[styles.circleMarker, { backgroundColor: '#10B981' }]} />
              <Text style={styles.selectorText}>{destino}</Text>
            </View>
            <FontAwesome name="chevron-down" size={13} color="#94A3B8" />
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
        <Text style={styles.resultsBadge}>{mockSalidas.length} disponibles</Text>
      </View>
    </View>
  );

  const renderItem = ({ item }: { item: HorarioSalida }) => {
    const isTesa = item.empresa === 'TESA';
    const isDirecto = item.tipo === 'Directo';

    return (
      <View style={styles.tripCard}>
        {/* Izquierda: Empresa y Tipo */}
        <View style={styles.companyColumn}>
          <View
            style={[
              styles.companyBadge,
              { backgroundColor: isTesa ? '#EFF6FF' : '#FFFBEB' },
            ]}>
            <Text
              style={[
                styles.companyName,
                { color: isTesa ? '#1D4ED8' : '#B45309' },
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

        {/* Centro: Horarios (Salida -> Llegada) */}
        <View style={styles.timeColumn}>
          <View style={styles.timeSchedule}>
            <Text style={styles.timeMain}>{item.horaSalida}</Text>
            <View style={styles.arrowBetween}>
              <FontAwesome name="long-arrow-right" size={14} color="#94A3B8" />
            </View>
            <Text style={styles.timeArrival}>{item.horaLlegada}</Text>
          </View>
          <Text style={styles.scheduleSubtitle}>Salida — Llegada</Text>
        </View>

        {/* Derecha: Duración Estimada */}
        <View style={styles.durationColumn}>
          <View style={styles.durationContainer}>
            <FontAwesome name="clock-o" size={12} color="#64748B" />
            <Text style={styles.durationText}>{item.duracionEstimada}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <FlatList
        data={mockSalidas}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
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
    backgroundColor: '#1E3A8A', // Azul primario elegante y moderno
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
    minWidth: 80,
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
    paddingHorizontal: 8,
  },
  timeSchedule: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeMain: {
    fontSize: 19,
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
  durationColumn: {
    alignItems: 'flex-end',
    minWidth: 70,
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 5,
  },
  durationText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
});
