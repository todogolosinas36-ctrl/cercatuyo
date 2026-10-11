import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@cercatuyo_admin_session';

export default function AdminLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // Campos de formulario
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  // Verificamos si existe sesión previa guardada en AsyncStorage
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((val) => {
        if (val === 'true') {
          setIsAuthenticated(true);
        }
      })
      .catch(() => {})
      .finally(() => {
        setLoadingAuth(false);
      });
  }, []);

  const handleLogin = async () => {
    // Validación estricta: usuario exactamente "admin" y contraseña exactamente "admin"
    if (usuario.trim() === 'admin' && password === 'admin') {
      setIsAuthenticated(true);
      setError('');
      setUsuario('');
      setPassword('');
      try {
        await AsyncStorage.setItem(STORAGE_KEY, 'true');
      } catch (e) {
        console.warn('Error al guardar sesión:', e);
      }
    } else {
      setError('Credenciales inválidas. Verifica usuario y contraseña.');
    }
  };

  const handleLogout = async () => {
    setIsAuthenticated(false);
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('Error al borrar sesión:', e);
    }
    router.replace('/');
  };

  // Pantalla de carga inicial mientras se consulta AsyncStorage
  if (loadingAuth) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  // Si no está autenticado, mostramos ÚNICAMENTE la pantalla de login privado
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.authContainer}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.authScrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.authCard}>
              {/* Ícono de Escudo / Seguridad */}
              <View style={styles.iconCircle}>
                <Ionicons name="shield-checkmark" size={38} color="#2563EB" />
              </View>

              <Text style={styles.authTitle}>Panel de Administración</Text>
              <Text style={styles.authSubtitle}>
                Acceso restringido para gestión de contenidos y datos de CercaTuyo.
              </Text>

              {/* Mensaje de error destacado si las credenciales fallan */}
              {error ? (
                <View style={styles.errorBanner}>
                  <Ionicons name="alert-circle" size={18} color="#EF4444" />
                  <Text style={styles.errorBannerText}>{error}</Text>
                </View>
              ) : null}

              {/* CAMPO: USUARIO */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>USUARIO</Text>
                <View style={[styles.inputWrapper, error ? styles.inputWrapperError : null]}>
                  <Ionicons name="person-outline" size={20} color="#64748B" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="admin"
                    placeholderTextColor="#94A3B8"
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={usuario}
                    onChangeText={(val) => {
                      setUsuario(val);
                      if (error) setError('');
                    }}
                    returnKeyType="next"
                  />
                </View>
              </View>

              {/* CAMPO: CONTRASEÑA */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>CONTRASEÑA</Text>
                <View style={[styles.inputWrapper, error ? styles.inputWrapperError : null]}>
                  <Ionicons name="lock-closed-outline" size={20} color="#64748B" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="••••••••"
                    placeholderTextColor="#94A3B8"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={password}
                    onChangeText={(val) => {
                      setPassword(val);
                      if (error) setError('');
                    }}
                    onSubmitEditing={handleLogin}
                    returnKeyType="done"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeButton}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color="#64748B"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* BOTÓN DE ACCESO ANCHO Y DESTACADO */}
              <TouchableOpacity
                style={styles.btnIngresar}
                onPress={handleLogin}
                activeOpacity={0.85}
              >
                <Text style={styles.btnIngresarText}>Iniciar Sesión</Text>
                <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
              </TouchableOpacity>

              {/* BOTÓN SECUNDARIO: VOLVER A LA APP PÚBLICA */}
              <TouchableOpacity
                style={styles.btnVolver}
                onPress={() => router.replace('/')}
                activeOpacity={0.7}
              >
                <Ionicons name="arrow-back" size={16} color="#64748B" />
                <Text style={styles.btnVolverText}>Volver a la app pública</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // Una vez autenticado, renderizamos el Stack interno con sus vistas
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#1E3A8A',
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: '700',
        },
        headerShadowVisible: false,
        headerRight: () => (
          <TouchableOpacity
            onPress={handleLogout}
            style={styles.btnLogoutHeader}
            activeOpacity={0.8}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="log-out-outline" size={18} color="#FFFFFF" />
            <Text style={styles.btnLogoutHeaderText}>Salir</Text>
          </TouchableOpacity>
        ),
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Panel de Control',
          headerBackVisible: false,
        }}
      />
      <Stack.Screen
        name="oficios"
        options={{
          title: 'Gestión de Oficios',
          headerBackTitle: 'Panel',
        }}
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  authContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  authScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  authCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#DBEAFE',
  },
  authTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  authSubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  errorBanner: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 18,
  },
  errorBannerText: {
    flex: 1,
    fontSize: 13,
    color: '#DC2626',
    fontWeight: '600',
  },
  inputGroup: {
    width: '100%',
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 52,
  },
  inputWrapperError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#0F172A',
    fontWeight: '600',
  },
  eyeButton: {
    padding: 6,
  },
  btnIngresar: {
    width: '100%',
    backgroundColor: '#1E3A8A',
    paddingVertical: 15,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 10,
    shadowColor: '#1E3A8A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  btnIngresarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  btnVolver: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  btnVolverText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '600',
  },
  btnLogoutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginRight: 4,
  },
  btnLogoutHeaderText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
