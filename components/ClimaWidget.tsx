import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface WeatherData {
  temperature: number;
  weathercode?: number;
}

function getWeatherIconAndDesc(code?: number): {
  icon: keyof typeof Ionicons.glyphMap;
  desc: string;
} {
  if (code === undefined) return { icon: 'partly-sunny-outline', desc: 'Clima local' };
  if (code === 0) return { icon: 'sunny-outline', desc: 'Despejado' };
  if (code === 1 || code === 2) return { icon: 'partly-sunny-outline', desc: 'Parcialmente nublado' };
  if (code === 3) return { icon: 'cloudy-outline', desc: 'Nublado' };
  if (code >= 45 && code <= 48) return { icon: 'cloud-outline', desc: 'Neblina' };
  if (code >= 51 && code <= 67) return { icon: 'rainy-outline', desc: 'Lluvia ligera' };
  if (code >= 80 && code <= 82) return { icon: 'rainy', desc: 'Chubascos' };
  if (code >= 95) return { icon: 'thunderstorm-outline', desc: 'Tormenta' };
  return { icon: 'partly-sunny-outline', desc: 'Templado' };
}

export default function ClimaWidget() {
  const [clima, setClima] = useState<WeatherData | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    let activo = true;

    const obtenerClima = async () => {
      try {
        const res = await fetch(
          'https://api.open-meteo.com/v1/forecast?latitude=-27.4333&longitude=-65.6167&current_weather=true'
        );
        if (!res.ok) throw new Error('Error al obtener clima');
        const data = await res.json();
        if (activo && data?.current_weather) {
          setClima({
            temperature: Math.round(data.current_weather.temperature),
            weathercode: data.current_weather.weathercode,
          });
        }
      } catch (err) {
        if (activo) setError(true);
      } finally {
        if (activo) setCargando(false);
      }
    };

    obtenerClima();

    return () => {
      activo = false;
    };
  }, []);

  const infoClima = getWeatherIconAndDesc(clima?.weathercode);

  return (
    <View style={styles.card}>
      <View style={styles.leftCol}>
        <View style={styles.iconCircle}>
          <Ionicons name={infoClima.icon} size={22} color="#0284C7" />
        </View>
        <View>
          <Text style={styles.cityText}>Aguilares</Text>
          <Text style={styles.descText}>{cargando ? 'Consultando...' : infoClima.desc}</Text>
        </View>
      </View>

      <View style={styles.rightCol}>
        {cargando ? (
          <ActivityIndicator size="small" color="#0284C7" />
        ) : error || clima === null ? (
          <Text style={styles.tempText}>--°C</Text>
        ) : (
          <Text style={styles.tempText}>{clima.temperature}°C</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0F9FF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  leftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cityText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0369A1',
  },
  descText: {
    fontSize: 12,
    color: '#0284C7',
    fontWeight: '500',
  },
  rightCol: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  tempText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0284C7',
    letterSpacing: -0.5,
  },
});
