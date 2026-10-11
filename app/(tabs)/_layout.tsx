import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { Tabs, router } from 'expo-router';
import { doc, setDoc, increment } from 'firebase/firestore';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { db } from '@/config/firebase';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: any;
}) {
  return <FontAwesome size={26} style={{ marginBottom: -3 }} {...props} />;
}

function BrandHeaderTitle() {
  return (
    <Pressable
      style={styles.brandContainer}
      delayLongPress={2000}
      onLongPress={() => router.push('/admin' as any)}
      accessibilityRole="header"
    >
      <View style={styles.brandIconWrapper}>
        <FontAwesome name="map-marker" size={20} color="#2563EB" />
      </View>
      <Text style={styles.brandTitle}>Cerca<Text style={styles.brandTitleHighlight}>Tuyo</Text></Text>
    </Pressable>
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  // Registrar visita global en Firestore al iniciar la app
  useEffect(() => {
    const registrarVisita = async () => {
      try {
        const statsRef = doc(db, 'sistema', 'estadisticas');
        await setDoc(statsRef, { visitas_totales: increment(1) }, { merge: true });
      } catch (error) {
        console.warn('No se pudo registrar la visita en Firestore:', error);
      }
    };

    registrarVisita();
  }, []);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: useClientOnlyValue(false, true),
        headerTitle: () => <BrandHeaderTitle />,
        headerTitleAlign: 'center',
        headerShadowVisible: false,
        headerStyle: {
          backgroundColor: '#FFFFFF',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: 'Colectivos',
          tabBarIcon: ({ color }) => <TabBarIcon name="bus" color={color} />,
        }}
      />
      <Tabs.Screen
        name="farmacias"
        options={{
          tabBarLabel: 'Farmacias',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'medkit' : 'medkit-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="oficios"
        options={{
          title: 'Oficios',
          tabBarIcon: ({ color }) => <Ionicons name="hammer-outline" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandIconWrapper: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.4,
  },
  brandTitleHighlight: {
    color: '#2563EB',
  },
});
