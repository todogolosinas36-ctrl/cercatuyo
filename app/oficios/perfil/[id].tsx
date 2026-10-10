import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Linking } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useOficios } from '../../../context/OficiosContext';

export default function PerfilOficioScreen() {
  const { id } = useLocalSearchParams();
  const { trabajadores } = useOficios();
  const trabajador = trabajadores.find(t => t.id === id);

  if (!trabajador) return <View style={styles.container}><Text>No encontrado</Text></View>;

  const abrirWhatsApp = () => {
    const url = `https://wa.me/${trabajador.telefono}?text=Hola%20${trabajador.nombre},%20vi%20tu%20perfil%20en%20CercaTuyo%20y%20me%20gustaría%20hacerte%20una%20consulta.`;
    Linking.openURL(url);
  };

  return (
    <ScrollView style={styles.container}>
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

      <TouchableOpacity style={styles.btnWhatsapp} onPress={abrirWhatsApp}>
        <Ionicons name="logo-whatsapp" size={24} color="white" />
        <Text style={styles.btnText}>Contactar por WhatsApp</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f4f5' },
  header: { backgroundColor: 'white', padding: 24, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  avatar: { width: 80, height: 80, backgroundColor: '#9ca3af', borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  nombre: { fontSize: 24, fontWeight: 'bold', color: '#1f2937' },
  ubicacion: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  ubicacionText: { marginLeft: 4, color: '#4b5563', fontSize: 16 },
  section: { backgroundColor: 'white', padding: 20, marginTop: 12 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1f2937', marginBottom: 12 },
  descripcion: { fontSize: 16, color: '#4b5563', lineHeight: 24 },
  galeria: { flexDirection: 'row' },
  foto: { width: 200, height: 150, borderRadius: 12, marginRight: 12, backgroundColor: '#e5e7eb' },
  btnWhatsapp: { backgroundColor: '#25D366', flexDirection: 'row', margin: 20, padding: 16, borderRadius: 12, justifyContent: 'center', alignItems: 'center', elevation: 3 },
  btnText: { color: 'white', fontSize: 18, fontWeight: 'bold', marginLeft: 12 }
});
