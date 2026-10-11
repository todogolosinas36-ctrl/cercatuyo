import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useOficios } from '@/context/OficiosContext';
import ClimaWidget from '@/components/ClimaWidget';
import CarruselFarmacias from '@/components/CarruselFarmacias';

// Formato de fecha en español
function obtenerFechaHoy(): string {
  const hoy = new Date();
  const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const meses = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
  ];
  return `${dias[hoy.getDay()]}, ${hoy.getDate()} de ${meses[hoy.getMonth()]} de ${hoy.getFullYear()}`;
}

// Categorías destacadas para acceso directo
const CATEGORIAS_DESTACADAS = [
  {
    id: 'albanileria',
    nombre: 'Albañilería',
    icono: 'hammer',
    color: '#D97706',
    bgColor: '#FEF3C7',
    subtitulo: 'Construcción y arreglos',
  },
  {
    id: 'plomeria',
    nombre: 'Plomería',
    icono: 'faucet',
    color: '#0284C7',
    bgColor: '#E0F2FE',
    subtitulo: 'Instalaciones y fugas',
  },
  {
    id: 'electricidad',
    nombre: 'Electricidad',
    icono: 'bolt',
    color: '#CA8A04',
    bgColor: '#FEF9C3',
    subtitulo: 'Urgencias e iluminación',
  },
  {
    id: 'carpinteria',
    nombre: 'Carpintería',
    icono: 'tools',
    color: '#B45309',
    bgColor: '#FFEDD5',
    subtitulo: 'Muebles y aberturas',
  },
];

export default function HomeDashboardScreen() {
  const { trabajadores } = useOficios();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fecha de hoy
  const fechaHoy = useMemo(() => obtenerFechaHoy(), []);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. ENCABEZADO Y BIENVENIDA */}
      <View style={styles.welcomeCard}>
        <View style={styles.locationPill}>
          <Ionicons name="location-sharp" size={14} color="#2563EB" />
          <Text style={styles.locationPillText}>Aguilares y Sur Tucumano</Text>
        </View>

        <Text style={styles.greetingTitle}>
          Bienvenido a <Text style={styles.greetingBrand}>CercaTuyo</Text>
        </Text>
        <Text style={styles.greetingDate}>{isMounted ? fechaHoy : 'Cargando fecha...'}</Text>
        <Text style={styles.greetingSubtitle}>
          Tu punto de encuentro con farmacias de guardia, transporte y trabajadores de confianza.
        </Text>

        {/* WIDGET DEL CLIMA LOCAL */}
        <ClimaWidget />

        {/* BOTÓN DESTACADO DE EMERGENCIAS */}
        <TouchableOpacity
          style={styles.emergencyButton}
          onPress={() => router.push('/emergencias')}
          activeOpacity={0.85}
        >
          <View style={styles.emergencyLeft}>
            <View style={styles.emergencyIconWrapper}>
              <Ionicons name="warning" size={18} color="#FFFFFF" />
            </View>
            <View style={styles.emergencyTexts}>
              <Text style={styles.emergencyBtnTitle}>Emergencias - Llamado Rápido</Text>
              <Text style={styles.emergencyBtnSub}>Hospital 107 • Policía 101 • Bomberos 100 • Def. Civil 103</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* 2. CARRUSEL DE FARMACIAS DE TURNO */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <Ionicons name="medkit" size={20} color="#059669" />
          <Text style={styles.sectionTitle}>Farmacias de Turno Hoy</Text>
        </View>
        <TouchableOpacity
          style={styles.seeAllButton}
          onPress={() => router.push('/(tabs)/farmacias' as any)}
          activeOpacity={0.7}
        >
          <Text style={styles.seeAllText}>Ver todas</Text>
          <Ionicons name="chevron-forward" size={14} color="#2563EB" />
        </TouchableOpacity>
      </View>
      <Text style={styles.sectionSubtitle}>
        Guardias activas en Aguilares, Concepción, Alberdi y Monteros
      </Text>

      <CarruselFarmacias />

      {/* 3. ACCESOS RÁPIDOS A OFICIOS */}
      <View style={[styles.sectionHeader, { marginTop: 24 }]}>
        <View style={styles.sectionTitleRow}>
          <Ionicons name="hammer-outline" size={20} color="#1E3A8A" />
          <Text style={styles.sectionTitle}>Oficios y Servicios</Text>
        </View>
        <TouchableOpacity
          style={styles.seeAllButton}
          onPress={() => router.push('/(tabs)/oficios' as any)}
          activeOpacity={0.7}
        >
          <Text style={styles.seeAllText}>Directorio</Text>
          <Ionicons name="chevron-forward" size={14} color="#2563EB" />
        </TouchableOpacity>
      </View>
      <Text style={styles.sectionSubtitle}>
        Encuentra trabajadores independientes y profesionales en el sur tucumano
      </Text>

      <View style={styles.categoriesGrid}>
        {CATEGORIAS_DESTACADAS.map((cat) => {
          const cantidadEnCategoria = trabajadores.filter(
            (t) => t.categoriaId === cat.id
          ).length;

          return (
            <TouchableOpacity
              key={cat.id}
              style={styles.categoryCard}
              onPress={() => router.push(`/oficios/${cat.id}` as any)}
              activeOpacity={0.75}
            >
              <View style={[styles.categoryIconWrap, { backgroundColor: cat.bgColor }]}>
                <FontAwesome5 name={cat.icono} size={22} color={cat.color} />
              </View>
              <Text style={styles.categoryName}>{cat.nombre}</Text>
              <Text style={styles.categorySub}>{cat.subtitulo}</Text>
              <View style={styles.categoryFooter}>
                <Text style={styles.categoryCount}>
                  {cantidadEnCategoria} {cantidadEnCategoria === 1 ? 'contacto' : 'contactos'}
                </Text>
                <Ionicons name="arrow-forward-circle" size={16} color={cat.color} />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 4. ATAJO A COLECTIVOS */}
      <View style={[styles.sectionHeader, { marginTop: 28 }]}>
        <View style={styles.sectionTitleRow}>
          <Ionicons name="bus-outline" size={20} color="#1E3A8A" />
          <Text style={styles.sectionTitle}>Transporte Interurbano</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.transitCard}
        onPress={() => router.push('/(tabs)/colectivos' as any)}
        activeOpacity={0.85}
      >
        <View style={styles.transitTopRow}>
          <View style={styles.transitBadge}>
            <Text style={styles.transitBadgeText}>Tesa & Exprebus</Text>
          </View>
          <View style={styles.transitArrowPill}>
            <Text style={styles.transitArrowText}>Consultar salidas</Text>
            <Ionicons name="arrow-forward" size={14} color="#2563EB" />
          </View>
        </View>

        <Text style={styles.transitTitle}>Horarios y Tarifas en Vivo</Text>
        <Text style={styles.transitDescription}>
          Consulta horarios por día hábil, sábados o feriados con cálculo automático de tarifas entre Aguilares, Concepción, Monteros y San Miguel de Tucumán.
        </Text>

        <View style={styles.transitRouteTags}>
          <View style={styles.routeTag}>
            <Ionicons name="location-outline" size={12} color="#1E3A8A" />
            <Text style={styles.routeTagText}>Aguilares</Text>
          </View>
          <Ionicons name="arrow-forward" size={12} color="#94A3B8" />
          <View style={styles.routeTag}>
            <Ionicons name="location-outline" size={12} color="#1E3A8A" />
            <Text style={styles.routeTagText}>Concepción</Text>
          </View>
          <Ionicons name="arrow-forward" size={12} color="#94A3B8" />
          <View style={styles.routeTag}>
            <Ionicons name="location-outline" size={12} color="#1E3A8A" />
            <Text style={styles.routeTagText}>Capital</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* 5. FOOTER INFORMATIVO */}
      <View style={styles.footerNote}>
        <Text style={styles.footerNoteBrand}>CercaTuyo</Text>
        <Text style={styles.footerNoteText}>
          Conectando a los vecinos de Aguilares, Concepción y todo el sur de Tucumán.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40,
  },

  // 1. BIENVENIDA
  welcomeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 4px 16px rgba(15, 23, 42, 0.05)',
      },
    }),
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 6,
    marginBottom: 12,
  },
  locationPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
  greetingTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  greetingBrand: {
    color: '#2563EB',
  },
  greetingDate: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
    marginBottom: 8,
  },
  greetingSubtitle: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#DC2626',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 14,
    ...Platform.select({
      ios: {
        shadowColor: '#DC2626',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0 4px 12px rgba(220, 38, 38, 0.25)',
      },
    }),
  },
  emergencyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  emergencyIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emergencyTexts: {
    flex: 1,
  },
  emergencyBtnTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  emergencyBtnSub: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
    marginTop: 1,
  },

  // SECCIONES GENERALES
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 14,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563EB',
  },

  // 2. WIDGET FARMACIA
  pharmacyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    ...Platform.select({
      ios: {
        shadowColor: '#059669',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0 4px 16px rgba(5, 150, 105, 0.08)',
      },
    }),
  },
  pharmacyCardFallback: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  pharmacyFallbackText: {
    fontSize: 14,
    color: '#64748B',
  },
  pharmacyCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  pharmacyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  pharmacyBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#059669',
  },
  pharmacyCityBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  pharmacyName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  pharmacyInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  pharmacyAddress: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
  },
  pharmacyPhone: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '600',
  },
  pharmacyActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    borderRadius: 12,
    gap: 6,
  },
  callBtn: {
    backgroundColor: '#059669',
  },
  callBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  mapBtn: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  mapBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#059669',
  },

  // 3. CUADRÍCULA DE OFICIOS
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 2px 10px rgba(15, 23, 42, 0.04)',
      },
    }),
  },
  categoryIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  categorySub: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 12,
  },
  categoryFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
    paddingTop: 8,
  },
  categoryCount: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
  },

  // 4. TRANSPORTE
  transitCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    ...Platform.select({
      ios: {
        shadowColor: '#2563EB',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 4px 16px rgba(37, 99, 235, 0.06)',
      },
    }),
  },
  transitTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  transitBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  transitBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2563EB',
  },
  transitArrowPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  transitArrowText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
  transitTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  transitDescription: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 14,
  },
  transitRouteTags: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  routeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  routeTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },

  // 5. FOOTER
  footerNote: {
    marginTop: 28,
    alignItems: 'center',
    gap: 4,
  },
  footerNoteBrand: {
    fontSize: 13,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  footerNoteText: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
  },
});
