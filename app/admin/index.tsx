import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useOficios } from '@/context/OficiosContext';

export default function AdminDashboardScreen() {
  const { trabajadores, categorias } = useOficios();
  const [isMounted, setIsMounted] = useState(false);

  // NOTA ARQUITECTURA (B-12):
  // Se eliminó la lectura y escritura del contador de visitas en Firestore ('sistema/estadisticas')
  // para evitar costos y cuotas innecesarias de operaciones de base de datos en Firebase.
  // Se recomienda integrar un script de analítica web ligero y externo (como Plausible Analytics,
  // Umami o Google Analytics 4) para medir visitantes únicos, páginas vistas y fuentes en tiempo real.

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleFarmaciasPress = () => {
    Alert.alert(
      'Administración de Farmacias',
      'El padrón y las farmacias de turno se sincronizan automáticamente todos los días a las 08:05 hs mediante el robot de GitHub Actions conectado al Colegio de Farmacéuticos (COFATUC).\n\nEn la próxima etapa podrás forzar actualizaciones manuales o modificar farmacias directamente desde aquí.',
      [{ text: 'Entendido', style: 'default' }]
    );
  };

  const handleConfiguracionPress = () => {
    Alert.alert(
      'Configuración General',
      'Parámetros activos de CercaTuyo:\n\n• Entorno: Desarrollo Local / Expo\n• Fuente de Turnos: GitHub Raw JSON (COFATUC)\n• Ciudades habilitadas: Aguilares, Concepción, Monteros, San Miguel de Tucumán\n• Versión del Panel: 1.0.0',
      [{ text: 'Aceptar', style: 'default' }]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* HEADER DE BIENVENIDA */}
      <View style={styles.headerCard}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerGreeting}>Bienvenido al</Text>
            <Text style={styles.headerTitle}>Panel de Control</Text>
          </View>
          <View style={styles.badgeAdmin}>
            <View style={styles.badgePulseDot} />
            <Text style={styles.badgeAdminText}>ADMIN ACTIVO</Text>
          </View>
        </View>
        <Text style={styles.headerSubtitle}>
          Administración centralizada de contenidos, servicios y analíticas de CercaTuyo.
        </Text>
      </View>

      {/* SECCIÓN DE MÉTRICAS / ANALYTICS */}
      <View style={styles.sectionHeader}>
        <Ionicons name="stats-chart" size={18} color="#1E3A8A" />
        <Text style={styles.sectionTitle}>Métricas de la Plataforma</Text>
      </View>
      <Text style={styles.sectionSubtitle}>
        Monitoreo de contenidos y actividad de CercaTuyo
      </Text>

      {/* TARJETA RECOMENDACIÓN ANALYTICS (B-12) */}
      <View style={styles.analyticsNoticeCard}>
        <View style={styles.analyticsIconBox}>
          <Ionicons name="analytics" size={24} color="#2563EB" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.analyticsTitle}>Analítica Web Externa Recomendada</Text>
          <Text style={styles.analyticsText}>
            Para medir visitas reales sin consumir operaciones de lectura y escritura en Firebase, se sugiere integrar un script de analítica (como Plausible, Umami o Google Analytics) directamente en app/+html.tsx.
          </Text>
        </View>
      </View>

      {/* MÉTRICA: OFICIOS Y CATEGORÍAS */}
      <View style={styles.summaryBar}>
        <View style={styles.summaryItem}>
          <Ionicons name="hammer-outline" size={16} color="#64748B" />
          <Text style={styles.summaryText}>
            <Text style={styles.summaryBold}>{trabajadores.length}</Text> Trabajadores cargados
          </Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Ionicons name="grid-outline" size={16} color="#64748B" />
          <Text style={styles.summaryText}>
            <Text style={styles.summaryBold}>{categorias.length}</Text> Categorías activas
          </Text>
        </View>
      </View>

      {/* SECCIÓN DE HERRAMIENTAS DE GESTIÓN */}
      <View style={[styles.sectionHeader, { marginTop: 28 }]}>
        <Ionicons name="build" size={18} color="#1E3A8A" />
        <Text style={styles.sectionTitle}>Herramientas de Gestión</Text>
      </View>
      <Text style={styles.sectionSubtitle}>
        Selecciona un módulo para actualizar la información de la aplicación
      </Text>

      <View style={styles.toolsList}>
        {/* BOTÓN 1: ADMINISTRAR OFICIOS */}
        <TouchableOpacity
          style={styles.toolCard}
          onPress={() => router.push('/admin/oficios')}
          activeOpacity={0.7}
        >
          <View style={[styles.toolIconBox, { backgroundColor: '#DBEAFE' }]}>
            <Ionicons name="hammer" size={26} color="#1E40AF" />
          </View>
          <View style={styles.toolContent}>
            <View style={styles.toolTitleRow}>
              <Text style={styles.toolTitle}>Administrar Oficios</Text>
              <View style={styles.toolBadgeActive}>
                <Text style={styles.toolBadgeText}>Activo</Text>
              </View>
            </View>
            <Text style={styles.toolDesc}>
              Cargar nuevos profesionales, editar datos de contacto, fotos y eliminar registros.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color="#94A3B8" />
        </TouchableOpacity>

        {/* BOTÓN 2: ADMINISTRAR FARMACIAS */}
        <TouchableOpacity
          style={styles.toolCard}
          onPress={handleFarmaciasPress}
          activeOpacity={0.7}
        >
          <View style={[styles.toolIconBox, { backgroundColor: '#D1FAE5' }]}>
            <Ionicons name="medkit" size={26} color="#065F46" />
          </View>
          <View style={styles.toolContent}>
            <View style={styles.toolTitleRow}>
              <Text style={styles.toolTitle}>Administrar Farmacias</Text>
              <View style={[styles.toolBadgeActive, { backgroundColor: '#E0F2FE' }]}>
                <Text style={[styles.toolBadgeText, { color: '#0369A1' }]}>GitHub Sync</Text>
              </View>
            </View>
            <Text style={styles.toolDesc}>
              Revisar estado de sincronización del scraper COFATUC, turnos de guardia y padrón.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color="#94A3B8" />
        </TouchableOpacity>

        {/* BOTÓN 3: CONFIGURACIÓN GENERAL */}
        <TouchableOpacity
          style={styles.toolCard}
          onPress={handleConfiguracionPress}
          activeOpacity={0.7}
        >
          <View style={[styles.toolIconBox, { backgroundColor: '#F3E8FF' }]}>
            <Ionicons name="settings" size={26} color="#6B21A8" />
          </View>
          <View style={styles.toolContent}>
            <View style={styles.toolTitleRow}>
              <Text style={styles.toolTitle}>Configuración General</Text>
            </View>
            <Text style={styles.toolDesc}>
              Parámetros de ciudades, endpoints remotos y preferencias de la aplicación.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color="#94A3B8" />
        </TouchableOpacity>
      </View>

      {/* BOTÓN PARA SALIR / VOLVER A LA APP PÚBLICA */}
      <View style={styles.footerContainer}>
        <TouchableOpacity
          style={styles.btnVolverPublico}
          onPress={() => router.replace('/')}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back-circle-outline" size={20} color="#475569" />
          <Text style={styles.btnVolverPublicoText}>Volver a la App Pública (Cliente)</Text>
        </TouchableOpacity>
        <Text style={styles.footerHint}>
          Para volver al panel, navega a /admin o utiliza el atajo de acceso seguro.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  headerCard: {
    backgroundColor: '#1E3A8A',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#1E3A8A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  headerGreeting: {
    fontSize: 13,
    color: '#93C5FD',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  badgeAdmin: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  badgePulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#34D399',
  },
  badgeAdminText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#E2E8F0',
    lineHeight: 18,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 12,
  },
  analyticsNoticeCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    marginBottom: 14,
  },
  analyticsIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  analyticsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E3A8A',
    marginBottom: 4,
  },
  analyticsText: {
    fontSize: 12,
    color: '#3B82F6',
    lineHeight: 18,
  },
  summaryBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  summaryText: {
    fontSize: 12,
    color: '#475569',
  },
  summaryBold: {
    fontWeight: '700',
    color: '#0F172A',
  },
  summaryDivider: {
    width: 1,
    height: 18,
    backgroundColor: '#E2E8F0',
  },
  toolsList: {
    gap: 12,
  },
  toolCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  toolIconBox: {
    width: 50,
    height: 50,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  toolContent: {
    flex: 1,
  },
  toolTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  toolTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  toolBadgeActive: {
    backgroundColor: '#EFF6FF',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
  },
  toolBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2563EB',
  },
  toolDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
  },
  footerContainer: {
    marginTop: 30,
    alignItems: 'center',
  },
  btnVolverPublico: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#E2E8F0',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  btnVolverPublicoText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
  },
  footerHint: {
    marginTop: 10,
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
  },
});
