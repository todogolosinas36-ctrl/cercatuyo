import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Switch,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';

export default function ConfiguracionScreen() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleUpdateHorarios = () => {
    console.log('Abrir panel de carga');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Encabezado */}
        <View style={styles.header}>
          <Text style={styles.title}>Panel de Control</Text>
          <Text style={styles.subtitle}>Preferencias y administración del sistema</Text>
        </View>

        {/* Sección: Gestión de Datos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gestión de Datos</Text>

          <TouchableOpacity
            style={styles.actionCard}
            activeOpacity={0.8}
            onPress={handleUpdateHorarios}>
            <View style={styles.actionIconContainer}>
              <FontAwesome name="cloud-upload" size={22} color="#2563EB" />
            </View>
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>Cargar / Actualizar Horarios</Text>
              <Text style={styles.actionDescription}>
                Sincronizar y actualizar frecuencias de Colectivos
              </Text>
            </View>
            <FontAwesome name="chevron-right" size={14} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* Sección: Apariencia y Preferencias */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Apariencia</Text>

          <View style={styles.preferenceCard}>
            <View style={styles.preferenceLeft}>
              <View style={styles.prefIconContainer}>
                <FontAwesome name="moon-o" size={20} color="#6366F1" />
              </View>
              <View>
                <Text style={styles.preferenceTitle}>Modo Oscuro</Text>
                <Text style={styles.preferenceSubtitle}>
                  Cambiar aspecto de la interfaz
                </Text>
              </View>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={setIsDarkMode}
              trackColor={{ false: '#CBD5E1', true: '#6366F1' }}
              thumbColor={Platform.OS === 'android' ? (isDarkMode ? '#FFFFFF' : '#F8FAFC') : undefined}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 26,
    paddingTop: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
    marginLeft: 4,
  },
  actionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
      },
      android: {
        elevation: 3,
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
      },
    }),
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  actionDescription: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 3,
  },
  preferenceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
      },
      android: {
        elevation: 3,
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
      },
    }),
  },
  preferenceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  prefIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  preferenceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  preferenceSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
});
