import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Linking,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import farmaciasFallback from '@/data/farmaciasTurno.json';

const URL_FARMACIAS_RAW =
  'https://raw.githubusercontent.com/todogolosinas36-ctrl/cercatuyo/master/data/farmaciasTurno.json';

export interface FarmaciaItemCarrusel {
  id: string;
  ciudad: string;
  nombre: string;
  direccion: string;
  telefono?: string;
  linkMapa?: string;
}

// Ciudades clave del sur tucumano para mostrar en el carrusel
const CIUDADES_OBJETIVO = [
  'Aguilares',
  'Concepción',
  'Juan Bautista Alberdi',
  'Monteros',
];

// Colores distintivos por ciudad
const COLOR_CIUDAD: Record<string, { bg: string; text: string; border: string }> = {
  'Aguilares': { bg: '#EFF6FF', text: '#2563EB', border: '#BFDBFE' },
  'Concepción': { bg: '#ECFDF5', text: '#059669', border: '#A7F3D0' },
  'Juan Bautista Alberdi': { bg: '#FEF3C7', text: '#D97706', border: '#FDE68A' },
  'Monteros': { bg: '#F3E8FF', text: '#7C3AED', border: '#DDD6FE' },
};

// Datos estáticos de respaldo
const DATOS_RESPALDO: FarmaciaItemCarrusel[] = [
  {
    id: 'resp_aguilares',
    ciudad: 'Aguilares',
    nombre: 'Farmacia San Martín de Porres',
    direccion: 'San Martín 633',
    telefono: '03865482075',
  },
  {
    id: 'resp_concepcion',
    ciudad: 'Concepción',
    nombre: 'Farmacia del Sol',
    direccion: 'San Martín 1420',
    telefono: '03865421100',
  },
  {
    id: 'resp_alberdi',
    ciudad: 'Juan Bautista Alberdi',
    nombre: 'Farmacia Central Alberdi',
    direccion: 'Av. Marañón 450',
    telefono: '03865471200',
  },
];

export default function CarruselFarmacias() {
  const [datosJson, setDatosJson] = useState<any>(farmaciasFallback);

  useEffect(() => {
    let montado = true;
    const fetchRemoto = async () => {
      try {
        const res = await fetch(`${URL_FARMACIAS_RAW}?_t=${Date.now()}`, {
          headers: { Accept: 'application/json' },
        });
        if (res.status === 200) {
          const data = await res.json();
          if (montado && data && (Array.isArray(data.farmacias) || Array.isArray(data.farmaciasDeTurno))) {
            setDatosJson(data);
          }
        }
      } catch (e) {
        // Usa el fallback local de farmaciasFallback
      }
    };

    fetchRemoto();
    return () => {
      montado = false;
    };
  }, []);

  // Filtrar exactamente 1 farmacia de turno por cada ciudad objetivo
  const listaFarmacias = useMemo<FarmaciaItemCarrusel[]>(() => {
    const listaCompleta = (datosJson?.farmacias || datosJson?.farmaciasDeTurno || []) as any[];

    if (!Array.isArray(listaCompleta) || listaCompleta.length === 0) {
      return DATOS_RESPALDO;
    }

    const resultado: FarmaciaItemCarrusel[] = [];

    CIUDADES_OBJETIVO.forEach((ciudad) => {
      const encontrada = listaCompleta.find(
        (f) => (f.localidad || f.ubicacion || '').toLowerCase().trim() === ciudad.toLowerCase().trim()
      );

      if (encontrada) {
        resultado.push({
          id: encontrada.id || `farm_${ciudad}`,
          ciudad: ciudad,
          nombre: encontrada.nombre,
          direccion: encontrada.direccion || 'Dirección de turno',
          telefono: encontrada.telefono,
          linkMapa: encontrada.linkMapa,
        });
      } else {
        // Buscar si existe en el respaldo
        const respaldo = DATOS_RESPALDO.find((r) => r.ciudad === ciudad);
        if (respaldo) resultado.push(respaldo);
      }
    });

    return resultado.length > 0 ? resultado : DATOS_RESPALDO;
  }, [datosJson]);

  const handleLlamar = (telefono?: string, nombre?: string) => {
    if (!telefono) {
      Alert.alert('Teléfono no disponible', `${nombre || 'Esta farmacia'} no tiene teléfono registrado.`);
      return;
    }
    const limpio = telefono.replace(/\D/g, '');
    Linking.openURL(`tel:${limpio}`);
  };

  const renderCard = ({ item }: { item: FarmaciaItemCarrusel }) => {
    const estiloCiudad = COLOR_CIUDAD[item.ciudad] || {
      bg: '#F1F5F9',
      text: '#334155',
      border: '#E2E8F0',
    };

    return (
      <View style={styles.card}>
        {/* ENCABEZADO DE LA TARJETA */}
        <View style={styles.cardHeader}>
          <View style={[styles.cityBadge, { backgroundColor: estiloCiudad.bg, borderColor: estiloCiudad.border }]}>
            <Ionicons name="location-sharp" size={12} color={estiloCiudad.text} />
            <Text style={[styles.cityText, { color: estiloCiudad.text }]}>{item.ciudad}</Text>
          </View>
          <View style={styles.openBadge}>
            <View style={styles.pulseDot} />
            <Text style={styles.openText}>24 HS</Text>
          </View>
        </View>

        {/* NOMBRE Y DIRECCIÓN */}
        <Text style={styles.pharmacyName} numberOfLines={2}>
          {item.nombre}
        </Text>

        <View style={styles.infoRow}>
          <Ionicons name="map-outline" size={14} color="#64748B" />
          <Text style={styles.addressText} numberOfLines={1}>
            {item.direccion}
          </Text>
        </View>

        {/* BOTÓN RÁPIDO DE LLAMADA */}
        <View style={styles.cardFooter}>
          <TouchableOpacity
            style={styles.callButton}
            onPress={() => handleLlamar(item.telefono, item.nombre)}
            activeOpacity={0.8}
          >
            <Ionicons name="call" size={14} color="#FFFFFF" />
            <Text style={styles.callButtonText}>Llamar</Text>
          </TouchableOpacity>

          {item.linkMapa ? (
            <TouchableOpacity
              style={styles.mapButton}
              onPress={() => Linking.openURL(item.linkMapa!)}
              activeOpacity={0.8}
            >
              <Ionicons name="navigate-outline" size={14} color="#059669" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={listaFarmacias}
        keyExtractor={(item) => item.id}
        renderItem={renderCard}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        snapToInterval={262} // Ancho de tarjeta + margen para snap suave
        decelerationRate="fast"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: -16, // Rompe el padding del contenedor padre para extenderse de borde a borde
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    gap: 12,
  },
  card: {
    width: 250,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'space-between',
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 3px 12px rgba(15, 23, 42, 0.05)',
      },
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    gap: 4,
  },
  cityText: {
    fontSize: 11,
    fontWeight: '800',
  },
  openBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 4,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  openText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
  },
  pharmacyName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
    minHeight: 38,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 14,
  },
  addressText: {
    fontSize: 13,
    color: '#64748B',
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  callButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
    paddingVertical: 9,
    borderRadius: 10,
    gap: 6,
  },
  callButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  mapButton: {
    width: 36,
    height: 36,
    backgroundColor: '#ECFDF5',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
