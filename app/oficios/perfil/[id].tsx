import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Linking } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useOficios } from '../../../context/OficiosContext';

export default function PerfilOficioScreen() {
  const { id } = useLocalSearchParams();
  const { trabajadores } = useOficios();
  const trabajador = trabajadores.find((t) => t.id === id);

  if (!trabajador) {
    return (
      <View style={styles.notFoundContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#94a3af" />
        <Text style={styles.notFoundText}>No se encontró el perfil del trabajador.</Text>
      </View>
    );
  }

  const abrirWhatsApp = () => {
    const tel = trabajador.telefono.replace(/\D/g, '');
    const msg = encodeURIComponent(`Hola ${trabajador.nombre}, vi tu perfil en CercaTuyo y me gustaría hacerte una consulta.`);
    Linking.openURL(`https://wa.me/${tel}?text=${msg}`).catch((err) => {
      console.warn('Error al abrir WhatsApp:', err);
    });
  };

  const realizarLlamada = () => {
    const tel = trabajador.telefono.replace(/\D/g, '');
    Linking.openURL(`tel:+${tel}`).catch((err) => {
      console.warn('Error al realizar llamada:', err);
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 30 }}>
      <Stack.Screen options={{ title: 'Perfil del Trabajador' }} />

      <View style={styles.header}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={40} color="white" />
        </View>
        <Text style={styles.nombre}>{trabajador.nombre}</Text>
        <View style={styles.ubicacion}>
          <Ionicons name="location" size={16} color="#4b5563" />
          <Text style={styles.ubicacionText}>{trabajador.ubicacion}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sobre el servicio</Text>
        <Text style={styles.descripcion}>{trabajador.descripcion}</Text>
      </View>

      {trabajador.fotos && trabajador.fotos.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trabajos realizados</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.galeria}>
            {trabajador.fotos.map((foto, index) => (
              <Image key={index} source={{ uri: foto }} style={styles.foto} />
            ))}
          </ScrollView>
        </View>
      )}

      {/* BOTONES DE CONTACTO DIRECTO */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.btnWhatsapp} onPress={abrirWhatsApp} activeOpacity={0.85}>
          <Ionicons name="logo-whatsapp" size={24} color="white" />
          <Text style={styles.btnText}>Contactar por WhatsApp</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnLlamar} onPress={realizarLlamada} activeOpacity={0.85}>
          <Ionicons name="call-outline" size={20} color="#1E3A8A" />
          <Text style={styles.btnLlamarText}>Llamar por teléfono</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f4f5' },
  notFoundContainer: {
    flex: 1,
    backgroundColor: '#f4f4f5',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  notFoundText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '600',
  },
  header: {
    backgroundColor: 'white',
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  avatar: {
    width: 80,
    height: 80,
    backgroundColor: '#9ca3af',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  nombre: { fontSize: 24, fontWeight: 'bold', color: '#1f2937' },
  ubicacion: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  ubicacionText: { marginLeft: 4, color: '#4b5563', fontSize: 16 },
  section: { backgroundColor: 'white', padding: 20, marginTop: 12 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1f2937', marginBottom: 12 },
  descripcion: { fontSize: 16, color: '#4b5563', lineHeight: 24 },
  galeria: { flexDirection: 'row' },
  foto: { width: 200, height: 150, borderRadius: 12, marginRight: 12, backgroundColor: '#e5e7eb' },
  actionsContainer: {
    padding: 20,
    gap: 12,
  },
  btnWhatsapp: {
    backgroundColor: '#25D366',
    flexDirection: 'row',
    paddingVertical: 16,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#25D366',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  btnText: { color: 'white', fontSize: 16, fontWeight: 'bold', marginLeft: 10 },
  btnLlamar: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#1E3A8A',
    flexDirection: 'row',
    paddingVertical: 14,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnLlamarText: {
    color: '#1E3A8A',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 10,
  },
});

