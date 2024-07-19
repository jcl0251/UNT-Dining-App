import { Tabs } from 'expo-router';
import React from 'react';

import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { DataProvider } from '../../DataContext';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <DataProvider>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          headerShown: false,
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon name={focused ? 'home' : 'home-outline'} color={color} /> // First 'home' is the icon it shows when selected. Second is when unselected.
            ),
          }}
        />
        <Tabs.Screen
          name="Plan"
          options={{
            title: 'Plan',
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon name={focused ? 'pizza' : 'pizza'} color={color} /> // First 'pizza' is the icon it shows when selected. Second is when unselected.
            ),
          }}
        />
        <Tabs.Screen
          name="Calculate"
          options={{
            title: 'Calculate',
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon name={focused ? 'fast-food' : 'fast-food'} color={color} />  // First 'fast-food' is the icon it shows when selected. Second is when unselected.
            ),
          }}
        />
      </Tabs>
    </DataProvider>
  );
}

