import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Platform,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CiudadConfig {
  nombre: string;
  lat: number;
  lon: number;
}

const CIUDADES: CiudadConfig[] = [
  { nombre: 'Aguilares', lat: -27.4338, lon: -65.6143 },
  { nombre: 'Monteros', lat: -27.1675, lon: -65.4983 },
  { nombre: 'Famaillá', lat: -27.0541, lon: -65.4033 },
  { nombre: 'San Miguel de Tucumán', lat: -26.8241, lon: -65.2226 },
];

interface PronosticoDia {
  nombreDia: string;
  codigoClima: number;
  tempMax: number;
  tempMin: number;
}

interface ClimaCiudad {
  nombreCiudad: string;
  tempActual: number;
  codigoClimaActual: number;
  pronostico: PronosticoDia[];
}

function formatearDiaCorto(fechaStr: string): string {
  try {
    const partes = fechaStr.split('-');
    if (partes.length === 3) {
      const anio = parseInt(partes[0], 10);
      const mes = parseInt(partes[1], 10) - 1;
      const dia = parseInt(partes[2], 10);
      const fecha = new Date(anio, mes, dia);
      const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
      return dias[fecha.getDay()] || '';
    }
  } catch {
    // fallback
  }
  return '';
}

function obtenerInfoClima(codigo?: number): {
  icon: keyof typeof Ionicons.glyphMap;
  desc: string;
} {
  if (codigo === undefined || codigo === null) {
    return { icon: 'partly-sunny-outline', desc: 'Templado' };
  }
  if (codigo === 0) {
    return { icon: 'sunny-outline', desc: 'Despejado' };
  }
  if (codigo === 1 || codigo === 2) {
    return { icon: 'partly-sunny-outline', desc: 'Parcialmente nublado' };
  }
  if (codigo === 3) {
    return { icon: 'cloudy-outline', desc: 'Nublado' };
  }
  if (codigo === 45 || codigo === 48) {
    return { icon: 'cloud-outline', desc: 'Neblina' };
  }
  if (codigo >= 51 && codigo <= 55) {
    return { icon: 'rainy-outline', desc: 'Llovizna' };
  }
  if (codigo === 56 || codigo === 57) {
    return { icon: 'rainy-outline', desc: 'Llovizna helada' };
  }
  if (codigo >= 61 && codigo <= 65) {
    return { icon: 'rainy-outline', desc: 'Lluvia' };
  }
  if (codigo === 66 || codigo === 67) {
    return { icon: 'rainy-outline', desc: 'Lluvia helada' };
  }
  if (codigo >= 71 && codigo <= 77) {
    return { icon: 'snow-outline', desc: 'Nieve' };
  }
  if (codigo >= 80 && codigo <= 82) {
    return { icon: 'rainy', desc: 'Chubascos' };
  }
  if (codigo === 85 || codigo === 86) {
    return { icon: 'snow-outline', desc: 'Chubascos de nieve' };
  }
  if (codigo === 95) {
    return { icon: 'thunderstorm-outline', desc: 'Tormenta' };
  }
  if (codigo >= 96) {
    return { icon: 'thunderstorm', desc: 'Tormenta con granizo' };
  }
  return { icon: 'partly-sunny-outline', desc: 'Parcialmente nublado' };
}

export default function ClimaWidget() {
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [datosClima, setDatosClima] = useState<ClimaCiudad[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [indiceActual, setIndiceActual] = useState<number>(0);

  const indiceActualRef = useRef<number>(0);
  const animandoRef = useRef<boolean>(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Consulta de datos de clima para las 4 ciudades
  useEffect(() => {
    if (!isMounted) return;
    let activo = true;

    const consultarClima = async () => {
      try {
        const promesas = CIUDADES.map(async (ciudad) => {
          const url = `https://api.open-meteo.com/v1/forecast?latitude=${ciudad.lat}&longitude=${ciudad.lon}&current=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=America%2FArgentina%2FTucuman&forecast_days=4`;
          const res = await fetch(url);
          if (!res.ok) throw new Error(`Error al consultar clima de ${ciudad.nombre}`);
          const data = await res.json();

          const pronostico: PronosticoDia[] = [1, 2, 3].map((idx) => {
            const fechaStr = data.daily?.time?.[idx] || '';
            return {
              nombreDia: formatearDiaCorto(fechaStr),
              codigoClima: data.daily?.weather_code?.[idx] ?? 0,
              tempMax: Math.round(data.daily?.temperature_2m_max?.[idx] ?? 0),
              tempMin: Math.round(data.daily?.temperature_2m_min?.[idx] ?? 0),
            };
          });

          return {
            nombreCiudad: ciudad.nombre,
            tempActual: Math.round(data.current?.temperature_2m ?? 0),
            codigoClimaActual: data.current?.weather_code ?? 0,
            pronostico,
          };
        });

        const resultados = await Promise.all(promesas);
        if (activo) {
          setDatosClima(resultados);
        }
      } catch {
        if (activo) {
          setError(true);
        }
      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    };

    consultarClima();

    return () => {
      activo = false;
    };
  }, [isMounted]);

  // Transición animada suave entre ciudades
  const animarTransicion = (nuevoIndice: number) => {
    if (nuevoIndice === indiceActualRef.current || animandoRef.current) return;
    animandoRef.current = true;

    // Fade out y desplazamiento hacia arriba
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }),
      Animated.timing(slideAnim, {
        toValue: -8,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start(() => {
      setIndiceActual(nuevoIndice);
      indiceActualRef.current = nuevoIndice;
      slideAnim.setValue(8);

      // Fade in y desplazamiento a posición original
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: false,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 220,
          useNativeDriver: false,
        }),
      ]).start(() => {
        animandoRef.current = false;
      });
    });
  };

  // Temporizador para cambio automático cada 4.5 segundos
  useEffect(() => {
    if (datosClima.length <= 1) return;

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      const siguiente = (indiceActualRef.current + 1) % datosClima.length;
      animarTransicion(siguiente);
    }, 4500);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [datosClima.length]);

  const seleccionarCiudadManual = (idx: number) => {
    if (idx === indiceActualRef.current || animandoRef.current) return;
    animarTransicion(idx);

    // Reinicia el contador de 4.5 segundos al interactuar manualmente
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    timerRef.current = setInterval(() => {
      const siguiente = (indiceActualRef.current + 1) % datosClima.length;
      animarTransicion(siguiente);
    }, 4500);
  };

  if (!isMounted) {
    return null;
  }

  if (cargando) {
    return (
      <View style={styles.card}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#0284C7" />
          <Text style={styles.loadingText}>Consultando clima de Tucumán...</Text>
        </View>
      </View>
    );
  }

  if (error || datosClima.length === 0) {
    return (
      <View style={styles.card}>
        <View style={styles.loadingContainer}>
          <Ionicons name="cloud-offline-outline" size={20} color="#0284C7" />
          <Text style={styles.loadingText}>Clima temporalmente no disponible</Text>
        </View>
      </View>
    );
  }

  const ciudadActual = datosClima[indiceActual] || datosClima[0];
  const infoActual = obtenerInfoClima(ciudadActual.codigoClimaActual);

  return (
    <View style={styles.card}>
      {/* Parte superior de la Card */}
      <View style={styles.topSection}>
        <Animated.View
          style={[
            styles.animatedSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.topRow}>
            <View style={styles.leftCol}>
              <View style={styles.iconCircle}>
                <Ionicons name={infoActual.icon} size={22} color="#0284C7" />
              </View>
              <View style={styles.cityTextCol}>
                <Text style={styles.cityName} numberOfLines={1}>
                  {ciudadActual.nombreCiudad}
                </Text>
                <Text style={styles.descText} numberOfLines={1}>
                  {infoActual.desc}
                </Text>
              </View>
            </View>

            <View style={styles.rightCol}>
              <Text style={styles.tempText}>{ciudadActual.tempActual}°</Text>
            </View>
          </View>
        </Animated.View>

        {/* Indicadores (dots discretos) para seleccionar ciudad */}
        <View style={styles.dotsRow}>
          {datosClima.map((ciudad, idx) => {
            const esActivo = idx === indiceActual;
            return (
              <TouchableOpacity
                key={ciudad.nombreCiudad}
                onPress={() => seleccionarCiudadManual(idx)}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
                style={[styles.dot, esActivo && styles.dotActivo]}
                accessibilityLabel={`Ver clima de ${ciudad.nombreCiudad}`}
              />
            );
          })}
        </View>
      </View>

      {/* Línea divisoria sutil */}
      <View style={styles.divider} />

      {/* Parte inferior de la Card: Pronóstico de 3 días */}
      <Animated.View
        style={[
          styles.animatedSection,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.forecastRow}>
          {ciudadActual.pronostico.map((dia, idx) => {
            const infoDia = obtenerInfoClima(dia.codigoClima);
            const esUltimo = idx === ciudadActual.pronostico.length - 1;
            return (
              <View
                key={`${dia.nombreDia}-${idx}`}
                style={[styles.forecastCol, !esUltimo && styles.colBorderRight]}
              >
                <Text style={styles.forecastDayText}>{dia.nombreDia}</Text>
                <View style={styles.forecastIconWrapper}>
                  <Ionicons name={infoDia.icon} size={18} color="#0284C7" />
                </View>
                <View style={styles.forecastTemps}>
                  <Text style={styles.forecastMax}>{dia.tempMax}°</Text>
                  <Text style={styles.forecastSep}>/</Text>
                  <Text style={styles.forecastMin}>{dia.tempMin}°</Text>
                </View>
              </View>
            );
          })}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#F0F7FF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    marginTop: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#0284C7',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
      },
      android: {
        elevation: 1,
      },
      web: {
        boxShadow: '0 2px 8px rgba(2, 132, 199, 0.06)',
      },
    }),
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 10,
  },
  loadingText: {
    fontSize: 13,
    color: '#0284C7',
    fontWeight: '500',
  },
  topSection: {
    width: '100%',
  },
  animatedSection: {
    width: '100%',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cityTextCol: {
    flex: 1,
    justifyContent: 'center',
  },
  cityName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  descText: {
    fontSize: 12,
    color: '#0284C7',
    fontWeight: '600',
    marginTop: 2,
  },
  rightCol: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingLeft: 8,
  },
  tempText: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0284C7',
    letterSpacing: -0.5,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 10,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#BAE6FD',
  },
  dotActivo: {
    width: 18,
    backgroundColor: '#0284C7',
  },
  divider: {
    height: 1,
    backgroundColor: '#BAE6FD',
    marginVertical: 10,
    opacity: 0.8,
  },
  forecastRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  forecastCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  colBorderRight: {
    borderRightWidth: 1,
    borderRightColor: '#BAE6FD',
  },
  forecastDayText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  forecastIconWrapper: {
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 2,
  },
  forecastTemps: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  forecastMax: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  forecastSep: {
    fontSize: 11,
    color: '#94A3B8',
    marginHorizontal: 2,
  },
  forecastMin: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0284C7',
  },
});
