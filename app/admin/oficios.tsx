import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Modal,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useOficios } from '@/context/OficiosContext';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

const CIUDADES_PERMITIDAS = ['Aguilares', 'Concepción', 'Monteros', 'San Miguel de Tucumán'];

export default function AdminOficiosScreen() {
  const { trabajadores, categorias, eliminarTrabajador, limpiarMemoria, restaurarPrueba } = useOficios();

  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fotoUrl, setFotoUrl] = useState('');
  const [guardando, setGuardando] = useState(false);

  // Estados para los desplegables
  const [ubicacion, setUbicacion] = useState(CIUDADES_PERMITIDAS[0]);
  const [categoriaId, setCategoriaId] = useState(categorias[0]?.id || '');

  // Estados para controlar los Modales
  const [modalCiudadVisible, setModalCiudadVisible] = useState(false);
  const [modalCategoriaVisible, setModalCategoriaVisible] = useState(false);

  const handleGuardar = async () => {
    if (!nombre.trim() || !telefono.trim() || !ubicacion || !descripcion.trim() || !categoriaId) {
      return Alert.alert('Error', 'Completa todos los campos obligatorios');
    }

    const telLimpio = telefono.replace(/\D/g, '');

    // Validación rápida de teléfono para WhatsApp Argentina (549 + cód. área + número)
    if (!telLimpio.startsWith('549')) {
      return Alert.alert(
        'Teléfono inválido',
        'El número debe comenzar con "549" (código de país y prefijo móvil de Argentina para WhatsApp, Ej: 549381xxxxxxx).'
      );
    }

    if (telLimpio.length < 12 || telLimpio.length > 13) {
      return Alert.alert(
        'Teléfono inválido',
        `El número ingresado tiene ${telLimpio.length} dígitos. Un número móvil de Argentina debe tener 12 o 13 dígitos en total (sin 0 ni 15).`
      );
    }

    setGuardando(true);

    try {
      const nuevoTrabajadorData = {
        nombre: nombre.trim(),
        telefono: telLimpio,
        ubicacion,
        descripcion: descripcion.trim(),
        categoriaId,
        fotos: fotoUrl.trim() ? [fotoUrl.trim()] : [],
        creadoEl: new Date().toISOString(),
      };

      // Guardar en la colección 'oficios' de Firebase Firestore
      // Al usar onSnapshot en el contexto, la lista se actualizará sola sin necesidad de modificar el estado local
      await addDoc(collection(db, 'oficios'), nuevoTrabajadorData);

      Alert.alert('Éxito', 'Trabajador agregado correctamente en la base de datos');
      setNombre('');
      setTelefono('');
      setDescripcion('');
      setFotoUrl('');
    } catch (error) {
      console.error('Error guardando oficio:', error);
      Alert.alert('Error', 'No se pudo guardar en Firebase. Revisa las reglas de seguridad o la consola.');
    } finally {
      setGuardando(false);
    }
  };

  const getNombreCategoria = (id: string) => {
    const cat = categorias.find((c) => c.id === id);
    return cat ? cat.nombre : 'Seleccionar categoría...';
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Stack.Screen options={{ title: 'Gestión de Oficios' }} />

      <View style={styles.form}>
        <Text style={styles.title}>Cargar Nuevo Trabajador</Text>

        {/* DESPLEGABLE DE CATEGORÍA */}
        <Text style={styles.label}>Oficio / Categoría</Text>
        <TouchableOpacity style={styles.pickerButton} onPress={() => setModalCategoriaVisible(true)}>
          <Text style={styles.pickerText}>{getNombreCategoria(categoriaId)}</Text>
          <Ionicons name="chevron-down" size={20} color="#6b7280" />
        </TouchableOpacity>

        <Text style={styles.label}>Nombre completo</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: Juan Pérez"
          placeholderTextColor="#9ca3af"
          value={nombre}
          onChangeText={setNombre}
        />

        <Text style={styles.label}>Teléfono (WhatsApp)</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: 5493811234567"
          placeholderTextColor="#9ca3af"
          value={telefono}
          onChangeText={setTelefono}
          keyboardType="phone-pad"
        />

        {/* DESPLEGABLE DE CIUDAD */}
        <Text style={styles.label}>Ciudad</Text>
        <TouchableOpacity style={styles.pickerButton} onPress={() => setModalCiudadVisible(true)}>
          <Text style={styles.pickerText}>{ubicacion}</Text>
          <Ionicons name="chevron-down" size={20} color="#6b7280" />
        </TouchableOpacity>

        <Text style={styles.label}>Descripción de los servicios</Text>
        <TextInput
          style={[styles.input, { minHeight: 70, textAlignVertical: 'top' }]}
          placeholder="¿Qué trabajos realiza?"
          placeholderTextColor="#9ca3af"
          value={descripcion}
          onChangeText={setDescripcion}
          multiline
          numberOfLines={3}
        />

        <Text style={styles.label}>URL de la foto (Opcional)</Text>
        <TextInput
          style={styles.input}
          placeholder="https://..."
          placeholderTextColor="#9ca3af"
          value={fotoUrl}
          onChangeText={setFotoUrl}
        />

        <TouchableOpacity
          style={[styles.btnGuardar, guardando && { opacity: 0.7 }]}
          onPress={handleGuardar}
          disabled={guardando}
          activeOpacity={0.85}
        >
          {guardando ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.btnText}>Guardar Trabajador</Text>
          )}
        </TouchableOpacity>
      </View>

      <Text style={styles.titleList}>Trabajadores Registrados ({trabajadores.length})</Text>
      {trabajadores.map((item) => (
        <View key={item.id} style={styles.card}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>{item.nombre}</Text>
            <Text style={styles.cardSubtitle}>
              {item.ubicacion} - {getNombreCategoria(item.categoriaId)}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => eliminarTrabajador(item.id)}
            style={styles.btnEliminar}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="trash-outline" size={20} color="white" />
          </TouchableOpacity>
        </View>
      ))}

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
        <TouchableOpacity
          style={{ backgroundColor: '#10b981', padding: 12, borderRadius: 8, flex: 0.48, alignItems: 'center' }}
          onPress={restaurarPrueba}
        >
          <Text style={{ color: 'white', fontWeight: 'bold' }}>Restaurar Prueba</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{ backgroundColor: '#ef4444', padding: 12, borderRadius: 8, flex: 0.48, alignItems: 'center' }}
          onPress={() => {
            Alert.alert('¡Atención!', '¿Borrar todos los trabajadores guardados?', [
              { text: 'Cancelar', style: 'cancel' },
              { text: 'Borrar todo', style: 'destructive', onPress: limpiarMemoria },
            ]);
          }}
        >
          <Text style={{ color: 'white', fontWeight: 'bold' }}>Limpiar Memoria</Text>
        </TouchableOpacity>
      </View>

      {/* MODAL PARA ELEGIR CIUDAD */}
      <Modal visible={modalCiudadVisible} transparent={true} animationType="slide">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setModalCiudadVisible(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Seleccionar Ciudad</Text>
            {CIUDADES_PERMITIDAS.map((ciudad) => (
              <TouchableOpacity
                key={ciudad}
                style={styles.modalItem}
                onPress={() => {
                  setUbicacion(ciudad);
                  setModalCiudadVisible(false);
                }}
              >
                <Text style={styles.modalItemText}>{ciudad}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* MODAL PARA ELEGIR CATEGORÍA */}
      <Modal visible={modalCategoriaVisible} transparent={true} animationType="slide">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setModalCategoriaVisible(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Seleccionar Oficio</Text>
            <FlatList
              data={categorias}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    setCategoriaId(item.id);
                    setModalCategoriaVisible(false);
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name={item.icono as any} size={20} color="#1E3A8A" style={{ marginRight: 10 }} />
                    <Text style={styles.modalItemText}>{item.nombre}</Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f4f5', padding: 16 },
  form: { backgroundColor: 'white', padding: 16, borderRadius: 12, marginBottom: 20, elevation: 2 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, color: '#1f2937' },
  titleList: { fontSize: 20, fontWeight: 'bold', marginBottom: 12, color: '#1f2937', marginTop: 10 },
  label: { fontSize: 12, fontWeight: '600', color: '#4b5563', marginBottom: 6 },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    color: '#1f2937',
  },
  pickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  pickerText: { fontSize: 16, color: '#1f2937' },
  btnGuardar: { backgroundColor: '#1E3A8A', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  card: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    alignItems: 'center',
    elevation: 1,
  },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#1f2937' },
  cardSubtitle: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  btnEliminar: { backgroundColor: '#ef4444', padding: 10, borderRadius: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '60%',
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#1f2937', marginBottom: 15, textAlign: 'center' },
  modalItem: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  modalItemText: { fontSize: 16, color: '#374151' },
});
