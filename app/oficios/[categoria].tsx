import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useOficios } from '../../context/OficiosContext'; // ÚNICA FUENTE DE DATOS

export default function ListaOficiosScreen() {
  const params = useLocalSearchParams();
  const categoriaIdStr = String(params.categoria);
  const { categorias, trabajadores, cargando } = useOficios(); // Extraemos del estado global

  const categoriaInfo = categorias.find(c => c.id === categoriaIdStr);
  const [ciudadFiltro, setCiudadFiltro] = useState<string>('Todas');
  
  // Filtramos los trabajadores que pertenecen a esta categoría específica
  const trabajadoresDeEstaCategoria = trabajadores.filter(t => t.categoriaId === categoriaIdStr);

  // Extraemos las ciudades ÚNICAMENTE de los trabajadores de esta categoría
  const ciudadesUnicas = Array.from(new Set(trabajadoresDeEstaCategoria.map(t => t.ubicacion))).sort();
  const ciudades = ['Todas', ...ciudadesUnicas];

  // Filtro final aplicando la ciudad seleccionada
  const trabajadoresFiltrados = trabajadoresDeEstaCategoria.filter(t => 
    ciudadFiltro === 'Todas' || t.ubicacion === ciudadFiltro
  );

  // Reseteamos el filtro de ciudad si la categoría cambia
  useEffect(() => {
    setCiudadFiltro('Todas');
  }, [categoriaIdStr]);

  if (cargando) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center', marginTop: 50 }}>Cargando oficios...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: categoriaInfo?.nombre || 'Oficios' }} />
      
      {ciudades.length > 1 && (
        <View style={styles.filtroContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {ciudades.map(ciudad => (
              <TouchableOpacity 
                key={ciudad} 
                style={[styles.chip, ciudadFiltro === ciudad && styles.chipActive]}
                onPress={() => setCiudadFiltro(ciudad)}
              >
                <Text style={[styles.chipText, ciudadFiltro === ciudad && styles.chipTextActive]}>
                  {ciudad}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {trabajadoresFiltrados.length === 0 ? (
        <Text style={styles.emptyText}>No hay trabajadores registrados aquí aún.</Text>
      ) : (
        <FlatList
          data={trabajadoresFiltrados}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => router.push(`/oficios/perfil/${item.id}` as any)}>
              <View style={styles.cardHeader}>
                <Text style={styles.nombre}>{item.nombre}</Text>
                <View style={styles.ubicacionBadge}>
                  <Ionicons name="location-outline" size={14} color="#1E3A8A" />
                  <Text style={styles.ubicacionText}>{item.ubicacion}</Text>
                </View>
              </View>
              <Text style={styles.descripcion} numberOfLines={2}>{item.descripcion}</Text>
              {item.fotos && item.fotos.length > 0 && (
                <Text style={styles.fotosIndicador}>
                  <Ionicons name="camera-outline" size={14} color="#059669" /> Tiene fotos de trabajos
                </Text>
              )}
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f4f5' },
  filtroContainer: { backgroundColor: 'white', paddingVertical: 12, paddingHorizontal: 16, marginBottom: 10, elevation: 1 },
  chip: { backgroundColor: '#e5e7eb', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 10 },
  chipActive: { backgroundColor: '#1E3A8A' },
  chipText: { color: '#4b5563', fontWeight: '600' },
  chipTextActive: { color: 'white' },
  emptyText: { textAlign: 'center', marginTop: 40, color: '#6b7280', fontSize: 16, paddingHorizontal: 20 },
  card: { backgroundColor: 'white', padding: 16, marginHorizontal: 16, marginBottom: 12, borderRadius: 12, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  nombre: { fontSize: 18, fontWeight: 'bold', color: '#1f2937', flex: 1 },
  ubicacionBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#eff6ff', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginLeft: 10 },
  ubicacionText: { marginLeft: 4, color: '#1E3A8A', fontSize: 12, fontWeight: '600' },
  descripcion: { color: '#4b5563', fontSize: 14, lineHeight: 20 },
  fotosIndicador: { marginTop: 10, color: '#059669', fontSize: 12, fontWeight: '600', flexDirection: 'row', alignItems: 'center' }
});
