import React, { useState, useEffect } from 'react';
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
  Platform,
} from 'react-native';
import { useOficios } from '@/context/OficiosContext';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Trabajador, TRABAJADORES_PRUEBA } from '@/data/oficios';

const CIUDADES_PERMITIDAS = ['Aguilares', 'Concepción', 'Monteros', 'San Miguel de Tucumán'];

function mostrarAlerta(titulo: string, mensaje: string) {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    window.alert(`${titulo}: ${mensaje}`);
  } else {
    Alert.alert(titulo, mensaje);
  }
}

function confirmarAccion(titulo: string, mensaje: string, alConfirmar: () => void) {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const ok = window.confirm(`${titulo}\n\n${mensaje}`);
    if (ok) {
      alConfirmar();
    }
  } else {
    Alert.alert(titulo, mensaje, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Aceptar', style: 'destructive', onPress: alConfirmar },
    ]);
  }
}

export default function AdminOficiosScreen() {
  const { trabajadores, categorias, agregarTrabajador, eliminarTrabajador, limpiarMemoria, restaurarPrueba } = useOficios();

  const [mounted, setMounted] = useState(false);
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fotoUrl, setFotoUrl] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [restaurando, setRestaurando] = useState(false);

  // Estados para los desplegables
  const [ubicacion, setUbicacion] = useState(CIUDADES_PERMITIDAS[0]);
  const [categoriaId, setCategoriaId] = useState(categorias[0]?.id || 'carpinteria');

  // Estados para controlar los Modales (solo se montan cuando están abiertos para evitar overlays invisibles en web)
  const [modalCiudadVisible, setModalCiudadVisible] = useState(false);
  const [modalCategoriaVisible, setModalCategoriaVisible] = useState(false);

  useEffect(() => {
    setMounted(true);
    setGuardando(false);
    setRestaurando(false);
  }, []);

  const handleSave = async () => {
    console.log('Click detectado en Guardar');
    console.log('>>> Botón presionado: handleSave');

    if (!nombre.trim()) {
      mostrarAlerta('Atención', 'Por favor ingresa el nombre completo del trabajador.');
      return;
    }

    if (!telefono.trim()) {
      mostrarAlerta('Atención', 'Por favor ingresa el número de WhatsApp.');
      return;
    }

    const telLimpio = telefono.replace(/\D/g, '');

    if (!telLimpio.startsWith('549')) {
      mostrarAlerta(
        'Teléfono inválido',
        'El número debe comenzar con "549" (código de país y prefijo móvil de Argentina, ej: 549381xxxxxxx).'
      );
      return;
    }

    if (telLimpio.length < 12 || telLimpio.length > 13) {
      mostrarAlerta(
        'Teléfono inválido',
        `El número ingresado tiene ${telLimpio.length} dígitos. Debe tener 12 o 13 dígitos en total (sin 0 ni 15).`
      );
      return;
    }

    if (!ubicacion) {
      mostrarAlerta('Atención', 'Por favor selecciona una ciudad.');
      return;
    }

    if (!categoriaId) {
      mostrarAlerta('Atención', 'Por favor selecciona un oficio / categoría.');
      return;
    }

    if (!descripcion.trim()) {
      mostrarAlerta('Atención', 'Por favor ingresa una descripción de los servicios que realiza.');
      return;
    }

    setGuardando(true);

    try {
      const nuevoTrabajador: Trabajador = {
        id: `trabajador_${Date.now()}`,
        nombre: nombre.trim(),
        telefono: telLimpio,
        ubicacion,
        descripcion: descripcion.trim(),
        categoriaId,
        fotos: fotoUrl.trim() ? [fotoUrl.trim()] : [],
      };

      // Intentar guardar en Firestore
      try {
        const docRef = await addDoc(collection(db, 'oficios'), {
          ...nuevoTrabajador,
          creadoEl: new Date().toISOString(),
        });
        nuevoTrabajador.id = docRef.id;
      } catch (firestoreErr) {
        console.warn('Advertencia: No se pudo guardar en Firestore directamente, guardando en memoria local:', firestoreErr);
      }

      // Siempre actualizar el estado local para reflejo inmediato
      agregarTrabajador(nuevoTrabajador);

      mostrarAlerta('Éxito', 'Trabajador guardado con éxito.');
      setNombre('');
      setTelefono('');
      setDescripcion('');
      setFotoUrl('');
    } catch (error: any) {
      console.error('Error al guardar trabajador:', error);
      mostrarAlerta('Error', `Ocurrió un problema al guardar: ${error?.message || error}`);
    } finally {
      setGuardando(false);
    }
  };

  const handleRestore = async () => {
    console.log('Click detectado en Restaurar');
    console.log('>>> Botón presionado: handleRestore');
    setRestaurando(true);

    try {
      restaurarPrueba();
      mostrarAlerta('Éxito', `Se han restaurado ${TRABAJADORES_PRUEBA.length} trabajadores de prueba correctamente.`);
    } catch (error: any) {
      console.error('Error al restaurar trabajadores de prueba:', error);
      mostrarAlerta('Error', `No se pudo restaurar: ${error?.message || error}`);
    } finally {
      setRestaurando(false);
    }
  };

  const handleClear = () => {
    console.log('Click detectado en Limpiar');
    console.log('>>> Botón presionado: handleClear');
    confirmarAccion('¡Atención!', '¿Estás seguro de que deseas borrar todos los trabajadores guardados?', () => {
      try {
        limpiarMemoria();
        mostrarAlerta('Memoria limpia', 'Se han borrado los trabajadores guardados.');
      } catch (error: any) {
        console.error('Error al limpiar memoria:', error);
        mostrarAlerta('Error', `No se pudo limpiar la memoria: ${error?.message || error}`);
      }
    });
  };

  const handleEliminar = (id: string) => {
    console.log('Click detectado en Eliminar', id);
    console.log('>>> Botón presionado: handleEliminar', id);
    confirmarAccion('Eliminar Trabajador', '¿Deseas eliminar este trabajador?', async () => {
      try {
        await eliminarTrabajador(id);
        mostrarAlerta('Éxito', 'Trabajador eliminado con éxito.');
      } catch (error: any) {
        console.error('Error al eliminar trabajador:', error);
        mostrarAlerta('Error', `No se pudo eliminar el trabajador: ${error?.message || error}`);
      }
    });
  };

  const getNombreCategoria = (id: string) => {
    const cat = categorias.find((c) => c.id === id);
    return cat ? cat.nombre : 'Seleccionar categoría...';
  };

  // Durante la primera hidratación del servidor o cliente, renderizar el placeholder para evitar error #418
  if (!mounted) {
    return (
      <View style={styles.screenWrapper}>
        <Stack.Screen options={{ title: 'Gestión de Oficios' }} />
        <View style={styles.loadingWrapper}>
          <ActivityIndicator size="large" color="#1E3A8A" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screenWrapper}>
      <Stack.Screen options={{ title: 'Gestión de Oficios' }} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.form}>
          <Text style={styles.title}>Cargar Nuevo Trabajador</Text>

          {/* DESPLEGABLE DE CATEGORÍA */}
          <Text style={styles.label}>Oficio / Categoría</Text>
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setModalCategoriaVisible(true)}
            activeOpacity={0.7}
          >
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
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setModalCiudadVisible(true)}
            activeOpacity={0.7}
          >
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
            onPress={handleSave}
            disabled={guardando}
            activeOpacity={0.8}
          >
            {guardando ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.btnText}>Guardar Trabajador</Text>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.titleList}>Trabajadores Registrados ({trabajadores.length})</Text>

        {trabajadores.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={32} color="#9ca3af" />
            <Text style={styles.emptyText}>No hay trabajadores cargados en este momento.</Text>
            <Text style={styles.emptySubtext}>Puedes usar el botón "Restaurar Prueba" para cargar datos iniciales.</Text>
          </View>
        ) : (
          trabajadores.map((item) => (
            <View key={item.id} style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{item.nombre}</Text>
                <Text style={styles.cardSubtitle}>
                  {item.ubicacion} - {getNombreCategoria(item.categoriaId)}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => handleEliminar(item.id)}
                style={styles.btnEliminar}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                activeOpacity={0.7}
              >
                <Ionicons name="trash-outline" size={20} color="white" />
              </TouchableOpacity>
            </View>
          ))
        )}

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.btnRestaurar, restaurando && { opacity: 0.7 }]}
            onPress={handleRestore}
            disabled={restaurando}
            activeOpacity={0.8}
          >
            {restaurando ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.btnAccionText}>Restaurar Prueba</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnLimpiar}
            onPress={handleClear}
            activeOpacity={0.8}
          >
            <Text style={styles.btnAccionText}>Limpiar Memoria</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* MODAL PARA ELEGIR CIUDAD: solo se monta cuando modalCiudadVisible es true */}
      {modalCiudadVisible && (
        <Modal
          visible={modalCiudadVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setModalCiudadVisible(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setModalCiudadVisible(false)}
          >
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
                  activeOpacity={0.7}
                >
                  <Text style={styles.modalItemText}>{ciudad}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>
      )}

      {/* MODAL PARA ELEGIR CATEGORÍA: solo se monta cuando modalCategoriaVisible es true */}
      {modalCategoriaVisible && (
        <Modal
          visible={modalCategoriaVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setModalCategoriaVisible(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setModalCategoriaVisible(false)}
          >
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
                    activeOpacity={0.7}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons
                        name={item.icono as any}
                        size={20}
                        color="#1E3A8A"
                        style={{ marginRight: 10 }}
                      />
                      <Text style={styles.modalItemText}>{item.nombre}</Text>
                    </View>
                  </TouchableOpacity>
                )}
              />
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screenWrapper: {
    flex: 1,
    backgroundColor: '#f4f4f5',
  },
  loadingWrapper: {
    flex: 1,
    minHeight: 400,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 60,
  },
  form: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
    ...Platform.select({
      web: {
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      },
    }),
  },
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
  btnGuardar: {
    backgroundColor: '#1E3A8A',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        userSelect: 'none',
      },
    }),
  },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  card: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    alignItems: 'center',
    elevation: 1,
    ...Platform.select({
      web: {
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
      },
    }),
  },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#1f2937' },
  cardSubtitle: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  btnEliminar: {
    backgroundColor: '#ef4444',
    padding: 10,
    borderRadius: 8,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  emptyContainer: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4b5563',
    marginTop: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 13,
    color: '#9ca3af',
    marginTop: 4,
    textAlign: 'center',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 20,
  },
  btnRestaurar: {
    backgroundColor: '#10b981',
    padding: 14,
    borderRadius: 8,
    flex: 0.48,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: {
        cursor: 'pointer',
        userSelect: 'none',
      },
    }),
  },
  btnLimpiar: {
    backgroundColor: '#ef4444',
    padding: 14,
    borderRadius: 8,
    flex: 0.48,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: {
        cursor: 'pointer',
        userSelect: 'none',
      },
    }),
  },
  btnAccionText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
    ...Platform.select({
      web: {
        position: 'fixed' as any,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
      },
    }),
  },
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
