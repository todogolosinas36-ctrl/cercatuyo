import React from 'react';
import { FontAwesome } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={26} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: useClientOnlyValue(false, true),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Colectivos',
          tabBarLabel: 'Colectivos',
          tabBarIcon: ({ color }) => <TabBarIcon name="bus" color={color} />,
        }}
      />
      <Tabs.Screen
        name="farmacias"
        options={{
          title: 'Farmacias',
          tabBarLabel: 'Farmacias',
          tabBarIcon: ({ color }) => <TabBarIcon name="medkit" color={color} />,
        }}
      />
      <Tabs.Screen
        name="oficios"
        options={{
          title: 'Oficios',
          tabBarLabel: 'Oficios',
          tabBarIcon: ({ color }) => <TabBarIcon name="wrench" color={color} />,
        }}
      />
      <Tabs.Screen
        name="configuracion"
        options={{
          title: 'Ajustes',
          tabBarLabel: 'Ajustes',
          tabBarIcon: ({ color }) => <TabBarIcon name="gear" color={color} />,
        }}
      />
    </Tabs>
  );
}
