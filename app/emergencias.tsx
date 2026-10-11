import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Platform,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface ContactoEmergencia {
  id: string;
  nombre: string;
  numero: string;
  subtitulo: string;
  icono: keyof typeof Ionicons.glyphMap;
  color: string;
  bgColor: string;
}

const EMERGENCIAS: ContactoEmergencia[] = [
  {
    id: 'hospital',
    nombre: 'Hospital de Aguilares',
    numero: '107',
    subtitulo: 'Emergencias médicas y ambulancias 24 hs',
    icono: 'medkit',
    color: '#DC2626',
    bgColor: '#FEF2F2',
  },
  {
    id: 'policia',
    nombre: 'Policía',
    numero: '101',
    subtitulo: 'Comisaría y emergencias de seguridad (o 911)',
    icono: 'shield-checkmark',
    color: '#2563EB',
    bgColor: '#EFF6FF',
  },
  {
    id: 'bomberos',
    nombre: 'Bomberos Voluntarios',
    numero: '100',
    subtitulo: 'Incendios, rescates y siniestros viales',
    icono: 'flame',
    color: '#EA580C',
    bgColor: '#FFF7ED',
  },
  {
    id: 'defensa_civil',
    nombre: 'Defensa Civil',
    numero: '103',
    subtitulo: 'Inundaciones, tormentas y contingencias',
    icono: 'warning',
    color: '#D97706',
    bgColor: '#FFFBEB',
  },
];

export default function EmergenciasScreen() {
  const handleLlamar = (numero: string) => {
    Linking.openURL(`tel:${numero}`);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Números de Emergencia',
          headerTitleAlign: 'center',
          headerShadowVisible: false,
          headerStyle: { backgroundColor: '#FFFFFF' },
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color="#0F172A" />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* BANNER INFORMATIVO */}
        <View style={styles.alertBanner}>
          <View style={styles.alertIconCircle}>
            <Ionicons name="call" size={20} color="#DC2626" />
          </View>
          <View style={styles.alertTextContainer}>
            <Text style={styles.alertTitle}>Llamado Directo</Text>
            <Text style={styles.alertSubtitle}>
              Presiona cualquier servicio para abrir tu teléfono y comunicar con la guardia de Aguilares.
            </Text>
          </View>
        </View>

        {/* LISTADO DE TELÉFONOS */}
        <View style={styles.listContainer}>
          {EMERGENCIAS.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.card}
              onPress={() => handleLlamar(item.numero)}
              activeOpacity={0.8}
            >
              <View style={styles.cardTop}>
                <View style={[styles.iconWrapper, { backgroundColor: item.bgColor }]}>
                  <Ionicons name={item.icono} size={28} color={item.color} />
                </View>
                <View style={styles.numberBadge}>
                  <Text style={[styles.numberBadgeText, { color: item.color }]}>
                    Línea {item.numero}
                  </Text>
                </View>
              </View>

              <Text style={styles.serviceName}>{item.nombre}</Text>
              <Text style={styles.serviceSubtitle}>{item.subtitulo}</Text>

              <View style={[styles.callButton, { backgroundColor: item.color }]}>
                <Ionicons name="call" size={18} color="#FFFFFF" />
                <Text style={styles.callButtonText}>Llamar al {item.numero}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* NOTA AL PIE */}
        <View style={styles.footerNote}>
          <Ionicons name="information-circle-outline" size={18} color="#64748B" />
          <Text style={styles.footerNoteText}>
            Líneas de emergencia gratuitas activas las 24 horas para Aguilares y alrededores.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  backButton: {
    padding: 8,
    marginLeft: -4,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    marginBottom: 20,
  },
  alertIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertTextContainer: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#991B1B',
  },
  alertSubtitle: {
    fontSize: 13,
    color: '#B91C1C',
    marginTop: 2,
    lineHeight: 18,
  },
  listContainer: {
    gap: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 4px 14px rgba(15, 23, 42, 0.05)',
      },
    }),
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconWrapper: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  numberBadgeText: {
    fontSize: 14,
    fontWeight: '800',
  },
  serviceName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  serviceSubtitle: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 16,
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  callButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  footerNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
    paddingHorizontal: 12,
  },
  footerNoteText: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    flex: 1,
  },
});
