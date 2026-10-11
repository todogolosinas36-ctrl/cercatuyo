import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Linking,
  Alert,
  Platform,
  useWindowDimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import farmaciasFallback from '@/data/farmaciasTurno.json';
import { URL_FARMACIAS_RAW } from '@/config/urls';

export interface FarmaciaItemCarrusel {
  id: string;
  ciudad: string;
  nombre: string;
  direccion: string;
  telefono?: string;
  linkMapa?: string;
}

// Ciudades clave del sur tucumano
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
  {
    id: 'resp_monteros',
    ciudad: 'Monteros',
    nombre: 'Farmacia San Roque',
    direccion: '25 de Mayo 310',
    telefono: '03863428100',
  },
];

export default function CarruselFarmacias() {
  const { width: screenWidth } = useWindowDimensions();
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [datosJson, setDatosJson] = useState<any>(farmaciasFallback);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // Referencia al FlatList para auto-scroll
  const flatListRef = useRef<FlatList>(null);

  // Ancho de la tarjeta y espaciado
  const cardWidth = Math.min(screenWidth - 40, 520);
  const itemSpacing = 12;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch remoto de datos en vivo de GitHub Actions
  useEffect(() => {
    if (!isMounted) return;
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
        // Usa farmaciasFallback local
      }
    };

    fetchRemoto();
    return () => {
      montado = false;
    };
  }, [isMounted]);

  // Filtrar exactamente 1 farmacia de turno por cada ciudad objetivo
  const listaFarmacias = useMemo<FarmaciaItemCarrusel[]>(() => {
    if (!isMounted) return DATOS_RESPALDO;
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
        const respaldo = DATOS_RESPALDO.find((r) => r.ciudad === ciudad);
        if (respaldo) resultado.push(respaldo);
      }
    });

    return resultado.length > 0 ? resultado : DATOS_RESPALDO;
  }, [datosJson, isMounted]);

  // Auto-Scroll cada 3 segundos (3000 ms)
  useEffect(() => {
    if (!isMounted || listaFarmacias.length <= 1) return;

    const intervalo = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = prevIndex + 1 >= listaFarmacias.length ? 0 : prevIndex + 1;
        flatListRef.current?.scrollToIndex({
          index: nextIndex,
          animated: true,
        });
        return nextIndex;
      });
    }, 3000);

    return () => clearInterval(intervalo);
  }, [isMounted, listaFarmacias.length]);

  // Sincronizar índice tras deslizamiento manual del usuario
  const handleMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const paso = cardWidth + itemSpacing;
    const nuevoIndice = Math.round(offsetX / paso);
    if (nuevoIndice >= 0 && nuevoIndice < listaFarmacias.length) {
      setCurrentIndex(nuevoIndice);
    }
  };

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
      <View style={[styles.card, { width: cardWidth }]}>
        {/* ENCABEZADO DE LA TARJETA */}
        <View style={styles.cardHeader}>
          <View style={[styles.cityBadge, { backgroundColor: estiloCiudad.bg, borderColor: estiloCiudad.border }]}>
            <Ionicons name="location-sharp" size={13} color={estiloCiudad.text} />
            <Text style={[styles.cityText, { color: estiloCiudad.text }]}>{item.ciudad}</Text>
          </View>
          <View style={styles.openBadge}>
            <View style={styles.pulseDot} />
            <Text style={styles.openText}>ABIERTA 24 HS</Text>
          </View>
        </View>

        {/* NOMBRE Y DIRECCIÓN */}
        <Text style={styles.pharmacyName} numberOfLines={2}>
          {item.nombre}
        </Text>

        <View style={styles.infoRow}>
          <Ionicons name="map-outline" size={15} color="#64748B" />
          <Text style={styles.addressText} numberOfLines={1}>
            {item.direccion}
          </Text>
        </View>

        {/* BOTONES DE ACCIÓN */}
        <View style={styles.cardFooter}>
          <TouchableOpacity
            style={styles.callButton}
            onPress={() => handleLlamar(item.telefono, item.nombre)}
            activeOpacity={0.8}
          >
            <Ionicons name="call" size={15} color="#FFFFFF" />
            <Text style={styles.callButtonText}>Llamar ahora</Text>
          </TouchableOpacity>

          {item.linkMapa ? (
            <TouchableOpacity
              style={styles.mapButton}
              onPress={() => Linking.openURL(item.linkMapa!)}
              activeOpacity={0.8}
            >
              <Ionicons name="navigate-outline" size={16} color="#059669" />
              <Text style={styles.mapButtonText}>Mapa</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    );
  };

  if (!isMounted) {
    return null;
  }

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={listaFarmacias}
        keyExtractor={(item) => item.id}
        renderItem={renderCard}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        pagingEnabled={false}
        snapToInterval={cardWidth + itemSpacing}
        snapToAlignment="center"
        decelerationRate="fast"
        contentContainerStyle={[
          styles.listContent,
          { paddingHorizontal: Math.max((screenWidth - cardWidth) / 2, 16) },
        ]}
        getItemLayout={(_, index) => ({
          length: cardWidth + itemSpacing,
          offset: (cardWidth + itemSpacing) * index,
          index,
        })}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        onScrollToIndexFailed={(info) => {
          setTimeout(() => {
            flatListRef.current?.scrollToIndex({ index: info.index, animated: true });
          }, 300);
        }}
      />

      {/* INDICADORES DE PAGINACIÓN */}
      {listaFarmacias.length > 1 && (
        <View style={styles.paginationDots}>
          {listaFarmacias.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                currentIndex === i ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: -16, // Extiende el carrusel de borde a borde de la pantalla
    marginTop: 4,
  },
  listContent: {
    paddingVertical: 6,
    gap: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'space-between',
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.07,
        shadowRadius: 10,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0 4px 16px rgba(15, 23, 42, 0.06)',
      },
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    gap: 5,
  },
  cityText: {
    fontSize: 12,
    fontWeight: '800',
  },
  openBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 7,
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
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
    lineHeight: 22,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  addressText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
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
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  callButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    gap: 4,
  },
  mapButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#059669',
  },
  paginationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 20,
    backgroundColor: '#2563EB',
  },
  dotInactive: {
    width: 6,
    backgroundColor: '#CBD5E1',
  },
});
