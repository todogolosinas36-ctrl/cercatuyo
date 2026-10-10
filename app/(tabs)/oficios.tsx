import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useOficios } from '../../context/OficiosContext';

export default function OficiosScreen() {
  const { categorias } = useOficios(); // <-- AHORA USA EL CONTEXTO DINÁMICO

  return (
    <View style={styles.container}>
      <Text style={styles.title}>¿Qué estás buscando?</Text>
      <FlatList
        data={categorias}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.card} 
            onPress={() => router.push(`/oficios/${item.id}` as any)}
          >
            <Ionicons name={item.icono as any} size={40} color="#1E3A8A" />
            <Text style={styles.cardText}>{item.nombre}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f4f5', padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1f2937', marginBottom: 20, textAlign: 'center' },
  row: { justifyContent: 'space-between', marginBottom: 16 },
  card: {
    backgroundColor: 'white', flex: 0.48, padding: 20, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3
  },
  cardText: { marginTop: 12, fontSize: 16, fontWeight: '600', color: '#374151' }
});
